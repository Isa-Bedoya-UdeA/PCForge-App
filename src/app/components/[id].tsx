import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardSkeleton } from '@/components/atoms';
import { ErrorView, SpecRow } from '@/components/molecules';
import { CATEGORY_LABELS, ComponentCategory } from '@/constants/categories';
import {
  BorderRadius,
  BottomTabInset,
  Fonts,
  MaxContentWidth,
  Shadows,
  Spacing,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { componentsService } from '@/services/components.service';
import { useBuildStore } from '@/stores/build.store';
import { useFavoritesStore } from '@/stores/favorites.store';
import { NormalizedComponent } from '@/types/component';

const SINGLE_ITEM_CATEGORIES: ComponentCategory[] = [
  'CPU',
  'MOTHERBOARD',
  'CASE',
  'POWER_SUPPLY',
  'CPU_COOLER',
];

export default function ComponentDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [component, setComponent] = useState<NormalizedComponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuildModalVisible, setIsBuildModalVisible] = useState(false);

  const isFavorite = useFavoritesStore((state) => (id ? state.isFavorite(id) : false));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const builds = useBuildStore((state) => state.builds);
  const addComponent = useBuildStore((state) => state.addComponent);
  const removeComponent = useBuildStore((state) => state.removeComponent);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    async function fetchComponent() {
      try {
        const data = await componentsService.getComponentById(id as string);
        if (isMounted) {
          setComponent(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load component details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchComponent();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleRetry = () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    componentsService
      .getComponentById(id as string)
      .then(setComponent)
      .catch((err: any) => setError(err?.message || 'Failed to load component details.'))
      .finally(() => setIsLoading(false));
  };

  const handleOpenBuildModal = () => {
    if (!component) return;

    if (builds.length === 0) {
      Alert.alert(
        'No Builds Available',
        'Please create a PC build configuration first to add components.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Build', onPress: () => router.push('/builds/create' as any) },
        ]
      );
      return;
    }

    setIsBuildModalVisible(true);
  };

  const handleSelectBuildToAdd = async (targetBuild: typeof builds[0]) => {
    if (!component) return;
    const result = await addComponent(targetBuild.id, component);
    if (result.success) {
      setIsBuildModalVisible(false);
      Alert.alert(
        'Component Added',
        `${component.name} added to "${targetBuild.name}".`,
        [
          { text: 'Keep Browsing', style: 'cancel' },
          { text: 'View Build', onPress: () => router.push(`/builds/${targetBuild.id}` as any) },
        ]
      );
    } else {
      Alert.alert('Cannot Add Component', result.message || 'Slot limit reached.');
    }
  };

  const handleReplaceComponent = (
    targetBuild: typeof builds[0],
    oldComponent: NormalizedComponent
  ) => {
    if (!component) return;
    Alert.alert(
      'Replace Component',
      `Replace "${oldComponent.name}" with "${component.name}" in "${targetBuild.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace',
          style: 'destructive',
          onPress: async () => {
            await removeComponent(targetBuild.id, component.category, oldComponent.id);
            const result = await addComponent(targetBuild.id, component);
            if (result.success) {
              setIsBuildModalVisible(false);
              Alert.alert(
                'Component Replaced',
                `Replaced with ${component.name} in "${targetBuild.name}".`,
                [
                  { text: 'Keep Browsing', style: 'cancel' },
                  { text: 'View Build', onPress: () => router.push(`/builds/${targetBuild.id}` as any) },
                ]
              );
            } else {
              Alert.alert('Cannot Add Component', result.message || 'Error occurred.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.container}>
          <View style={{ padding: Spacing.md }}>
            <CardSkeleton />
            <View style={{ height: Spacing.md }} />
            <CardSkeleton />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !component) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.container}>
          <ErrorView
            title="Component Not Found"
            message={error || 'Unable to retrieve component details.'}
            onRetry={handleRetry}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const categoryLabel = CATEGORY_LABELS[component.category] || component.category;
  const specs = (component.specifications || {}) as Record<string, any>;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={[styles.backIcon, { color: theme.primary, fontFamily: Fonts?.sans }]}>
              ← Back
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            hitSlop={8}
            onPress={() => toggleFavorite(component.id)}
            style={styles.favoriteButton}
          >
            <Text style={[styles.favoriteIcon, { color: isFavorite ? theme.tertiary : theme.textMuted }]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + Spacing.xl },
          ]}
        >
          {/* Main Info Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              Shadows.sm,
            ]}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.badgeText, { color: theme.primary, fontFamily: Fonts?.sans }]}>
                  {categoryLabel}
                </Text>
              </View>
              {component.manufacturer ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: `${theme.secondary}20`,
                      borderColor: `${theme.secondary}50`,
                      borderWidth: StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: theme.secondary, fontFamily: Fonts?.sans, fontWeight: '600' },
                    ]}
                  >
                    {component.manufacturer}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.componentTitle, { color: theme.text, fontFamily: Fonts?.sans }]}>
              {component.name}
            </Text>

            {component.price ? (
              <Text style={[styles.priceText, { color: theme.tertiary, fontFamily: Fonts?.mono }]}>
                ${component.price.toFixed(2)}
              </Text>
            ) : null}

            {/* Add to Build Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${component.name} to a build`}
              onPress={handleOpenBuildModal}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.actionButtonText, { color: '#0B1C2D', fontFamily: Fonts?.sans }]}>
                + Add to Build
              </Text>
            </Pressable>
          </View>

          {/* Technical Specifications Section */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                marginTop: Spacing.md,
              },
              Shadows.sm,
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts?.sans }]}>
              Technical Specifications
            </Text>

            <View style={styles.specsTable}>
              {Object.entries(specs).map(([key, val], idx) => {
                if (val === undefined || val === null || val === '') return null;
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());

                return (
                  <SpecRow
                    key={key}
                    label={formattedKey}
                    value={val}
                    isEven={idx % 2 === 0}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Add to Build Modal */}
      <Modal
        visible={isBuildModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBuildModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Shadows.md,
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.text, fontFamily: Fonts?.sans }]}>
                  Add to Build
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.modalSubtitle, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}
                >
                  {component.name}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close build selector"
                hitSlop={8}
                onPress={() => setIsBuildModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalCloseBtn,
                  { borderColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            {/* Builds List */}
            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {builds.map((b) => {
                const existingItems = b.components[component.category] || [];
                const isAlreadyInBuild = existingItems.some(
                  (it) => it.component.id === component.id
                );
                const isSingleSlot = SINGLE_ITEM_CATEGORIES.includes(component.category);
                const hasExistingDifferent =
                  isSingleSlot && existingItems.length > 0 && !isAlreadyInBuild;
                const oldItem = hasExistingDifferent ? existingItems[0].component : null;

                return (
                  <View
                    key={b.id}
                    style={[
                      styles.buildItemCard,
                      { backgroundColor: theme.surfaceSubdued, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.buildItemInfo}>
                      <Text
                        numberOfLines={1}
                        style={[styles.buildItemName, { color: theme.text, fontFamily: Fonts?.sans }]}
                      >
                        {b.name}
                      </Text>
                      {isAlreadyInBuild ? (
                        <Text style={[styles.buildItemStatus, { color: theme.success }]}>
                          ✓ Already configured in this build
                        </Text>
                      ) : hasExistingDifferent && oldItem ? (
                        <Text
                          numberOfLines={1}
                          style={[styles.buildItemStatus, { color: theme.warning }]}
                        >
                          Has: {oldItem.name}
                        </Text>
                      ) : (
                        <Text style={[styles.buildItemStatus, { color: theme.textSecondary }]}>
                          {isSingleSlot ? 'Slot is available' : `${existingItems.reduce((acc, it) => acc + it.quantity, 0)} installed`}
                        </Text>
                      )}
                    </View>

                    {isAlreadyInBuild ? (
                      <View
                        style={[
                          styles.buildItemBtn,
                          { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                      >
                        <Text style={[styles.buildItemBtnText, { color: theme.textMuted }]}>
                          Added
                        </Text>
                      </View>
                    ) : hasExistingDifferent && oldItem ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Replace in ${b.name}`}
                        onPress={() => handleReplaceComponent(b, oldItem)}
                        style={({ pressed }) => [
                          styles.buildItemBtn,
                          { backgroundColor: `${theme.secondary}25`, borderColor: theme.secondary },
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text style={[styles.buildItemBtnText, { color: theme.secondary, fontWeight: '700' }]}>
                          Replace
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Add to ${b.name}`}
                        onPress={() => handleSelectBuildToAdd(b)}
                        style={({ pressed }) => [
                          styles.buildItemBtn,
                          { backgroundColor: theme.primary, borderColor: theme.primary },
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text style={[styles.buildItemBtnText, { color: '#0B1C2D', fontWeight: '700' }]}>
                          + Add
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create another build"
                onPress={() => {
                  setIsBuildModalVisible(false);
                  router.push('/builds/create' as any);
                }}
                style={({ pressed }) => [
                  styles.modalNewBuildBtn,
                  { borderColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.modalNewBuildText, { color: theme.secondary }]}>
                  + Create New Build
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  componentTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginVertical: Spacing.xs,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  actionButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    minHeight: 48,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  specsTable: {
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalList: {
    maxHeight: 340,
  },
  modalListContent: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  buildItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  buildItemInfo: {
    flex: 1,
  },
  buildItemName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  buildItemStatus: {
    fontSize: 12,
  },
  buildItemBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  buildItemBtnText: {
    fontSize: 13,
  },
  modalFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  modalNewBuildBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalNewBuildText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
