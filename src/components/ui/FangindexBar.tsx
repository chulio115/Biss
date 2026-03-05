/**
 * FangindexBar Component
 * Animated progress bar for individual Fangindex factors
 * Uses react-native-reanimated for staggered UI-thread animations
 *
 * Props:
 *   label     – factor name (e.g. "Wetter")
 *   icon      – emoji or short string
 *   score     – 0-100 value
 *   weight    – factor weight as string (e.g. "30%")
 *   delay     – stagger delay in ms before this bar animates
 *   animated  – whether to animate (default true)
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

interface FangindexBarProps {
  label: string;
  icon: string;
  score: number;
  weight: string;
  delay?: number;
  animated?: boolean;
}

const getBarColor = (score: number): string => {
  if (score >= 70) return COLORS.green;
  if (score >= 50) return COLORS.yellow;
  return COLORS.red;
};

export const FangindexBar: React.FC<FangindexBarProps> = ({
  label,
  icon,
  score,
  weight,
  delay: staggerDelay = 0,
  animated = true,
}) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const barColor = getBarColor(clampedScore);

  useEffect(() => {
    if (animated) {
      progress.value = 0;
      opacity.value = 0;
      opacity.value = withDelay(
        staggerDelay,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      );
      progress.value = withDelay(
        staggerDelay + 100,
        withTiming(clampedScore / 100, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
    } else {
      progress.value = clampedScore / 100;
      opacity.value = 1;
    }
  }, [score, animated]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.weight}>{weight}</Text>
        <Text style={[styles.score, { color: barColor }]}>{clampedScore}</Text>
      </View>
      <View style={styles.trackContainer}>
        <View style={styles.track} />
        <Animated.View style={[styles.bar, { backgroundColor: barColor }, barStyle]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
    width: 20,
    textAlign: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  weight: {
    fontSize: 11,
    color: COLORS.gray400,
    marginRight: 8,
  },
  score: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },
  trackContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default FangindexBar;
