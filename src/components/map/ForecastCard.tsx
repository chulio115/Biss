/**
 * ForecastCard - 48h Fangindex-Prognose Komponente
 * Zeigt Tages-Scores, beste Stunde, Wetter-Zusammenfassung
 * Für MapBottomSheet (Explore View) und Spot-Detail
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, Clock, Cloud, Droplets, Wind, Sun, ChevronRight, Zap } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { WeekForecast, ForecastDay, ForecastHour, getForecastScoreColor } from '../../services/fangindexForecast';

interface ForecastCardProps {
  forecast: WeekForecast | null;
  loading: boolean;
  error?: string | null;
  onLoadForecast?: () => void;
  compact?: boolean;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  loading,
  error,
  onLoadForecast,
  compact = false,
}) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={[styles.loadingText, isDark && styles.textLight]}>Prognose wird berechnet...</Text>
      </View>
    );
  }

  if (!forecast && !error) {
    return (
      <TouchableOpacity
        style={[styles.container, styles.ctaContainer, isDark && styles.containerDark]}
        onPress={onLoadForecast}
        activeOpacity={0.8}
      >
        <View style={styles.ctaRow}>
          <TrendingUp size={18} color={COLORS.primary} />
          <Text style={[styles.ctaText, isDark && styles.textLight]}>48h Fangindex-Prognose laden</Text>
          <ChevronRight size={16} color={COLORS.gray400} />
        </View>
        <Text style={styles.ctaSubtext}>DWD Wetter + Solunar + Mondphasen</Text>
      </TouchableOpacity>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={styles.errorText}>Prognose nicht verfügbar</Text>
      </View>
    );
  }

  if (!forecast) return null;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TrendingUp size={16} color={COLORS.primary} />
          <Text style={[styles.headerTitle, isDark && styles.textLight]}>Fangindex-Prognose</Text>
        </View>
        <Text style={styles.headerSub}>48h · DWD</Text>
      </View>

      {/* Best Moment Highlight */}
      <View style={[styles.bestMoment, { backgroundColor: getForecastScoreColor(forecast.bestMoment.score) + '20' }]}>
        <View style={styles.bestMomentLeft}>
          <Zap size={14} color={getForecastScoreColor(forecast.bestMoment.score)} />
          <Text style={[styles.bestMomentLabel, isDark && styles.textLight]}>Bester Moment</Text>
        </View>
        <View style={styles.bestMomentRight}>
          <Text style={[styles.bestMomentTime, isDark && styles.textLight]}>
            {forecast.bestDay.dateLabel} {formatTime(forecast.bestMoment.timestamp)}
          </Text>
          <View style={[styles.scoreBadge, { backgroundColor: getForecastScoreColor(forecast.bestMoment.score) }]}>
            <Text style={styles.scoreBadgeText}>{forecast.bestMoment.score}</Text>
          </View>
        </View>
      </View>

      {/* Day Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
        {forecast.days.map((day, i) => (
          <DayCard key={i} day={day} isDark={isDark} isFirst={i === 0} isBest={day === forecast.bestDay} />
        ))}
      </ScrollView>

      {/* Hourly Timeline for today */}
      {!compact && forecast.days.length > 0 && (
        <View style={styles.timelineSection}>
          <Text style={[styles.timelineTitle, isDark && styles.textLight]}>
            {forecast.days[0].dateLabel} — Stündlich
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {forecast.days[0].hours
              .filter(h => {
                const hr = h.timestamp.getHours();
                return hr >= 5 && hr <= 22;
              })
              .map((hour, i) => (
                <HourPill key={i} hour={hour} isDark={isDark} />
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ─── Sub-Components ───

const DayCard: React.FC<{ day: ForecastDay; isDark: boolean; isFirst: boolean; isBest: boolean }> = ({
  day, isDark, isFirst, isBest,
}) => {
  const scoreColor = getForecastScoreColor(day.dayScore);

  return (
    <View style={[
      styles.dayCard,
      isDark && styles.dayCardDark,
      isFirst && { marginLeft: 0 },
      isBest && { borderColor: scoreColor, borderWidth: 2 },
    ]}>
      {isBest && (
        <View style={[styles.bestBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.bestBadgeText}>BEST</Text>
        </View>
      )}
      <Text style={[styles.dayLabel, isDark && styles.textLight]}>{day.dateLabel}</Text>
      <Text style={styles.dayMoon}>{day.moonEmoji}</Text>
      <View style={[styles.dayScoreCircle, { backgroundColor: scoreColor + '25' }]}>
        <Text style={[styles.dayScoreText, { color: scoreColor }]}>{day.dayScore}</Text>
      </View>
      <Text style={[styles.dayWeather, isDark && styles.textMuted]}>{day.weatherSummary}</Text>
      <View style={styles.dayBestTime}>
        <Clock size={10} color={COLORS.gray400} />
        <Text style={styles.dayBestTimeText}>{formatTime(day.bestHour.timestamp)}</Text>
      </View>
    </View>
  );
};

const HourPill: React.FC<{ hour: ForecastHour; isDark: boolean }> = ({ hour, isDark }) => {
  const scoreColor = getForecastScoreColor(hour.score);
  const hr = hour.timestamp.getHours();

  return (
    <View style={[styles.hourPill, isDark && styles.hourPillDark]}>
      <Text style={[styles.hourTime, isDark && styles.textMuted]}>{hr}:00</Text>
      <View style={[styles.hourBar, { height: Math.max(8, hour.score * 0.4), backgroundColor: scoreColor }]} />
      <Text style={[styles.hourScore, { color: scoreColor }]}>{hour.score}</Text>
      {hour.isSolunarPeriod && (
        <Text style={styles.hourSolunar}>{hour.solunarType === 'major' ? '🔥' : '⭐'}</Text>
      )}
      {hour.isGoldenHour && !hour.isSolunarPeriod && (
        <Text style={styles.hourSolunar}>🌅</Text>
      )}
    </View>
  );
};

// ─── Helpers ───

const formatTime = (date: Date): string => {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  containerDark: { backgroundColor: '#1A1A2E' },
  textLight: { color: COLORS.white },
  textMuted: { color: COLORS.gray400 },

  loadingText: { fontSize: 13, color: COLORS.gray500, textAlign: 'center', marginTop: 4 },
  errorText: { fontSize: 13, color: COLORS.red, textAlign: 'center' },

  // CTA (before loading)
  ctaContainer: { gap: 4 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.gray800 },
  ctaSubtext: { fontSize: 12, color: COLORS.gray400, marginLeft: 26 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray800 },
  headerSub: { fontSize: 11, color: COLORS.gray400, fontWeight: '500' },

  // Best Moment
  bestMoment: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 12 },
  bestMomentLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bestMomentLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray700 },
  bestMomentRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bestMomentTime: { fontSize: 12, fontWeight: '500', color: COLORS.gray600 },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  scoreBadgeText: { fontSize: 13, fontWeight: '800', color: COLORS.white },

  // Day Cards
  daysScroll: { marginHorizontal: -4 },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    width: 100,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  dayCardDark: { backgroundColor: '#252540', borderColor: '#333355' },
  dayLabel: { fontSize: 12, fontWeight: '700', color: COLORS.gray800 },
  dayMoon: { fontSize: 16 },
  dayScoreCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  dayScoreText: { fontSize: 18, fontWeight: '800' },
  dayWeather: { fontSize: 10, color: COLORS.gray500, textAlign: 'center' },
  dayBestTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dayBestTimeText: { fontSize: 10, color: COLORS.gray400 },
  bestBadge: { position: 'absolute', top: -6, right: -6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bestBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.white },

  // Hourly Timeline
  timelineSection: { gap: 8 },
  timelineTitle: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  hourPill: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginRight: 2,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    minWidth: 38,
  },
  hourPillDark: { backgroundColor: '#252540' },
  hourTime: { fontSize: 9, color: COLORS.gray500, fontWeight: '500' },
  hourBar: { width: 16, borderRadius: 4, minHeight: 8 },
  hourScore: { fontSize: 10, fontWeight: '700' },
  hourSolunar: { fontSize: 10 },
});

export default ForecastCard;
