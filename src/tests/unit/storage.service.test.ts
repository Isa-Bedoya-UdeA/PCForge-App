import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/categories';
import { StorageService } from '../../services/storage.service';
import { createNewBuild } from '../../types/build';

describe('StorageService', () => {
  it('should return empty array when no builds are stored', async () => {
    const builds = await StorageService.loadBuilds();
    expect(builds).toEqual([]);
  });

  it('should save and load builds correctly', async () => {
    const sampleBuild = createNewBuild('bld-save-test', 'Gaming Rig');
    await StorageService.saveBuilds([sampleBuild]);

    const loaded = await StorageService.loadBuilds();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('bld-save-test');
    expect(loaded[0].name).toBe('Gaming Rig');
  });

  it('should handle corrupted JSON data gracefully without throwing', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.BUILDS, 'invalid{{json-content');

    const loaded = await StorageService.loadBuilds();
    expect(loaded).toEqual([]);
  });

  it('should save and load favorite IDs correctly', async () => {
    const favorites = ['comp-cpu-1', 'comp-gpu-2'];
    await StorageService.saveFavorites(favorites);

    const loaded = await StorageService.loadFavorites();
    expect(loaded).toEqual(favorites);
  });

  it('should return empty array for corrupted favorites data', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, 'not[valid json');

    const loaded = await StorageService.loadFavorites();
    expect(loaded).toEqual([]);
  });

  it('should clear all storage keys', async () => {
    await StorageService.saveBuilds([createNewBuild('bld-temp')]);
    await StorageService.saveFavorites(['comp-1']);

    await StorageService.clearAll();

    const builds = await StorageService.loadBuilds();
    const favorites = await StorageService.loadFavorites();
    expect(builds).toEqual([]);
    expect(favorites).toEqual([]);
  });
});
