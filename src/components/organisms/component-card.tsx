import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CATEGORY_SHORT_LABELS } from '../../constants/categories';
import { BorderRadius, Fonts, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { useFavoritesStore } from '../../stores/favorites.store';
import { NormalizedComponent } from '../../types/component';

export interface ComponentCardProps {
  component: NormalizedComponent;
  onPress?: () => void;
  onAddToBuild?: () => void;
  style?: ViewStyle;
}

function getKeySpecsSummary(component: NormalizedComponent): string[] {
  const specs = (component.specifications || {}) as Record<string, any>;
  const category = component.category;
  const badges: string[] = [];

  switch (category) {
    case 'CPU':
      if (specs.socket) badges.push(String(specs.socket));
      if (specs.cores) {
        let coresCount = specs.cores;
        if (typeof coresCount === 'object' && coresCount !== null) {
          coresCount = coresCount.total ?? coresCount.count ?? coresCount.performance ?? '';
        }
        if (coresCount) badges.push(`${coresCount} Cores`);
      }
      if (specs.tdp) badges.push(`${specs.tdp}W`);
      break;
    case 'VIDEO_CARD':
      if (specs.memoryGb) badges.push(`${specs.memoryGb}GB`);
      if (specs.lengthMm) badges.push(`${specs.lengthMm}mm`);
      if (specs.tdp || specs.wattage) badges.push(`${specs.tdp || specs.wattage}W`);
      break;
    case 'MOTHERBOARD':
      if (specs.socket) badges.push(String(specs.socket));
      if (specs.formFactor) badges.push(String(specs.formFactor));
      if (specs.memoryType) badges.push(String(specs.memoryType));
      break;
    case 'MEMORY':
      if (specs.memoryType) badges.push(String(specs.memoryType));
      if (specs.capacityGb) badges.push(`${specs.capacityGb}GB`);
      if (specs.speedMhz) badges.push(`${specs.speedMhz}MHz`);
      break;
    case 'CASE':
      if (Array.isArray(specs.supportedFormFactors)) {
        badges.push(specs.supportedFormFactors[0] || 'ATX');
      }
      if (specs.maxGpuLengthMm) badges.push(`GPU ≤ ${specs.maxGpuLengthMm}mm`);
      break;
    case 'POWER_SUPPLY':
      if (specs.wattage) badges.push(`${specs.wattage}W`);
      if (specs.efficiencyRating) badges.push(String(specs.efficiencyRating));
      break;
    case 'INTERNAL_HARD_DRIVE':
      if (specs.capacityGb) badges.push(`${specs.capacityGb}GB`);
      if (specs.interfaceType) badges.push(String(specs.interfaceType));
      break;
    case 'CPU_COOLER':
      if (specs.radiatorSizeMm) badges.push(`${specs.radiatorSizeMm}mm AIO`);
      else if (specs.heightMm) badges.push(`${specs.heightMm}mm Air`);
      break;
  }

  return badges.slice(0, 3);
}

export function ComponentCard({
  component,
  onPress,
  onAddToBuild,
  style,
}: ComponentCardProps) {
  const theme = useTheme();
  const isFavorite = useFavoritesStore((state) => state.isFavorite(component.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const categoryLabel = CATEGORY_SHORT_LABELS[component.category] || component.category;
  const keyBadges = getKeySpecsSummary(component);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${component.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.92 : 1,
        },
        Shadows.sm,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: theme.primary, fontFamily: Fonts?.sans },
                ]}
              >
                {categoryLabel}
              </Text>
            </View>

            {component.manufacturer ? (
              <View
                style={[
                  styles.manufacturerBadge,
                  {
                    backgroundColor: `${theme.secondary}20`,
                    borderColor: `${theme.secondary}50`,
                    borderWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.manufacturerBadgeText,
                    { color: theme.secondary, fontFamily: Fonts?.sans, fontWeight: '600' },
                  ]}
                >
                  {component.manufacturer}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[
              styles.nameText,
              { color: theme.text, fontFamily: Fonts?.sans },
            ]}
            numberOfLines={2}
          >
            {component.name}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(component.id);
          }}
          style={styles.favoriteButton}
        >
          <Text
            style={[
              styles.favoriteIcon,
              { color: isFavorite ? theme.tertiary : theme.textMuted },
            ]}
          >
            {isFavorite ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      {keyBadges.length > 0 ? (
        <View style={styles.specChipsRow}>
          {keyBadges.map((badge, idx) => (
            <View
              key={`badge-${idx}`}
              style={[
                styles.specChip,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.specChipText,
                  { color: theme.textSecondary, fontFamily: Fonts?.mono },
                ]}
              >
                {badge}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footerRow}>
        {component.price && component.price > 0 ? (
          <Text
            style={[
              styles.priceText,
              { color: theme.tertiary, fontFamily: Fonts?.mono },
            ]}
          >
            ${component.price.toFixed(2)}
          </Text>
        ) : <View />}

        {onAddToBuild ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${component.name} to active build`}
            onPress={(e) => {
              e.stopPropagation();
              onAddToBuild();
            }}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: `${theme.primary}18`,
                borderColor: theme.primary,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.addButtonText,
                { color: theme.primary, fontFamily: Fonts?.sans },
              ]}
            >
              + Add to Build
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  manufacturerBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  manufacturerBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  specChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  specChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  specChipText: {
    fontSize: 12,
  },
  footerRow: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
