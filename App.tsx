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
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TabNavigator } from './src/navigation/TabNavigator';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

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

function AppContent() {
  const { isDark } = useTheme();

  // Skip auth for development - show main app directly
  return (
    <>
      <TabNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <NavigationContainer>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </NavigationContainer>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.light.bg,
  },
  containerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  logoDark: {
    // No change needed for emoji
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  demoButtonDark: {
    // Same for dark mode
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerLineDark: {
    backgroundColor: '#374151',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#6B7280',
  },
  textLight: {
    color: '#FFFFFF',
  },
  textMuted: {
    color: '#6B7280',
  },
});
