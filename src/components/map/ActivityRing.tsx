/**
 * ActivityRing - Apple Watch Style Fangindex Ring
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const COLORS = {
  scoreHigh: '#4ADE80',
  scoreMedium: '#FACC15',
  scoreLow: '#EF4444',
  gray200: '#E5E5E5',
  gray500: '#737373',
};

const getScoreColor = (score: number): string => {
  if (score >= 70) return COLORS.scoreHigh;
  if (score >= 50) return COLORS.scoreMedium;
  return COLORS.scoreLow;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActivityRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ActivityRing: React.FC<ActivityRingProps> = ({ 
  score, 
  size = 120, 
  strokeWidth = 12 
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score / 100,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.gray200}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Glow effect */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 8}
          fill="url(#ringGlow)"
        />
        
        {/* Progress ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      
      {/* Score text */}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '800', color: color }}>
          {score}
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.gray500, marginTop: -4 }}>
          FANGINDEX
        </Text>
      </View>
    </View>
  );
};

export default ActivityRing;
