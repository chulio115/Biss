/**
 * StarRating – Interactive star rating component
 * Used for both display (read-only) and input (interactive) modes.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  gap?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
  gap = 4,
  interactive = false,
  onChange,
  color = '#FACC15',
}) => {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { gap }]}>
      {stars.map((star) => {
        const filled = star <= Math.round(rating);
        const StarWrapper = interactive ? TouchableOpacity : View;

        return (
          <StarWrapper
            key={star}
            {...(interactive
              ? {
                  onPress: () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onChange?.(star);
                  },
                  activeOpacity: 0.7,
                }
              : {})}
          >
            <Star
              size={size}
              color={filled ? color : COLORS.gray300}
              fill={filled ? color : 'transparent'}
              strokeWidth={1.5}
            />
          </StarWrapper>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
