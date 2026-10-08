import { create } from 'zustand';
import { StorageService } from '../services/storage.service';

export interface FavoritesState {
  favoriteIds: string[];
  isHydrated: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (componentId: string) => Promise<void>;
  addFavorite: (componentId: string) => Promise<void>;
  removeFavorite: (componentId: string) => Promise<void>;
  isFavorite: (componentId: string) => boolean;
  clearFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],
  isHydrated: false,

  loadFavorites: async () => {
    const ids = await StorageService.loadFavorites();
    set({ favoriteIds: ids, isHydrated: true });
  },

  toggleFavorite: async (componentId: string) => {
    const { favoriteIds } = get();
    const exists = favoriteIds.includes(componentId);
    const updated = exists
      ? favoriteIds.filter((id) => id !== componentId)
      : [...favoriteIds, componentId];

    set({ favoriteIds: updated });
    await StorageService.saveFavorites(updated);
  },

  addFavorite: async (componentId: string) => {
    const { favoriteIds } = get();
    if (favoriteIds.includes(componentId)) return;

    const updated = [...favoriteIds, componentId];
    set({ favoriteIds: updated });
    await StorageService.saveFavorites(updated);
  },

  removeFavorite: async (componentId: string) => {
    const { favoriteIds } = get();
    if (!favoriteIds.includes(componentId)) return;

    const updated = favoriteIds.filter((id) => id !== componentId);
    set({ favoriteIds: updated });
    await StorageService.saveFavorites(updated);
  },

  isFavorite: (componentId: string) => {
    return get().favoriteIds.includes(componentId);
  },

  clearFavorites: async () => {
    set({ favoriteIds: [] });
    await StorageService.saveFavorites([]);
  },
}));
