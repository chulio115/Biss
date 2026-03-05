/**
 * BISS ProfileScreen - Benutzerprofil
 * 
 * Features:
 * - Benutzerdaten
 * - Fangstatistiken
 * - Einstellungen (Settings-Button oben rechts)
 * - Abmelden
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Settings, 
  Fish, 
  Trophy, 
  MapPin, 
  ChevronRight,
  LogOut,
  Bell,
  HelpCircle,
  Shield,
  Star,
} from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useAchievements } from '../hooks/useAchievements';
import { useFavorites } from '../hooks/useFavorites';
import { useRatings } from '../hooks/useRatings';
import { useFishingLicense } from '../hooks/useFishingLicense';
import { useCatchCount } from '../hooks/useCatchCount';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { AchievementModal } from '../components/profile/AchievementModal';
import { LeaderboardModal } from '../components/profile/LeaderboardModal';
import { COLORS } from '../constants/colors';
import { TIER_COLORS, CATEGORY_LABELS, AchievementDef } from '../constants/achievements';


// Menu items
const MENU_ITEMS = [
  { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  { id: 'favorites', label: 'Favoriten', icon: Star },
  { id: 'help', label: 'Hilfe & Support', icon: HelpCircle },
  { id: 'privacy', label: 'Datenschutz', icon: Shield },
];

export const ProfileScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { achievements, streak, unlockedCount, totalCount, incrementProgress } = useAchievements();
  const { favoritesCount } = useFavorites();
  const { ratings } = useRatings();
  const { hasLicense } = useFishingLicense();
  const catchesCount = useCatchCount();
  const { leaderboard, currentUserEntry, scoreBreakdown } = useLeaderboard(
    achievements, streak, catchesCount, favoritesCount, ratings.length
  );
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Sync external data into achievement progress
  useEffect(() => {
    if (favoritesCount > 0) incrementProgress('spots_favorited', favoritesCount, true);
    if (ratings.length > 0) incrementProgress('spots_rated', ratings.length, true);
    if (hasLicense) incrementProgress('license_added', 1, true);
  }, [favoritesCount, ratings.length, hasLicense]);

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header with Settings Button */}
      <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, isDark && styles.textLight]}>Profil</Text>
        <TouchableOpacity 
          style={[styles.settingsBtn, isDark && styles.settingsBtnDark]} 
          activeOpacity={0.7}
        >
          <Settings size={22} color={isDark ? COLORS.white : COLORS.gray600} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primary + '30' }]}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDark && styles.textLight]}>
              Angler
            </Text>
            <Text style={[styles.profileEmail, isDark && styles.subtitleDark]}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>

          <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
            <Text style={styles.editBtnText}>Bearbeiten</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {[
            { label: 'Badges', value: `${unlockedCount}/${totalCount}`, icon: Trophy, color: COLORS.yellow },
            { label: 'Streak', value: `${streak.currentStreak}d`, icon: Fish, color: COLORS.primary },
            { label: 'Favoriten', value: `${favoritesCount}`, icon: Star, color: COLORS.green },
          ].map((stat, index, arr) => (
            <View 
              key={stat.label} 
              style={[
                styles.statCard, 
                isDark && styles.statCardDark,
                index < arr.length - 1 && styles.statCardBorder,
              ]}
            >
              <stat.icon size={24} color={stat.color} strokeWidth={1.5} />
              <Text style={[styles.statValue, isDark && styles.textLight]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.subtitleDark]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Free-Tier-Banner (Opas Rat #1: "Wir vertrauen euch") */}
        <View style={[styles.freeTierBanner, isDark && styles.freeTierBannerDark]}>
          <Text style={styles.freeTierEmoji}>🎁</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.freeTierTitle, isDark && styles.textLight]}>
              Immer kostenlos bei BISS
            </Text>
            <Text style={[styles.freeTierDesc, isDark && styles.subtitleDark]}>
              Fangindex, Beißzeiten, Karten, Fangbuch, Schonzeiten — keine Paywall, kein Abo
            </Text>
          </View>
        </View>

        {/* Streak Banner */}
        {streak.currentStreak >= 2 && (
          <View style={[styles.streakBanner, isDark && styles.streakBannerDark]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.streakTitle, isDark && styles.textLight]}>
                {streak.currentStreak} Tage Streak!
              </Text>
              <Text style={[styles.streakDesc, isDark && styles.subtitleDark]}>
                Rekord: {streak.longestStreak} Tage
              </Text>
            </View>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Achievements</Text>
          <Text style={styles.sectionBadge}>{unlockedCount}/{totalCount}</Text>
        </View>

        {/* Unlocked Badges Grid */}
        {unlockedAchievements.length > 0 ? (
          <View style={styles.badgeGrid}>
            {unlockedAchievements.map((a) => (
              <View key={a.id} style={[styles.badgeCard, isDark && styles.badgeCardDark]}>
                <View style={[styles.badgeIcon, { backgroundColor: TIER_COLORS[a.tier] + '20' }]}>
                  <Text style={styles.badgeEmoji}>{a.icon}</Text>
                </View>
                <Text style={[styles.badgeTitle, isDark && styles.textLight]} numberOfLines={1}>{a.title}</Text>
                <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[a.tier] }]} />
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
            <Text style={styles.emptyStateEmoji}>🎯</Text>
            <Text style={[styles.emptyStateText, isDark && styles.textLight]}>Noch keine Achievements freigeschaltet</Text>
          </View>
        )}

        {/* Show All Button */}
        <TouchableOpacity
          style={[styles.showAllBtn, isDark && styles.showAllBtnDark]}
          onPress={() => setShowAchievementModal(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.showAllBtnText, isDark && styles.showAllBtnTextDark]}>
            Alle {totalCount} Achievements anzeigen
          </Text>
        </TouchableOpacity>

        {/* Leaderboard */}
        <TouchableOpacity
          style={[styles.leaderboardBtn, isDark && styles.leaderboardBtnDark]}
          onPress={() => setShowLeaderboardModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.leaderboardLeft}>
            <Trophy size={22} color={COLORS.yellow} strokeWidth={2} />
            <View>
              <Text style={[styles.leaderboardTitle, isDark && styles.textLight]}>Leaderboard</Text>
              <Text style={styles.leaderboardSubtitle}>
                {currentUserEntry ? `Platz ${currentUserEntry.rank} · ${scoreBreakdown.total} Punkte` : 'Score berechnen...'}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={COLORS.gray400} strokeWidth={2} />
        </TouchableOpacity>

        {/* Menu */}
        <View style={[styles.menuCard, isDark && styles.menuCardDark]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={item.id}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              activeOpacity={0.7}
            >
              <item.icon size={22} color={COLORS.primary} strokeWidth={1.5} />
              <Text style={[styles.menuLabel, isDark && styles.textLight]}>
                {item.label}
              </Text>
              <ChevronRight size={20} color={COLORS.gray400} strokeWidth={1.8} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity 
          style={[styles.signOutBtn, isDark && styles.signOutBtnDark]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={COLORS.red} strokeWidth={1.8} />
          <Text style={styles.signOutText}>Abmelden</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>BISS v1.0.0</Text>
      </ScrollView>

      {/* Achievement Modal */}
      <AchievementModal
        visible={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        achievements={achievements}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        visible={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        leaderboard={leaderboard}
        currentUserEntry={currentUserEntry}
        scoreBreakdown={scoreBreakdown}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  containerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerDark: {
    backgroundColor: COLORS.dark.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  textLight: {
    color: COLORS.white,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBtnDark: {
    backgroundColor: COLORS.dark.bg,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  statCardBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.gray400,
  },

  // ─── Free-Tier-Banner (Opas Rat #1) ───
  freeTierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B981' + '20',
  },
  freeTierBannerDark: { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30' },
  freeTierEmoji: { fontSize: 32 },
  freeTierTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  freeTierDesc: { fontSize: 12, color: COLORS.gray600, lineHeight: 17 },

  // ─── Streak ───
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  streakBannerDark: { backgroundColor: '#78350F' + '30' },
  streakEmoji: { fontSize: 32 },
  streakTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  streakDesc: { fontSize: 12, color: COLORS.gray500 },

  // ─── Achievements ───
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  sectionBadge: { fontSize: 13, fontWeight: '700', color: COLORS.primary, backgroundColor: COLORS.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  subSectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray500, marginBottom: 10, marginTop: 4 },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  badgeCard: {
    width: '30%' as any,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeCardDark: { backgroundColor: COLORS.dark.card },
  badgeCardLocked: { opacity: 0.55 },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: { fontSize: 24 },
  badgeTitle: { fontSize: 11, fontWeight: '600', color: COLORS.gray900, textAlign: 'center' },
  tierDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

  // ─── Locked Achievements ───
  lockedList: { gap: 10, marginBottom: 20 },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  lockedRowDark: { backgroundColor: COLORS.dark.card },
  lockedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  lockedEmoji: { fontSize: 20 },
  lockedTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  lockedDesc: { fontSize: 11, color: COLORS.gray500, marginBottom: 6 },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: { fontSize: 12, fontWeight: '700', color: COLORS.gray400, minWidth: 32, textAlign: 'right' },
  showAllBtn: { 
    alignItems: 'center', 
    paddingVertical: 14, 
    marginBottom: 20,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
  },
  showAllBtnDark: {
    backgroundColor: COLORS.primary + '20',
  },
  showAllBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  showAllBtnTextDark: { color: '#4DA3FF' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
  },
  emptyStateDark: {
    backgroundColor: COLORS.dark.card,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
  },

  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardBtnDark: {
    backgroundColor: COLORS.dark.card,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  leaderboardSubtitle: {
    fontSize: 12,
    color: COLORS.gray400,
    marginTop: 2,
  },

  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray900,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.red + '10',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  signOutBtnDark: {
    backgroundColor: COLORS.red + '20',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.red,
  },
  version: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'center',
  },
});

export default ProfileScreen;
