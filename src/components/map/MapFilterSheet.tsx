/**
 * MapFilterSheet - Slide-up filter modal for the map
 * Replaces inline category chips with a full filter system.
 * 
 * Sections:
 * - Kategorien (Spot categories)
 * - Fischarten (Fish species)
 * - Fangindex (Min score slider)
 * - Favoriten (Toggle)
 * - Bewertung (Min stars)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SlidersHorizontal, X, RotateCcw, Heart, Star, Target } from 'lucide-react-native';

const FAB_LIGHT = '#FFFFFF';
const FAB_DARK = '#0A1A2F';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { SPOT_CATEGORIES, FISH_FILTERS, SpotCategory } from '../../constants/fishing';

export interface MapFilters {
  categories: SpotCategory[];
  fish: string[];
  minScore: number;
  onlyFavorites: boolean;
  minRating: number;
}

export const DEFAULT_FILTERS: MapFilters = {
  categories: [],
  fish: [],
  minScore: 0,
  onlyFavorites: false,
  minRating: 0,
};

interface MapFilterSheetProps {
  visible: boolean;
  filters: MapFilters;
  onApply: (filters: MapFilters) => void;
  onClose: () => void;
  totalCount: number;
  filteredCount: number;
}

const SCORE_OPTIONS = [0, 30, 50, 70, 80];
const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5];

export const MapFilterSheet: React.FC<MapFilterSheetProps> = ({
  visible,
  filters,
  onApply,
  onClose,
  totalCount,
  filteredCount,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [draft, setDraft] = useState<MapFilters>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible]);

  const activeCount = [
    draft.categories.length > 0,
    draft.fish.length > 0,
    draft.minScore > 0,
    draft.onlyFavorites,
    draft.minRating > 0,
  ].filter(Boolean).length;

  const toggleCategory = (cat: SpotCategory) => {
    Haptics.selectionAsync();
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const toggleFish = (fishId: string) => {
    Haptics.selectionAsync();
    setDraft((prev) => ({
      ...prev,
      fish: prev.fish.includes(fishId)
        ? prev.fish.filter((f) => f !== fishId)
        : [...prev.fish, fishId],
    }));
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(draft);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[s.sheet, isDark && s.sheetDark]}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <SlidersHorizontal size={20} color={COLORS.primary} strokeWidth={2} />
              <Text style={[s.headerTitle, isDark && s.textLight]}>Filter</Text>
              {activeCount > 0 && (
                <View style={s.activeBadge}>
                  <Text style={s.activeBadgeText}>{activeCount}</Text>
                </View>
              )}
            </View>
            <View style={s.headerRight}>
              {activeCount > 0 && (
                <TouchableOpacity style={s.resetBtn} onPress={handleReset}>
                  <RotateCcw size={14} color={COLORS.gray500} strokeWidth={2} />
                  <Text style={s.resetText}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.closeBtn, isDark && s.closeBtnDark]} onPress={onClose}>
                <X size={18} color={isDark ? COLORS.white : COLORS.gray500} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>
            {/* ── Kategorien ── */}
            <Text style={[s.sectionLabel, isDark && s.textLight]}>Kategorie</Text>
            <View style={s.chipGrid}>
              {(Object.entries(SPOT_CATEGORIES) as [SpotCategory, typeof SPOT_CATEGORIES[SpotCategory]][]).map(
                ([key, cat]) => {
                  const active = draft.categories.includes(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        s.chip,
                        isDark && s.chipDark,
                        active && { backgroundColor: cat.color + '20', borderColor: cat.color },
                      ]}
                      onPress={() => toggleCategory(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.chipIcon}>{cat.icon}</Text>
                      <Text style={[s.chipText, isDark && s.textLight, active && { color: cat.color, fontWeight: '700' }]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            {/* ── Fischarten ── */}
            <Text style={[s.sectionLabel, isDark && s.textLight]}>Fischarten</Text>
            <View style={s.chipGrid}>
              {FISH_FILTERS.map((fish) => {
                const active = draft.fish.includes(fish.id);
                return (
                  <TouchableOpacity
                    key={fish.id}
                    style={[
                      s.chip,
                      isDark && s.chipDark,
                      active && { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
                    ]}
                    onPress={() => toggleFish(fish.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.chipText, isDark && s.textLight, active && { color: COLORS.primary, fontWeight: '700' }]}>
                      {fish.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Fangindex Minimum ── */}
            <Text style={[s.sectionLabel, isDark && s.textLight]}>Min. Fangindex</Text>
            <View style={s.chipGrid}>
              {SCORE_OPTIONS.map((score) => {
                const active = draft.minScore === score;
                const label = score === 0 ? 'Alle' : `${score}+`;
                return (
                  <TouchableOpacity
                    key={score}
                    style={[
                      s.chip,
                      isDark && s.chipDark,
                      active && { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDraft((prev) => ({ ...prev, minScore: score }));
                    }}
                    activeOpacity={0.7}
                  >
                    <Target size={13} color={active ? COLORS.primary : COLORS.gray400} strokeWidth={2} />
                    <Text style={[s.chipText, isDark && s.textLight, active && { color: COLORS.primary, fontWeight: '700' }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Bewertung ── */}
            <Text style={[s.sectionLabel, isDark && s.textLight]}>Min. Bewertung</Text>
            <View style={s.chipGrid}>
              {RATING_OPTIONS.map((rating) => {
                const active = draft.minRating === rating;
                const label = rating === 0 ? 'Alle' : `${rating}★+`;
                return (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      s.chip,
                      isDark && s.chipDark,
                      active && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDraft((prev) => ({ ...prev, minRating: rating }));
                    }}
                    activeOpacity={0.7}
                  >
                    <Star size={13} color={active ? '#F59E0B' : COLORS.gray400} strokeWidth={2} fill={active ? '#F59E0B' : 'none'} />
                    <Text style={[s.chipText, isDark && s.textLight, active && { color: '#B45309', fontWeight: '700' }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Favoriten Toggle ── */}
            <TouchableOpacity
              style={[
                s.toggleRow,
                isDark && s.toggleRowDark,
                draft.onlyFavorites && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setDraft((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }));
              }}
              activeOpacity={0.7}
            >
              <Heart
                size={18}
                color={draft.onlyFavorites ? '#EF4444' : COLORS.gray400}
                strokeWidth={2}
                fill={draft.onlyFavorites ? '#EF4444' : 'none'}
              />
              <Text style={[s.toggleText, isDark && s.textLight, draft.onlyFavorites && { color: '#DC2626', fontWeight: '700' }]}>
                Nur Favoriten anzeigen
              </Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Apply Button */}
          <View style={s.footer}>
            <TouchableOpacity style={s.applyBtn} onPress={handleApply} activeOpacity={0.8}>
              <Text style={s.applyBtnText}>
                Anwenden
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

/**
 * Filter FAB - Floating action button for the map
 */
export const FilterFAB: React.FC<{
  activeCount: number;
  onPress: () => void;
}> = ({ activeCount, onPress }) => {
  const isDark = useColorScheme() === 'dark';
  const hasActive = activeCount > 0;

  return (
    <TouchableOpacity
      style={[
        fab.container,
        isDark && fab.containerDark,
        hasActive && fab.containerActive,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <SlidersHorizontal
        size={18}
        color={hasActive ? COLORS.primary : (isDark ? COLORS.white : FAB_DARK)}
        strokeWidth={2.2}
      />
      {hasActive && (
        <Text style={fab.activeLabel}>Filter ({activeCount})</Text>
      )}
      {hasActive && (
        <View style={fab.badge}>
          <View style={fab.badgeDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ───

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
    paddingTop: 8,
  },
  sheetDark: { backgroundColor: COLORS.dark.bg },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray900 },
  textLight: { color: COLORS.white },
  activeBadge: {
    backgroundColor: COLORS.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: COLORS.gray100 },
  resetText: { fontSize: 12, fontWeight: '600', color: COLORS.gray500 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnDark: { backgroundColor: COLORS.dark.card },
  scroll: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.gray900, marginBottom: 10, marginTop: 8 },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipDark: { backgroundColor: COLORS.dark.card },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.gray700 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  toggleRowDark: { backgroundColor: COLORS.dark.card },
  toggleText: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});

const fab = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 15,
  },
  containerDark: {
    backgroundColor: 'rgba(10,26,47,0.92)',
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0.4,
  },
  containerActive: {
    borderColor: COLORS.primary + '30',
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
});
