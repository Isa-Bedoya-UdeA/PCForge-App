import { create } from 'zustand';
import { CATEGORY_LIMITS, ComponentCategory } from '../constants/categories';
import { StorageService } from '../services/storage.service';
import { Build, createNewBuild } from '../types/build';
import { CompatibilityReport, PowerEstimate } from '../types/compatibility';
import { NormalizedComponent } from '../types/component';
import {
  evaluateCompatibility,
  getRamSticksPerKit,
  isM2Drive,
} from '../utils/compatibility';
import { calculatePowerEstimate } from '../utils/power';

export interface BuildState {
  builds: Build[];
  activeBuildId: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  loadBuilds: () => Promise<void>;
  setActiveBuild: (id: string | null) => void;
  createBuild: (name?: string, description?: string) => Promise<string>;
  renameBuild: (id: string, name: string) => Promise<void>;
  updateBuildDescription: (id: string, description: string) => Promise<void>;
  deleteBuild: (id: string) => Promise<void>;
  duplicateBuild: (id: string) => Promise<string>;

  // Component Management
  addComponent: (
    buildId: string,
    component: NormalizedComponent,
    quantity?: number
  ) => Promise<{ success: boolean; message?: string }>;
  removeComponent: (
    buildId: string,
    category: ComponentCategory,
    componentId: string
  ) => Promise<void>;
  setQuantity: (
    buildId: string,
    category: ComponentCategory,
    componentId: string,
    quantity: number
  ) => Promise<{ success: boolean; message?: string }>;
  clearBuildComponents: (buildId: string) => Promise<void>;

  // Selectors
  getActiveBuild: () => Build | undefined;
  getBuildById: (id: string) => Build | undefined;
  getCompatibility: (buildId: string) => CompatibilityReport;
  getPowerEstimate: (buildId: string) => PowerEstimate;
}

function generateId(): string {
  return 'bld_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

export const useBuildStore = create<BuildState>((set, get) => ({
  builds: [],
  activeBuildId: null,
  isLoading: false,
  isHydrated: false,
  error: null,

  loadBuilds: async () => {
    set({ isLoading: true, error: null });
    try {
      const persisted = await StorageService.loadBuilds();
      const activeId = persisted.length > 0 ? persisted[0].id : null;
      set({
        builds: persisted,
        activeBuildId: activeId,
        isHydrated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to load builds',
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  setActiveBuild: (id: string | null) => {
    set({ activeBuildId: id });
  },

  createBuild: async (name?: string, description?: string) => {
    const newBuild = createNewBuild(generateId(), name, description);
    const updated = [newBuild, ...get().builds];
    set({ builds: updated, activeBuildId: newBuild.id });
    await StorageService.saveBuilds(updated);
    return newBuild.id;
  },

  renameBuild: async (id: string, name: string) => {
    const updated = get().builds.map((b) =>
      b.id === id ? { ...b, name: name.trim() || 'Custom Build', updatedAt: new Date().toISOString() } : b
    );
    set({ builds: updated });
    await StorageService.saveBuilds(updated);
  },

  updateBuildDescription: async (id: string, description: string) => {
    const updated = get().builds.map((b) =>
      b.id === id ? { ...b, description, updatedAt: new Date().toISOString() } : b
    );
    set({ builds: updated });
    await StorageService.saveBuilds(updated);
  },

  deleteBuild: async (id: string) => {
    const currentBuilds = get().builds;
    const updated = currentBuilds.filter((b) => b.id !== id);
    const nextActive =
      get().activeBuildId === id ? (updated.length > 0 ? updated[0].id : null) : get().activeBuildId;

    set({ builds: updated, activeBuildId: nextActive });
    await StorageService.saveBuilds(updated);
  },

  duplicateBuild: async (id: string) => {
    const target = get().builds.find((b) => b.id === id);
    if (!target) throw new Error(`Build with id ${id} not found.`);

    const cloned: Build = {
      ...JSON.parse(JSON.stringify(target)),
      id: generateId(),
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [cloned, ...get().builds];
    set({ builds: updated, activeBuildId: cloned.id });
    await StorageService.saveBuilds(updated);
    return cloned.id;
  },

  addComponent: async (buildId: string, component: NormalizedComponent, quantity = 1) => {
    const build = get().builds.find((b) => b.id === buildId);
    if (!build) return { success: false, message: 'Build not found.' };

    const category = component.category;
    const rule = CATEGORY_LIMITS[category];
    const currentItems = [...(build.components[category] || [])];

    // Single-slot categories (CPU, Motherboard, Case, PSU, Cooler): replace existing item
    if (!rule.allowMulti) {
      const updatedBuild: Build = {
        ...build,
        components: {
          ...build.components,
          [category]: [{ component, quantity: 1 }],
        },
        updatedAt: new Date().toISOString(),
      };

      const updatedBuilds = get().builds.map((b) => (b.id === buildId ? updatedBuild : b));
      set({ builds: updatedBuilds });
      await StorageService.saveBuilds(updatedBuilds);
      return { success: true };
    }

    // Multi-item categories:
    // 1. RAM: must be identical model and limited by motherboard slots
    if (category === 'MEMORY') {
      const primaryMb = build.components.MOTHERBOARD?.[0]?.component;
      const maxSlots =
        (primaryMb?.specifications?.memory as any)?.slots ??
        (primaryMb?.specifications?.memorySlots as number) ??
        rule.max;
      const sticksPerPack = getRamSticksPerKit({ component, quantity: 1 });

      // Check if existing RAM has a different component ID
      if (currentItems.length > 0 && currentItems[0].component.id !== component.id) {
        const allowedPacks = Math.max(1, Math.floor(maxSlots / sticksPerPack));
        // Replacing distinct RAM kit
        const updatedBuild: Build = {
          ...build,
          components: {
            ...build.components,
            MEMORY: [{ component, quantity: Math.min(quantity, allowedPacks) }],
          },
          updatedAt: new Date().toISOString(),
        };
        const updatedBuilds = get().builds.map((b) => (b.id === buildId ? updatedBuild : b));
        set({ builds: updatedBuilds });
        await StorageService.saveBuilds(updatedBuilds);
        return {
          success: true,
          message: 'Previous different RAM kit replaced with new selection to ensure module uniformity.',
        };
      }

      const existingIndex = currentItems.findIndex((it) => it.component.id === component.id);
      let newQty = quantity;
      if (existingIndex >= 0) {
        newQty = currentItems[existingIndex].quantity + quantity;
      }

      if (newQty * sticksPerPack > maxSlots) {
        return {
          success: false,
          message: `Cannot exceed ${maxSlots} RAM slots supported by motherboard (${newQty} packs × ${sticksPerPack} modules = ${newQty * sticksPerPack} sticks).`,
        };
      }

      const updatedItems = [{ component, quantity: newQty }];
      const updatedBuild: Build = {
        ...build,
        components: {
          ...build.components,
          MEMORY: updatedItems,
        },
        updatedAt: new Date().toISOString(),
      };
      const updatedBuilds = get().builds.map((b) => (b.id === buildId ? updatedBuild : b));
      set({ builds: updatedBuilds });
      await StorageService.saveBuilds(updatedBuilds);
      return { success: true };
    }

    // 1.1 M.2 Storage Slots
    if (category === 'INTERNAL_HARD_DRIVE' && isM2Drive({ component, quantity: 1 })) {
      const primaryMb = build.components.MOTHERBOARD?.[0]?.component;
      const rawM2 = (primaryMb?.specifications as any)?.m2_slots ?? (primaryMb?.specifications as any)?.m2Slots;
      const m2Slots = Array.isArray(rawM2) ? rawM2.length : null;
      if (m2Slots !== null) {
        const existingM2 = currentItems
          .filter(isM2Drive)
          .reduce((sum, it) => sum + (it.component.id === component.id ? 0 : it.quantity), 0);
        if (existingM2 + quantity > m2Slots) {
          return {
            success: false,
            message: `Cannot exceed ${m2Slots} M.2 slots supported by motherboard.`,
          };
        }
      }
    }

    // 2. GPU: Max 2 units
    if (category === 'VIDEO_CARD') {
      const currentTotal = currentItems.reduce((sum, it) => sum + it.quantity, 0);
      if (currentTotal + quantity > rule.max) {
        return {
          success: false,
          message: `Cannot add more than ${rule.max} GPUs to a desktop build.`,
        };
      }
    }

    // Storage and other multi-item categories
    const currentTotal = currentItems.reduce((sum, it) => sum + it.quantity, 0);
    if (currentTotal + quantity > rule.max) {
      return {
        success: false,
        message: `Exceeds maximum limit of ${rule.max} items for ${category}.`,
      };
    }

    const existingIndex = currentItems.findIndex((it) => it.component.id === component.id);
    if (existingIndex >= 0) {
      currentItems[existingIndex] = {
        component,
        quantity: currentItems[existingIndex].quantity + quantity,
      };
    } else {
      currentItems.push({ component, quantity });
    }

    const updatedBuild: Build = {
      ...build,
      components: {
        ...build.components,
        [category]: currentItems,
      },
      updatedAt: new Date().toISOString(),
    };

    const updatedBuilds = get().builds.map((b) => (b.id === buildId ? updatedBuild : b));
    set({ builds: updatedBuilds });
    await StorageService.saveBuilds(updatedBuilds);
    return { success: true };
  },

  removeComponent: async (buildId: string, category: ComponentCategory, componentId: string) => {
    const build = get().builds.find((b) => b.id === buildId);
    if (!build) return;

    const currentItems = build.components[category] || [];
    const updatedItems = currentItems.filter((it) => it.component.id !== componentId);

    const updatedBuild: Build = {
      ...build,
      components: {
        ...build.components,
        [category]: updatedItems,
      },
      updatedAt: new Date().toISOString(),
    };

    const updatedBuilds = get().builds.map((b) => (b.id === buildId ? updatedBuild : b));
    set({ builds: updatedBuilds });
    await StorageService.saveBuilds(updatedBuilds);
  },

  setQuantity: async (
    buildId: string,
    category: ComponentCategory,
    componentId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      await get().removeComponent(buildId, category, componentId);
      return { success: true };
    }

    const build = get().builds.find((b) => b.id === buildId);
    if (!build) return { success: false, message: 'Build not found.' };

    const rule = CATEGORY_LIMITS[category];
    const currentItems = build.components[category] || [];
    const otherQuantity = currentItems
      .filter((it) => it.component.id !== componentId)
      .reduce((sum, it) => sum + it.quantity, 0);

    if (otherQuantity + quantity > rule.max) {
      return {
        success: false,
        message: `Exceeds maximum allowed quantity (${rule.max}) for this category.`,
      };
    }

    // Check RAM slots limit
    if (category === 'MEMORY') {
      const primaryMb = build.components.MOTHERBOARD?.[0]?.component;
      const maxSlots =
        (primaryMb?.specifications?.memory as any)?.slots ??
        (primaryMb?.specifications?.memorySlots as number) ??
        rule.max;
      const targetItem = currentItems.find((it) => it.component.id === componentId);
      if (targetItem) {
        const sticksPerPack = getRamSticksPerKit(targetItem);
        if (quantity * sticksPerPack > maxSlots) {
          return {
            success: false,
            message: `Cannot exceed ${maxSlots} RAM slots supported by motherboard (${quantity} packs × ${sticksPerPack} modules = ${quantity * sticksPerPack} sticks).`,
          };
        }
      }
    }

    // Check M.2 slots limit
    if (category === 'INTERNAL_HARD_DRIVE') {
      const targetItem = currentItems.find((it) => it.component.id === componentId);
      if (targetItem && isM2Drive(targetItem)) {
        const primaryMb = build.components.MOTHERBOARD?.[0]?.component;
        const rawM2 = (primaryMb?.specifications as any)?.m2_slots ?? (primaryMb?.specifications as any)?.m2Slots;
        const m2Slots = Array.isArray(rawM2) ? rawM2.length : null;
        if (m2Slots !== null) {
          const otherM2 = currentItems
            .filter((it) => it.component.id !== componentId && isM2Drive(it))
            .reduce((sum, it) => sum + it.quantity, 0);
          if (otherM2 + quantity > m2Slots) {
            return {
              success: false,
              message: `Cannot exceed ${m2Slots} M.2 slots supported by motherboard.`,
            };
          }
        }
      }
    }

    const updatedItems = currentItems.map((it) =>
      it.component.id === componentId ? { ...it, quantity } : it
    );

    const updatedBuild: Build = {
      ...build,
      components: {
        ...build.components,
        [category]: updatedItems,
      },
      updatedAt: new Date().toISOString(),
    };

    const updatedBuilds = get().builds.map((b) => (b.id === buildId ? updatedBuild : b));
    set({ builds: updatedBuilds });
    await StorageService.saveBuilds(updatedBuilds);
    return { success: true };
  },

  clearBuildComponents: async (buildId: string) => {
    const build = get().builds.find((b) => b.id === buildId);
    if (!build) return;

    const baseMap = {
      CPU: [],
      CPU_COOLER: [],
      MOTHERBOARD: [],
      MEMORY: [],
      INTERNAL_HARD_DRIVE: [],
      VIDEO_CARD: [],
      CASE: [],
      POWER_SUPPLY: [],
    };

    const updatedBuild: Build = {
      ...build,
      components: baseMap,
      updatedAt: new Date().toISOString(),
    };

    const updatedBuilds = get().builds.map((b) => (b.id === buildId ? updatedBuild : b));
    set({ builds: updatedBuilds });
    await StorageService.saveBuilds(updatedBuilds);
  },

  getActiveBuild: () => {
    const { builds, activeBuildId } = get();
    return builds.find((b) => b.id === activeBuildId);
  },

  getBuildById: (id: string) => {
    return get().builds.find((b) => b.id === id);
  },

  getCompatibility: (buildId: string) => {
    const build = get().builds.find((b) => b.id === buildId);
    if (!build) {
      return {
        status: 'COMPATIBLE',
        isValid: true,
        issues: [],
        hasIncompleteData: false,
      };
    }
    return evaluateCompatibility(build);
  },

  getPowerEstimate: (buildId: string) => {
    const build = get().builds.find((b) => b.id === buildId);
    if (!build) {
      return {
        estimatedWattage: 50,
        recommendedWattage: 450,
        baseSystemTdp: 50,
        hasIncompleteData: false,
        breakdown: {},
      };
    }
    return calculatePowerEstimate(build);
  },
}));
