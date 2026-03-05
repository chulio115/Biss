/**
 * RatingModal – Submit or edit a spot rating
 * Stars (1-5) + optional comment
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { StarRating } from '../ui/StarRating';
import { SpotRating } from '../../hooks/useRatings';

interface RatingModalProps {
  visible: boolean;
  spotName: string;
  existingRating?: SpotRating;
  onClose: () => void;
  onSubmit: (stars: number, comment?: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  spotName,
  existingRating,
  onClose,
  onSubmit,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (visible) {
      setStars(existingRating?.stars ?? 0);
      setComment(existingRating?.comment ?? '');
    }
  }, [visible, existingRating]);

  const handleSubmit = () => {
    if (stars === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(stars, comment.trim() || undefined);
    onClose();
  };

  const ratingLabels = ['', 'Schlecht', 'Geht so', 'Okay', 'Gut', 'Ausgezeichnet'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, isDark && styles.containerDark]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, isDark && styles.textLight]}>Spot bewerten</Text>
              <Text style={[styles.subtitle, isDark && styles.subtitleDark]} numberOfLines={1}>
                {spotName}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, isDark && styles.closeBtnDark]}
              onPress={onClose}
            >
              <X size={18} color={isDark ? COLORS.gray300 : COLORS.gray500} />
            </TouchableOpacity>
          </View>

          {/* Stars */}
          <View style={styles.starsSection}>
            <StarRating
              rating={stars}
              size={40}
              gap={12}
              interactive
              onChange={setStars}
            />
            {stars > 0 && (
              <Text style={[styles.ratingLabel, isDark && styles.subtitleDark]}>
                {ratingLabels[stars]}
              </Text>
            )}
          </View>

          {/* Comment */}
          <View style={styles.commentSection}>
            <Text style={[styles.commentLabel, isDark && styles.textLight]}>
              Kommentar (optional)
            </Text>
            <TextInput
              style={[styles.commentInput, isDark && styles.commentInputDark]}
              placeholder="Was war gut? Was könnte besser sein?"
              placeholderTextColor={COLORS.gray400}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={300}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{comment.length}/300</Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              stars === 0 && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={stars === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {existingRating ? 'Bewertung aktualisieren' : 'Bewertung abgeben'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  containerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.gray900,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 2,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  textLight: {
    color: COLORS.white,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnDark: {
    backgroundColor: COLORS.dark.surface,
  },

  // Stars
  starsSection: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
  },

  // Comment
  commentSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: COLORS.gray900,
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  commentInputDark: {
    backgroundColor: COLORS.dark.surface,
    borderColor: COLORS.dark.border,
    color: COLORS.white,
  },
  charCount: {
    fontSize: 11,
    color: COLORS.gray400,
    textAlign: 'right',
    marginTop: 4,
  },

  // Submit
  submitBtn: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.gray300,
    shadowOpacity: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default RatingModal;
