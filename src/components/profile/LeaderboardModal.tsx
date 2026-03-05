/**
 * LeaderboardModal - Fullscreen ranking overview
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from 'react-native';
import { X, Trophy, Flame, Target, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { LeaderboardEntry } from '../../hooks/useLeaderboard';

interface ScoreBreakdown {
  achievements: number;
  catches: number;
  streak: number;
  spots: number;
  ratings: number;
  favorites: number;
  weight: number;
  total: number;
}

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
  scoreBreakdown: ScoreBreakdown;
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

const LeaderboardItem: React.FC<{ item: LeaderboardEntry; isDark: boolean }> = ({ item, isDark }) => {
  const isTop3 = item.rank <= 3;

  return (
    <View
      style={[
        styles.row,
        isDark && styles.rowDark,
        item.isCurrentUser && styles.rowCurrent,
        item.isCurrentUser && isDark && styles.rowCurrentDark,
      ]}
    >
      {/* Rank */}
      <View style={[styles.rankCircle, isTop3 && { backgroundColor: RANK_COLORS[item.rank - 1] + '20' }]}>
        {isTop3 ? (
          <Text style={styles.rankEmoji}>{RANK_EMOJIS[item.rank - 1]}</Text>
        ) : (
          <Text style={[styles.rankText, isDark && styles.textLight]}>{item.rank}</Text>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, isDark && styles.textLight, item.isCurrentUser && styles.userNameCurrent]}>
          {item.displayName}
          {item.isCurrentUser ? ' (Du)' : ''}
        </Text>
        <View style={styles.userMeta}>
          <Text style={styles.metaText}>🎣 {item.catchesCount}</Text>
          <Text style={styles.metaText}>🏆 {item.achievementsCount}</Text>
          <Text style={styles.metaText}>🔥 {item.currentStreak}d</Text>
        </View>
      </View>

      {/* Score */}
      <View style={styles.scoreCol}>
        <Text style={[styles.scoreValue, isDark && styles.textLight, isTop3 && { color: RANK_COLORS[item.rank - 1] }]}>
          {item.totalScore.toLocaleString()}
        </Text>
        <Text style={styles.scoreLabel}>Punkte</Text>
      </View>
    </View>
  );
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  visible,
  onClose,
  leaderboard,
  currentUserEntry,
  scoreBreakdown,
}) => {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, isDark && styles.textLight]}>Leaderboard</Text>
            <Text style={styles.headerSubtitle}>
              {currentUserEntry ? `Platz ${currentUserEntry.rank} von ${leaderboard.length}` : 'Lade...'}
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

        {/* Your Score Breakdown */}
        {currentUserEntry && (
          <View style={[styles.breakdownCard, isDark && styles.breakdownCardDark]}>
            <View style={styles.breakdownHeader}>
              <Trophy size={22} color={COLORS.yellow} strokeWidth={2} />
              <Text style={[styles.breakdownTitle, isDark && styles.textLight]}>Dein Score</Text>
              <Text style={[styles.breakdownTotal, isDark && styles.textLight]}>{scoreBreakdown.total}</Text>
            </View>
            <View style={styles.breakdownGrid}>
              {[
                { label: 'Achievements', value: scoreBreakdown.achievements, icon: '🏆' },
                { label: 'Fänge', value: scoreBreakdown.catches, icon: '🎣' },
                { label: 'Streak', value: scoreBreakdown.streak, icon: '🔥' },
                { label: 'Bewertungen', value: scoreBreakdown.ratings, icon: '⭐' },
                { label: 'Favoriten', value: scoreBreakdown.favorites, icon: '❤️' },
              ].filter((s) => s.value > 0).map((s) => (
                <View key={s.label} style={styles.breakdownItem}>
                  <Text style={styles.breakdownEmoji}>{s.icon}</Text>
                  <Text style={[styles.breakdownValue, isDark && styles.textLight]}>{s.value}</Text>
                  <Text style={styles.breakdownLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Leaderboard List */}
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => <LeaderboardItem item={item} isDark={isDark} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        />
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
  headerDark: {
    backgroundColor: COLORS.dark.surface,
    borderBottomColor: COLORS.dark.border,
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

  // Score Breakdown
  breakdownCard: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
    flex: 1,
  },
  breakdownTotal: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  breakdownEmoji: {
    fontSize: 14,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  breakdownLabel: {
    fontSize: 11,
    color: COLORS.gray400,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowDark: {
    backgroundColor: COLORS.dark.card,
  },
  rowCurrent: {
    backgroundColor: COLORS.primary + '08',
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  rowCurrentDark: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 18,
  },
  rankText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 3,
  },
  userNameCurrent: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray900,
  },
  scoreLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    fontWeight: '500',
  },
});
