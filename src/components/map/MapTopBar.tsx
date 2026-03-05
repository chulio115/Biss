/**
 * MapTopBar - Location, Search, Beißzeit-Radar, Day/Night Toggle
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useColorScheme, Image } from 'react-native';
import { Navigation, Search, Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';

const BAR_LIGHT = '#FFFFFF';
const BAR_DARK = '#0A1A2F';
const ICON_LIGHT = '#0A1A2F';
const ICON_DARK = '#FFFFFF';

interface MapTopBarProps {
  goldenHourInfo: { isGolden: boolean; nextGolden: string };
  isNightMode: boolean;
  onToggleNight: () => void;
  onMyLocation: () => void;
  onSearch: () => void;
  onBiteTimePress?: () => void;
}

export const MapTopBar: React.FC<MapTopBarProps> = ({
  goldenHourInfo,
  isNightMode,
  onToggleNight,
  onMyLocation,
  onSearch,
  onBiteTimePress,
}) => {
  const isDark = useColorScheme() === 'dark';

  const iconColor = isDark ? ICON_DARK : ICON_LIGHT;
  const labelColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(10,26,47,0.5)';
  const timeColor = isDark ? ICON_DARK : ICON_LIGHT;

  return (
    <View style={[styles.topBarWrap, isDark && styles.topBarWrapDark]}>
      <View style={styles.topBar}>
      <View style={styles.leftGroup}>
        <TouchableOpacity
          style={[styles.iconBtn, isDark && styles.iconBtnDark]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onMyLocation();
          }}
        >
          <Navigation size={20} color={iconColor} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, isDark && styles.iconBtnDark]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSearch();
          }}
        >
          <Search size={20} color={iconColor} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.badge, isDark && styles.badgeDark, goldenHourInfo.isGolden && styles.badgeActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onBiteTimePress?.();
        }}
        activeOpacity={0.8}
      >
        {goldenHourInfo.isGolden ? (
          <Text style={styles.badgeIcon}>🔥</Text>
        ) : (
          <Image source={require('../../../assets/logo.png')} style={styles.badgeLogo} />
        )}
        <View>
          <Text style={[styles.badgeLabel, isDark && styles.badgeLabelDark, goldenHourInfo.isGolden && styles.badgeLabelActive]}>
            {goldenHourInfo.isGolden ? 'BEISSZEIT!' : 'Nächste Beißzeit'}
          </Text>
          <Text style={[styles.badgeTime, isDark && styles.badgeTimeDark, goldenHourInfo.isGolden && styles.badgeTimeActive]}>
            {goldenHourInfo.nextGolden}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.toggle, isDark && styles.toggleDark]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleNight();
        }}
      >
        {isNightMode ? (
          <Moon size={20} color={iconColor} strokeWidth={2} />
        ) : (
          <Sun size={20} color={iconColor} strokeWidth={2} />
        )}
        <Text style={[styles.toggleText, isDark && styles.toggleTextDark]}>
          {isNightMode ? 'Night' : 'Day'}
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBarWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: BAR_LIGHT,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  topBarWrapDark: {
    backgroundColor: BAR_DARK,
    shadowOpacity: 0.3,
  },
  topBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  leftGroup: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 8,
  },
  badgeDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  badgeActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  badgeIcon: { fontSize: 20 },
  badgeLogo: { width: 28, height: 28, borderRadius: 6 },
  badgeLabel: { fontSize: 10, color: 'rgba(10,26,47,0.5)', fontWeight: '500' },
  badgeLabelDark: { color: 'rgba(255,255,255,0.6)' },
  badgeLabelActive: { color: '#B45309', fontWeight: '700' },
  badgeTime: { fontSize: 14, color: BAR_DARK, fontWeight: '600' },
  badgeTimeDark: { color: COLORS.white },
  badgeTimeActive: { color: '#B45309', fontWeight: '800' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  toggleDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleText: { fontSize: 13, fontWeight: '600', color: BAR_DARK },
  toggleTextDark: { color: COLORS.white },
});
