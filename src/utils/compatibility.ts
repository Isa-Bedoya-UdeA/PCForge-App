import { ComponentCategory } from '../constants/categories';
import { Build, BuildComponentItem } from '../types/build';
import {
  CompatibilityIssue,
  CompatibilityReport,
  CompatibilityStatus,
} from '../types/compatibility';
import { NormalizedComponent } from '../types/component';
import { calculatePowerEstimate } from './power';

function normalizeString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/[\s-_]/g, '');
}

function extractStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => normalizeString(v)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,/|]/)
      .map((v) => normalizeString(v))
      .filter(Boolean);
  }
  return [];
}

const FORM_FACTOR_HIERARCHY: Record<string, number> = {
  minitx: 1,
  miniitx: 1,
  microatx: 2,
  matx: 2,
  atx: 3,
  eatx: 4,
  extendedatx: 4,
};

function extractMemoryType(component?: NormalizedComponent): string | undefined {
  if (!component) return undefined;
  const specs = (component.specifications || {}) as Record<string, any>;
  const val =
    specs.ram_type ??
    specs.memory?.ram_type ??
    specs.memoryType ??
    specs.memory_type;
  if (typeof val === 'string' && val.trim()) return val.trim();

  // Fallback: detect from component name (e.g. DDR5, DDR4, DDR3)
  const match = component.name?.match(/\b(DDR[2-5])\b/i);
  return match ? match[1].toUpperCase() : undefined;
}

function extractFormFactor(component?: NormalizedComponent): string | undefined {
  if (!component) return undefined;
  const specs = (component.specifications || {}) as Record<string, any>;
  const val = specs.form_factor ?? specs.formFactor;
  if (typeof val === 'string' && val.trim()) return val.trim();

  // Fallback: detect from name
  const match = component.name?.match(/\b(E-?ATX|ATX|Micro-?ATX|mATX|Mini-?ITX|ITX)\b/i);
  return match ? match[1].toUpperCase() : undefined;
}

function extractCaseSupportedFormFactors(component?: NormalizedComponent): string[] {
  if (!component) return [];
  const specs = (component.specifications || {}) as Record<string, any>;
  const raw =
    specs.supported_motherboard_form_factors ??
    specs.supportedFormFactors ??
    specs.supported_form_factors;
  return extractStringArray(raw);
}

function extractGpuLength(component?: NormalizedComponent): number {
  if (!component) return 0;
  const specs = (component.specifications || {}) as Record<string, any>;
  const val = specs.length ?? specs.lengthMm ?? specs.length_mm;
  const num = typeof val === 'number' ? val : parseFloat(String(val || ''));
  return isNaN(num) ? 0 : num;
}

function extractCaseMaxGpuLength(component?: NormalizedComponent): number {
  if (!component) return 0;
  const specs = (component.specifications || {}) as Record<string, any>;
  const val =
    specs.max_video_card_length ??
    specs.maxGpuLengthMm ??
    specs.max_gpu_length_mm;
  const num = typeof val === 'number' ? val : parseFloat(String(val || ''));
  return isNaN(num) ? 0 : num;
}

function extractCoolerSockets(component?: NormalizedComponent): string[] {
  if (!component) return [];
  const specs = (component.specifications || {}) as Record<string, any>;
  const raw =
    specs.cpu_sockets ??
    specs.supportedSockets ??
    specs.sockets ??
    specs.supported_sockets;
  return extractStringArray(raw);
}

export function getRamSticksPerKit(item: BuildComponentItem): number {
  const specs = (item.component.specifications || {}) as Record<string, any>;
  const qty = specs.modules?.quantity ?? specs.quantity;
  if (typeof qty === 'number' && qty > 0) return qty;

  // Fallback: check name like "(2x64GB)" or "2x16GB" or "4x8GB"
  const match =
    item.component.name?.match(/\((\d+)x[\d.]+\s*(?:GB|TB)\)/i) ||
    item.component.name?.match(/\b(\d+)x[\d.]+\s*(?:GB|TB)\b/i);
  if (match) return parseInt(match[1], 10);

  return 1;
}

export function isM2Drive(item: BuildComponentItem): boolean {
  const specs = (item.component.specifications || {}) as Record<string, any>;
  const form = String(specs.form_factor || specs.formFactor || '').toLowerCase();
  const iface = String(specs.interface || specs.interfaceType || '').toLowerCase();
  const name = String(item.component.name || '').toLowerCase();
  return form.includes('m.2') || iface.includes('m.2') || name.includes('m.2');
}

export function evaluateCompatibility(build: Build): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];
  let hasIncompleteData = false;

  const components = build.components;
  const cpus = components.CPU || [];
  const motherboards = components.MOTHERBOARD || [];
  const memories = components.MEMORY || [];
  const gpus = components.VIDEO_CARD || [];
  const cases = components.CASE || [];
  const coolers = components.CPU_COOLER || [];
  const psus = components.POWER_SUPPLY || [];
  const storages = components.INTERNAL_HARD_DRIVE || [];

  // 1. Single-component slot constraints
  const singleSlotRules: {
    category: ComponentCategory;
    items: BuildComponentItem[];
    name: string;
  }[] = [
    { category: 'CPU', items: cpus, name: 'Processor' },
    { category: 'MOTHERBOARD', items: motherboards, name: 'Motherboard' },
    { category: 'CASE', items: cases, name: 'PC Case' },
    { category: 'POWER_SUPPLY', items: psus, name: 'Power Supply' },
    { category: 'CPU_COOLER', items: coolers, name: 'CPU Cooler' },
  ];

  for (const rule of singleSlotRules) {
    const totalQty = rule.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (totalQty > 1) {
      issues.push({
        id: `limit-${rule.category.toLowerCase()}-exceeded`,
        code: `MAX_${rule.category}_EXCEEDED`,
        severity: 'ERROR',
        category: rule.category,
        affectedCategories: [rule.category],
        title: `Multiple ${rule.name}s Selected`,
        message: `Standard desktop builds support only 1 ${rule.name.toLowerCase()} (found ${totalQty}).`,
      });
    }
  }

  // Multi-GPU limit: max 2
  const totalGpuQty = gpus.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (totalGpuQty > 2) {
    issues.push({
      id: 'limit-gpu-exceeded',
      code: 'MAX_VIDEO_CARD_EXCEEDED',
      severity: 'ERROR',
      category: 'VIDEO_CARD',
      affectedCategories: ['VIDEO_CARD'],
      title: 'Maximum Graphics Cards Exceeded',
      message: `Consumer builds support a maximum of 2 GPUs (selected: ${totalGpuQty}).`,
    });
  }

  const primaryCpu = cpus[0]?.component;
  const primaryMb = motherboards[0]?.component;
  const primaryCase = cases[0]?.component;
  const primaryCooler = coolers[0]?.component;
  const primaryPsu = psus[0]?.component;

  // 2. CPU & Motherboard Socket Matching
  if (primaryCpu && primaryMb) {
    const cpuSocket = primaryCpu.specifications?.socket as string | undefined;
    const mbSocket = primaryMb.specifications?.socket as string | undefined;

    if (!cpuSocket || !mbSocket) {
      hasIncompleteData = true;
      issues.push({
        id: 'warn-cpu-mb-socket-unknown',
        code: 'MISSING_SOCKET_DATA',
        severity: 'WARNING',
        affectedCategories: ['CPU', 'MOTHERBOARD'],
        title: 'CPU / Motherboard Socket Data Missing',
        message: 'Could not verify socket compatibility because socket specification is missing.',
      });
    } else {
      const normCpuSocket = normalizeString(cpuSocket);
      const normMbSocket = normalizeString(mbSocket);

      if (normCpuSocket !== normMbSocket) {
        issues.push({
          id: 'err-cpu-mb-socket-mismatch',
          code: 'SOCKET_MISMATCH',
          severity: 'ERROR',
          affectedCategories: ['CPU', 'MOTHERBOARD'],
          title: 'Incompatible CPU & Motherboard Socket',
          message: `The CPU requires socket "${cpuSocket}", but the motherboard has socket "${mbSocket}".`,
        });
      }
    }
  }

  // 3. Motherboard & RAM Memory Type and Slots Matching
  if (primaryMb && memories.length > 0) {
    const mbMemType = extractMemoryType(primaryMb);

    if (!mbMemType) {
      hasIncompleteData = true;
      issues.push({
        id: 'warn-mb-memory-unknown',
        code: 'MISSING_MEMORY_TYPE_DATA',
        severity: 'WARNING',
        affectedCategories: ['MOTHERBOARD', 'MEMORY'],
        title: 'Motherboard Memory Specification Missing',
        message: 'Could not verify memory type compatibility because motherboard memory standard is missing.',
      });
    } else {
      const normMbMem = normalizeString(mbMemType);

      for (const ramItem of memories) {
        const ramMemType = extractMemoryType(ramItem.component);
        if (!ramMemType) {
          hasIncompleteData = true;
          issues.push({
            id: `warn-ram-mem-unknown-${ramItem.component.id}`,
            code: 'MISSING_MEMORY_TYPE_DATA',
            severity: 'WARNING',
            affectedCategories: ['MEMORY'],
            title: 'RAM Memory Type Specification Missing',
            message: `Memory "${ramItem.component.name}" does not specify memory type (e.g. DDR4 or DDR5).`,
          });
        } else {
          const normRamMem = normalizeString(ramMemType);
          if (normMbMem !== normRamMem) {
            issues.push({
              id: `err-ram-mem-mismatch-${ramItem.component.id}`,
              code: 'MEMORY_TYPE_MISMATCH',
              severity: 'ERROR',
              affectedCategories: ['MOTHERBOARD', 'MEMORY'],
              title: 'Incompatible RAM Standard',
              message: `Motherboard requires "${mbMemType}", but "${ramItem.component.name}" is "${ramMemType}".`,
            });
          }
        }
      }
    }

    // RAM Slots Capacity Check (accounting for sticks per pack)
    const totalRamSticks = memories.reduce(
      (sum, item) => sum + (item.quantity || 1) * getRamSticksPerKit(item),
      0
    );
    const maxMbSlots =
      (primaryMb.specifications?.memory as any)?.slots ??
      (primaryMb.specifications?.memorySlots as number) ??
      4;

    if (totalRamSticks > maxMbSlots) {
      issues.push({
        id: 'err-ram-slots-exceeded',
        code: 'RAM_SLOTS_EXCEEDED',
        severity: 'ERROR',
        affectedCategories: ['MOTHERBOARD', 'MEMORY'],
        title: 'Exceeded Motherboard Memory Slots',
        message: `Selected ${totalRamSticks} RAM modules across kit(s), but motherboard only provides ${maxMbSlots} memory slots.`,
      });
    }

    // RAM Uniformity Check: modules must be identical
    if (memories.length > 1) {
      issues.push({
        id: 'err-ram-non-identical',
        code: 'RAM_NON_IDENTICAL_MODULES',
        severity: 'ERROR',
        affectedCategories: ['MEMORY'],
        title: 'Mixed RAM Kits Detected',
        message: 'All memory modules in a build must be identical to guarantee dual-channel/quad-channel stability.',
      });
    }
  }

  // 4. Motherboard M.2 Storage Slots Check
  if (primaryMb && storages.length > 0) {
    const rawM2Slots = (primaryMb.specifications as any)?.m2_slots ?? (primaryMb.specifications as any)?.m2Slots;
    const m2Slots = Array.isArray(rawM2Slots) ? rawM2Slots.length : null;

    if (m2Slots !== null) {
      const totalM2Drives = storages
        .filter(isM2Drive)
        .reduce((sum, item) => sum + (item.quantity || 1), 0);

      if (totalM2Drives > m2Slots) {
        issues.push({
          id: 'err-m2-slots-exceeded',
          code: 'M2_SLOTS_EXCEEDED',
          severity: 'ERROR',
          affectedCategories: ['MOTHERBOARD', 'INTERNAL_HARD_DRIVE'],
          title: 'Exceeded Motherboard M.2 Storage Slots',
          message: `Selected ${totalM2Drives} M.2 NVMe SSDs, but motherboard only provides ${m2Slots} M.2 slots.`,
        });
      }
    }
  }

  // 5. Motherboard & Case Form Factor Compatibility
  if (primaryMb && primaryCase) {
    const mbForm = extractFormFactor(primaryMb);
    const caseForms = extractCaseSupportedFormFactors(primaryCase);

    if (!mbForm || caseForms.length === 0) {
      hasIncompleteData = true;
      issues.push({
        id: 'warn-form-factor-unknown',
        code: 'MISSING_FORM_FACTOR_DATA',
        severity: 'WARNING',
        affectedCategories: ['MOTHERBOARD', 'CASE'],
        title: 'Form Factor Data Incomplete',
        message: 'Could not verify motherboard and case fit because form factor data is incomplete.',
      });
    } else {
      const normMbForm = normalizeString(mbForm);
      const isDirectMatch = caseForms.includes(normMbForm);

      let isHierarchyCompatible = false;
      const mbRank = FORM_FACTOR_HIERARCHY[normMbForm] || 0;
      if (mbRank > 0) {
        const maxCaseRank = Math.max(
          ...caseForms.map((cf) => FORM_FACTOR_HIERARCHY[cf] || 0)
        );
        if (maxCaseRank >= mbRank) {
          isHierarchyCompatible = true;
        }
      }

      if (!isDirectMatch && !isHierarchyCompatible) {
        issues.push({
          id: 'err-form-factor-incompatible',
          code: 'FORM_FACTOR_INCOMPATIBLE',
          severity: 'ERROR',
          affectedCategories: ['MOTHERBOARD', 'CASE'],
          title: 'Incompatible Form Factor',
          message: `Case does not support "${mbForm}" motherboards. Supported: ${caseForms.join(', ')}.`,
        });
      }
    }
  }

  // 6. GPU Clearance vs Case
  if (primaryCase && gpus.length > 0) {
    const maxLen = extractCaseMaxGpuLength(primaryCase);

    if (maxLen <= 0) {
      hasIncompleteData = true;
      issues.push({
        id: 'warn-case-gpu-clearance-unknown',
        code: 'MISSING_GPU_CLEARANCE_DATA',
        severity: 'WARNING',
        affectedCategories: ['CASE', 'VIDEO_CARD'],
        title: 'Case GPU Clearance Unknown',
        message: 'Case does not specify maximum GPU clearance length.',
      });
    } else {
      for (const gpuItem of gpus) {
        const gpuLen = extractGpuLength(gpuItem.component);

        if (gpuLen <= 0) {
          hasIncompleteData = true;
          issues.push({
            id: `warn-gpu-length-unknown-${gpuItem.component.id}`,
            code: 'MISSING_GPU_CLEARANCE_DATA',
            severity: 'WARNING',
            affectedCategories: ['VIDEO_CARD'],
            title: 'GPU Length Data Missing',
            message: `GPU "${gpuItem.component.name}" does not specify physical length.`,
          });
        } else if (gpuLen > maxLen) {
          issues.push({
            id: `err-gpu-length-exceeds-${gpuItem.component.id}`,
            code: 'GPU_LENGTH_EXCEEDS_CASE',
            severity: 'ERROR',
            affectedCategories: ['VIDEO_CARD', 'CASE'],
            title: 'GPU Physical Clearance Exceeded',
            message: `GPU length (${gpuLen} mm) exceeds case maximum clearance (${maxLen} mm).`,
          });
        }
      }
    }
  }

  // 7. CPU Cooler Socket Support
  if (primaryCooler && (primaryCpu || primaryMb)) {
    const targetSocket =
      (primaryCpu?.specifications?.socket as string | undefined) ||
      (primaryMb?.specifications?.socket as string | undefined);
    const supportedSockets = extractCoolerSockets(primaryCooler);

    if (!targetSocket || supportedSockets.length === 0) {
      hasIncompleteData = true;
      issues.push({
        id: 'warn-cooler-socket-unknown',
        code: 'MISSING_COOLER_SOCKET_DATA',
        severity: 'WARNING',
        affectedCategories: ['CPU_COOLER', 'CPU'],
        title: 'Cooler Socket Compatibility Unknown',
        message: 'Could not verify cooler compatibility because socket specification is missing.',
      });
    } else {
      const normTargetSocket = normalizeString(targetSocket);
      const isSupported = supportedSockets.some(
        (s) =>
          s === normTargetSocket ||
          normTargetSocket.includes(s) ||
          s.includes(normTargetSocket)
      );

      if (!isSupported) {
        issues.push({
          id: 'err-cooler-socket-incompatible',
          code: 'COOLER_SOCKET_INCOMPATIBLE',
          severity: 'ERROR',
          affectedCategories: ['CPU_COOLER', 'CPU'],
          title: 'Incompatible CPU Cooler Mounting',
          message: `Cooler does not support socket "${targetSocket}". Supported: ${supportedSockets.join(', ')}.`,
        });
      }
    }
  }

  // 8. Power Supply Wattage Sufficiency Check
  const powerEstimate = calculatePowerEstimate(build);
  if (powerEstimate.hasIncompleteData) {
    hasIncompleteData = true;
    if (powerEstimate.missingComponents && powerEstimate.missingComponents.length > 0) {
      issues.push({
        id: 'warn-power-incomplete-specs',
        code: 'MISSING_TDP_DATA',
        severity: 'WARNING',
        affectedCategories: ['POWER_SUPPLY'],
        title: 'TDP Specification Missing',
        message: `TDP specification is not specified for: ${powerEstimate.missingComponents.join(', ')}. Power consumption estimate may be conservative.`,
      });
    }
  }

  if (primaryPsu) {
    const rawPsuW = primaryPsu.specifications?.wattage;
    const psuW = typeof rawPsuW === 'number' ? rawPsuW : parseFloat(String(rawPsuW || ''));

    if (isNaN(psuW) || psuW <= 0) {
      hasIncompleteData = true;
      issues.push({
        id: 'warn-psu-wattage-unknown',
        code: 'MISSING_PSU_WATTAGE_DATA',
        severity: 'WARNING',
        affectedCategories: ['POWER_SUPPLY'],
        title: 'PSU Wattage Unknown',
        message: 'Could not determine PSU rated capacity.',
      });
    } else {
      if (psuW < powerEstimate.estimatedWattage) {
        issues.push({
          id: 'err-psu-underpowered',
          code: 'PSU_WATTAGE_INSUFFICIENT',
          severity: 'ERROR',
          affectedCategories: ['POWER_SUPPLY'],
          title: 'Critical Power Deficit',
          message: `PSU rating (${psuW}W) is lower than estimated system draw (${powerEstimate.estimatedWattage}W). System will be unstable or fail to boot.`,
        });
      } else if (psuW < powerEstimate.recommendedWattage) {
        issues.push({
          id: 'warn-psu-recommended-margin',
          code: 'PSU_MARGIN_LOW',
          severity: 'WARNING',
          affectedCategories: ['POWER_SUPPLY'],
          title: 'Below Recommended PSU Margin',
          message: `PSU rating (${psuW}W) does not meet the recommended 30% safety margin (${powerEstimate.recommendedWattage}W tier).`,
        });
      }
    }
  }

  // Calculate overall report status
  const hasErrors = issues.some((i) => i.severity === 'ERROR');
  const hasWarnings = issues.some((i) => i.severity === 'WARNING');

  let status: CompatibilityStatus = 'COMPATIBLE';
  if (hasErrors) {
    status = 'INCOMPATIBLE';
  } else if (hasWarnings) {
    status = 'WARNING';
  }

  return {
    status,
    isValid: !hasErrors,
    issues,
    hasIncompleteData,
  };
}
