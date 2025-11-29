/**
 * PulseMarker - Animated marker with pulse effect for hot spots (80+)
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';

const COLORS = {
  white: '#FFFFFF',
  scoreHigh: '#4ADE80',
  scoreMedium: '#FACC15',
  scoreLow: '#EF4444',
};

const getScoreColor = (score: number): string => {
  if (score >= 70) return COLORS.scoreHigh;
  if (score >= 50) return COLORS.scoreMedium;
  return COLORS.scoreLow;
};

interface PulseMarkerProps {
  score: number;
  onPress: () => void;
  isNight?: boolean;
}

export const PulseMarker: React.FC<PulseMarkerProps> = ({ score, onPress, isNight = false }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const isHotSpot = score >= 80;
  const color = getScoreColor(score);

  useEffect(() => {
    if (isHotSpot) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isHotSpot]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ scale: isHotSpot ? pulseAnim : 1 }] }
        ]}
      >
        {/* Glow ring for hot spots */}
        {isHotSpot && (
          <Animated.View 
            style={[
              styles.glowRing,
              { 
                backgroundColor: color,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.5],
                }),
              }
            ]} 
          />
        )}
        
        {/* Main marker */}
        <View style={[
          styles.marker,
          { 
            backgroundColor: color,
            borderColor: isNight ? COLORS.white : 'transparent',
            borderWidth: isNight ? 2 : 0,
          }
        ]}>
          <Text style={styles.score}>{score}</Text>
        </View>
        
        {/* Arrow */}
        <View style={[styles.arrow, { borderTopColor: color }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -8,
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  score: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});

export default PulseMarker;
