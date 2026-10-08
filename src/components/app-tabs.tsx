import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, Text } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#A3BDD5',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          fontFamily: Fonts?.sans,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="builds"
        options={{
          title: 'Builds',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/tabIcons/home.png')}
              style={{ width: 22, height: 22, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color, lineHeight: 22 }}>♥</Text>
          ),
        }}
      />
    </Tabs>
  );
}
