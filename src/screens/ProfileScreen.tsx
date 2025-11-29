/**
 * BISS ProfileScreen - Benutzerprofil
 * 
 * Features:
 * - Benutzerdaten
 * - Fangstatistiken
 * - Einstellungen (Settings-Button oben rechts)
 * - Abmelden
 */
import React from 'react';
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

// Design Tokens
const COLORS = {
  primary: '#00A3FF',
  accent: '#0066FF',
  green: '#4ADE80',
  yellow: '#FACC15',
  red: '#EF4444',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#111827',
  dark: {
    bg: '#0A1A2F',
    surface: '#132337',
    card: '#1A2D44',
  },
};

// Mock stats
const STATS = [
  { label: 'Fänge', value: '24', icon: Fish, color: COLORS.primary },
  { label: 'Spots', value: '8', icon: MapPin, color: COLORS.green },
  { label: 'Trophäen', value: '3', icon: Trophy, color: COLORS.yellow },
];

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
          {STATS.map((stat, index) => (
            <View 
              key={stat.label} 
              style={[
                styles.statCard, 
                isDark && styles.statCardDark,
                index < STATS.length - 1 && styles.statCardBorder,
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
