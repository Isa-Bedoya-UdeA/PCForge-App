import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/categories';
import { Build, createEmptyComponentsMap } from '../types/build';

/**
 * Ensures build object has all required categories in components map
 * even if stored under an older schema.
 */
function sanitizeBuild(raw: any): Build | null {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') {
    return null;
  }

  const baseMap = createEmptyComponentsMap();
  const rawComponents = raw.components && typeof raw.components === 'object' ? raw.components : {};

  for (const key of Object.keys(baseMap)) {
    if (Array.isArray(rawComponents[key])) {
      (baseMap as any)[key] = rawComponents[key];
    }
  }

  return {
    id: raw.id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : 'Custom PC Build',
    description: typeof raw.description === 'string' ? raw.description : undefined,
    components: baseMap,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

export const StorageService = {
  /**
   * Loads persisted builds from AsyncStorage.
   * Returns empty array if none found or on corruption without throwing.
   */
  async loadBuilds(): Promise<Build[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BUILDS);
      if (!data) return [];

      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      const sanitized: Build[] = [];
      for (const item of parsed) {
        const build = sanitizeBuild(item);
        if (build) sanitized.push(build);
      }
      return sanitized;
    } catch (error) {
      console.warn('[StorageService] Error loading builds from AsyncStorage:', error);
      return [];
    }
  },

  /**
   * Persists builds to AsyncStorage.
   */
  async saveBuilds(builds: Build[]): Promise<void> {
    try {
      const payload = JSON.stringify(builds);
      await AsyncStorage.setItem(STORAGE_KEYS.BUILDS, payload);
    } catch (error) {
      console.warn('[StorageService] Error saving builds to AsyncStorage:', error);
    }
  },

  /**
   * Loads favorite component IDs from AsyncStorage.
   */
  async loadFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (!data) return [];

      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter((id): id is string => typeof id === 'string');
    } catch (error) {
      console.warn('[StorageService] Error loading favorites from AsyncStorage:', error);
      return [];
    }
  },

  /**
   * Persists favorite component IDs to AsyncStorage.
   */
  async saveFavorites(ids: string[]): Promise<void> {
    try {
      const payload = JSON.stringify(ids);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, payload);
    } catch (error) {
      console.warn('[StorageService] Error saving favorites to AsyncStorage:', error);
    }
  },

  /**
   * Clears all local application storage keys.
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.BUILDS),
        AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES),
      ]);
    } catch (error) {
      console.warn('[StorageService] Error clearing storage:', error);
    }
  },
};
