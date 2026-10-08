import { StorageService } from '../../services/storage.service';
import { useFavoritesStore } from '../../stores/favorites.store';

describe('useFavoritesStore', () => {
  beforeEach(async () => {
    await useFavoritesStore.getState().clearFavorites();
  });

  it('should hydrate favorites from StorageService', async () => {
    await StorageService.saveFavorites(['comp-a', 'comp-b']);

    await useFavoritesStore.getState().loadFavorites();
    const state = useFavoritesStore.getState();

    expect(state.favoriteIds).toEqual(['comp-a', 'comp-b']);
    expect(state.isHydrated).toBe(true);
  });

  it('should toggle favorite status correctly', async () => {
    const store = useFavoritesStore.getState();

    expect(store.isFavorite('comp-1')).toBe(false);

    await store.toggleFavorite('comp-1');
    expect(useFavoritesStore.getState().isFavorite('comp-1')).toBe(true);

    await store.toggleFavorite('comp-1');
    expect(useFavoritesStore.getState().isFavorite('comp-1')).toBe(false);
  });

  it('should add and remove favorite components', async () => {
    const store = useFavoritesStore.getState();

    await store.addFavorite('comp-x');
    expect(useFavoritesStore.getState().favoriteIds).toContain('comp-x');

    // Adding duplicate does not add second entry
    await store.addFavorite('comp-x');
    expect(useFavoritesStore.getState().favoriteIds.filter((id) => id === 'comp-x')).toHaveLength(1);

    await store.removeFavorite('comp-x');
    expect(useFavoritesStore.getState().favoriteIds).not.toContain('comp-x');
  });
});
