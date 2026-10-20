import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LoadingSkeletonList } from '@/components/atoms/loading-skeleton';
import { EmptyView } from '@/components/molecules/empty-view';
import { ComponentCard } from '@/components/organisms/component-card';
import { BorderRadius, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { componentsService } from '@/services/components.service';
import { BuildState, useBuildStore } from '@/stores/build.store';
import { FavoritesState, useFavoritesStore } from '@/stores/favorites.store';
import { NormalizedComponent } from '@/types/component';

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const favoriteIds = useFavoritesStore((s: FavoritesState) => s.favoriteIds);
  const isHydrated = useFavoritesStore((s: FavoritesState) => s.isHydrated);
  const clearFavorites = useFavoritesStore((s: FavoritesState) => s.clearFavorites);
  const builds = useBuildStore((s: BuildState) => s.builds);
  const activeBuildId = useBuildStore((s: BuildState) => s.activeBuildId);
  const addComponentToBuild = useBuildStore((s: BuildState) => s.addComponent);

  const [components, setComponents] = useState<NormalizedComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayedComponents = useMemo(() => {
    return components.filter((c) => favoriteIds.includes(c.id));
  }, [components, favoriteIds]);

  useEffect(() => {
    let isMounted = true;
    if (!isHydrated || favoriteIds.length === 0) {
      return;
    }

    async function fetchFavorites() {
      try {
        const results = await Promise.allSettled(
          favoriteIds.map((id: string) => componentsService.getComponentById(id))
        );

        const loaded: NormalizedComponent[] = [];
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value) {
            loaded.push(res.value);
          }
        });

        if (isMounted) {
          setComponents(loaded);
        }
      } catch {
        // Handled gracefully
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setRefreshing(false);
        }
      }
    }

    fetchFavorites();
    return () => {
      isMounted = false;
    };
  }, [isHydrated, favoriteIds]);

  const onRefresh = async () => {
    if (favoriteIds.length === 0) return;
    setRefreshing(true);
    try {
      const results = await Promise.allSettled(
        favoriteIds.map((id: string) => componentsService.getComponentById(id))
      );
      const loaded: NormalizedComponent[] = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value) {
          loaded.push(res.value);
        }
      });
      setComponents(loaded);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to clear all favorites?');
      if (confirmed) {
        clearFavorites();
      }
      return;
    }

    Alert.alert('Clear Favorites', 'Are you sure you want to clear all bookmarked items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => clearFavorites() },
    ]);
  };

  const handleAddToBuild = (item: NormalizedComponent) => {
    if (builds.length === 0) {
      Alert.alert(
        'No Builds Available',
        'You have no PC builds yet. Create a build first to add components.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Build', onPress: () => router.push('/builds/create' as any) },
        ]
      );
      return;
    }

    const targetBuild = builds.find((b) => b.id === activeBuildId) || builds[0];
    addComponentToBuild(targetBuild.id, item).then((res) => {
      if (res.success) {
        Alert.alert(
          'Part Added',
          `Added ${item.name} to "${targetBuild.name}".`,
          [
            { text: 'Keep Browsing', style: 'cancel' },
            {
              text: 'Open Build',
              onPress: () => router.push(`/builds/${targetBuild.id}` as any),
            },
          ]
        );
      } else {
        Alert.alert('Unable to Add', res.message || 'Build limits reached.');
      }
    });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 20, color: theme.tertiary }}>♥</Text>
            <Text style={[styles.screenTitle, { color: theme.text, fontFamily: Fonts?.sans }]}>
              Bookmarks & Favorites
            </Text>
          </View>
          <Text
            style={[
              styles.screenSubtitle,
              { color: theme.textSecondary, fontFamily: Fonts?.sans },
            ]}
          >
            {favoriteIds.length} {favoriteIds.length === 1 ? 'part' : 'parts'} saved
          </Text>
        </View>

        {favoriteIds.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear all favorites"
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.clearBtn,
              { borderColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.clearBtnText, { color: theme.error }]}>🗑 Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Body Content */}
      {isLoading && !refreshing && components.length === 0 ? (
        <LoadingSkeletonList count={6} style={{ padding: Spacing.md }} />
      ) : favoriteIds.length === 0 ? (
        <EmptyView
          title="No Saved Parts Yet"
          message="Browse the component catalog and tap the bookmark icon on any processor, graphics card, or motherboard to pin it here."
          actionLabel="Explore Catalog"
          onAction={() => router.push('/explore' as any)}
          icon="♥"
        />
      ) : (
        <FlatList
          data={displayedComponents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ComponentCard
              component={item}
              onPress={() => router.push(`/components/${item.id}` as any)}
              onAddToBuild={() => handleAddToBuild(item)}
              style={styles.cardItem}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.tertiary}
              colors={[theme.tertiary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  screenSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 110,
    gap: Spacing.md,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  cardItem: {
    marginBottom: 0,
  },
});
