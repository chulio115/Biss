/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SmartRecommendationCard - Intelligente Spot-Empfehlungen
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * NICHT einfach nur Top 3 nach Score!
 * Sondern kategorisierte Empfehlungen:
 * - 🔥 "Perfekt für JETZT" - Best considering current conditions
 * - 📍 "Nah & gut" - Best value distance vs score
 * - 🌤️ "Wetter-Tipp" - Best for current weather
 * 
 * "Above and Beyond" Features:
 * - Kategorie-basierte Darstellung
 * - Animated score circle
 * - Haptic feedback
 * - Contextual reasoning
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SmartRecommendation } from '../../services/smartFishing';

interface SmartRecommendationCardProps {
  recommendation: SmartRecommendation;
  index: number;
  onPress: (spotId: string) => void;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<SmartRecommendation['category'], readonly [string, string]> = {
  perfect_now: ['#FF6B6B', '#FF8E53'] as const,
  nearby: ['#4ECDC4', '#44A08D'] as const,
  golden_hour: ['#F2994A', '#F2C94C'] as const,
  hidden_gem: ['#667EEA', '#764BA2'] as const,
  weather_pick: ['#56CCF2', '#2F80ED'] as const,
};

export const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  recommendation,
  index,
  onPress,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  const colors = CATEGORY_COLORS[recommendation.category] || CATEGORY_COLORS.perfect_now;
  
  // Entrance animation
  useEffect(() => {
    const delay = index * 120;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Press animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress(recommendation.spotId);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#9CA3AF';
  };
  
  // ─── Compact Card (for horizontal scroll) ───
  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={styles.compactTouchable}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.compactGradient}
          >
            {/* Category Badge */}
            <View style={styles.compactCategoryBadge}>
              <Text style={styles.compactCategoryIcon}>{recommendation.categoryIcon}</Text>
              <Text style={styles.compactCategoryLabel}>{recommendation.categoryLabel}</Text>
            </View>
            
            {/* Score */}
            <View style={styles.compactScoreContainer}>
              <Text style={styles.compactScore}>{recommendation.score}</Text>
            </View>
            
            {/* Spot Name */}
            <Text style={styles.compactSpotName} numberOfLines={1}>
              {recommendation.spotName}
            </Text>
            
            {/* Distance */}
            <Text style={styles.compactDistance}>
              {recommendation.distance.toFixed(1)}km • {recommendation.timing}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  
  // ─── Full Card ───
  return (
    <Animated.View
      style={[
        styles.container,
        isDark && styles.containerDark,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        {/* Header with Category */}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.categoryIcon}>{recommendation.categoryIcon}</Text>
          <Text style={styles.categoryLabel}>{recommendation.categoryLabel}</Text>
        </LinearGradient>
        
        {/* Content */}
        <View style={styles.content}>
          {/* Left: Score Circle */}
          <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(recommendation.score) }]}>
            <Text style={styles.scoreText}>{recommendation.score}</Text>
          </View>
          
          {/* Middle: Info */}
          <View style={styles.info}>
            <Text style={[styles.spotName, isDark && styles.textLight]} numberOfLines={1}>
              {recommendation.spotName}
            </Text>
            <Text style={[styles.reason, isDark && styles.textMuted]}>
              {recommendation.reason}
            </Text>
            <Text style={styles.timing}>{recommendation.timing}</Text>
          </View>
          
          {/* Right: Distance & Fish */}
          <View style={styles.meta}>
            <Text style={styles.distance}>{recommendation.distance.toFixed(1)}km</Text>
            <View style={styles.fishContainer}>
              {recommendation.bestFish.slice(0, 2).map((fish, i) => (
                <Text key={i} style={styles.fishEmoji}>🐟</Text>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Smart Recommendations List - Horizontal Scroll
// ─────────────────────────────────────────────────────────────────────────────

interface SmartRecommendationsListProps {
  recommendations: SmartRecommendation[];
  onRecommendationPress: (spotId: string) => void;
  variant?: 'horizontal' | 'vertical';
}

export const SmartRecommendationsList: React.FC<SmartRecommendationsListProps> = ({
  recommendations,
  onRecommendationPress,
  variant = 'horizontal',
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }
  
  if (variant === 'vertical') {
    return (
      <View style={styles.verticalList}>
        {recommendations.map((rec, index) => (
          <SmartRecommendationCard
            key={rec.id}
            recommendation={rec}
            index={index}
            onPress={onRecommendationPress}
          />
        ))}
      </View>
    );
  }
  
  return (
    <View style={styles.horizontalList}>
      {recommendations.map((rec, index) => (
        <SmartRecommendationCard
          key={rec.id}
          recommendation={rec}
          index={index}
          onPress={onRecommendationPress}
          compact
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Full Card
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  containerDark: {
    backgroundColor: '#1A2D44',
  },
  touchable: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reason: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  timing: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  meta: {
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066FF',
  },
  fishContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  fishEmoji: {
    fontSize: 14,
    marginLeft: -4,
  },
  textLight: {
    color: '#FFFFFF',
  },
  textMuted: {
    color: '#9CA3AF',
  },
  
  // Compact Card
  compactContainer: {
    marginRight: 12,
    width: 160,
  },
  compactTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  compactGradient: {
    padding: 12,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  compactCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactCategoryIcon: {
    fontSize: 14,
  },
  compactCategoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  compactScoreContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactScore: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  compactSpotName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  compactDistance: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  
  // Lists
  horizontalList: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingVertical: 8,
  },
  verticalList: {
    paddingVertical: 8,
  },
});

export default SmartRecommendationCard;
