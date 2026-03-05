/**
 * AchievementModal - Fullscreen scrollable achievement overview
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { Achievement } from '../../hooks/useAchievements';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
};

interface AchievementModalProps {
  visible: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  onClose,
  achievements,
}) => {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, isDark && styles.textLight]}>Achievements</Text>
            <Text style={styles.headerSubtitle}>
              {unlockedAchievements.length}/{achievements.length} freigeschaltet
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, isDark && styles.closeBtnDark]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          >
            <X size={20} color={isDark ? COLORS.white : COLORS.gray700} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
                Freigeschaltet ({unlockedAchievements.length})
              </Text>
              <View style={styles.achievementList}>
                {unlockedAchievements.map((a) => (
                  <View key={a.id} style={[styles.achievementCard, isDark && styles.achievementCardDark]}>
                    <View style={[styles.iconCircle, { backgroundColor: TIER_COLORS[a.tier] + '20' }]}>
                      <Text style={styles.iconEmoji}>{a.icon}</Text>
                    </View>
                    <View style={styles.achievementContent}>
                      <View style={styles.achievementHeader}>
                        <Text style={[styles.achievementTitle, isDark && styles.textLight]}>{a.title}</Text>
                        <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[a.tier] }]}>
                          <Text style={styles.tierText}>{a.tier.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={[styles.achievementDesc, isDark && styles.subtitleDark]}>{a.description}</Text>
                      <Text style={styles.achievementDate}>
                        Freigeschaltet: {new Date(a.unlockedAt || Date.now()).toLocaleDateString('de-DE')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, isDark && styles.textLight, { marginTop: 24 }]}>
                Gesperrt ({lockedAchievements.length})
              </Text>
              <View style={styles.achievementList}>
                {lockedAchievements.map((a) => (
                  <View key={a.id} style={[styles.achievementCard, styles.achievementCardLocked, isDark && styles.achievementCardDark]}>
                    <View style={[styles.iconCircle, { backgroundColor: COLORS.gray200 }]}>
                      <Text style={[styles.iconEmoji, { opacity: 0.3 }]}>{a.icon}</Text>
                    </View>
                    <View style={styles.achievementContent}>
                      <View style={styles.achievementHeader}>
                        <Text style={[styles.achievementTitle, { color: COLORS.gray400 }]}>{a.title}</Text>
                        <View style={[styles.tierBadge, { backgroundColor: COLORS.gray300 }]}>
                          <Text style={styles.tierText}>{a.tier.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={[styles.achievementDesc, { color: COLORS.gray400 }]}>{a.description}</Text>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.round(a.progress * 100)}%`,
                                backgroundColor: TIER_COLORS[a.tier],
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {a.currentValue}/{a.requirement}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  containerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.gray400,
    marginTop: 2,
  },
  textLight: {
    color: COLORS.white,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnDark: {
    backgroundColor: COLORS.dark.card,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 12,
  },
  achievementList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  achievementDesc: {
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 8,
  },
  achievementDate: {
    fontSize: 11,
    color: COLORS.gray400,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray400,
    minWidth: 40,
  },
});
