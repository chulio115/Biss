/**
 * BiteTimeModal – Premium Solunar & Beißzeit-Ansicht
 *
 * Shows current/next solunar periods, golden hour status,
 * moon phase, sunrise/sunset, and a visual timeline.
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import {
  getSolunarData,
  getMoonPhase,
  getMoonEmoji,
  getMoonPhaseIndex,
  SolunarPeriod,
} from '../../utils/fangindex';
import { calculateSunTimes, isGoldenHour } from '../../utils/fishing';

interface BiteTimeModalProps {
  visible: boolean;
  onClose: () => void;
  userLocation: [number, number]; // [lng, lat]
}

const formatTime = (date: Date | null): string => {
  if (!date) return '--:--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getMoonPhaseScore = (): { label: string; score: number } => {
  const idx = getMoonPhaseIndex();
  const scores = [
    { label: 'Neumond – Sehr gut', score: 85 },
    { label: 'Zunehmend – Gut', score: 60 },
    { label: 'Erstes Viertel – Mäßig', score: 45 },
    { label: 'Zunehmend – Gut', score: 60 },
    { label: 'Vollmond – Sehr gut', score: 90 },
    { label: 'Abnehmend – Gut', score: 60 },
    { label: 'Letztes Viertel – Mäßig', score: 45 },
    { label: 'Abnehmend – Gut', score: 60 },
  ];
  return scores[idx];
};

const PeriodCard: React.FC<{
  period: SolunarPeriod;
  isCurrent: boolean;
  isDark: boolean;
}> = ({ period, isCurrent, isDark }) => {
  const isMajor = period.type === 'major';
  const bgColor = isCurrent
    ? isMajor ? '#FEF3C7' : '#ECFDF5'
    : isDark ? COLORS.dark.card : COLORS.gray50;
  const borderColor = isCurrent
    ? isMajor ? '#F59E0B' : COLORS.green
    : 'transparent';
  const textColor = isCurrent
    ? isMajor ? '#B45309' : '#065F46'
    : isDark ? COLORS.gray300 : COLORS.gray700;

  return (
    <View style={[
      styles.periodCard,
      { backgroundColor: bgColor, borderColor, borderWidth: isCurrent ? 2 : 0 },
    ]}>
      <View style={styles.periodHeader}>
        <Text style={[styles.periodType, { color: isMajor ? '#F59E0B' : COLORS.green }]}>
          {isMajor ? '🔥 MAJOR' : '⭐ MINOR'}
        </Text>
        {isCurrent && (
          <View style={[styles.liveTag, { backgroundColor: isMajor ? '#F59E0B' : COLORS.green }]}>
            <Text style={styles.liveTagText}>JETZT</Text>
          </View>
        )}
      </View>
      <Text style={[styles.periodLabel, { color: textColor }]}>{period.label}</Text>
      <Text style={[styles.periodTime, { color: textColor }]}>
        {formatTime(period.start)} – {formatTime(period.end)}
      </Text>
    </View>
  );
};

export const BiteTimeModal: React.FC<BiteTimeModalProps> = ({
  visible,
  onClose,
  userLocation,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [lng, lat] = userLocation;

  const data = useMemo(() => {
    const solunar = getSolunarData(lat, lng);
    const sunTimes = calculateSunTimes(lat, lng);
    const golden = isGoldenHour(lat, lng);
    const moonPhase = getMoonPhase();
    const moonEmoji = getMoonEmoji();
    const moonInfo = getMoonPhaseScore();
    return { solunar, sunTimes, golden, moonPhase, moonEmoji, moonInfo };
  }, [lat, lng, visible]);

  const { solunar, sunTimes, golden, moonPhase, moonEmoji, moonInfo } = data;

  const scoreColor = solunar.solunarScore >= 70
    ? COLORS.green
    : solunar.solunarScore >= 50
      ? COLORS.yellow
      : COLORS.red;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, isDark && styles.containerDark]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isDark && styles.textLight]}>Beißzeit-Radar</Text>
              <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                Solunar-Theorie & Tageszeiten
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, isDark && styles.closeBtnDark]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
            >
              <X size={18} color={isDark ? COLORS.gray300 : COLORS.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Score Hero */}
            <View style={[styles.scoreHero, isDark && styles.scoreHeroDark]}>
              <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                  {solunar.solunarScore}
                </Text>
                <Text style={styles.scoreLabel}>SOLUNAR</Text>
              </View>
              <View style={styles.scoreMeta}>
                <Text style={[styles.scoreHeadline, isDark && styles.textLight]}>
                  {solunar.solunarScore >= 80
                    ? 'Hervorragende Beißzeit!'
                    : solunar.solunarScore >= 60
                      ? 'Gute Bedingungen'
                      : 'Ruhige Phase'}
                </Text>
                <Text style={[styles.scoreDesc, isDark && styles.subtitleDark]}>
                  {solunar.currentPeriod
                    ? `${solunar.currentPeriod.type === 'major' ? 'Major' : 'Minor'} Period aktiv – maximale Aktivität!`
                    : solunar.nextPeriod
                      ? `Nächste Period in ${Math.round((solunar.nextPeriod.start.getTime() - Date.now()) / 60000)} Min.`
                      : 'Zwischen den aktiven Perioden'}
                </Text>
              </View>
            </View>

            {/* Solunar Periods */}
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Solunar-Perioden heute
            </Text>
            <View style={styles.periodsGrid}>
              {solunar.periods.map((period, i) => (
                <PeriodCard
                  key={i}
                  period={period}
                  isCurrent={solunar.currentPeriod === period}
                  isDark={isDark}
                />
              ))}
            </View>

            {/* Sun & Golden Hour */}
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Tageszeiten
            </Text>
            <View style={[styles.infoGrid, isDark && styles.infoGridDark]}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🌅</Text>
                <Text style={[styles.infoLabel, isDark && styles.subtitleDark]}>Sonnenaufgang</Text>
                <Text style={[styles.infoValue, isDark && styles.textLight]}>
                  {formatTime(sunTimes.sunrise)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🌇</Text>
                <Text style={[styles.infoLabel, isDark && styles.subtitleDark]}>Sonnenuntergang</Text>
                <Text style={[styles.infoValue, isDark && styles.textLight]}>
                  {formatTime(sunTimes.sunset)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>{golden.isGolden ? '🔥' : '🌤️'}</Text>
                <Text style={[styles.infoLabel, isDark && styles.subtitleDark]}>Golden Hour</Text>
                <Text style={[
                  styles.infoValue,
                  { color: golden.isGolden ? COLORS.green : isDark ? COLORS.white : COLORS.gray900 },
                ]}>
                  {golden.isGolden ? 'JETZT!' : golden.nextGolden}
                </Text>
              </View>
            </View>

            {/* Moon Phase */}
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Mondphase
            </Text>
            <View style={[styles.moonCard, isDark && styles.moonCardDark]}>
              <Text style={styles.moonEmoji}>{moonEmoji}</Text>
              <View style={styles.moonInfo}>
                <Text style={[styles.moonPhase, isDark && styles.textLight]}>{moonPhase}</Text>
                <Text style={[styles.moonScore, isDark && styles.subtitleDark]}>
                  {moonInfo.label}
                </Text>
                <View style={styles.moonBar}>
                  <View style={styles.moonBarTrack} />
                  <View style={[
                    styles.moonBarFill,
                    {
                      width: `${moonInfo.score}%`,
                      backgroundColor: moonInfo.score >= 70 ? COLORS.green : moonInfo.score >= 50 ? COLORS.yellow : COLORS.red,
                    },
                  ]} />
                </View>
              </View>
            </View>

            {/* Solunar Explanation */}
            <View style={[styles.explainer, isDark && styles.explainerDark]}>
              <Text style={[styles.explainerTitle, isDark && styles.textLight]}>
                Was ist die Solunar-Theorie?
              </Text>
              <Text style={[styles.explainerText, isDark && styles.subtitleDark]}>
                Die Solunar-Theorie besagt, dass Fische zu bestimmten Zeiten aktiver sind – basierend auf
                der Position von Mond und Sonne. Major Periods (Mond-Transit) dauern ~2 Stunden,
                Minor Periods (Mondauf-/untergang) ~1 Stunde.
              </Text>
              <View style={styles.explainerLegend}>
                <View style={styles.explainerItem}>
                  <Text style={styles.explainerIcon}>🔥</Text>
                  <Text style={[styles.explainerLabel, isDark && styles.subtitleDark]}>
                    Major = Höchste Aktivität
                  </Text>
                </View>
                <View style={styles.explainerItem}>
                  <Text style={styles.explainerIcon}>⭐</Text>
                  <Text style={[styles.explainerLabel, isDark && styles.subtitleDark]}>
                    Minor = Erhöhte Aktivität
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
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
    maxHeight: '92%',
    paddingTop: 8,
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
    fontSize: 12,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Score Hero
  scoreHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  scoreHeroDark: {
    backgroundColor: COLORS.dark.surface,
  },
  scoreBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.gray400,
    letterSpacing: 1,
  },
  scoreMeta: {
    flex: 1,
  },
  scoreHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  scoreDesc: {
    fontSize: 13,
    color: COLORS.gray500,
    lineHeight: 18,
  },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 12,
  },

  // Periods
  periodsGrid: {
    gap: 10,
    marginBottom: 24,
  },
  periodCard: {
    borderRadius: 14,
    padding: 14,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  periodType: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  periodTime: {
    fontSize: 13,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  infoGridDark: {
    backgroundColor: COLORS.dark.surface,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoIcon: {
    fontSize: 22,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.gray500,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
  },

  // Moon
  moonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  moonCardDark: {
    backgroundColor: COLORS.dark.surface,
  },
  moonEmoji: {
    fontSize: 48,
  },
  moonInfo: {
    flex: 1,
  },
  moonPhase: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  moonScore: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 8,
  },
  moonBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  moonBarTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
  },
  moonBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Explainer
  explainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
  },
  explainerDark: {
    backgroundColor: COLORS.dark.surface,
  },
  explainerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  explainerText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 12,
  },
  explainerLegend: {
    gap: 6,
  },
  explainerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  explainerIcon: {
    fontSize: 16,
  },
  explainerLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
});

export default BiteTimeModal;
