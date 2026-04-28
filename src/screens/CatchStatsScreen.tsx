/**
 * CatchStatsScreen
 * Detaillierte Fang-Statistik für BISS
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Fish,
  Trophy,
  Calendar,
  TrendingUp,
  MapPin,
  Star,
  Award,
  BarChart3,
  Clock,
  Target,
} from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useCatchCount } from '../hooks/useCatchCount';
import { useFavorites } from '../hooks/useFavorites';
import { useRatings } from '../hooks/useRatings';
import { useAchievements } from '../hooks/useAchievements';
import { COLORS } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { TIER_COLORS } from '../constants/achievements';

const { width: screenWidth } = Dimensions.get('window');

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  isDark?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, title, value, subtitle, color = COLORS.primary, isDark 
}) => (
  <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
    <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
      {icon}
    </View>
    <View style={styles.statsContent}>
      <Text style={[styles.statsValue, isDark && styles.textLight]}>{value}</Text>
      <Text style={[styles.statsTitle, isDark && styles.subtitleDark]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statsSubtitle, isDark && styles.subtitleDark]}>{subtitle}</Text>
      )}
    </View>
  </View>
);

export const CatchStatsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const catchesCount = useCatchCount();
  const { favoritesCount } = useFavorites();
  const { ratings } = useRatings();
  const { achievements, streak, unlockedCount } = useAchievements();
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'year'>('all');
  const insets = useSafeAreaInsets();

  // Mock data für Demo - später mit echten Fang-Daten ersetzen
  const mockCatchData = {
    totalCatches: catchesCount || 12,
    totalSpecies: 8,
    biggestCatch: { weight: 4.2, species: 'Hecht', date: '15.02.2026' },
    averageWeight: 1.8,
    favoriteSpot: 'Steinhuder Meer',
    catchesByMonth: [
      { month: 'Jan', catches: 3 },
      { month: 'Feb', catches: 5 },
      { month: 'Mär', catches: 4 },
    ],
    speciesBreakdown: [
      { species: 'Hecht', count: 4, percentage: 33 },
      { species: 'Zander', count: 3, percentage: 25 },
      { species: 'Barsch', count: 2, percentage: 17 },
      { species: 'Karpfen', count: 2, percentage: 17 },
      { species: 'Forelle', count: 1, percentage: 8 },
    ],
  };

  const periodOptions = [
    { id: 'all', label: 'Alle Zeit' },
    { id: 'year', label: 'Dieses Jahr' },
    { id: 'month', label: 'Diesen Monat' },
  ];

  const renderProgressBar = (percentage: number, color: string, isDark?: boolean) => (
    <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${percentage}%`, backgroundColor: color }
        ]} 
      />
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.backBtn, isDark && styles.backBtnDark]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={isDark ? COLORS.white : COLORS.gray600} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.titleDark]}>Fang-Statistik</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={[styles.periodSelector, isDark && styles.periodSelectorDark]}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.periodOption,
                selectedPeriod === option.id && styles.periodOptionActive,
                isDark && styles.periodOptionDark,
                selectedPeriod === option.id && styles.periodOptionActiveDark,
              ]}
              onPress={() => setSelectedPeriod(option.id as any)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === option.id && styles.periodTextActive,
                isDark && styles.periodTextDark,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            icon={<Fish size={24} color={COLORS.primary} strokeWidth={2} />}
            title="Gesamtfänge"
            value={mockCatchData.totalCatches}
            subtitle={`${mockCatchData.totalSpecies} Arten`}
            color={COLORS.primary}
            isDark={isDark}
          />
          <StatsCard
            icon={<Trophy size={24} color={COLORS.yellow} strokeWidth={2} />}
            title="Größter Fang"
            value={`${mockCatchData.biggestCatch.weight}kg`}
            subtitle={mockCatchData.biggestCatch.species}
            color={COLORS.yellow}
            isDark={isDark}
          />
          <StatsCard
            icon={<TrendingUp size={24} color={COLORS.green} strokeWidth={2} />}
            title="Durchschnitt"
            value={`${mockCatchData.averageWeight}kg`}
            subtitle="Ø Gewicht"
            color={COLORS.green}
            isDark={isDark}
          />
          <StatsCard
            icon={<MapPin size={24} color={COLORS.primary} strokeWidth={2} />}
            title="Lieblingsspot"
            value={mockCatchData.favoriteSpot}
            subtitle="Meistbesucht"
            color={COLORS.primary}
            isDark={isDark}
          />
        </View>

        {/* Monthly Chart */}
        <View style={[styles.chartSection, isDark && styles.chartSectionDark]}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Monatsübersicht</Text>
          </View>
          <View style={styles.monthlyChart}>
            {mockCatchData.catchesByMonth.map((month) => (
              <View key={month.month} style={styles.monthBar}>
                <View style={[styles.monthBarContainer, isDark && styles.monthBarContainerDark]}>
                  <View 
                    style={[
                      styles.monthBarFill,
                      { 
                        height: `${(month.catches / Math.max(...mockCatchData.catchesByMonth.map(m => m.catches))) * 100}%`,
                        backgroundColor: COLORS.primary 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.monthLabel, isDark && styles.monthLabelDark]}>
                  {month.month}
                </Text>
                <Text style={[styles.monthValue, isDark && styles.monthValueDark]}>
                  {month.catches}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Species Breakdown */}
        <View style={[styles.speciesSection, isDark && styles.speciesSectionDark]}>
          <View style={styles.sectionHeader}>
            <Fish size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Arten-Verteilung</Text>
          </View>
          {mockCatchData.speciesBreakdown.map((species) => (
            <View key={species.species} style={styles.speciesItem}>
              <View style={styles.speciesInfo}>
                <Text style={[styles.speciesName, isDark && styles.textLight]}>
                  {species.species}
                </Text>
                <Text style={[styles.speciesCount, isDark && styles.subtitleDark]}>
                  {species.count} Fänge ({species.percentage}%)
                </Text>
              </View>
              <View style={styles.speciesBar}>
                {renderProgressBar(species.percentage, COLORS.primary, isDark)}
              </View>
            </View>
          ))}
        </View>

        {/* Additional Stats */}
        <View style={[styles.additionalStats, isDark && styles.additionalStatsDark]}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Weitere Statistiken</Text>
          </View>
          <View style={styles.additionalGrid}>
            <View style={[styles.additionalCard, isDark && styles.additionalCardDark]}>
              <Clock size={20} color={COLORS.gray500} strokeWidth={2} />
              <Text style={[styles.additionalValue, isDark && styles.additionalValueDark]}>
                {streak.currentStreak}
              </Text>
              <Text style={[styles.additionalLabel, isDark && styles.additionalLabelDark]}>
                Tage Streak
              </Text>
            </View>
            <View style={[styles.additionalCard, isDark && styles.additionalCardDark]}>
              <Star size={20} color={COLORS.gray500} strokeWidth={2} />
              <Text style={[styles.additionalValue, isDark && styles.additionalValueDark]}>
                {favoritesCount}
              </Text>
              <Text style={[styles.additionalLabel, isDark && styles.additionalLabelDark]}>
                Favoriten
              </Text>
            </View>
            <View style={[styles.additionalCard, isDark && styles.additionalCardDark]}>
              <Target size={20} color={COLORS.gray500} strokeWidth={2} />
              <Text style={[styles.additionalValue, isDark && styles.additionalValueDark]}>
                {unlockedCount}
              </Text>
              <Text style={[styles.additionalLabel, isDark && styles.additionalLabelDark]}>
                Achievements
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Best */}
        <View style={[styles.personalBestSection, isDark && styles.personalBestSectionDark]}>
          <View style={styles.sectionHeader}>
            <Trophy size={20} color={COLORS.yellow} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Persönliche Rekorde</Text>
          </View>
          <View style={[styles.personalBestCard, isDark && styles.personalBestCardDark]}>
            <View style={styles.personalBestItem}>
              <Text style={[styles.personalBestLabel, isDark && styles.subtitleDark]}>
                Größter Fang
              </Text>
              <Text style={[styles.personalBestValue, isDark && styles.textLight]}>
                {mockCatchData.biggestCatch.weight}kg {mockCatchData.biggestCatch.species}
              </Text>
              <Text style={[styles.personalBestDate, isDark && styles.subtitleDark]}>
                {mockCatchData.biggestCatch.date}
              </Text>
            </View>
            <View style={styles.personalBestDivider} />
            <View style={styles.personalBestItem}>
              <Text style={[styles.personalBestLabel, isDark && styles.subtitleDark]}>
                Meist gefangene Art
              </Text>
              <Text style={[styles.personalBestValue, isDark && styles.textLight]}>
                Hecht ({mockCatchData.speciesBreakdown[0].count}x)
              </Text>
              <Text style={[styles.personalBestDate, isDark && styles.subtitleDark]}>
                {mockCatchData.speciesBreakdown[0].percentage}% aller Fänge
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View style={[styles.footerNote, isDark && styles.footerNoteDark]}>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            📊 Statistiken werden automatisch aktualisiert
          </Text>
          <Text style={[styles.footerSubtext, isDark && styles.footerSubtextDark]}>
            Basierend auf deinen Fang-Bucheinträgen
          </Text>
        </View>
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
    borderBottomColor: COLORS.dark.card,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDark: {
    backgroundColor: COLORS.dark.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  titleDark: {
    color: COLORS.white,
  },
  textLight: {
    color: COLORS.white,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodSelectorDark: {
    backgroundColor: COLORS.dark.bg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodOptionDark: {
    backgroundColor: 'transparent',
  },
  periodOptionActive: {
    backgroundColor: COLORS.primary,
  },
  periodOptionActiveDark: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  periodTextDark: {
    color: COLORS.gray300,
  },
  periodTextActive: {
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statsCard: {
    width: (screenWidth - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  chartSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartSectionDark: {
    backgroundColor: COLORS.dark.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  sectionTitleDark: {
    color: COLORS.white,
  },
  monthlyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  monthBar: {
    alignItems: 'center',
    flex: 1,
  },
  monthBarContainer: {
    height: 80,
    width: 30,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  monthBarContainerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  monthBarFill: {
    borderRadius: 4,
  },
  monthLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  monthLabelDark: {
    color: COLORS.gray400,
  },
  monthValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  monthValueDark: {
    color: COLORS.white,
  },
  speciesSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  speciesSectionDark: {
    backgroundColor: COLORS.dark.card,
  },
  speciesItem: {
    marginBottom: 16,
  },
  speciesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  speciesName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray900,
  },
  speciesCount: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  speciesBar: {
    height: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarDark: {
    backgroundColor: COLORS.dark.bg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  additionalStats: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  additionalStatsDark: {
    backgroundColor: COLORS.dark.card,
  },
  additionalGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  additionalCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
  },
  additionalCardDark: {
    backgroundColor: COLORS.dark.bg,
  },
  additionalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    marginTop: 8,
    marginBottom: 4,
  },
  additionalValueDark: {
    color: COLORS.white,
  },
  additionalLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  additionalLabelDark: {
    color: COLORS.gray400,
  },
  personalBestSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  personalBestSectionDark: {
    backgroundColor: COLORS.dark.card,
  },
  personalBestCard: {
    borderRadius: 12,
    backgroundColor: COLORS.yellow + '10',
    padding: 16,
  },
  personalBestCardDark: {
    backgroundColor: COLORS.yellow + '20',
  },
  personalBestItem: {
    marginBottom: 8,
  },
  personalBestLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  personalBestValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  personalBestDate: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  personalBestDivider: {
    height: 1,
    backgroundColor: COLORS.yellow + '30',
    marginVertical: 12,
  },
  footerNote: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footerNoteDark: {
    backgroundColor: COLORS.dark.card,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerTextDark: {
    color: COLORS.gray300,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  footerSubtextDark: {
    color: COLORS.gray400,
  },
});
