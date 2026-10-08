import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useBuildStore } from '@/stores/build.store';
import { useFavoritesStore } from '@/stores/favorites.store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [, setIsReady] = useState(false);

  useEffect(() => {
    async function hydrateAppData() {
      try {
        await Promise.all([
          useBuildStore.getState().loadBuilds(),
          useFavoritesStore.getState().loadFavorites(),
        ]);
      } catch (error) {
        console.warn('[RootLayout] Storage hydration error on launch:', error);
      } finally {
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch {
          // Splash screen might already be hidden
        }
      }
    }

    hydrateAppData();
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="builds/create" options={{ headerShown: false }} />
        <Stack.Screen name="builds/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="components/[id]" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
