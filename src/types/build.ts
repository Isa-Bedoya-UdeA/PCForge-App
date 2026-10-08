import { ComponentCategory, COMPONENT_CATEGORIES } from '../constants/categories';
import { NormalizedComponent } from './component';

export interface BuildComponentItem {
  component: NormalizedComponent;
  quantity: number;
}

export type BuildComponentsMap = Record<ComponentCategory, BuildComponentItem[]>;

export interface Build {
  id: string;
  name: string;
  description?: string;
  components: BuildComponentsMap;
  createdAt: string;
  updatedAt: string;
}

export function createEmptyComponentsMap(): BuildComponentsMap {
  const map = {} as BuildComponentsMap;
  for (const cat of COMPONENT_CATEGORIES) {
    map[cat] = [];
  }
  return map;
}

export function createNewBuild(
  id: string,
  name = 'New Custom Build',
  description?: string
): Build {
  const now = new Date().toISOString();
  return {
    id,
    name,
    description,
    components: createEmptyComponentsMap(),
    createdAt: now,
    updatedAt: now,
  };
}
