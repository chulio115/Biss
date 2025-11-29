// BISS App - Dein digitaler Angelbegleiter
// MVP Woche 1: Auth + Fangindex
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type AuthScreen = 'login' | 'register';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  // Loading state
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ade80" />
        <StatusBar style="light" />
      </View>
    );
  }

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        {authScreen === 'login' ? (
          <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
        ) : (
          <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
        )}
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  // Authenticated - show main app
  return (
    <SafeAreaProvider>
      <HomeScreen />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
