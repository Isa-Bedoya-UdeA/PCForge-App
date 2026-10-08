import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Fonts, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { CompatibilityReport } from '../../types/compatibility';

export interface CompatibilityBannerProps {
  report: CompatibilityReport;
  style?: ViewStyle;
}

export function CompatibilityBanner({ report, style }: CompatibilityBannerProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const status = report.status;
  const isWarning = status === 'WARNING';
  const isIncompatible = status === 'INCOMPATIBLE';

  const statusColor = isIncompatible
    ? theme.error
    : isWarning
    ? theme.warning
    : theme.success;

  const statusTitle = isIncompatible
    ? 'Compatibility Issues Detected'
    : isWarning
    ? 'Compatible with Warnings'
    : 'All Components Fully Compatible';

  const statusDescription = isIncompatible
    ? `${report.issues.filter((i) => i.severity === 'ERROR').length} critical conflict(s) found. Check details below.`
    : isWarning
    ? report.hasIncompleteData
      ? 'Some components lack full specifications. Compatibility cannot be fully guaranteed.'
      : 'Minor warnings detected. Review recommendations.'
    : 'No physical clearance, socket, or power conflicts detected.';

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.surface,
          borderColor: statusColor,
        },
        Shadows.sm,
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Compatibility status: ${statusTitle}. ${report.issues.length} issues.`}
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.header}
      >
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: `${statusColor}20` },
          ]}
        >
          <Text style={[styles.statusIcon, { color: statusColor }]}>
            {isIncompatible ? '✕' : isWarning ? '⚠' : '✓'}
          </Text>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: theme.text, fontFamily: Fonts?.sans },
              ]}
            >
              {statusTitle}
            </Text>
            {report.issues.length > 0 ? (
              <View
                style={[
                  styles.issueCountBadge,
                  { backgroundColor: `${statusColor}25` },
                ]}
              >
                <Text
                  style={[
                    styles.issueCountText,
                    { color: statusColor, fontFamily: Fonts?.mono },
                  ]}
                >
                  {report.issues.length}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            style={[
              styles.description,
              { color: theme.textSecondary, fontFamily: Fonts?.sans },
            ]}
          >
            {statusDescription}
          </Text>
        </View>

        {report.issues.length > 0 ? (
          <Text
            style={[
              styles.chevron,
              { color: theme.textMuted },
            ]}
          >
            {expanded ? '▲' : '▼'}
          </Text>
        ) : null}
      </Pressable>

      {expanded && report.issues.length > 0 ? (
        <View
          style={[
            styles.issuesList,
            { borderTopColor: theme.border },
          ]}
        >
          {report.issues.map((issue) => {
            const isErr = issue.severity === 'ERROR';
            const itemColor = isErr ? theme.error : theme.warning;

            return (
              <View
                key={issue.id}
                style={[
                  styles.issueItem,
                  {
                    backgroundColor: theme.surfaceSubdued,
                    borderLeftColor: itemColor,
                  },
                ]}
              >
                <View style={styles.issueHeader}>
                  <Text
                    style={[
                      styles.issueSeverity,
                      { color: itemColor, fontFamily: Fonts?.mono },
                    ]}
                  >
                    {issue.severity}
                  </Text>
                  <Text
                    style={[
                      styles.issueCategories,
                      { color: theme.textMuted, fontFamily: Fonts?.sans },
                    ]}
                  >
                    [{issue.affectedCategories.join(', ')}]
                  </Text>
                </View>
                <Text
                  style={[
                    styles.issueTitle,
                    { color: theme.text, fontFamily: Fonts?.sans },
                  ]}
                >
                  {issue.title}
                </Text>
                <Text
                  style={[
                    styles.issueMessage,
                    { color: theme.textSecondary, fontFamily: Fonts?.sans },
                  ]}
                >
                  {issue.message}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  issueCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  issueCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 12,
    marginLeft: Spacing.sm,
  },
  issuesList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  issueItem: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  issueSeverity: {
    fontSize: 11,
    fontWeight: '700',
  },
  issueCategories: {
    fontSize: 11,
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  issueMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
});
