/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SmartInsightCard - Kontextbewusste Insight-Anzeige
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Zeigt intelligente Tipps basierend auf:
 * - Tageszeit (Morgenbiss, Goldene Stunde)
 * - Wetter (Druckabfall, Wind, Temperatur)
 * - Mondphase (Vollmond = Aale!)
 * 
 * "Above and Beyond" Features:
 * - Animated entrance
 * - Haptic feedback on tap
 * - Contextual colors
 * - Actionable buttons
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
import * as Haptics from 'expo-haptics';
import { SmartInsight } from '../../services/smartFishing';

interface SmartInsightCardProps {
  insight: SmartInsight;
  index: number;
  onAction?: (action: SmartInsight['actionable']) => void;
  onDismiss?: () => void;
}

const COLORS = {
  opportunity: {
    bg: '#ECFDF5',
    bgDark: '#064E3B',
    border: '#10B981',
    text: '#065F46',
    textDark: '#A7F3D0',
  },
  warning: {
    bg: '#FEF3C7',
    bgDark: '#78350F',
    border: '#F59E0B',
    text: '#92400E',
    textDark: '#FDE68A',
  },
  tip: {
    bg: '#EFF6FF',
    bgDark: '#1E3A5F',
    border: '#3B82F6',
    text: '#1E40AF',
    textDark: '#BFDBFE',
  },
  timing: {
    bg: '#FDF4FF',
    bgDark: '#581C87',
    border: '#A855F7',
    text: '#7C3AED',
    textDark: '#E9D5FF',
  },
};

export const SmartInsightCard: React.FC<SmartInsightCardProps> = ({
  insight,
  index,
  onAction,
  onDismiss,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Get colors based on insight type
  const typeColors = COLORS[insight.type] || COLORS.tip;
  
  // Animate in on mount
  useEffect(() => {
    const delay = index * 100; // Stagger animation
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (insight.actionable && onAction) {
      onAction(insight.actionable);
    }
  };
  
  const handleDismiss = () => {
    Haptics.selectionAsync();
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? typeColors.bgDark : typeColors.bg,
          borderLeftColor: typeColors.border,
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={!insight.actionable}
      >
        {/* Icon */}
        <Text style={styles.icon}>{insight.icon}</Text>
        
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isDark ? typeColors.textDark : typeColors.text },
            ]}
          >
            {insight.title}
          </Text>
          <Text
            style={[
              styles.message,
              { color: isDark ? typeColors.textDark : typeColors.text },
            ]}
            numberOfLines={2}
          >
            {insight.message}
          </Text>
          
          {/* Action Button */}
          {insight.actionable && (
            <View style={[styles.actionButton, { backgroundColor: typeColors.border }]}>
              <Text style={styles.actionText}>{insight.actionable.label}</Text>
            </View>
          )}
        </View>
        
        {/* Priority Indicator */}
        {insight.priority === 'high' && (
          <View style={[styles.priorityDot, { backgroundColor: typeColors.border }]} />
        )}
      </TouchableOpacity>
      
      {/* Dismiss Button */}
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Smart Insight Banner - Compact Version for Map Overlay
// ─────────────────────────────────────────────────────────────────────────────

interface SmartInsightBannerProps {
  insights: SmartInsight[];
  onInsightPress?: (insight: SmartInsight) => void;
}

export const SmartInsightBanner: React.FC<SmartInsightBannerProps> = ({
  insights,
  onInsightPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Only show highest priority insight
  const topInsight = insights[0];
  
  if (!topInsight) return null;
  
  const typeColors = COLORS[topInsight.type] || COLORS.tip;
  
  return (
    <TouchableOpacity
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? typeColors.bgDark : typeColors.bg,
          borderColor: typeColors.border,
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onInsightPress?.(topInsight);
      }}
      activeOpacity={0.8}
    >
      <Text style={styles.bannerIcon}>{topInsight.icon}</Text>
      <View style={styles.bannerTextContainer}>
        <Text
          style={[
            styles.bannerTitle,
            { color: isDark ? typeColors.textDark : typeColors.text },
          ]}
        >
          {topInsight.title}
        </Text>
        <Text
          style={[
            styles.bannerMessage,
            { color: isDark ? typeColors.textDark : typeColors.text },
          ]}
          numberOfLines={1}
        >
          {topInsight.message}
        </Text>
      </View>
      {insights.length > 1 && (
        <View style={styles.moreIndicator}>
          <Text style={styles.moreText}>+{insights.length - 1}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Full Card Styles
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    paddingRight: 36,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 18,
    color: '#666',
    marginTop: -2,
  },
  
  // Banner Styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  bannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerMessage: {
    fontSize: 11,
    opacity: 0.8,
  },
  moreIndicator: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  moreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
});

export default SmartInsightCard;
