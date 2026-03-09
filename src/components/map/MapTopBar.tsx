/**
 * MapTopBar - Location, Search, Beißzeit-Radar, Day/Night Toggle
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useColorScheme, Image, Animated } from 'react-native';
import { Navigation, Search, Sun, Moon, Crosshair } from 'lucide-react-native';
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
      {/* Left: Navigation Pill */}
      <View style={[styles.pillGroup, isDark && styles.pillGroupDark]}>
        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onMyLocation();
          }}
          activeOpacity={0.7}
        >
          <Crosshair size={18} color={iconColor} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={[styles.pillDivider, isDark && styles.pillDividerDark]} />

        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSearch();
          }}
          activeOpacity={0.7}
        >
          <Search size={18} color={iconColor} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Center: Beißzeit Badge */}
      <TouchableOpacity
        style={[styles.badge, isDark && styles.badgeDark, goldenHourInfo.isGolden && styles.badgeActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onBiteTimePress?.();
        }}
        activeOpacity={0.8}
      >
        {goldenHourInfo.isGolden ? (
          <View style={styles.badgeIconWrap}>
            <Text style={styles.badgeIcon}>🔥</Text>
          </View>
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

      {/* Right: Day/Night Toggle */}
      <TouchableOpacity
        style={[styles.toggle, isDark && styles.toggleDark]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleNight();
        }}
        activeOpacity={0.7}
      >
        {isNightMode ? (
          <Moon size={17} color={isDark ? '#FACC15' : iconColor} strokeWidth={2.2} />
        ) : (
          <Sun size={17} color={isDark ? iconColor : '#F59E0B'} strokeWidth={2.2} />
        )}
        <Text style={[styles.toggleText, isDark && styles.toggleTextDark]}>
          {isNightMode ? 'Nacht' : 'Tag'}
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
    backgroundColor: 'rgba(255,255,255,0.92)',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  topBarWrapDark: {
    backgroundColor: 'rgba(10,26,47,0.95)',
    shadowOpacity: 0.4,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },

  // Pill Group (Location + Search)
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  pillGroupDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  pillDividerDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Beißzeit Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgeDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 4,
  },
  badgeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: { fontSize: 16 },
  badgeLogo: { width: 28, height: 28, borderRadius: 8 },
  badgeLabel: { fontSize: 9, color: 'rgba(10,26,47,0.45)', fontWeight: '600', letterSpacing: 0.3 },
  badgeLabelDark: { color: 'rgba(255,255,255,0.5)' },
  badgeLabelActive: { color: '#B45309', fontWeight: '700' },
  badgeTime: { fontSize: 15, color: BAR_DARK, fontWeight: '700' },
  badgeTimeDark: { color: COLORS.white },
  badgeTimeActive: { color: '#92400E', fontWeight: '800' },

  // Day/Night Toggle
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  toggleDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleText: { fontSize: 13, fontWeight: '600', color: BAR_DARK, letterSpacing: 0.2 },
  toggleTextDark: { color: COLORS.white },
});
