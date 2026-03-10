/**
 * MapBottomSheet - Premium Spot Detail + Explore View
 * Redesigned with Score Ring, Hero sections, and micro-interactions
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Linking,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Navigation, MapPin, Phone, ExternalLink, Info, Star, Clock, Droplets, Sun, Moon, Wind, ChevronRight, Heart, Cloud, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, getScoreColor } from '../../constants/colors';
import { ScoreRing } from '../ui/ScoreRing';
import { FangindexBar } from '../ui/FangindexBar';
import { StarRating } from '../ui/StarRating';
import { SpotRatingSummary } from '../../hooks/useRatings';
import { SPOT_CATEGORIES, FISH_SEASONS, FISH_FILTERS } from '../../constants/fishing';
import { getWaterTypeName, getFishSeasonStatus, formatDistance } from '../../utils/fishing';
import { MapWaterBody } from '../../types/map';
import { LinearGradient } from 'expo-linear-gradient';
import { ForecastCard } from './ForecastCard';
import { WeekForecast } from '../../services/fangindexForecast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'Gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffH < 24) return `vor ${diffH} Std.`;
  if (diffD === 1) return 'Gestern';
  if (diffD < 7) return `vor ${diffD} Tagen`;
  if (diffD < 30) return `vor ${Math.floor(diffD / 7)} Wochen`;
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
};

interface MapBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  selectedSpot: MapWaterBody | null;
  top3: MapWaterBody[];
  userLocation: [number, number];
  goldenHourInfo: { isGolden: boolean; nextGolden: string };
  selectedFish: string[];
  onSelectSpot: (spot: MapWaterBody | null) => void;
  onMarkerPress: (spot: MapWaterBody) => void;
  onShowFangindexInfo: () => void;
  onToggleFish: (fishId: string) => void;
  isFavorite?: (spotId: string) => boolean;
  onToggleFavorite?: (spotId: string) => void;
  favoriteIds?: string[];
  allSpots?: MapWaterBody[];
  getRatingSummary?: (spotId: string) => SpotRatingSummary;
  onRateSpot?: (spotId: string) => void;
  forecast?: WeekForecast | null;
  forecastLoading?: boolean;
  onLoadForecast?: () => void;
}

export const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
  bottomSheetRef,
  selectedSpot,
  top3,
  userLocation,
  goldenHourInfo,
  selectedFish,
  onSelectSpot,
  onMarkerPress,
  onShowFangindexInfo,
  onToggleFish,
  isFavorite,
  onToggleFavorite,
  favoriteIds,
  allSpots,
  getRatingSummary,
  onRateSpot,
  forecast,
  forecastLoading,
  onLoadForecast,
}) => {
  const { isDark } = useTheme();
  const snapPoints = [20, 450, '90%'];
  const [showBreakdown, setShowBreakdown] = useState<MapWaterBody | null>(null);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={selectedSpot ? 1 : 0}
      snapPoints={snapPoints}
      backgroundStyle={[styles.sheetBg, isDark && styles.sheetBgDark]}
      handleIndicatorStyle={[styles.sheetHandle, isDark && styles.sheetHandleDark]}
    >
      <View style={styles.sheetHeader}>
        <View style={{ flex: 1 }}>
          {selectedSpot && (
            <Text style={styles.sheetSubtitle}>
              {SPOT_CATEGORIES[selectedSpot.category].icon} {SPOT_CATEGORIES[selectedSpot.category].name}
            </Text>
          )}
          <Text style={[styles.sheetTitle, isDark && styles.textLight]} numberOfLines={1}>
            {selectedSpot ? selectedSpot.name : 'Erkunden'}
          </Text>
        </View>
        {selectedSpot && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.sheetFavBtn,
                isFavorite?.(selectedSpot.id) && styles.sheetFavBtnActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onToggleFavorite?.(selectedSpot.id);
              }}
            >
              <Heart
                size={18}
                color={isFavorite?.(selectedSpot.id) ? COLORS.red : COLORS.gray400}
                fill={isFavorite?.(selectedSpot.id) ? COLORS.red : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetCloseBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectSpot(null);
              }}
            >
              <Text style={styles.sheetClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Fangindex Breakdown Modal */}
      <Modal
        visible={!!showBreakdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBreakdown(null)}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowBreakdown(null)}
        >
          <TouchableOpacity activeOpacity={1} style={[modalStyles.sheet, isDark && modalStyles.sheetDark]}>
            {/* Handle */}
            <View style={modalStyles.handle} />
            {/* Header */}
            <View style={modalStyles.header}>
              <View style={modalStyles.headerLeft}>
                <View style={[modalStyles.scoreCircle, { backgroundColor: getScoreColor(showBreakdown?.fangIndex ?? 0) + '20' }]}>
                  <Text style={[modalStyles.scoreText, { color: getScoreColor(showBreakdown?.fangIndex ?? 0) }]}>
                    {showBreakdown?.fangIndex ?? 0}
                  </Text>
                </View>
                <View>
                  <Text style={[modalStyles.title, isDark && modalStyles.textLight]}>Fangindex</Text>
                  <Text style={modalStyles.subtitle}>Aktuelle Bedingungen</Text>
                </View>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowBreakdown(null)}>
                <Text style={modalStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Bars */}
            <View style={modalStyles.barsContainer}>
              {FACTOR_CONFIG.map((factor, index) => (
                <FangindexBar
                  key={factor.key}
                  label={factor.label}
                  icon={factor.icon}
                  score={showBreakdown?.fangIndexFactors?.[factor.key] ?? 50}
                  weight={factor.weight}
                  delay={index * 80}
                  animated={true}
                />
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
        {selectedSpot ? (
          <SpotDetailView
            spot={selectedSpot}
            userLocation={userLocation}
            goldenHourInfo={goldenHourInfo}
            isDark={isDark}
            onShowFangindexInfo={onShowFangindexInfo}
            onShowBreakdown={() => setShowBreakdown(selectedSpot)}
            isFavorite={isFavorite?.(selectedSpot.id) ?? false}
            onToggleFavorite={() => onToggleFavorite?.(selectedSpot.id)}
            ratingSummary={getRatingSummary?.(selectedSpot.id)}
            onRateSpot={() => onRateSpot?.(selectedSpot.id)}
          />
        ) : (
          <ExploreView
            top3={top3}
            userLocation={userLocation}
            selectedFish={selectedFish}
            isDark={isDark}
            onMarkerPress={onMarkerPress}
            onToggleFish={onToggleFish}
            favoriteIds={favoriteIds ?? []}
            allSpots={allSpots ?? []}
            forecast={forecast}
            forecastLoading={forecastLoading}
            onLoadForecast={onLoadForecast}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

// ─── Spot Detail View ───

const SpotDetailView: React.FC<{
  spot: MapWaterBody;
  userLocation: [number, number];
  goldenHourInfo: { isGolden: boolean; nextGolden: string };
  isDark: boolean;
  onShowFangindexInfo: () => void;
  onShowBreakdown: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  ratingSummary?: SpotRatingSummary;
  onRateSpot?: () => void;
}> = ({ spot, userLocation, goldenHourInfo, isDark, onShowFangindexInfo, onShowBreakdown, isFavorite, onToggleFavorite, ratingSummary, onRateSpot }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [spot.id]);

  const scoreColor = getScoreColor(spot.fangIndex);
  const isHotSpot = spot.fangIndex >= 80;

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
      {/* Hero Photo (only if available) */}
      {spot.placePhoto && (
        <View style={styles.heroSection}>
          <Image source={{ uri: spot.placePhoto }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroGradient}
          />
          {spot.placeRating != null && (
            <View style={styles.heroRatingBadge}>
              <Star size={12} color="#FACC15" fill="#FACC15" />
              <Text style={styles.heroRatingText}>{spot.placeRating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Score + Info Card */}
      <View style={[styles.scoreCard, isDark && styles.scoreCardDark]}>
        <View style={styles.scoreRingContainer}>
          <ScoreRing
            score={spot.fangIndex}
            size={72}
            strokeWidth={5}
            label="BISS"
            animated={true}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onShowBreakdown();
            }}
          />
        </View>

        <View style={styles.scoreInfo}>
          <View style={styles.scoreInfoRow}>
            <View style={[styles.categoryPill, { backgroundColor: SPOT_CATEGORIES[spot.category].color + '20' }]}>
              <Text style={styles.categoryPillIcon}>{SPOT_CATEGORIES[spot.category].icon}</Text>
              <Text style={[styles.categoryPillText, { color: SPOT_CATEGORIES[spot.category].color }]}>
                {SPOT_CATEGORIES[spot.category].name}
              </Text>
            </View>
            {spot.data_source === 'curated' && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#059669" strokeWidth={2.5} />
                <Text style={styles.verifiedBadgeText}>Verifiziert</Text>
              </View>
            )}
          </View>
          <Text style={[styles.spotTypeName, isDark && styles.textLight]} numberOfLines={1}>
            {getWaterTypeName(spot.type)}
          </Text>
          <View style={styles.metaRow}>
            <MapPin size={13} color={COLORS.gray400} />
            <Text style={styles.metaText}>
              {formatDistance(spot.longitude, spot.latitude, userLocation)}
            </Text>
            {goldenHourInfo.isGolden && (
              <>
                <View style={styles.metaDot} />
                <Sun size={13} color="#F59E0B" />
                <Text style={[styles.metaText, { color: '#F59E0B', fontWeight: '600' }]}>
                  Golden Hour
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

    {/* Datenfrische / Catch Activity (Opas Rat: Schicht 3) */}
    {(spot.lastCaughtAt || spot.catchCount) ? (
      <View style={[styles.freshnessSection, isDark && styles.freshnessSectionDark]}>
        <View style={styles.freshnessRow}>
          <View style={styles.freshnessItem}>
            <Clock size={14} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Zuletzt gefangen</Text>
          </View>
          <Text style={[styles.freshnessValue, isDark && styles.textLight]}>
            {formatTimeAgo(spot.lastCaughtAt!)}
          </Text>
        </View>
        {(spot.catchCount ?? 0) > 0 && (
          <View style={styles.freshnessRow}>
            <View style={styles.freshnessItem}>
              <Text style={styles.freshnessEmoji}>🎣</Text>
              <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Deine Fänge hier</Text>
            </View>
            <Text style={[styles.freshnessValue, isDark && styles.textLight]}>
              {spot.catchCount}
            </Text>
          </View>
        )}
      </View>
    ) : (
      <View style={[styles.freshnessSection, isDark && styles.freshnessSectionDark]}>
        <View style={styles.freshnessRow}>
          <View style={styles.freshnessItem}>
            <Clock size={14} color={COLORS.gray400} strokeWidth={2} />
            <Text style={styles.freshnessEmpty}>Noch keine Fänge an diesem Spot</Text>
          </View>
        </View>
      </View>
    )}

    {/* Pegel-Daten für Flüsse (Spot-Daten 2.0) */}
    {spot.pegelStation && (
      <View style={[styles.freshnessSection, isDark && styles.freshnessSectionDark]}>
        <View style={styles.freshnessRow}>
          <View style={styles.freshnessItem}>
            <Droplets size={14} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Pegel ({spot.pegelStation})</Text>
          </View>
          <Text style={[styles.freshnessValue, isDark && styles.textLight]}>
            {spot.pegelLevel ? `${spot.pegelLevel} cm` : '–'}
          </Text>
        </View>
        {spot.pegelTrend && (
          <View style={styles.freshnessRow}>
            <View style={styles.freshnessItem}>
              <Text style={styles.freshnessEmoji}>
                {spot.pegelTrend === 'rising' ? '↗️' : spot.pegelTrend === 'falling' ? '↘️' : '➡️'}
              </Text>
              <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Trend</Text>
            </View>
            <Text style={[styles.pegelTrendText, isDark && styles.textLight, 
              spot.pegelTrend === 'rising' && styles.pegelRising,
              spot.pegelTrend === 'falling' && styles.pegelFalling,
            ]}>
              {spot.pegelTrend === 'rising' ? 'Steigend' : spot.pegelTrend === 'falling' ? 'Fallend' : 'Stabil'}
            </Text>
          </View>
        )}
      </View>
    )}

    {/* Angelerlaubnis (Spot-Daten 2.0) */}
    {(spot.permit_info || spot.permit_url || spot.permit_price !== null) && (
      <View style={[styles.freshnessSection, isDark && styles.freshnessSectionDark]}>
        <View style={styles.freshnessRow}>
          <View style={styles.freshnessItem}>
            <Info size={14} color={COLORS.green} strokeWidth={2} />
            <Text style={[styles.sectionLabel, isDark && styles.textLight]}>Angelerlaubnis</Text>
          </View>
        </View>
        {spot.permit_price !== null && spot.permit_price !== undefined && (
          <View style={styles.freshnessRow}>
            <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Tageskarte</Text>
            <Text style={[styles.freshnessValue, { color: COLORS.green }, isDark && { color: COLORS.green }]}>
              {spot.permit_price === 0 ? 'Kostenlos' : `€${spot.permit_price}`}
            </Text>
          </View>
        )}
        {spot.permit_info && (
          <Text style={[styles.permitInfoText, isDark && styles.textLight]}>{spot.permit_info}</Text>
        )}
        {spot.permit_url && (
          <TouchableOpacity
            style={styles.permitLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL(spot.permit_url!);
            }}
            activeOpacity={0.7}
          >
            <ExternalLink size={14} color={COLORS.primary} />
            <Text style={styles.permitLinkText}>Tageskarte kaufen</Text>
          </TouchableOpacity>
        )}
        {spot.regulations?.specialRules && (
          <Text style={[styles.regulationsText, isDark && styles.textLight]}>
            📋 {spot.regulations.specialRules}
          </Text>
        )}
      </View>
    )}

    {/* Datenqualität (Spot-Daten 2.0) */}
    {spot.data_source === 'curated' && (
      <View style={[styles.dataQualitySection, isDark && styles.freshnessSectionDark]}>
        <Text style={[styles.dataQualityTitle, isDark && styles.textLight]}>
          <ShieldCheck size={13} color="#059669" /> Verifizierte Daten
        </Text>
        <View style={styles.dataQualityGrid}>
          {spot.fish_species_confirmed && (
            <View style={styles.dataQualityChip}>
              <Text style={styles.dataQualityChipText}>✅ Fischarten bestätigt</Text>
            </View>
          )}
          {(spot.permit_url || spot.permit_info) && (
            <View style={styles.dataQualityChip}>
              <Text style={styles.dataQualityChipText}>✅ Erlaubnis-Info</Text>
            </View>
          )}
          {spot.regulations && (
            <View style={styles.dataQualityChip}>
              <Text style={styles.dataQualityChipText}>✅ Regeln & Bestimmungen</Text>
            </View>
          )}
          {spot.pegelStation && (
            <View style={styles.dataQualityChip}>
              <Text style={styles.dataQualityChipText}>✅ Live-Pegel</Text>
            </View>
          )}
        </View>
      </View>
    )}

    {/* Community Rating */}
    <View style={[styles.ratingSection, isDark && styles.ratingSectionDark]}>
      <View style={styles.ratingHeader}>
        <Text style={[styles.sectionLabel, isDark && styles.textLight]}>Community-Bewertung</Text>
        {ratingSummary?.ratingCount ? (
          <Text style={styles.ratingCount}>
            {ratingSummary.ratingCount} {ratingSummary.ratingCount === 1 ? 'Bewertung' : 'Bewertungen'}
          </Text>
        ) : null}
      </View>
      {ratingSummary?.userRating ? (
        <View style={styles.ratingDisplay}>
          <StarRating rating={ratingSummary.avgRating} size={22} />
          <Text style={[styles.ratingAvg, isDark && styles.textLight]}>
            {ratingSummary.avgRating.toFixed(1)}
          </Text>
          <TouchableOpacity
            style={styles.ratingEditBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRateSpot?.();
            }}
          >
            <Text style={styles.ratingEditText}>Ändern</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.ratingCta}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRateSpot?.();
          }}
          activeOpacity={0.8}
        >
          <Star size={18} color={COLORS.primary} />
          <Text style={styles.ratingCtaText}>Diesen Spot bewerten</Text>
          <ChevronRight size={16} color={COLORS.gray400} />
        </TouchableOpacity>
      )}
      {ratingSummary?.userRating?.comment ? (
        <View style={[styles.ratingComment, isDark && styles.ratingCommentDark]}>
          <Text style={[styles.ratingCommentText, isDark && styles.textLight]}>
            „{ratingSummary.userRating.comment}"
          </Text>
        </View>
      ) : null}
    </View>

    {/* Category-specific sections */}
    {spot.category === 'official' && <OfficialBanner spot={spot} />}
    {spot.category === 'hidden' && <HiddenGemBanner />}

    {/* Fish Species with Season Status */}
    {spot.fish_species?.length > 0 && (
      <View style={styles.fishSection}>
        <Text style={[styles.sectionLabel, isDark && styles.textLight]}>Fischarten (Saison-Status)</Text>
        <View style={styles.fishGrid}>
          {spot.fish_species.map((fish, i) => {
            const status = getFishSeasonStatus(fish, { spotName: spot.name, spotType: spot.type });
            const fishData = FISH_SEASONS[fish.toLowerCase()];
            return (
              <View
                key={i}
                style={[
                  styles.fishTagEnhanced,
                  isDark && styles.fishTagDark,
                  status === 'closed' && styles.fishTagClosed,
                  status === 'best' && styles.fishTagBest,
                ]}
              >
                <Text style={styles.fishIcon}>{fishData?.icon || '🐟'}</Text>
                <Text
                  style={[
                    styles.fishTagText,
                    isDark && styles.textLight,
                    status === 'closed' && styles.fishTagTextClosed,
                  ]}
                >
                  {fish}
                </Text>
                <View
                  style={[
                    styles.seasonBadge,
                    status === 'open' && styles.seasonOpen,
                    status === 'closed' && styles.seasonClosed,
                    status === 'best' && styles.seasonBest,
                  ]}
                >
                  <Text style={styles.seasonBadgeText}>
                    {status === 'closed' ? '🚫' : status === 'best' ? '🔥' : '✓'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        {spot.fish_species.some(
          (f) => getFishSeasonStatus(f, { spotName: spot.name, spotType: spot.type }) === 'closed'
        ) && <Text style={styles.schonzeitWarning}>⚠️ Einige Fischarten haben aktuell Schonzeit</Text>}

        {/* Mindestmaße pro Region */}
        {(() => {
          const region = spot.region || 'Niedersachsen';
          const minSizeEntries = spot.fish_species
            .map(fish => {
              const fishData = FISH_SEASONS[fish.toLowerCase()];
              const minSize = fishData?.minSizes?.[region];
              return minSize && minSize > 0 ? { name: fish, size: minSize } : null;
            })
            .filter(Boolean) as { name: string; size: number }[];
          
          return minSizeEntries.length > 0 ? (
            <View style={styles.minSizesSection}>
              <Text style={[styles.minSizesTitle, isDark && styles.textLight]}>
                📏 Mindestmaße ({region})
              </Text>
              <View style={styles.minSizesGrid}>
                {minSizeEntries.map((entry) => (
                  <View key={entry.name} style={styles.minSizeChip}>
                    <Text style={styles.minSizeFish}>{entry.name}</Text>
                    <Text style={styles.minSizeValue}>{entry.size} cm</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null;
        })()}
      </View>
    )}

    {/* Live-Bedingungen (Spot-Daten 2.0) */}
    {spot.fangIndexFactors && (
      <View style={[styles.freshnessSection, isDark && styles.freshnessSectionDark]}>
        <Text style={[styles.sectionLabel, isDark && styles.textLight]}>Aktuelle Bedingungen</Text>
        <View style={styles.conditionsGrid}>
          <View style={styles.conditionItem}>
            <Cloud size={16} color={COLORS.gray500} />
            <Text style={[styles.conditionValue, isDark && styles.textLight]}>
              {spot.fangIndexFactors.weather >= 70 ? 'Ideal' : spot.fangIndexFactors.weather >= 45 ? 'OK' : 'Schwierig'}
            </Text>
            <Text style={styles.conditionLabel}>Wetter</Text>
          </View>
          <View style={styles.conditionItem}>
            <Droplets size={16} color={COLORS.gray500} />
            <Text style={[styles.conditionValue, isDark && styles.textLight]}>
              {spot.fangIndexFactors.water_level >= 70 ? 'Optimal' : spot.fangIndexFactors.water_level >= 45 ? 'Normal' : 'Niedrig'}
            </Text>
            <Text style={styles.conditionLabel}>Pegel</Text>
          </View>
          <View style={styles.conditionItem}>
            <Moon size={16} color={COLORS.gray500} />
            <Text style={[styles.conditionValue, isDark && styles.textLight]}>
              {spot.fangIndexFactors.moon_phase >= 70 ? 'Stark' : spot.fangIndexFactors.moon_phase >= 45 ? 'Mittel' : 'Schwach'}
            </Text>
            <Text style={styles.conditionLabel}>Mond</Text>
          </View>
          <View style={styles.conditionItem}>
            <Sun size={16} color={COLORS.gray500} />
            <Text style={[styles.conditionValue, isDark && styles.textLight]}>
              {spot.fangIndexFactors.time_of_day >= 70 ? 'Prime!' : spot.fangIndexFactors.time_of_day >= 45 ? 'Gut' : 'Mäßig'}
            </Text>
            <Text style={styles.conditionLabel}>Tageszeit</Text>
          </View>
        </View>
        {spot.fangIndexFactors.solunar && spot.fangIndexFactors.solunar >= 75 && (
          <View style={styles.solunarAlert}>
            <Text style={styles.solunarAlertText}>🎯 Solunar-Fenster aktiv — erhöhte Beißaktivität!</Text>
          </View>
        )}
      </View>
    )}

    {/* Regulations (kuratierte Spots) */}
    {spot.regulations && ((spot.regulations.allowedMethods?.length ?? 0) > 0 || spot.regulations.dailyLimit || spot.regulations.minSizes) && (
      <View style={[styles.freshnessSection, isDark && styles.freshnessSectionDark]}>
        <Text style={[styles.sectionLabel, isDark && styles.textLight]}>📋 Regeln & Bestimmungen</Text>
        {spot.regulations.allowedMethods && spot.regulations.allowedMethods.length > 0 && (
          <View style={styles.freshnessRow}>
            <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Methoden</Text>
            <Text style={[styles.freshnessValue, isDark && styles.textLight]} numberOfLines={2}>
              {spot.regulations.allowedMethods.join(', ')}
            </Text>
          </View>
        )}
        {spot.regulations.dailyLimit && (
          <View style={styles.freshnessRow}>
            <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Tagesfang</Text>
            <Text style={[styles.freshnessValue, isDark && styles.textLight]}>
              max. {spot.regulations.dailyLimit} Fische
            </Text>
          </View>
        )}
        {spot.regulations.nightFishing !== undefined && (
          <View style={styles.freshnessRow}>
            <Text style={[styles.freshnessLabel, isDark && styles.textLight]}>Nachtangeln</Text>
            <Text style={[styles.freshnessValue, isDark && styles.textLight]}>
              {spot.regulations.nightFishing ? '✅ Erlaubt' : '❌ Nicht erlaubt'}
            </Text>
          </View>
        )}
        {spot.regulations.minSizes && Object.keys(spot.regulations.minSizes).length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={[styles.freshnessLabel, isDark && styles.textLight, { marginBottom: 4 }]}>Mindestmaße</Text>
            <View style={styles.minSizesGrid}>
              {Object.entries(spot.regulations.minSizes).map(([fish, size]) => (
                <View key={fish} style={styles.minSizeChip}>
                  <Text style={styles.minSizeFish}>{fish}</Text>
                  <Text style={styles.minSizeValue}>{size} cm</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {spot.regulations.specialRules && (
          <Text style={[styles.regulationsText, isDark && styles.textLight]}>
            💡 {spot.regulations.specialRules}
          </Text>
        )}
      </View>
    )}

    {/* Price */}
    {spot.permit_price != null && (
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceSectionLabel}>Tageskarte</Text>
            <Text style={styles.priceValue}>
              {spot.permit_price === 0 ? 'Kostenlos!' : `€${spot.permit_price}`}
            </Text>
          </View>
          {spot.permit_url ? (
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Linking.openURL(spot.permit_url!);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.buyBtnText}>Kaufen</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              activeOpacity={0.85}
            >
              <Text style={styles.buyBtnText}>Info</Text>
            </TouchableOpacity>
          )}
        </View>
        {spot.permit_info && (
          <Text style={[styles.permitInfoText, isDark && styles.textLight]}>{spot.permit_info}</Text>
        )}
      </View>
    )}

    {/* Action Buttons */}
    <Text style={[styles.sectionLabel, isDark && styles.textLight, { marginTop: 16 }]}>Aktionen</Text>
    <View style={styles.actionSection}>
      <TouchableOpacity
        style={styles.actionBtnPrimary}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const url = Platform.select({
            ios: `maps:?q=${spot.name}&ll=${spot.latitude},${spot.longitude}`,
            android: `geo:${spot.latitude},${spot.longitude}?q=${spot.name}`,
          });
          if (url) Linking.openURL(url);
        }}
      >
        <Navigation size={18} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.actionBtnPrimaryText}>Route</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => {
          const url = spot.placeId
            ? `https://www.google.com/maps/place/?q=place_id:${spot.placeId}`
            : `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
          Linking.openURL(url);
        }}
      >
        <MapPin size={18} color="#4285F4" strokeWidth={2} />
        <Text style={styles.actionBtnText}>Maps</Text>
      </TouchableOpacity>

      {spot.placePhone && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Linking.openURL(`tel:${spot.placePhone?.replace(/\s/g, '')}`)}
        >
          <Phone size={18} color="#10B981" strokeWidth={2} />
          <Text style={styles.actionBtnText}>Anrufen</Text>
        </TouchableOpacity>
      )}

      {spot.placeWebsite && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(spot.placeWebsite!)}>
          <ExternalLink size={18} color="#6B7280" strokeWidth={2} />
          <Text style={styles.actionBtnText}>Web</Text>
        </TouchableOpacity>
      )}
    </View>

    {spot.placeAddress && (
      <View style={styles.addressSection}>
        <MapPin size={14} color="#6B7280" />
        <Text style={styles.addressText}>{spot.placeAddress}</Text>
      </View>
    )}
  </Animated.View>
);
};

// ─── Sub-components ───

const OfficialBanner: React.FC<{ spot: MapWaterBody }> = ({ spot }) => (
  <View style={styles.officialInfoSection}>
    <LinearGradient
      colors={['#ECFDF5', '#D1FAE5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.officialBanner}
    >
      <View style={styles.officialBannerIconWrap}>
        <Text style={styles.officialBannerIcon}>🏕️</Text>
      </View>
      <View style={styles.officialBannerContent}>
        <Text style={styles.officialBannerTitle}>Offizieller Angelteich</Text>
        <Text style={styles.officialBannerDesc}>Tageskarten vor Ort erhältlich</Text>
      </View>
    </LinearGradient>
    {spot.placeRating != null && (
      <View style={styles.ratingRow}>
        <Star size={14} color="#FACC15" fill="#FACC15" />
        <Text style={styles.ratingValue}>{spot.placeRating.toFixed(1)}</Text>
        <Text style={styles.ratingLabel}>Google Bewertung</Text>
      </View>
    )}
    {spot.placeOpenNow !== undefined && (
      <View style={[styles.openStatus, spot.placeOpenNow ? styles.openStatusOpen : styles.openStatusClosed]}>
        <Text style={styles.openStatusText}>
          {spot.placeOpenNow ? '🟢 Jetzt geöffnet' : '🔴 Geschlossen'}
        </Text>
      </View>
    )}
  </View>
);

const FACTOR_CONFIG = [
  { key: 'weather' as const, label: 'Wetter', icon: '🌤️', weight: '30%' },
  { key: 'time_of_day' as const, label: 'Tageszeit', icon: '🕐', weight: '25%' },
  { key: 'moon_phase' as const, label: 'Mondphase', icon: '🌙', weight: '20%' },
  { key: 'solunar' as const, label: 'Solunar', icon: '🎯', weight: '15%' },
  { key: 'water_level' as const, label: 'Wasserstand', icon: '💧', weight: '10%' },
];

const HiddenGemBanner: React.FC = () => (
  <View style={styles.hiddenGemBanner}>
    <Text style={styles.hiddenGemIcon}>💎</Text>
    <View style={styles.hiddenGemContent}>
      <Text style={styles.hiddenGemTitle}>Versteckter Schatz</Text>
      <Text style={styles.hiddenGemDesc}>Weniger bekannt, oft weniger Angler</Text>
    </View>
  </View>
);

// ─── Explore View ───

const ExploreView: React.FC<{
  top3: MapWaterBody[];
  userLocation: [number, number];
  selectedFish: string[];
  isDark: boolean;
  onMarkerPress: (spot: MapWaterBody) => void;
  onToggleFish: (fishId: string) => void;
  favoriteIds: string[];
  allSpots: MapWaterBody[];
  forecast?: WeekForecast | null;
  forecastLoading?: boolean;
  onLoadForecast?: () => void;
}> = ({ top3, userLocation, selectedFish, isDark, onMarkerPress, onToggleFish, favoriteIds, allSpots, forecast, forecastLoading, onLoadForecast }) => {
  const favoriteSpots = allSpots.filter((s) => favoriteIds.includes(s.id));

  return (
  <View>
    {/* Favorites Section */}
    {favoriteSpots.length > 0 && (
      <View style={styles.top3Section}>
        <Text style={[styles.sectionLabel, isDark && styles.textLight]}>❤️ Deine Favoriten</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.top3ScrollContent}>
          {favoriteSpots.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={[styles.top3Card, isDark && styles.top3CardDark]}
              onPress={() => onMarkerPress(spot)}
              activeOpacity={0.9}
            >
              <View style={[styles.top3Rank, { backgroundColor: COLORS.red }]}>
                <Heart size={10} color={COLORS.white} fill={COLORS.white} />
              </View>
              <Text style={[styles.top3Name, isDark && styles.textLight]} numberOfLines={2}>
                {spot.name}
              </Text>
              <View style={styles.top3Meta}>
                <Text style={styles.top3CategoryIcon}>{SPOT_CATEGORIES[spot.category].icon}</Text>
                <Text style={styles.top3Distance}>{formatDistance(spot.longitude, spot.latitude, userLocation)}</Text>
              </View>
              <View style={[styles.top3Score, { backgroundColor: getScoreColor(spot.fangIndex) }]}>
                <Text style={styles.top3ScoreText}>{spot.fangIndex}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}

    {/* 48h Fangindex-Prognose (Spot-Daten 2.0) */}
    <ForecastCard
      forecast={forecast ?? null}
      loading={forecastLoading ?? false}
      onLoadForecast={onLoadForecast}
    />

    {top3.length > 0 && (
      <View style={styles.top3Section}>
        <Text style={[styles.sectionLabel, isDark && styles.textLight]}>🏆 Top 3 in deiner Nähe</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.top3ScrollContent}>
          {top3.map((spot, index) => (
            <TouchableOpacity
              key={spot.id}
              style={[styles.top3Card, isDark && styles.top3CardDark]}
              onPress={() => onMarkerPress(spot)}
              activeOpacity={0.9}
            >
              <View style={[styles.top3Rank, { backgroundColor: SPOT_CATEGORIES[spot.category].color }]}>
                <Text style={styles.top3RankText}>#{index + 1}</Text>
              </View>
              <Text style={[styles.top3Name, isDark && styles.textLight]} numberOfLines={2}>
                {spot.name}
              </Text>
              <View style={styles.top3Meta}>
                <Text style={styles.top3CategoryIcon}>{SPOT_CATEGORIES[spot.category].icon}</Text>
                <Text style={styles.top3Distance}>{formatDistance(spot.longitude, spot.latitude, userLocation)}</Text>
              </View>
              <View style={[styles.top3Score, { backgroundColor: getScoreColor(spot.fangIndex) }]}>
                <Text style={styles.top3ScoreText}>{spot.fangIndex}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}

    <Text style={[styles.filterLabel, isDark && styles.textLight]}>Fisch-Filter</Text>
    <View style={styles.filterGrid}>
      {FISH_FILTERS.map((fish) => (
        <TouchableOpacity
          key={fish.id}
          style={[
            styles.filterChip,
            isDark && styles.filterChipDark,
            selectedFish.includes(fish.id) && styles.filterChipActive,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onToggleFish(fish.id);
          }}
        >
          <Text style={[styles.filterChipText, selectedFish.includes(fish.id) && styles.filterChipTextActive]}>
            {fish.name}
          </Text>
          <View
            style={[
              styles.confidenceBadge,
              fish.confidence === 'high' && styles.confidenceHigh,
              fish.confidence === 'medium' && styles.confidenceMedium,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
  );
};

// ─── Styles ───

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  sheetBgDark: { backgroundColor: COLORS.dark.surface },
  sheetHandle: { backgroundColor: COLORS.gray200, width: 40 },
  sheetHandleDark: { backgroundColor: COLORS.gray600 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  sheetSubtitle: { fontSize: 11, fontWeight: '600', color: COLORS.gray400, marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetFavBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
  sheetFavBtnActive: { backgroundColor: '#FEE2E2' },
  sheetCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
  sheetClose: { fontSize: 16, color: COLORS.gray500 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40 },
  textLight: { color: COLORS.white },

  // Hero Section (Premium)
  heroSection: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', position: 'relative', height: 160 },
  heroImageContainer: { position: 'relative', height: 160 },
  heroImage: { width: '100%', height: 160 },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  heroRatingBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  heroRatingText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  heroGradientOnly: { height: 120, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  heroEmoji: { fontSize: 48 },

  // Score Card (Premium)
  scoreCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  scoreCardDark: { backgroundColor: COLORS.dark.card },
  scoreRingContainer: { marginRight: 16 },
  scoreInfo: { flex: 1 },
  scoreInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  categoryPillIcon: { fontSize: 12 },
  categoryPillText: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: '#ECFDF5', gap: 3, marginLeft: 6 },
  verifiedBadgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  dataQualitySection: { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  dataQualityTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 8 },
  dataQualityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dataQualityChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5' },
  dataQualityChipText: { fontSize: 12, fontWeight: '500', color: '#047857' },
  spotTypeName: { fontSize: 16, fontWeight: '600', color: COLORS.gray900, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: COLORS.gray500 },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.gray300 },

  // Photo (legacy)
  photoContainer: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  spotPhoto: { width: '100%', height: 180, borderRadius: 16 },
  ratingBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#111827' },

  // Spot Header (legacy)
  spotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  spotScoreCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  spotScoreText: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  scoreInfoBadge: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  spotInfo: { flex: 1 },
  spotTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  spotType: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  spotDistance: { fontSize: 14, color: COLORS.gray600 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  categoryBadgeIcon: { fontSize: 10 },
  categoryBadgeText: { fontSize: 10, fontWeight: '600', color: COLORS.white },

  // Official
  officialInfoSection: { marginBottom: 16 },
  officialBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 12, marginBottom: 12 },
  officialBannerIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center' },
  officialBannerIcon: { fontSize: 20 },
  officialBannerContent: { flex: 1 },
  officialBannerTitle: { fontSize: 14, fontWeight: '700', color: '#059669', marginBottom: 2 },
  officialBannerDesc: { fontSize: 12, color: '#10B981' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ratingStars: { fontSize: 14 },
  ratingValue: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  ratingLabel: { fontSize: 12, color: COLORS.gray400 },
  openStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  openStatusOpen: { backgroundColor: '#ECFDF5' },
  openStatusClosed: { backgroundColor: '#FEF2F2' },
  openStatusText: { fontSize: 13, fontWeight: '600' },

  // Fangindex
  fangindexSection: { marginBottom: 16 },
  fangindexInsight: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, gap: 12, marginBottom: 16 },
  fangindexInsightIcon: { fontSize: 24 },
  fangindexInsightContent: { flex: 1 },
  fangindexInsightTitle: { fontSize: 14, fontWeight: '700', color: '#B45309', marginBottom: 2 },
  fangindexInsightDesc: { fontSize: 12, color: '#D97706', lineHeight: 16 },
  fangindexBreakdown: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginTop: 8 },

  // Hidden Gem
  hiddenGemBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', padding: 12, borderRadius: 12, gap: 12, marginBottom: 16 },
  hiddenGemIcon: { fontSize: 24 },
  hiddenGemContent: { flex: 1 },
  hiddenGemTitle: { fontSize: 14, fontWeight: '700', color: '#7C3AED', marginBottom: 2 },
  hiddenGemDesc: { fontSize: 12, color: '#8B5CF6', lineHeight: 16 },

  // Community Rating
  ratingSection: { marginBottom: 20, backgroundColor: COLORS.gray50, borderRadius: 16, padding: 16 },
  ratingSectionDark: { backgroundColor: COLORS.dark.surface },
  ratingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ratingCount: { fontSize: 11, color: COLORS.gray400, fontWeight: '500' },
  ratingDisplay: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingAvg: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  ratingEditBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: COLORS.gray200 },
  ratingEditText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  ratingCta: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.gray200 },
  ratingCtaText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.primary },
  ratingComment: { marginTop: 10, backgroundColor: COLORS.white, borderRadius: 12, padding: 12 },
  ratingCommentDark: { backgroundColor: COLORS.dark.card },
  ratingCommentText: { fontSize: 13, color: COLORS.gray700, fontStyle: 'italic', lineHeight: 18 },

  // Fish Section
  fishSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray500, marginBottom: 12 },
  fishGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fishTagEnhanced: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray100, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, gap: 6 },
  fishTagDark: { backgroundColor: COLORS.dark.bg },
  fishTagClosed: { backgroundColor: '#FEE2E2', opacity: 0.7 },
  fishTagBest: { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: COLORS.green },
  fishTagText: { fontSize: 13, color: COLORS.gray600 },
  fishTagTextClosed: { textDecorationLine: 'line-through', color: COLORS.red },
  fishIcon: { fontSize: 16 },
  seasonBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray200 },
  seasonOpen: { backgroundColor: '#D1FAE5' },
  seasonClosed: { backgroundColor: '#FEE2E2' },
  seasonBest: { backgroundColor: COLORS.green },
  seasonBadgeText: { fontSize: 10 },
  schonzeitWarning: { fontSize: 12, color: '#B91C1C', marginTop: 12, fontStyle: 'italic', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },
  minSizesSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  minSizesTitle: { fontSize: 13, fontWeight: '600', color: COLORS.gray700, marginBottom: 8 },

  // Price
  priceSection: { marginBottom: 20, backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,102,255,0.08)' },
  priceSectionLabel: { fontSize: 12, fontWeight: '500', color: COLORS.gray500, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceValue: { fontSize: 28, fontWeight: '800', color: COLORS.gray900 },
  buyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buyBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  // Actions
  actionSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 16, gap: 10 },
  actionBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 14, gap: 8 },
  actionBtnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 14, gap: 6 },
  actionBtnText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  addressSection: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, gap: 8, marginBottom: 16 },
  addressText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 18 },

  // Top 3
  top3Section: { marginBottom: 20 },
  top3ScrollContent: { paddingTop: 8, gap: 12 },
  top3Card: { width: 140, backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4, position: 'relative' },
  top3CardDark: { backgroundColor: 'rgba(19,35,55,0.98)' },
  top3Rank: { position: 'absolute', top: -6, left: -6, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  top3RankText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  top3Name: { fontSize: 13, fontWeight: '600', color: COLORS.gray900, marginTop: 4, marginBottom: 8, lineHeight: 18 },
  top3Meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  top3CategoryIcon: { fontSize: 12 },
  top3Distance: { fontSize: 11, color: COLORS.gray400 },
  top3Score: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  top3ScoreText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },

  // Filters
  filterLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray600, marginBottom: 12, marginTop: 8 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray100, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, gap: 6 },
  filterChipDark: { backgroundColor: COLORS.dark.bg },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 14, color: COLORS.gray600 },
  filterChipTextActive: { color: COLORS.white },
  confidenceBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gray400 },
  confidenceHigh: { backgroundColor: COLORS.green },
  confidenceMedium: { backgroundColor: COLORS.yellow },

  // Datenfrische (Opas Rat: Schicht 3)
  freshnessSection: { marginBottom: 16, backgroundColor: COLORS.gray50, borderRadius: 16, padding: 14, gap: 10 },
  freshnessSectionDark: { backgroundColor: COLORS.dark.surface },
  freshnessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  freshnessItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  freshnessLabel: { fontSize: 13, fontWeight: '500', color: COLORS.gray600 },
  freshnessValue: { fontSize: 13, fontWeight: '700', color: COLORS.gray900 },
  freshnessEmoji: { fontSize: 14 },
  freshnessEmpty: { fontSize: 13, color: COLORS.gray400, fontStyle: 'italic' },

  // Pegel (Spot-Daten 2.0)
  pegelTrendText: { fontSize: 13, fontWeight: '700', color: COLORS.gray900 },
  pegelRising: { color: COLORS.red },
  pegelFalling: { color: COLORS.green },

  // Angelerlaubnis (Spot-Daten 2.0)
  permitInfoText: { fontSize: 13, color: COLORS.gray600, marginTop: 4, lineHeight: 18 },
  permitLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.primary + '15', borderRadius: 10 },
  permitLinkText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  regulationsText: { fontSize: 12, color: COLORS.gray500, marginTop: 6, lineHeight: 17 },

  // Live-Bedingungen (Spot-Daten 2.0)
  conditionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  conditionItem: { flex: 1, minWidth: '45%' as any, alignItems: 'center', gap: 4, paddingVertical: 10, backgroundColor: COLORS.white, borderRadius: 12 },
  conditionValue: { fontSize: 13, fontWeight: '700', color: COLORS.gray800 },
  conditionLabel: { fontSize: 11, color: COLORS.gray400 },
  solunarAlert: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginTop: 6 },
  solunarAlertText: { fontSize: 12, fontWeight: '600', color: '#92400E', textAlign: 'center' },

  // Regulations (Spot-Daten 2.0)
  minSizesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  minSizeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.gray100, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  minSizeFish: { fontSize: 12, fontWeight: '600', color: COLORS.gray700 },
  minSizeValue: { fontSize: 12, color: COLORS.gray500 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 8,
  },
  sheetDark: { backgroundColor: COLORS.backgroundDark },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: { fontSize: 20, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  textLight: { color: COLORS.white },
  subtitle: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, color: COLORS.gray500 },
  barsContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: 16,
  },
});
