import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Fonts, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export interface SpecRowProps {
  label: string;
  value: string | number | boolean | null | undefined;
  unit?: string;
  isEven?: boolean;
  style?: ViewStyle;
}

export function formatSpecValue(
  value: string | number | boolean | null | undefined,
  unit?: string
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, any>;
    if ('total' in obj) {
      const parts = [`${obj.total} cores`];
      if (obj.threads) parts.push(`${obj.threads} threads`);
      if (obj.performance && obj.performance > 0) parts.push(`${obj.performance} P-cores`);
      if (obj.efficiency && obj.efficiency > 0) parts.push(`${obj.efficiency} E-cores`);
      return parts.join(' • ');
    }
    if ('performance' in obj || 'efficiency' in obj) {
      const p = obj.performance;
      const e = obj.efficiency;
      const parts: string[] = [];
      if (p && (p.base || p.boost)) {
        if (p.base && p.boost) {
          parts.push(`${p.base} GHz base / ${p.boost} GHz boost`);
        } else if (p.base) {
          parts.push(`${p.base} GHz base`);
        } else if (p.boost) {
          parts.push(`${p.boost} GHz boost`);
        }
      }
      if (e && (e.base || e.boost)) {
        if (e.base && e.boost) {
          parts.push(`Eff: ${e.base} - ${e.boost} GHz`);
        } else if (e.base) {
          parts.push(`Eff: ${e.base} GHz`);
        } else if (e.boost) {
          parts.push(`Eff boost: ${e.boost} GHz`);
        }
      }
      if (parts.length > 0) return parts.join(' • ');
    }
    if ('base' in obj && 'boost' in obj) {
      return `${obj.base} GHz base / ${obj.boost} GHz boost`;
    }
    if ('count' in obj) {
      return `${obj.count}`;
    }
    if ('l1' in obj || 'l2' in obj || 'l3' in obj) {
      const cacheParts: string[] = [];
      if (obj.l3) cacheParts.push(`L3: ${obj.l3} MB`);
      if (obj.l2) cacheParts.push(`L2: ${obj.l2} MB`);
      if (cacheParts.length > 0) return cacheParts.join(' • ');
    }
    if ('model' in obj) {
      return `${obj.model}${obj.shaderCount ? ` (${obj.shaderCount} shaders)` : ''}`;
    }
    if ('types' in obj && 'maxSupport' in obj) {
      return `${obj.types?.join(', ') || ''} (up to ${obj.maxSupport} GB)`;
    }
    try {
      const parts = Object.entries(obj)
        .filter(([_, v]) => v !== 0 && v !== '' && v !== null && v !== false)
        .map(([k, v]) => {
          if (typeof v === 'object') {
            return `${k}: ${formatSpecValue(v)}`;
          }
          return `${k}: ${v}`;
        });
      if (parts.length > 0) return parts.join(', ');
    } catch {
      // Fallback
    }
    return '—';
  }
  if (unit) {
    return `${value} ${unit}`;
  }
  return String(value);
}

export function SpecRow({ label, value, unit, isEven, style }: SpecRowProps) {
  const theme = useTheme();
  const formattedValue = formatSpecValue(value, unit);

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isEven ? `${theme.surfaceSubdued}50` : 'transparent',
          borderBottomColor: theme.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: theme.textSecondary, fontFamily: Fonts?.sans },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          { color: theme.text, fontFamily: Fonts?.sans },
        ]}
        numberOfLines={2}
      >
        {formattedValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1.2,
  },
});
