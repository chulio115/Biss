/**
 * BISS Tab Navigator - 2026 Clean Design
 * 
 * Bottom Navigation mit Blur-Effekt
 * Icons: lucide-react-native
 * Farben: #00A3FF (active), #94A3B8 (inactive)
 */
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { FileText, Map, Ticket, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootTabParamList } from './types';
import { ScheinScreen } from '../screens/ScheinScreen';
import { MapScreen } from '../screens/MapScreen';
import { BuyScreen } from '../screens/BuyScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Design Tokens
const COLORS = {
  active: '#00A3FF',
  inactive: '#94A3B8',
  background: 'rgba(255, 255, 255, 0.85)',
  backgroundDark: 'rgba(10, 26, 47, 0.92)',
  border: 'rgba(0, 0, 0, 0.05)',
  borderDark: 'rgba(255, 255, 255, 0.1)',
};

const ICON_SIZE = 24;
const ICON_STROKE = 1.8;

interface TabBarBackgroundProps {
  isDark: boolean;
}

// Blur Background Component
const TabBarBackground: React.FC<TabBarBackgroundProps> = ({ isDark }) => (
  <BlurView
    intensity={80}
    tint={isDark ? 'dark' : 'light'}
    style={StyleSheet.absoluteFill}
  />
);

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  // For now, we'll detect dark mode from system
  const isDark = false; // Can be connected to useColorScheme() later

  return (
    <Tab.Navigator
      initialRouteName="MapStack"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: -2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 84,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: isDark ? COLORS.borderDark : COLORS.border,
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarBackground: () => <TabBarBackground isDark={isDark} />,
      }}
    >
      <Tab.Screen
        name="ScheinStack"
        component={ScheinScreen}
        options={{
          tabBarLabel: 'Schein',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.iconActive}>
              <FileText
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color={color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="MapStack"
        component={MapScreen}
        options={{
          tabBarLabel: 'Karte',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.iconActive}>
              <Map
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color={color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="BuyStack"
        component={BuyScreen}
        options={{
          tabBarLabel: 'Kaufen',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.iconActive}>
              <Ticket
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color={color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="ProfileStack"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.iconActive}>
              <User
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconActive: {
    // Subtle scale effect for active icon
    transform: [{ scale: 1.05 }],
  },
});

export default TabNavigator;
