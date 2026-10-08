import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Fonts, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export interface ErrorViewProps {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorView({
  title = 'Something went wrong',
  message = 'Unable to load data. Please ensure the API backend is running and try again.',
  code,
  onRetry,
  style,
}: ErrorViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
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
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: `${theme.error}1A` },
          ]}
        >
          <Text style={[styles.iconText, { color: theme.error }]}>!</Text>
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

        {code ? (
          <View
            style={[
              styles.codeBadge,
              { backgroundColor: theme.surfaceSubdued },
            ]}
          >
            <Text
              style={[
                styles.codeText,
                { color: theme.textMuted, fontFamily: Fonts?.mono },
              ]}
            >
              Error Code: {code}
            </Text>
          </View>
        ) : null}

        {onRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry action"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.retryText,
                { color: '#FFFFFF', fontFamily: Fonts?.sans },
              ]}
            >
              Try Again
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 28,
    fontWeight: '800',
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
    marginBottom: Spacing.md,
  },
  codeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  codeText: {
    fontSize: 12,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
