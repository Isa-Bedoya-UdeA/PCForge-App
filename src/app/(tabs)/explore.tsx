import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyView, ErrorView } from '@/components/molecules';
import { ComponentCard } from '@/components/organisms';
import { LoadingSkeletonList } from '@/components/atoms';
import {
  CATEGORY_SHORT_LABELS,
  COMPONENT_CATEGORIES,
  ComponentCategory,
} from '@/constants/categories';
import {
  BorderRadius,
  BottomTabInset,
  Fonts,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { componentsService } from '@/services/components.service';
import { useBuildStore } from '@/stores/build.store';
import { NormalizedComponent } from '@/types/component';

const PAGE_SIZE = 20;

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; selectBuildId?: string }>();

  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'ALL'>(
    (params.category as ComponentCategory) || 'ALL'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [components, setComponents] = useState<NormalizedComponent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComponentToBuild = useBuildStore((state) => state.addComponent);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevParamCategory, setPrevParamCategory] = useState(params.category);
  if (params.category !== prevParamCategory) {
    setPrevParamCategory(params.category);
    if (params.category && COMPONENT_CATEGORIES.includes(params.category as ComponentCategory)) {
      setSelectedCategory(params.category as ComponentCategory);
    }
  }

  // Debounce search term by 300ms
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(text.trim());
    }, 300);
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchInitialPage() {
      try {
        const queryCat = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const res = await componentsService.getComponents({
          category: queryCat,
          search: debouncedSearch || undefined,
          page: 1,
          pageSize: PAGE_SIZE,
        });

        if (isMounted) {
          setComponents(res.data);
          setPage(res.pagination.page);
          setTotalPages(res.pagination.totalPages);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to connect to the component catalog');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setRefreshing(false);
        }
      }
    }

    fetchInitialPage();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, debouncedSearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const queryCat = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const res = await componentsService.getComponents({
        category: queryCat,
        search: debouncedSearch || undefined,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setComponents(res.data);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the component catalog');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEndReached = async () => {
    if (isLoadingMore || page >= totalPages) return;
    try {
      setIsLoadingMore(true);
      const queryCat = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const res = await componentsService.getComponents({
        category: queryCat,
        search: debouncedSearch || undefined,
        page: page + 1,
        pageSize: PAGE_SIZE,
      });
      setComponents((prev) => [...prev, ...res.data]);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.totalPages);
    } catch {
      // Ignored
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSelectComponent = async (component: NormalizedComponent) => {
    if (params.selectBuildId) {
      await addComponentToBuild(params.selectBuildId, component);
      router.replace(`/builds/${params.selectBuildId}` as any);
      return;
    }
    router.push(`/components/${component.id}` as any);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts?.sans }]}>
            Component Catalog
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}
          >
            {params.selectBuildId ? 'Select part to add to build' : 'Explore and compare PC hardware'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            accessibilityLabel="Search catalog components"
            placeholder="Search processor, GPU, motherboard..."
            placeholderTextColor={theme.textMuted}
            value={searchTerm}
            onChangeText={handleSearchChange}
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
                fontFamily: Fonts?.sans,
              },
            ]}
          />
        </View>

        {/* Category Selector Pills */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['ALL', ...COMPONENT_CATEGORIES] as (ComponentCategory | 'ALL')[]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoriesContent}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item;
              const label =
                item === 'ALL'
                  ? 'All Parts'
                  : CATEGORY_SHORT_LABELS[item as ComponentCategory] || item;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${label}`}
                  onPress={() => setSelectedCategory(item)}
                  style={({ pressed }) => [
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? theme.secondary : theme.surface,
                      borderColor: isSelected ? theme.secondary : theme.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                        fontFamily: Fonts?.sans,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Content Area */}
        {isLoading ? (
          <LoadingSkeletonList count={5} style={{ paddingBottom: BottomTabInset }} />
        ) : error ? (
          <ErrorView
            message={error}
            onRetry={onRefresh}
            style={{ marginTop: Spacing.xl }}
          />
        ) : components.length === 0 ? (
          <EmptyView
            title="No Components Found"
            message={
              debouncedSearch
                ? `No components match "${debouncedSearch}". Try a different keyword.`
                : 'No hardware components available in this category.'
            }
            actionLabel={debouncedSearch ? 'Clear Search' : 'Show All Parts'}
            onAction={() => {
              setSearchTerm('');
              setDebouncedSearch('');
              setSelectedCategory('ALL');
            }}
            style={{ marginTop: Spacing.xl }}
          />
        ) : (
          <FlatList
            data={components}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: BottomTabInset + Spacing.lg },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
              />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <ComponentCard
                component={item}
                onPress={() => handleSelectComponent(item)}
              />
            )}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <Text style={{ color: theme.textMuted, fontSize: 13, fontFamily: Fonts?.sans }}>
                    Loading more components...
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  categoriesWrapper: {
    marginVertical: Spacing.xs,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  footerLoader: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
