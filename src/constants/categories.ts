export const COMPONENT_CATEGORIES = [
  'CPU',
  'CPU_COOLER',
  'MOTHERBOARD',
  'MEMORY',
  'INTERNAL_HARD_DRIVE',
  'VIDEO_CARD',
  'CASE',
  'POWER_SUPPLY',
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  CPU: 'Processor (CPU)',
  CPU_COOLER: 'CPU Cooler',
  MOTHERBOARD: 'Motherboard',
  MEMORY: 'Memory (RAM)',
  INTERNAL_HARD_DRIVE: 'Storage Drive',
  VIDEO_CARD: 'Graphics Card (GPU)',
  CASE: 'PC Case',
  POWER_SUPPLY: 'Power Supply (PSU)',
};

export const CATEGORY_SHORT_LABELS: Record<ComponentCategory, string> = {
  CPU: 'CPU',
  CPU_COOLER: 'Cooler',
  MOTHERBOARD: 'Motherboard',
  MEMORY: 'RAM',
  INTERNAL_HARD_DRIVE: 'Storage',
  VIDEO_CARD: 'GPU',
  CASE: 'Case',
  POWER_SUPPLY: 'PSU',
};

export const CATEGORY_ICONS: Record<ComponentCategory, string> = {
  CPU: 'cpu',
  CPU_COOLER: 'fan',
  MOTHERBOARD: 'developer-board',
  MEMORY: 'memory',
  INTERNAL_HARD_DRIVE: 'hard-drive',
  VIDEO_CARD: 'monitor',
  CASE: 'desktop-mac',
  POWER_SUPPLY: 'flash-on',
};

export const CATEGORY_LIMITS: Record<
  ComponentCategory,
  {
    min: number;
    max: number;
    allowMulti: boolean;
    required: boolean;
  }
> = {
  CPU: { min: 1, max: 1, allowMulti: false, required: true },
  CPU_COOLER: { min: 0, max: 1, allowMulti: false, required: false },
  MOTHERBOARD: { min: 1, max: 1, allowMulti: false, required: true },
  MEMORY: { min: 1, max: 4, allowMulti: true, required: true },
  INTERNAL_HARD_DRIVE: { min: 1, max: 6, allowMulti: true, required: true },
  VIDEO_CARD: { min: 0, max: 2, allowMulti: true, required: false },
  CASE: { min: 1, max: 1, allowMulti: false, required: true },
  POWER_SUPPLY: { min: 1, max: 1, allowMulti: false, required: true },
};

export const COMMERCIAL_PSU_TIERS: readonly number[] = [
  450, 550, 650, 750, 850, 1000, 1200, 1500,
] as const;

export const BASE_SYSTEM_TDP_WATTS = 50;
export const POWER_SAFETY_MARGIN_MULTIPLIER = 1.3;

export const STORAGE_KEYS = {
  BUILDS: 'pcforge_v1_builds',
  FAVORITES: 'pcforge_v1_favorites',
} as const;

export function isComponentCategory(value: unknown): value is ComponentCategory {
  return (
    typeof value === 'string' &&
    COMPONENT_CATEGORIES.includes(value as ComponentCategory)
  );
}
