import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CATEGORY_SHORT_LABELS, ComponentCategory } from '../../constants/categories';
import { BorderRadius, Fonts, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { PowerEstimate } from '../../types/compatibility';

export interface PowerSummaryProps {
  powerEstimate: PowerEstimate;
  style?: ViewStyle;
}

export function PowerSummary({ powerEstimate, style }: PowerSummaryProps) {
  const theme = useTheme();

  const {
    estimatedWattage,
    recommendedWattage,
    baseSystemTdp,
    hasIncompleteData,
    missingComponents,
    unspecifiedComponents,
    breakdown,
  } = powerEstimate;

  const allUnspecified = [
    ...(missingComponents || []),
    ...(unspecifiedComponents || []),
  ];
  const showWarning = hasIncompleteData || allUnspecified.length > 0;

  const marginWattage = Math.ceil(estimatedWattage * 1.3);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        Shadows.sm,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text
            style={[
              styles.heading,
              { color: theme.text, fontFamily: Fonts?.sans },
            ]}
          >
            Power & PSU Recommendation
          </Text>
          <Text
            style={[
              styles.subheading,
              { color: theme.textSecondary, fontFamily: Fonts?.sans },
            ]}
          >
            Estimated draw + 30% engineering safety margin
          </Text>
        </View>

        <View
          style={[
            styles.psuTierBadge,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Text
            style={[
              styles.psuTierLabel,
              { color: theme.primary, fontFamily: Fonts?.sans },
            ]}
          >
            Rec. PSU
          </Text>
          <Text
            style={[
              styles.psuTierValue,
              { color: theme.primary, fontFamily: Fonts?.mono },
            ]}
          >
            {recommendedWattage}W
          </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: theme.surfaceSubdued },
          ]}
        >
          <Text
            style={[
              styles.metricLabel,
              { color: theme.textSecondary, fontFamily: Fonts?.sans },
            ]}
          >
            Estimated Draw
          </Text>
          <Text
            style={[
              styles.metricValue,
              { color: theme.text, fontFamily: Fonts?.mono },
            ]}
          >
            {estimatedWattage} W
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: theme.surfaceSubdued },
          ]}
        >
          <Text
            style={[
              styles.metricLabel,
              { color: theme.textSecondary, fontFamily: Fonts?.sans },
            ]}
          >
            With +30% Margin
          </Text>
          <Text
            style={[
              styles.metricValue,
              { color: theme.secondary, fontFamily: Fonts?.mono },
            ]}
          >
            {marginWattage} W
          </Text>
        </View>
      </View>

      {/* Breakdown chips */}
      <View style={styles.breakdownSection}>
        <Text
          style={[
            styles.breakdownTitle,
            { color: theme.textSecondary, fontFamily: Fonts?.sans },
          ]}
        >
          Power Breakdown:
        </Text>
        <View style={styles.chipsRow}>
          <View
            style={[
              styles.chip,
              { backgroundColor: theme.surfaceSubdued, borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: theme.textMuted, fontFamily: Fonts?.mono },
              ]}
            >
              Base: {baseSystemTdp}W
            </Text>
          </View>
          {Object.entries(breakdown).map(([catKey, watts]) => {
            if (!watts || watts <= 0) return null;
            const catLabel =
              CATEGORY_SHORT_LABELS[catKey as ComponentCategory] || catKey;
            return (
              <View
                key={catKey}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.surfaceSubdued,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary, fontFamily: Fonts?.mono },
                  ]}
                >
                  {catLabel}: {watts}W
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {showWarning ? (
        <View
          style={[
            styles.warningBanner,
            { backgroundColor: `${theme.warning}15`, borderColor: theme.warning },
          ]}
        >
          <Text
            style={[
              styles.warningText,
              { color: theme.warning, fontFamily: Fonts?.sans },
            ]}
          >
            ⚠ Warning: Some components {allUnspecified.length > 0 ? `(${allUnspecified.slice(0, 2).join(', ')}${allUnspecified.length > 2 ? ` +${allUnspecified.length - 2} more` : ''}) ` : ''}do not specify discrete TDP or voltage. The calculation uses baseline average estimates (~50W base); actual power draw may be higher. Select a PSU with sufficient headroom.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 12,
    marginTop: 2,
  },
  psuTierBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minWidth: 84,
  },
  psuTierLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  psuTierValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  breakdownSection: {
    marginTop: Spacing.xs,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xxs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 11,
  },
  warningBanner: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
