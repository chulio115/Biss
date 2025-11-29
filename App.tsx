/**
 * BISS App - Dein digitaler Angelbegleiter
 * 
 * 2026 Clean Design Navigation:
 * - Bottom Tab Navigator (Schein, Karte, Kaufen, Profil)
 * - Auth Flow (Login/Register)
 * - Native Mapbox Integration
 */
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TabNavigator } from './src/navigation/TabNavigator';

// Design Tokens
const COLORS = {
  primary: '#00A3FF',
  dark: {
    bg: '#0A1A2F',
  },
  light: {
    bg: '#FFFFFF',
  },
};

type AuthScreen = 'login' | 'register';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loading, isDark && styles.loadingDark]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.flex}>
          {authScreen === 'login' ? (
            <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
          ) : (
            <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
          )}
        </GestureHandlerRootView>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  // Authenticated - show main app with Tab Navigation
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.light.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDark: {
    backgroundColor: COLORS.dark.bg,
  },
});
