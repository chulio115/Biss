/**
 * 🆕 EnhancedMarker Component
 * Premium Marker Design mit Animationen
 * 
 * Features:
 * - Zoom-adaptive Größe
 * - Pulse-Animation für HotSpots (80+)
 * - Kategorie-basierte Icons
 * - Mini-Foto Thumbnail für offizielle Spots
 * - Glowing Shadow für Night Mode
 * - Selection State mit Ring
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Check, Sparkles, MapPin, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type SpotCategory = 'fangindex' | 'official' | 'hidden' | 'mystery';

interface EnhancedMarkerProps {
  fangIndex: number;
  category: SpotCategory;
  name: string;
  isSelected?: boolean;
  isNightMode?: boolean;
  zoomLevel?: number;
  thumbnailUrl?: string;
  onPress: () => void;
}

// Category config
const CATEGORY_CONFIG = {
  fangindex: { icon: Target, color: '#F59E0B', bg: '#FEF3C7' },
  official: { icon: Check, color: '#10B981', bg: '#D1FAE5' },
  hidden: { icon: Sparkles, color: '#8B5CF6', bg: '#EDE9FE' },
  mystery: { icon: MapPin, color: '#06B6D4', bg: '#CFFAFE' },
};

// Score color helper
const getScoreColor = (score: number): string => {
  if (score >= 70) return '#4ADE80';
  if (score >= 50) return '#FACC15';
  return '#EF4444';
};

// Size based on zoom level and score
const getMarkerSize = (zoom: number, score: number, isHotSpot: boolean): number => {
  const baseSize = zoom < 10 ? 28 : zoom < 13 ? 36 : 44;
  return isHotSpot ? baseSize + 8 : baseSize;
};

export const EnhancedMarker: React.FC<EnhancedMarkerProps> = ({
  fangIndex,
  category,
  name,
  isSelected = false,
  isNightMode = false,
  zoomLevel = 12,
  thumbnailUrl,
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const isHotSpot = fangIndex >= 80;
  const isFangindexCategory = category === 'fangindex';
  const markerSize = getMarkerSize(zoomLevel, fangIndex, isHotSpot);
  const categoryConfig = CATEGORY_CONFIG[category];
  const CategoryIcon = categoryConfig.icon;

  // Pulse animation for hot spots
  useEffect(() => {
    if (isHotSpot && isFangindexCategory) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isHotSpot, isFangindexCategory]);

  // Selection scale animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.15 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Dynamic colors
  const markerColor = isFangindexCategory 
    ? getScoreColor(fangIndex) 
    : categoryConfig.color;
  
  const glowColor = isNightMode 
    ? markerColor 
    : 'transparent';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.container}
    >
      {/* Pulse Ring for Hot Spots */}
      {isHotSpot && isFangindexCategory && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: markerSize + 24,
              height: markerSize + 24,
              borderRadius: (markerSize + 24) / 2,
              backgroundColor: `${markerColor}30`,
              borderColor: `${markerColor}50`,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Selection Ring */}
      {isSelected && (
        <View
          style={[
            styles.selectionRing,
            {
              width: markerSize + 14,
              height: markerSize + 14,
              borderRadius: (markerSize + 14) / 2,
            },
          ]}
        />
      )}

      {/* Main Marker */}
      <Animated.View
        style={[
          styles.marker,
          {
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
            backgroundColor: markerColor,
            transform: [{ scale: scaleAnim }],
            // Night mode glow
            shadowColor: glowColor,
            shadowOpacity: isNightMode ? 0.8 : 0.25,
            shadowRadius: isNightMode ? 12 : 4,
          },
        ]}
      >
        {/* Thumbnail for official spots with photo */}
        {category === 'official' && thumbnailUrl && markerSize >= 40 ? (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={[styles.thumbnail, { 
                width: markerSize - 6, 
                height: markerSize - 6,
                borderRadius: (markerSize - 6) / 2,
              }]}
            />
            <View style={[styles.thumbnailBadge, { backgroundColor: categoryConfig.color }]}>
              <CategoryIcon size={10} color="#FFFFFF" />
            </View>
          </View>
        ) : (
          // Score or Icon
          <>
            {isFangindexCategory ? (
              <Text style={[
                styles.scoreText,
                { fontSize: markerSize * 0.35 }
              ]}>
                {fangIndex}
              </Text>
            ) : (
              <CategoryIcon 
                size={markerSize * 0.4} 
                color="#FFFFFF" 
                strokeWidth={2.5}
              />
            )}
          </>
        )}
      </Animated.View>

      {/* Pointer Arrow */}
      <View
        style={[
          styles.arrow,
          { borderTopColor: markerColor }
        ]}
      />

      {/* Name Label (only at high zoom) */}
      {zoomLevel >= 14 && (
        <View style={[styles.nameLabel, isNightMode && styles.nameLabelDark]}>
          <Text 
            style={[styles.nameLabelText, isNightMode && styles.nameLabelTextDark]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  selectionRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#0066FF',
    backgroundColor: 'transparent',
  },
  marker: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -3,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameLabel: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nameLabelDark: {
    backgroundColor: 'rgba(19,35,55,0.95)',
  },
  nameLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  nameLabelTextDark: {
    color: '#FFFFFF',
  },
});

export default EnhancedMarker;
