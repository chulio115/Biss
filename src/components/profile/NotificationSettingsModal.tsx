/**
 * NotificationSettingsModal
 * Fullscreen-Modal für Benachrichtigungs-Einstellungen.
 * Golden Hour, Solunar, Tages-Zusammenfassung.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Bell,
  BellOff,
  Sun,
  Moon,
  Star,
  Clock,
  ChevronRight,
  Zap,
  RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotificationPreferences, NotificationPreferences } from '../../hooks/useNotificationPreferences';

interface Props {
  visible: boolean;
  onClose: () => void;
  favoriteSpots: { name: string; lat: number; lng: number }[];
}

// ─── Toggle Row ───
const ToggleRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  isDark: boolean;
  disabled?: boolean;
}> = ({ icon, title, description, value, onToggle, isDark, disabled }) => (
  <TouchableOpacity
    style={[styles.toggleRow, disabled && styles.toggleRowDisabled]}
    onPress={() => { Haptics.selectionAsync(); onToggle(); }}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <View style={[styles.toggleIcon, isDark && styles.toggleIconDark]}>
      {icon}
    </View>
    <View style={styles.toggleInfo}>
      <Text style={[styles.toggleTitle, isDark && styles.textLight, disabled && styles.textDisabled]}>
        {title}
      </Text>
      <Text style={[styles.toggleDesc, isDark && styles.subtitleDark]}>
        {description}
      </Text>
    </View>
    <View style={[styles.toggleTrack, value && styles.toggleTrackActive, disabled && styles.toggleTrackDisabled]}>
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </View>
  </TouchableOpacity>
);

// ─── Hour Picker ───
const HOURS = [5, 6, 7, 8];

const HourPicker: React.FC<{
  value: number;
  onChange: (h: number) => void;
  isDark: boolean;
  disabled?: boolean;
}> = ({ value, onChange, isDark, disabled }) => (
  <View style={styles.hourPicker}>
    <Text style={[styles.hourLabel, isDark && styles.subtitleDark]}>
      Tägliche Zusammenfassung um:
    </Text>
    <View style={styles.hourChips}>
      {HOURS.map((h) => (
        <TouchableOpacity
          key={h}
          style={[
            styles.hourChip,
            isDark && styles.hourChipDark,
            value === h && styles.hourChipActive,
            disabled && styles.hourChipDisabled,
          ]}
          onPress={() => { Haptics.selectionAsync(); onChange(h); }}
          disabled={disabled}
        >
          <Text style={[
            styles.hourChipText,
            value === h && styles.hourChipTextActive,
            isDark && value !== h && styles.subtitleDark,
          ]}>
            {`${String(h).padStart(2, '0')}:00`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Main Modal ───
export const NotificationSettingsModal: React.FC<Props> = ({
  visible,
  onClose,
  favoriteSpots,
}) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    prefs,
    loading,
    toggleEnabled,
    toggleGoldenHour,
    toggleSolunarMajor,
    toggleSolunarMinor,
    toggleDailySummary,
    setSummaryHour,
    refreshAlerts,
  } = useNotificationPreferences();

  const [refreshing, setRefreshing] = useState(false);

  const handleToggleEnabled = async () => {
    const success = await toggleEnabled();
    if (!success && !prefs.enabled) {
      Alert.alert(
        'Berechtigung benötigt',
        'Bitte erlaube Benachrichtigungen in den Einstellungen deines Geräts.',
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const count = await refreshAlerts(favoriteSpots);
    setRefreshing(false);
    Alert.alert(
      'Alerts aktualisiert',
      count > 0
        ? `${count} Benachrichtigung${count > 1 ? 'en' : ''} geplant für heute.`
        : 'Keine Alerts geplant. Aktiviere mindestens eine Alert-Art.',
    );
  };

  // Auto-refresh when prefs change and enabled
  useEffect(() => {
    if (prefs.enabled && visible) {
      refreshAlerts(favoriteSpots);
    }
  }, [prefs.goldenHour, prefs.solunarMajor, prefs.solunarMinor, prefs.dailySummary, prefs.summaryHour]);

  if (loading) return null;

  const alertsDisabled = !prefs.enabled;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={isDark ? COLORS.white : COLORS.gray900} />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.textLight]}>Benachrichtigungen</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          {/* Master Toggle */}
          <View style={[styles.masterCard, isDark && styles.masterCardDark]}>
            <TouchableOpacity
              style={styles.masterToggle}
              onPress={handleToggleEnabled}
              activeOpacity={0.7}
            >
              <View style={[
                styles.masterIcon,
                { backgroundColor: prefs.enabled ? COLORS.primary + '20' : (isDark ? '#1E293B' : '#F3F4F6') },
              ]}>
                {prefs.enabled ? (
                  <Bell size={24} color={COLORS.primary} />
                ) : (
                  <BellOff size={24} color={isDark ? '#6B7280' : COLORS.gray400} />
                )}
              </View>
              <View style={styles.masterInfo}>
                <Text style={[styles.masterTitle, isDark && styles.textLight]}>
                  Beißzeit-Alerts
                </Text>
                <Text style={[styles.masterDesc, isDark && styles.subtitleDark]}>
                  {prefs.enabled
                    ? `${prefs.scheduledCount} Alert${prefs.scheduledCount !== 1 ? 's' : ''} geplant`
                    : 'Nie wieder die beste Beißzeit verpassen'}
                </Text>
              </View>
              <View style={[styles.toggleTrack, prefs.enabled && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, prefs.enabled && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={[styles.infoBanner, isDark && styles.infoBannerDark]}>
            <Zap size={14} color={isDark ? '#FACC15' : '#B45309'} />
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              {favoriteSpots.length > 0
                ? `Alerts für ${favoriteSpots.length} Favoriten-Spot${favoriteSpots.length > 1 ? 's' : ''}`
                : 'Füge Favoriten-Spots hinzu für personalisierte Alerts'}
            </Text>
          </View>

          {/* Alert Types */}
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Alert-Arten
          </Text>

          <View style={[styles.alertsCard, isDark && styles.alertsCardDark]}>
            <ToggleRow
              icon={<Sun size={20} color="#F59E0B" />}
              title="Golden Hour"
              description="15 Min. vor Sonnenauf- und -untergang"
              value={prefs.goldenHour}
              onToggle={toggleGoldenHour}
              isDark={isDark}
              disabled={alertsDisabled}
            />

            <View style={[styles.divider, isDark && styles.dividerDark]} />

            <ToggleRow
              icon={<Moon size={20} color="#8B5CF6" />}
              title="Solunar Major"
              description="Mond-Transit — höchste Fischaktivität (~2h)"
              value={prefs.solunarMajor}
              onToggle={toggleSolunarMajor}
              isDark={isDark}
              disabled={alertsDisabled}
            />

            <View style={[styles.divider, isDark && styles.dividerDark]} />

            <ToggleRow
              icon={<Star size={20} color="#10B981" />}
              title="Solunar Minor"
              description="Mondauf-/untergang — erhöhte Aktivität (~1h)"
              value={prefs.solunarMinor}
              onToggle={toggleSolunarMinor}
              isDark={isDark}
              disabled={alertsDisabled}
            />

            <View style={[styles.divider, isDark && styles.dividerDark]} />

            <ToggleRow
              icon={<Clock size={20} color={COLORS.primary} />}
              title="Tages-Zusammenfassung"
              description="Morgens: Alle Beißzeiten für heute"
              value={prefs.dailySummary}
              onToggle={toggleDailySummary}
              isDark={isDark}
              disabled={alertsDisabled}
            />

            {prefs.dailySummary && !alertsDisabled && (
              <HourPicker
                value={prefs.summaryHour}
                onChange={setSummaryHour}
                isDark={isDark}
                disabled={alertsDisabled}
              />
            )}
          </View>

          {/* Refresh Button */}
          {prefs.enabled && (
            <TouchableOpacity
              style={[styles.refreshBtn, isDark && styles.refreshBtnDark]}
              onPress={handleRefresh}
              activeOpacity={0.7}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <RefreshCw size={18} color={COLORS.primary} />
              )}
              <Text style={styles.refreshBtnText}>
                {refreshing ? 'Aktualisiere...' : 'Alerts jetzt aktualisieren'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Explanation */}
          <View style={[styles.explainer, isDark && styles.explainerDark]}>
            <Text style={[styles.explainerTitle, isDark && styles.textLight]}>
              Wie funktioniert das?
            </Text>
            <Text style={[styles.explainerText, isDark && styles.subtitleDark]}>
              BISS berechnet die besten Beißzeiten lokal auf deinem Gerät — basierend auf
              Solunar-Theorie, Sonnenzeiten und deinen Favoriten-Spots. Alle Daten bleiben
              auf deinem Gerät, kein Server benötigt.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─── Styles ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: '#0A1A2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerDark: {
    backgroundColor: '#0F2744',
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  titleDark: {
    color: COLORS.white,
  },
  textLight: {
    color: '#F9FAFB',
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  textDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    paddingBottom: 120,
  },

  // Master Toggle
  masterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  masterCardDark: {
    backgroundColor: '#132337',
  },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  masterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  masterInfo: {
    flex: 1,
  },
  masterTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  masterTitleDark: {
    color: COLORS.white,
  },
  masterDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoBannerDark: {
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  infoTextDark: {
    color: '#FDE68A',
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },

  // Alerts Card
  alertsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  alertsCardDark: {
    backgroundColor: '#132337',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: 68,
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  toggleRowDisabled: {
    opacity: 0.5,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIconDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: COLORS.primary,
  },
  toggleTrackDisabled: {
    opacity: 0.4,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  // Hour Picker
  hourPicker: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  hourLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  hourChips: {
    flexDirection: 'row',
    gap: 8,
  },
  hourChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  hourChipDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hourChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  hourChipDisabled: {
    opacity: 0.4,
  },
  hourChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  hourChipTextActive: {
    color: '#FFFFFF',
  },

  // Refresh Button
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
  },
  refreshBtnDark: {
    backgroundColor: '#132337',
    borderColor: COLORS.primary + '40',
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Explainer
  explainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  explainerDark: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  explainerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  explainerText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
});
