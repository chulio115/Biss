/**
 * BISS Tab Navigator - Premium 2026 Design
 * 
 * Features:
 * - Glassmorphism blur effect
 * - Prominent center tab (Map/Karte)
 * - Active state with colored background pill
 * - Smooth animations
 */
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Map, Users, User, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootTabParamList } from './types';
import { MapScreen } from '../screens/MapScreen';
import { CatchBookScreen } from '../screens/CatchBookScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICON_SIZE = 22;
const ICON_SIZE_CENTER = 26;
const ICON_STROKE = 1.8;


export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="MapStack"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? COLORS.accent : COLORS.tab.active,
        tabBarInactiveTintColor: isDark ? COLORS.gray400 : COLORS.tab.inactive,
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
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          backgroundColor: isDark ? COLORS.backgroundDark : COLORS.background,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
        },
      }}
    >
      <Tab.Screen
        name="MapStack"
        component={MapScreen}
        options={{
          tabBarLabel: 'Karte',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.centerTab, focused && styles.centerTabActive]}>
              <Map
                size={ICON_SIZE_CENTER}
                strokeWidth={focused ? 2.2 : ICON_STROKE}
                color={focused ? COLORS.tab.active : color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="CatchBookStack"
        component={CatchBookScreen}
        options={{
          tabBarLabel: 'Fänge',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.iconActive}>
              <BookOpen
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color={color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="CommunityStack"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.iconActive}>
              <Users
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
    transform: [{ scale: 1.05 }],
  },
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.tab.activeBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  centerTabActive: {
    backgroundColor: COLORS.tab.activeBgDark,
    shadowColor: COLORS.tab.active,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default TabNavigator;
