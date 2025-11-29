/**
 * PulsingBuyButton - Premium animated buy button with glow effect
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingCart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const COLORS = {
  white: '#FFFFFF',
  scoreHigh: '#4ADE80',
};

interface PulsingBuyButtonProps {
  price: number;
  onPress: () => void;
  label?: string;
}

export const PulsingBuyButton: React.FC<PulsingBuyButtonProps> = ({ 
  price, 
  onPress,
  label = 'Tageskarte',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.container}
      >
        <LinearGradient
          colors={[COLORS.scoreHigh, '#22C55E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Animated.View 
            style={[
              styles.glow,
              { opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
              })}
            ]} 
          />
          <ShoppingCart size={20} color={COLORS.white} strokeWidth={2} />
          <Text style={styles.text}>{label} €{price}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.scoreHigh,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
  },
  text: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});

export default PulsingBuyButton;
