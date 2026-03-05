/**
 * ScoreRing Component
 * Premium animated score display with circular progress ring
 * Uses react-native-reanimated for UI-thread animations
 *
 * Props:
 *   score      – 0-100 value
 *   size       – ring diameter in px (default 80)
 *   strokeWidth – ring thickness (default 6)
 *   showLabel  – show subtitle beneath score (default true)
 *   label      – subtitle text (default 'BISS')
 *   animated   – animate on mount / score change (default true)
 *   onPress    – optional tap handler
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { COLORS, getScoreColor } from '../../constants/colors';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  onPress?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  label = 'BISS',
  animated = true,
  onPress,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const progress = Math.min(score / 100, 1);

  const scoreColor = getScoreColor(score);
  const endColor = score >= 70 ? COLORS.greenDark : score >= 50 ? COLORS.yellowDark : COLORS.redDark;
  const isHotSpot = score >= 80;

  // Shared values
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = 0;
      animatedProgress.value = withDelay(
        200,
        withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
    } else {
      animatedProgress.value = progress;
    }
  }, [score, animated]);

  useEffect(() => {
    if (isHotSpot) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
      glowOpacity.value = 0;
    }
  }, [isHotSpot]);

  // Animated SVG props for progress arc
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  // Animated container scale for pulse
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Animated glow behind the ring
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, { width: size, height: size }]}
    >
      <Animated.View style={pulseStyle}>
        {/* Glow (only for hot spots) */}
        {isHotSpot && (
          <Animated.View
            style={[
              styles.glow,
              {
                width: size + 12,
                height: size + 12,
                borderRadius: (size + 12) / 2,
                backgroundColor: scoreColor,
                top: -6,
                left: -6,
              },
              glowStyle,
            ]}
          />
        )}

        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={scoreColor} />
              <Stop offset="100%" stopColor={endColor} />
            </LinearGradient>
          </Defs>

          {/* Track ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={COLORS.gray200}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: scoreColor, fontSize: size * 0.3 }]}>
            {score}
          </Text>
          {showLabel && (
            <Text style={[styles.labelText, { fontSize: Math.max(size * 0.1, 8) }]}>
              {label}
            </Text>
          )}
        </View>

        {/* Hot spot badge */}
        {isHotSpot && (
          <View style={[styles.hotSpotBadge, { backgroundColor: scoreColor }]}>
            <Text style={styles.hotSpotText}>🔥</Text>
          </View>
        )}
      </Animated.View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
  },
  scoreContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: '800',
  },
  labelText: {
    color: COLORS.gray500,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 1,
    textTransform: 'uppercase',
  },
  hotSpotBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  hotSpotText: {
    fontSize: 12,
  },
});

export default ScoreRing;
