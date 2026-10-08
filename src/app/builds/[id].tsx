import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyView } from '../../components/molecules/empty-view';
import { CompatibilityBanner } from '../../components/organisms/compatibility-banner';
import { PowerSummary } from '../../components/organisms/power-summary';
import { SlotItem } from '../../components/organisms/slot-item';
import { COMPONENT_CATEGORIES, ComponentCategory } from '../../constants/categories';
import { BorderRadius, Fonts, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { useBuildStore } from '../../stores/build.store';
import { evaluateCompatibility } from '../../utils/compatibility';
import { calculatePowerEstimate } from '../../utils/power';

export default function BuildDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const buildId = params.id;

  const builds = useBuildStore((s) => s.builds);
  const isHydrated = useBuildStore((s) => s.isHydrated);
  const renameBuild = useBuildStore((s) => s.renameBuild);
  const duplicateBuild = useBuildStore((s) => s.duplicateBuild);
  const clearBuildComponents = useBuildStore((s) => s.clearBuildComponents);
  const removeComponent = useBuildStore((s) => s.removeComponent);
  const setQuantity = useBuildStore((s) => s.setQuantity);

  const build = useMemo(() => {
    return builds.find((b) => b.id === buildId);
  }, [builds, buildId]);

  // Rename modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renamedName, setRenamedName] = useState('');

  const compatibilityReport = useMemo(() => {
    if (!build) return null;
    return evaluateCompatibility(build);
  }, [build]);

  const powerEstimate = useMemo(() => {
    if (!build) return null;
    return calculatePowerEstimate(build);
  }, [build]);

  const totalItems = useMemo(() => {
    if (!build) return 0;
    let items = 0;
    Object.values(build.components).forEach((catItems) => {
      catItems.forEach((it) => {
        items += it.quantity;
      });
    });
    return items;
  }, [build]);

  if (!isHydrated) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading build configuration...
        </Text>
      </View>
    );
  }

  if (!build) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <EmptyView
          title="Build Not Found"
          message="The requested PC build configuration could not be located."
          actionLabel="Return to My Builds"
          onAction={() => router.replace('/builds' as any)}
          icon="⚠"
        />
      </View>
    );
  }

  const handleOpenRename = () => {
    setRenamedName(build.name);
    setIsRenameModalOpen(true);
  };

  const handleSaveRename = async () => {
    if (!renamedName.trim()) return;
    await renameBuild(build.id, renamedName.trim());
    setIsRenameModalOpen(false);
  };

  const handleDuplicate = async () => {
    try {
      const clonedId = await duplicateBuild(build.id);
      router.replace(`/builds/${clonedId}`);
    } catch {
      Alert.alert('Error', 'Failed to clone build.');
    }
  };

  const handleClear = () => {
    const executeClear = () => clearBuildComponents(build.id);

    if (Platform.OS === 'web') {
      if (window.confirm('Clear all selected parts from this configuration?')) {
        executeClear();
      }
      return;
    }

    Alert.alert(
      'Clear All Components',
      'Are you sure you want to remove all components from this build?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: executeClear },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Navigation Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to builds"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerIconBtn,
            { borderColor: theme.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.headerIconText, { color: theme.text }]}>←</Text>
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text
            numberOfLines={1}
            style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts?.sans }]}
          >
            {build.name}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.textSecondary, fontFamily: Fonts?.sans },
            ]}
          >
            {totalItems} {totalItems === 1 ? 'part' : 'parts'}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rename build"
            onPress={handleOpenRename}
            hitSlop={8}
            style={({ pressed }) => [
              styles.headerIconBtn,
              { borderColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.headerIconText, { color: theme.textSecondary }]}>✎</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clone build"
            onPress={handleDuplicate}
            hitSlop={8}
            style={({ pressed }) => [
              styles.headerIconBtn,
              { borderColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.headerIconText, { color: theme.textSecondary }]}>⎘</Text>
          </Pressable>

          {totalItems > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear all components"
              onPress={handleClear}
              hitSlop={8}
              style={({ pressed }) => [
                styles.headerIconBtn,
                { borderColor: theme.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.headerIconText, { color: theme.error }]}>🗑</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Description Banner if available */}
        {build.description ? (
          <View
            style={[
              styles.descriptionCard,
              { backgroundColor: theme.surfaceSubdued, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.descIcon, { color: theme.primary }]}>ℹ</Text>
            <Text
              style={[
                styles.descriptionText,
                { color: theme.textSecondary, fontFamily: Fonts?.sans },
              ]}
            >
              {build.description}
            </Text>
          </View>
        ) : null}

        {/* Live Compatibility Status */}
        {compatibilityReport ? (
          <CompatibilityBanner report={compatibilityReport} style={styles.sectionMargin} />
        ) : null}

        {/* Live Power Consumption Breakdown */}
        {powerEstimate ? (
          <PowerSummary powerEstimate={powerEstimate} style={styles.sectionMargin} />
        ) : null}

        {/* Overview Summary Card */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            Shadows.sm,
          ]}
        >
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Configured Parts
            </Text>
            <Text style={[styles.summaryVal, { color: theme.text }]}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Estimated Draw
            </Text>
            <Text style={[styles.summaryVal, { color: theme.secondary, fontFamily: Fonts?.mono }]}>
              ~{powerEstimate?.estimatedWattage || 50}W
            </Text>
          </View>

          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Recommended PSU
            </Text>
            <Text style={[styles.summaryVal, { color: theme.primary, fontFamily: Fonts?.mono }]}>
              {powerEstimate?.recommendedWattage || 450}W+
            </Text>
          </View>
        </View>

        {/* Component Slots */}
        <View style={styles.slotsSection}>
          <Text
            style={[styles.sectionHeading, { color: theme.text, fontFamily: Fonts?.sans }]}
          >
            Component Slots
          </Text>

          {COMPONENT_CATEGORIES.map((category: ComponentCategory) => (
            <SlotItem
              key={category}
              category={category}
              items={build.components[category] || []}
              onSelectComponent={() =>
                router.push({
                  pathname: '/explore',
                  params: {
                    category,
                    selectBuildId: build.id,
                  },
                } as any)
              }
              onRemoveItem={(componentId) =>
                removeComponent(build.id, category, componentId)
              }
              onUpdateQuantity={async (componentId, quantity) => {
                const res = await setQuantity(build.id, category, componentId, quantity);
                if (!res.success && res.message) {
                  Alert.alert('Slot Limit Reached', res.message);
                }
              }}
              style={styles.slotSpacing}
            />
          ))}
        </View>
      </ScrollView>

      {/* Rename Modal */}
      <Modal
        visible={isRenameModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRenameModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Shadows.md,
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: theme.text, fontFamily: Fonts?.sans }]}
            >
              Rename Build
            </Text>

            <TextInput
              value={renamedName}
              onChangeText={setRenamedName}
              placeholder="Build Name"
              placeholderTextColor={theme.textSecondary}
              maxLength={60}
              autoFocus
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            <View style={styles.modalBtnRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel rename"
                onPress={() => setIsRenameModalOpen(false)}
                style={({ pressed }) => [
                  styles.modalCancelBtn,
                  { borderColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save rename"
                onPress={handleSaveRename}
                style={({ pressed }) => [
                  styles.modalSaveBtn,
                  { backgroundColor: theme.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Spacing.xxl,
  },
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  descIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionMargin: {
    marginBottom: Spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  summaryCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  slotsSection: {
    gap: Spacing.md,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  slotSpacing: {
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  modalCancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalSaveBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalSaveText: {
    fontWeight: '700',
    color: '#0B1C2D',
  },
});
