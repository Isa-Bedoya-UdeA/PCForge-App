import { ComponentCategory } from '../constants/categories';

export interface CpuSpecifications {
  socket?: string;
  tdp?: number;
  cores?: number;
  threads?: number;
  baseClockGhz?: number;
  boostClockGhz?: number;
  integratedGraphics?: boolean | string;
  [key: string]: unknown;
}

export interface CpuCoolerSpecifications {
  supportedSockets?: string[];
  fanRpm?: string | number;
  noiseLevelDb?: number;
  radiatorSizeMm?: number;
  heightMm?: number;
  [key: string]: unknown;
}

export interface MotherboardSpecifications {
  socket?: string;
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX' | string;
  memoryType?: 'DDR4' | 'DDR5' | string;
  memorySlots?: number;
  maxMemoryGb?: number;
  sataPorts?: number;
  m2Slots?: number;
  pcieSlots?: number;
  [key: string]: unknown;
}

export interface MemorySpecifications {
  memoryType?: 'DDR4' | 'DDR5' | string;
  speedMhz?: number;
  modules?: number;
  capacityGb?: number;
  casLatency?: number;
  [key: string]: unknown;
}

export interface StorageSpecifications {
  interfaceType?: 'NVMe' | 'SATA' | 'M.2' | 'PCIe' | string;
  capacityGb?: number;
  type?: 'SSD' | 'HDD' | string;
  formFactor?: '2.5"' | '3.5"' | 'M.2-2280' | string;
  [key: string]: unknown;
}

export interface VideoCardSpecifications {
  lengthMm?: number;
  tdp?: number;
  wattage?: number;
  recommendedPsuWattage?: number;
  memoryGb?: number;
  interface?: string;
  slotsUsed?: number;
  [key: string]: unknown;
}

export interface CaseSpecifications {
  supportedFormFactors?: string[];
  maxGpuLengthMm?: number;
  maxCoolerHeightMm?: number;
  sidePanel?: string;
  driveBays35?: number;
  driveBays25?: number;
  [key: string]: unknown;
}

export interface PowerSupplySpecifications {
  wattage?: number;
  efficiencyRating?: '80+ Bronze' | '80+ Gold' | '80+ Platinum' | '80+ Titanium' | string;
  modular?: 'Full' | 'Semi' | 'No' | boolean | string;
  formFactor?: string;
  [key: string]: unknown;
}

export type ComponentSpecifications =
  | CpuSpecifications
  | CpuCoolerSpecifications
  | MotherboardSpecifications
  | MemorySpecifications
  | StorageSpecifications
  | VideoCardSpecifications
  | CaseSpecifications
  | PowerSupplySpecifications
  | Record<string, unknown>;

export interface NormalizedComponent<T = Record<string, unknown>> {
  id: string;
  category: ComponentCategory;
  name: string;
  manufacturer: string | null;
  specifications: T;
  price?: number;
  imageUrl?: string;
}

export interface ComponentFilterQuery {
  category?: ComponentCategory;
  search?: string;
  q?: string;
  manufacturer?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface PaginatedComponentsResponse {
  data: NormalizedComponent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
