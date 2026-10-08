import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Fonts, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export interface EmptyViewProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyView({
  title = 'No items found',
  message = 'Try modifying your search or check back later.',
  icon = '🔍',
  actionLabel,
  onAction,
  style,
}: EmptyViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.surfaceSubdued },
        ]}
      >
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      <Text style={[styles.title, { color: theme.text, fontFamily: Fonts?.sans }]}>
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          { color: theme.textSecondary, fontFamily: Fonts?.sans },
        ]}
      >
        {message}
      </Text>

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: theme.primaryLight,
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.actionText,
              { color: theme.primary, fontFamily: Fonts?.sans },
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
