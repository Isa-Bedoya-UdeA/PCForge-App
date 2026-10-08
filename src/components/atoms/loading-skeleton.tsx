import React, { useEffect, useState } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const [opacityAnim] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.surfaceSubdued,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export interface CardSkeletonProps {
  style?: ViewStyle;
}

export function CardSkeleton({ style }: CardSkeletonProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={BorderRadius.md} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="60%" height={16} borderRadius={BorderRadius.sm} />
          <View style={{ height: Spacing.xs }} />
          <Skeleton width="40%" height={12} borderRadius={BorderRadius.xs} />
        </View>
      </View>
      <View style={{ height: Spacing.md }} />
      <View style={styles.cardSpecs}>
        <Skeleton width="45%" height={14} borderRadius={BorderRadius.xs} />
        <Skeleton width="45%" height={14} borderRadius={BorderRadius.xs} />
      </View>
    </View>
  );
}

export interface LoadingSkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export function LoadingSkeletonList({ count = 4, style }: LoadingSkeletonListProps) {
  return (
    <View style={[styles.listContainer, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={`skeleton-${index}`} style={styles.listItem} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listItem: {
    marginBottom: Spacing.sm,
  },
});
