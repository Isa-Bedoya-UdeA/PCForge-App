import { ComponentCategory } from '../constants/categories';

export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type CompatibilityStatus = 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE';

export interface CompatibilityIssue {
  id: string;
  code: string;
  severity: IssueSeverity;
  category?: ComponentCategory;
  affectedCategories: ComponentCategory[];
  title: string;
  message: string;
}

export interface CompatibilityReport {
  status: CompatibilityStatus;
  isValid: boolean;
  issues: CompatibilityIssue[];
  hasIncompleteData: boolean;
}

export interface PowerEstimate {
  estimatedWattage: number;
  recommendedWattage: number;
  baseSystemTdp: number;
  hasIncompleteData: boolean;
  missingComponents?: string[];
  unspecifiedComponents?: string[];
  breakdown: Partial<Record<ComponentCategory, number>>;
}
