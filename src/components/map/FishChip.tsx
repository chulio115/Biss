/**
 * FishChip - Premium fish species chip with icon and confidence badge
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#00A3FF',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray800: '#262626',
  scoreHigh: '#4ADE80',
  scoreMedium: '#FACC15',
  scoreLow: '#EF4444',
  dark: {
    card: '#243B4D',
  },
};

// Fish database with icons
const FISH_DATABASE: Record<string, { name: string; icon: string; color: string }> = {
  forelle: { name: 'Forelle', icon: '🐟', color: '#FF6B6B' },
  karpfen: { name: 'Karpfen', icon: '🐡', color: '#FFB347' },
  hecht: { name: 'Hecht', icon: '🦈', color: '#4ECDC4' },
  zander: { name: 'Zander', icon: '🐠', color: '#45B7D1' },
  barsch: { name: 'Barsch', icon: '🎣', color: '#96CEB4' },
  aal: { name: 'Aal', icon: '🐍', color: '#6C5B7B' },
  wels: { name: 'Wels', icon: '🐋', color: '#355C7D' },
  schleie: { name: 'Schleie', icon: '🐡', color: '#99B898' },
  brassen: { name: 'Brassen', icon: '🐟', color: '#E8A87C' },
  rotauge: { name: 'Rotauge', icon: '👁️', color: '#C06C84' },
  regenbogenforelle: { name: 'Regenbogenforelle', icon: '🌈', color: '#FF69B4' },
  bachforelle: { name: 'Bachforelle', icon: '🐟', color: '#DAA520' },
};

const normalizeFishName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-zäöü]/g, '');
};

interface FishChipProps {
  fishName: string;
  confidence?: 'high' | 'medium' | 'low';
  isNight?: boolean;
}

export const FishChip: React.FC<FishChipProps> = ({ 
  fishName, 
  confidence = 'medium', 
  isNight = false 
}) => {
  const normalized = normalizeFishName(fishName);
  const fishData = FISH_DATABASE[normalized] || { 
    name: fishName, 
    icon: '🐟', 
    color: COLORS.primary 
  };

  const confidenceColor = {
    high: COLORS.scoreHigh,
    medium: COLORS.scoreMedium,
    low: COLORS.scoreLow,
  }[confidence];

  return (
    <View style={[
      styles.container,
      isNight && styles.containerNight,
    ]}>
      <View style={[styles.iconCircle, { backgroundColor: fishData.color + '20' }]}>
        <Text style={styles.icon}>{fishData.icon}</Text>
      </View>
      <Text style={[
        styles.name,
        isNight && styles.nameNight,
      ]}>
        {fishData.name}
      </Text>
      <View style={[styles.badge, { backgroundColor: confidenceColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 10,
  },
  containerNight: {
    backgroundColor: COLORS.dark.card,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  nameNight: {
    color: COLORS.white,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default FishChip;
