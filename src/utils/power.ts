import {
  BASE_SYSTEM_TDP_WATTS,
  COMMERCIAL_PSU_TIERS,
  ComponentCategory,
  POWER_SAFETY_MARGIN_MULTIPLIER,
} from '../constants/categories';
import { Build } from '../types/build';
import { PowerEstimate } from '../types/compatibility';

/**
 * Extracts numeric TDP or wattage from component specifications.
 * Handles variations in property names: tdp, wattage, tdpWattage.
 */
export function extractComponentWattage(
  category: ComponentCategory,
  specs: Record<string, unknown> | undefined
): { wattage: number; isMissing: boolean } {
  if (!specs) {
    return { wattage: 0, isMissing: true };
  }

  // Categories that typically do not consume significant active TDP
  if (category === 'CASE' || category === 'POWER_SUPPLY') {
    return { wattage: 0, isMissing: false };
  }

  const nested = specs.specifications as Record<string, unknown> | undefined;

  const raw =
    specs.tdp ??
    specs.wattage ??
    specs.tdpWattage ??
    specs.powerDrawWatts ??
    specs.powerDraw ??
    nested?.tdp ??
    nested?.wattage ??
    nested?.ppt;

  if (typeof raw === 'number' && !isNaN(raw) && raw > 0) {
    return { wattage: raw, isMissing: false };
  }

  if (typeof raw === 'string') {
    const parsed = parseFloat(raw.replace(/[^\d.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      return { wattage: parsed, isMissing: false };
    }
  }

  // CPU and GPU are critical power consumers where missing TDP flags incomplete data
  const isCriticalConsumer = category === 'CPU' || category === 'VIDEO_CARD';

  return {
    wattage: 0,
    isMissing: isCriticalConsumer,
  };
}

/**
 * Maps a target wattage with safety margin to the next standard commercial PSU tier.
 */
export function recommendPsuTier(targetWithMargin: number): number {
  for (const tier of COMMERCIAL_PSU_TIERS) {
    if (tier >= targetWithMargin) {
      return tier;
    }
  }
  // Above highest standard tier, ceil to next 100W increment or return target
  return Math.max(1500, Math.ceil(targetWithMargin / 100) * 100);
}

/**
 * Pure calculation logic for system power estimation.
 * Formula:
 *   estimated = 50W base + sum(componentTdp * quantity)
 *   recommended = ceilToCommercialTier(estimated * 1.30)
 */
export function calculatePowerEstimate(build: Build): PowerEstimate {
  let componentsTdp = 0;
  let hasIncompleteData = false;
  const missingComponents: string[] = [];
  const unspecifiedComponents: string[] = [];
  const breakdown: Partial<Record<ComponentCategory, number>> = {};

  if (build && build.components) {
    for (const [catKey, items] of Object.entries(build.components)) {
      const category = catKey as ComponentCategory;
      let categoryTotal = 0;

      for (const item of items) {
        if (!item || !item.component) continue;
        const qty = item.quantity > 0 ? item.quantity : 1;
        const { wattage, isMissing } = extractComponentWattage(
          category,
          item.component.specifications as Record<string, unknown>
        );

        if (isMissing) {
          hasIncompleteData = true;
          if (item.component.name && !missingComponents.includes(item.component.name)) {
            missingComponents.push(item.component.name);
          }
        } else if (wattage === 0 && category !== 'CASE' && category !== 'POWER_SUPPLY') {
          if (item.component.name && !unspecifiedComponents.includes(item.component.name)) {
            unspecifiedComponents.push(item.component.name);
          }
        }

        categoryTotal += wattage * qty;
      }

      if (categoryTotal > 0) {
        breakdown[category] = categoryTotal;
        componentsTdp += categoryTotal;
      }
    }
  }

  const estimatedWattage = BASE_SYSTEM_TDP_WATTS + componentsTdp;
  const targetWithMargin = Math.ceil(
    estimatedWattage * POWER_SAFETY_MARGIN_MULTIPLIER
  );
  const recommendedWattage = recommendPsuTier(targetWithMargin);

  return {
    estimatedWattage,
    recommendedWattage,
    baseSystemTdp: BASE_SYSTEM_TDP_WATTS,
    hasIncompleteData,
    missingComponents,
    unspecifiedComponents,
    breakdown,
  };
}
