import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyView } from '@/components/molecules/empty-view';
import { BorderRadius, Fonts, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBuildStore } from '@/stores/build.store';
import { Build } from '@/types/build';
import { evaluateCompatibility } from '@/utils/compatibility';
import { calculatePowerEstimate } from '@/utils/power';

interface BuildCardProps {
  build: Build;
  onPress: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function BuildCard({ build, onPress, onDuplicate, onDelete }: BuildCardProps) {
  const theme = useTheme();

  const totalItems = useMemo(() => {
    let items = 0;
    Object.values(build.components).forEach((catItems) => {
      catItems.forEach((it) => {
        items += it.quantity;
      });
    });
    return items;
  }, [build.components]);

  const report = useMemo(() => evaluateCompatibility(build), [build]);
  const power = useMemo(() => calculatePowerEstimate(build), [build]);

  const isWarning = report.status === 'WARNING';
  const isIncompatible = report.status === 'INCOMPATIBLE';
  const compatColor = isIncompatible
    ? theme.error
    : isWarning
    ? theme.warning
    : theme.success;

  const compatIcon = isIncompatible ? '×' : isWarning ? '⚠' : '✓';
  const compatLabel = isIncompatible
    ? 'Incompatible'
    : isWarning
    ? 'Warnings'
    : 'Compatible';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open build ${build.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buildCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        Shadows.sm,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text
            numberOfLines={1}
            style={[styles.buildName, { color: theme.text, fontFamily: Fonts?.sans }]}
          >
            {build.name}
          </Text>
          {build.description ? (
            <Text
              numberOfLines={2}
              style={[
                styles.buildDescription,
                { color: theme.textSecondary, fontFamily: Fonts?.sans },
              ]}
            >
              {build.description}
            </Text>
          ) : null}
        </View>

        {/* Action icons */}
        <View style={styles.cardActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Duplicate build ${build.name}`}
            onPress={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: theme.surfaceSubdued },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.actionIconText, { color: theme.textSecondary }]}>⎘</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete build ${build.name}`}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: theme.surfaceSubdued },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.actionIconText, { color: theme.error }]}>🗑</Text>
          </Pressable>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={[styles.metricsRow, { borderTopColor: theme.border }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Parts
          </Text>
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {totalItems}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Est. Draw
          </Text>
          <Text style={[styles.metricValue, { color: theme.secondary, fontFamily: Fonts?.mono }]}>
            ~{power.estimatedWattage}W
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Rec. PSU
          </Text>
          <Text style={[styles.metricValue, { color: theme.primary, fontFamily: Fonts?.mono }]}>
            {power.recommendedWattage}W+
          </Text>
        </View>

        {/* Compatibility badge */}
        <View
          style={[
            styles.compatBadge,
            { backgroundColor: compatColor + '20', borderColor: compatColor },
          ]}
        >
          <Text style={[styles.compatIconText, { color: compatColor }]}>
            {compatIcon}
          </Text>
          <Text style={[styles.compatText, { color: compatColor }]}>
            {compatLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function BuildsListScreen() {
  const theme = useTheme();
  const router = useRouter();

  const builds = useBuildStore((s) => s.builds);
  const duplicateBuild = useBuildStore((s) => s.duplicateBuild);
  const deleteBuild = useBuildStore((s) => s.deleteBuild);

  const handleDuplicate = async (build: Build) => {
    try {
      const clonedId = await duplicateBuild(build.id);
      router.push(`/builds/${clonedId}` as any);
    } catch {
      Alert.alert('Error', 'Unable to duplicate build.');
    }
  };

  const handleDelete = (build: Build) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${build.name}"? This action cannot be undone.`
      );
      if (confirmed) {
        deleteBuild(build.id);
      }
      return;
    }

    Alert.alert(
      'Delete Build',
      `Are you sure you want to delete "${build.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBuild(build.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.screenHeader,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.screenTitle, { color: theme.text, fontFamily: Fonts?.sans }]}>
            My Builds
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: theme.textSecondary, fontFamily: Fonts?.sans },
            ]}
          >
            {builds.length} {builds.length === 1 ? 'configuration' : 'configurations'} saved
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create new PC build"
          onPress={() => router.push('/builds/create' as any)}
          style={({ pressed }) => [
            styles.newBuildBtn,
            { backgroundColor: theme.secondary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.newBuildBtnText}>+ New Build</Text>
        </Pressable>
      </View>

      {/* List or Empty State */}
      {builds.length === 0 ? (
        <EmptyView
          title="No Saved Builds Yet"
          message="Create your first custom PC build to assemble hardware, verify physical and socket compatibility, and calculate power consumption."
          actionLabel="Create First Build"
          onAction={() => router.push('/builds/create' as any)}
          icon="💻"
        />
      ) : (
        <FlatList
          data={builds}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BuildCard
              build={item}
              onPress={() => router.push(`/builds/${item.id}` as any)}
              onDuplicate={() => handleDuplicate(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
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
  newBuildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  newBuildBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 110,
    gap: Spacing.md,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  buildCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  titleArea: {
    flex: 1,
  },
  buildName: {
    fontSize: 17,
    fontWeight: '700',
  },
  buildDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  metricItem: {
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  compatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  compatIconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  compatText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
