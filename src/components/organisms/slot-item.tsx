import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  CATEGORY_LABELS,
  CATEGORY_LIMITS,
  ComponentCategory,
} from '../../constants/categories';
import { BorderRadius, Fonts, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { BuildComponentItem } from '../../types/build';

export interface SlotItemProps {
  category: ComponentCategory;
  items: BuildComponentItem[];
  onSelectComponent: () => void;
  onRemoveItem: (componentId: string) => void;
  onUpdateQuantity?: (componentId: string, quantity: number) => void;
  style?: ViewStyle;
}

export function SlotItem({
  category,
  items,
  onSelectComponent,
  onRemoveItem,
  onUpdateQuantity,
  style,
}: SlotItemProps) {
  const theme = useTheme();
  const rule = CATEGORY_LIMITS[category];
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const isOccupied = items.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.categoryTitle,
            { color: theme.textSecondary, fontFamily: Fonts?.sans },
          ]}
        >
          {categoryLabel}
          {rule.required ? <Text style={{ color: theme.tertiary }}> *</Text> : null}
        </Text>

        {isOccupied && rule.allowMulti ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add another ${categoryLabel}`}
            onPress={onSelectComponent}
            style={({ pressed }) => [
              styles.addMoreButton,
              {
                backgroundColor: theme.surfaceSubdued,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.addMoreText,
                { color: theme.primary, fontFamily: Fonts?.sans },
              ]}
            >
              + Add
            </Text>
          </Pressable>
        ) : null}
      </View>

      {!isOccupied ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Select ${categoryLabel}`}
          onPress={onSelectComponent}
          style={({ pressed }) => [
            styles.emptySlotButton,
            {
              backgroundColor: theme.surfaceSubdued,
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.emptyPlus,
              { color: theme.primary, fontFamily: Fonts?.sans },
            ]}
          >
            +
          </Text>
          <Text
            style={[
              styles.emptySlotText,
              { color: theme.primary, fontFamily: Fonts?.sans },
            ]}
          >
            Select {categoryLabel}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View
              key={item.component.id}
              style={[
                styles.itemRow,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.itemInfo}>
                <Text
                  style={[
                    styles.itemName,
                    { color: theme.text, fontFamily: Fonts?.sans },
                  ]}
                  numberOfLines={1}
                >
                  {item.component.name}
                </Text>
                {item.component.manufacturer ? (
                  <Text
                    style={[
                      styles.itemManufacturer,
                      { color: theme.textSecondary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    {item.component.manufacturer}
                  </Text>
                ) : null}
              </View>

              <View style={styles.controlsRow}>
                {rule.allowMulti && onUpdateQuantity ? (
                  <View style={styles.quantityStepper}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Decrease quantity"
                      hitSlop={6}
                      onPress={() =>
                        onUpdateQuantity(item.component.id, item.quantity - 1)
                      }
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.surface },
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: theme.text }]}>
                        -
                      </Text>
                    </Pressable>

                    <Text
                      style={[
                        styles.quantityValue,
                        { color: theme.text, fontFamily: Fonts?.mono },
                      ]}
                    >
                      {item.quantity}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Increase quantity"
                      hitSlop={6}
                      onPress={() =>
                        onUpdateQuantity(item.component.id, item.quantity + 1)
                      }
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.surface },
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: theme.text }]}>
                        +
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {!rule.allowMulti ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Change ${categoryLabel}`}
                    onPress={onSelectComponent}
                    style={({ pressed }) => [
                      styles.changeButton,
                      {
                        backgroundColor: theme.surface,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeButtonText,
                        { color: theme.primary, fontFamily: Fonts?.sans },
                      ]}
                    >
                      Change
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.component.name}`}
                  hitSlop={8}
                  onPress={() => onRemoveItem(item.component.id)}
                  style={({ pressed }) => [
                    styles.removeButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Text style={[styles.removeButtonText, { color: theme.error }]}>
                    ✕
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addMoreButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptySlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    minHeight: 48,
  },
  emptyPlus: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsList: {
    gap: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemManufacturer: {
    fontSize: 12,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantityValue: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
  },
  changeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
