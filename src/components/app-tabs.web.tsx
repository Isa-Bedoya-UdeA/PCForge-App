import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './atoms/themed-text';
import { ThemedView } from './atoms/themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Catalog</TabButton>
          </TabTrigger>
          <TabTrigger name="builds" href="/builds" asChild>
            <TabButton>Builds</TabButton>
          </TabTrigger>
          <TabTrigger name="favorites" href="/favorites" asChild>
            <TabButton>Favorites</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}
      >
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          PCForge Mobile
        </ThemedText>

        <View style={styles.tabButtonsRow}>{props.children}</View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 9999,
    width: '90%',
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandText: {
    paddingLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: '700',
  },
  tabButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tabButtonView: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 9999,
  },
  pressed: {
    opacity: 0.7,
  },
});
