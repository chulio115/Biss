/**
 * BISS Community Screen
 * Social Feed mit geteilten Fängen — Privacy-First.
 * Ersetzt den BuyScreen Tab.
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {
  Fish,
  Heart,
  MapPin,
  Clock,
  Trophy,
  Flame,
  Sparkles,
  Share2,
  Eye,
  EyeOff,
  Users,
  TrendingUp,
  SlidersHorizontal,
  X,
  Building2,
  Navigation,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { FISH_SEASONS } from '../constants/fishing';
import { useCommunityFeed } from '../hooks/useCommunityFeed';
import { SharedCatchCard, CommunityReaction } from '../types';

// ─── Filter Types ───
interface CommunityFilters {
  species: string | null;
  radiusKm: number | null;
  club: string | null;
}

const DEFAULT_FILTERS: CommunityFilters = { species: null, radiusKm: null, club: null };

const RADIUS_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
];

const MOCK_CLUBS = [
  { id: 'club-1', name: 'ASV Elbe Hamburg', region: 'Hamburg', members: 342 },
  { id: 'club-2', name: 'Angelverein Lüneburg', region: 'Niedersachsen', members: 187 },
  { id: 'club-3', name: 'SAV Harburg', region: 'Hamburg', members: 256 },
  { id: 'club-4', name: 'Fischereiverein Winsen', region: 'Niedersachsen', members: 124 },
  { id: 'club-5', name: 'Angelfreunde Stade', region: 'Niedersachsen', members: 98 },
];

const FISH_OPTIONS_LIST = Object.entries(FISH_SEASONS).map(([key, val]) => ({
  id: key,
  name: val.name,
  icon: val.icon,
}));

// Haversine distance in km
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Reaction Emoji Map ───
const REACTIONS: { key: CommunityReaction; emoji: string; label: string }[] = [
  { key: 'petri_heil', emoji: '🐟', label: 'Petri Heil!' },
  { key: 'trophy', emoji: '🏆', label: 'Rekord!' },
  { key: 'fire', emoji: '🔥', label: 'Feuer!' },
  { key: 'wow', emoji: '😮', label: 'Wow!' },
];

// ─── Fish Emoji Helper ───
const getFishEmoji = (species: string): string => {
  const lower = species.toLowerCase();
  if (lower.includes('hecht')) return '🐊';
  if (lower.includes('karpfen')) return '🐟';
  if (lower.includes('zander')) return '👁️';
  if (lower.includes('forelle')) return '🌈';
  if (lower.includes('barsch')) return '🐠';
  if (lower.includes('aal')) return '🐍';
  if (lower.includes('wels')) return '🐋';
  return '🐟';
};

// ─── Location Sharing Badge ───
const PrivacyBadge: React.FC<{ locationSharing: string; isDark: boolean }> = ({ locationSharing, isDark }) => {
  if (locationSharing === 'exact') return null;

  const isHidden = locationSharing === 'none';
  return (
    <View style={[styles.privacyBadge, isDark && styles.privacyBadgeDark]}>
      {isHidden ? (
        <EyeOff size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />
      ) : (
        <Eye size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />
      )}
      <Text style={[styles.privacyText, isDark && styles.privacyTextDark]}>
        {isHidden ? 'Spot verborgen' : '~Bereich'}
      </Text>
    </View>
  );
};

// ─── Single Catch Card ───
const CatchCard: React.FC<{
  item: SharedCatchCard;
  isDark: boolean;
  onLike: (id: string, reaction: CommunityReaction) => void;
}> = ({ item, isDark, onLike }) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      {/* Header: Avatar + Name + Time */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, isDark && styles.avatarDark]}>
          <Text style={styles.avatarText}>
            {item.display_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.displayName, isDark && styles.textDark]}>
            {item.display_name}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={11} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.timeText, isDark && styles.timeTextDark]}>
              {item.time_ago}
            </Text>
            {item.water_body_name && (
              <>
                <MapPin size={11} color={isDark ? '#6B7280' : '#9CA3AF'} />
                <Text style={[styles.timeText, isDark && styles.timeTextDark]} numberOfLines={1}>
                  {item.water_body_name}
                </Text>
                <PrivacyBadge locationSharing={item.location_sharing} isDark={isDark} />
              </>
            )}
            {!item.water_body_name && item.location_sharing === 'none' && (
              <PrivacyBadge locationSharing="none" isDark={isDark} />
            )}
          </View>
        </View>
      </View>

      {/* Catch Info */}
      <View style={[styles.catchInfo, isDark && styles.catchInfoDark]}>
        <View style={styles.catchMainRow}>
          <Text style={styles.fishEmoji}>{getFishEmoji(item.fish_species)}</Text>
          <View style={styles.catchDetails}>
            <Text style={[styles.fishSpecies, isDark && styles.textDark]}>
              {item.fish_species}
            </Text>
            <View style={styles.statsRow}>
              {item.weight_kg && (
                <Text style={[styles.statText, isDark && styles.statTextDark]}>
                  {item.weight_kg} kg
                </Text>
              )}
              {item.weight_kg && item.length_cm && (
                <Text style={[styles.statDivider, isDark && styles.statTextDark]}>·</Text>
              )}
              {item.length_cm && (
                <Text style={[styles.statText, isDark && styles.statTextDark]}>
                  {item.length_cm} cm
                </Text>
              )}
              {(item.weight_kg || item.length_cm) && item.method && (
                <Text style={[styles.statDivider, isDark && styles.statTextDark]}>·</Text>
              )}
              {item.method && (
                <Text style={[styles.statText, isDark && styles.statTextDark]}>
                  {item.method}
                </Text>
              )}
            </View>
          </View>
        </View>

        {item.bait && (
          <View style={styles.baitRow}>
            <Text style={[styles.baitLabel, isDark && styles.baitLabelDark]}>Köder:</Text>
            <Text style={[styles.baitValue, isDark && styles.statTextDark]}>{item.bait}</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {item.notes && (
        <Text style={[styles.notes, isDark && styles.notesDark]} numberOfLines={3}>
          {item.notes}
        </Text>
      )}

      {/* Photo placeholder */}
      {item.photo_url && (
        <View style={[styles.photoPlaceholder, isDark && styles.photoPlaceholderDark]}>
          <Image source={{ uri: item.photo_url }} style={styles.photo} resizeMode="cover" />
        </View>
      )}

      {/* Actions Bar */}
      <View style={[styles.actionsBar, isDark && styles.actionsBarDark]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(item.id, item.user_reaction || 'petri_heil')}
          onLongPress={() => setShowReactions(!showReactions)}
        >
          <Heart
            size={18}
            color={item.user_has_liked ? '#EF4444' : (isDark ? '#6B7280' : '#9CA3AF')}
            fill={item.user_has_liked ? '#EF4444' : 'none'}
          />
          <Text style={[
            styles.actionText,
            isDark && styles.actionTextDark,
            item.user_has_liked && styles.actionTextActive,
          ]}>
            {item.likes_count > 0 ? item.likes_count : ''} Petri Heil!
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Picker (on long press) */}
      {showReactions && (
        <View style={[styles.reactionPicker, isDark && styles.reactionPickerDark]}>
          {REACTIONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.reactionButton,
                item.user_reaction === r.key && styles.reactionButtonActive,
              ]}
              onPress={() => {
                onLike(item.id, r.key);
                setShowReactions(false);
              }}
            >
              <Text style={styles.reactionEmoji}>{r.emoji}</Text>
              <Text style={[styles.reactionLabel, isDark && styles.reactionLabelDark]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Header Component ───
const FeedHeader: React.FC<{ isDark: boolean; feedCount: number }> = ({ isDark, feedCount }) => (
  <View style={styles.headerSection}>
    <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
      <View style={styles.statsItem}>
        <Users size={18} color={COLORS.primary} />
        <Text style={[styles.statsValue, isDark && styles.textDark]}>
          {feedCount}
        </Text>
        <Text style={[styles.statsLabel, isDark && styles.statsLabelDark]}>
          Geteilte Fänge
        </Text>
      </View>
      <View style={[styles.statsDivider, isDark && styles.statsDividerDark]} />
      <View style={styles.statsItem}>
        <TrendingUp size={18} color="#4ADE80" />
        <Text style={[styles.statsValue, isDark && styles.textDark]}>
          Hecht
        </Text>
        <Text style={[styles.statsLabel, isDark && styles.statsLabelDark]}>
          Trending Fisch
        </Text>
      </View>
      <View style={[styles.statsDivider, isDark && styles.statsDividerDark]} />
      <View style={styles.statsItem}>
        <Sparkles size={18} color="#FACC15" />
        <Text style={[styles.statsValue, isDark && styles.textDark]}>
          NDS
        </Text>
        <Text style={[styles.statsLabel, isDark && styles.statsLabelDark]}>
          Region
        </Text>
      </View>
    </View>

    {/* Privacy Info Banner */}
    <View style={[styles.privacyInfoBanner, isDark && styles.privacyInfoBannerDark]}>
      <EyeOff size={14} color={isDark ? '#60A5FA' : COLORS.primary} />
      <Text style={[styles.privacyInfoText, isDark && styles.privacyInfoTextDark]}>
        Privacy-First: Standorte werden nie exakt geteilt, es sei denn du erlaubst es.
      </Text>
    </View>

    <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
      Aktueller Feed
    </Text>
  </View>
);

// ─── Community Filter Modal ───
const CommunityFilterModal: React.FC<{
  visible: boolean;
  isDark: boolean;
  filters: CommunityFilters;
  onApply: (f: CommunityFilters) => void;
  onClose: () => void;
}> = ({ visible, isDark, filters, onApply, onClose }) => {
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState<CommunityFilters>(filters);

  useEffect(() => { setLocal(filters); }, [filters]);

  const activeCount = (local.species ? 1 : 0) + (local.radiusKm ? 1 : 0) + (local.club ? 1 : 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.filterModal, isDark && styles.filterModalDark, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.filterModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={isDark ? COLORS.white : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.filterModalTitle, isDark && styles.textDark]}>Filter</Text>
          <TouchableOpacity onPress={() => { setLocal(DEFAULT_FILTERS); }}>
            <Text style={styles.filterResetText}>Zur\u00fccksetzen</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* ─── Fischart ─── */}
          <Text style={[styles.filterSectionTitle, isDark && styles.textDark]}>Fischart</Text>
          <View style={styles.filterChipGrid}>
            {FISH_OPTIONS_LIST.map((fish) => (
              <TouchableOpacity
                key={fish.id}
                style={[
                  styles.filterChipItem,
                  isDark && styles.filterChipItemDark,
                  local.species === fish.name && styles.filterChipItemActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setLocal(prev => ({ ...prev, species: prev.species === fish.name ? null : fish.name }));
                }}
              >
                <Text style={styles.filterChipIcon}>{fish.icon}</Text>
                <Text style={[
                  styles.filterChipLabel,
                  isDark && styles.filterChipLabelDark,
                  local.species === fish.name && styles.filterChipLabelActive,
                ]}>{fish.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ─── Umkreis ─── */}
          <Text style={[styles.filterSectionTitle, isDark && styles.textDark]}>Umkreis</Text>
          <View style={styles.filterChipRow}>
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.radiusChip,
                  isDark && styles.radiusChipDark,
                  local.radiusKm === r.value && styles.radiusChipActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setLocal(prev => ({ ...prev, radiusKm: prev.radiusKm === r.value ? null : r.value }));
                }}
              >
                <Text style={[
                  styles.radiusChipText,
                  isDark && styles.radiusChipTextDark,
                  local.radiusKm === r.value && styles.radiusChipTextActive,
                ]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.filterHint, isDark && styles.filterHintDark]}>
            Zeigt nur F\u00e4nge im gew\u00e4hlten Umkreis deines Standorts.
          </Text>

          {/* ─── Verein ─── */}
          <Text style={[styles.filterSectionTitle, isDark && styles.textDark]}>Verein</Text>
          {MOCK_CLUBS.map((club) => (
            <TouchableOpacity
              key={club.id}
              style={[
                styles.clubRow,
                isDark && styles.clubRowDark,
                local.club === club.name && styles.clubRowActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setLocal(prev => ({ ...prev, club: prev.club === club.name ? null : club.name }));
              }}
            >
              <Building2 size={18} color={local.club === club.name ? COLORS.primary : (isDark ? '#6B7280' : '#9CA3AF')} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.clubName,
                  isDark && styles.textDark,
                  local.club === club.name && { color: COLORS.primary },
                ]}>{club.name}</Text>
                <Text style={[styles.clubMeta, isDark && styles.clubMetaDark]}>
                  {club.region} \u00b7 {club.members} Mitglieder
                </Text>
              </View>
              {local.club === club.name && (
                <View style={styles.clubCheck}>
                  <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '700' }}>\u2713</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          <Text style={[styles.filterHint, isDark && styles.filterHintDark]}>
            Vereins-Feature kommt bald \u2014 zeigt dann nur F\u00e4nge deiner Vereinsmitglieder.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.filterApplyWrap, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={styles.filterApplyBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onApply(local);
              onClose();
            }}
          >
            <Text style={styles.filterApplyText}>
              {activeCount > 0 ? `${activeCount} Filter anwenden` : 'Alle anzeigen'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Community Screen ───
export const CommunityScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { feed, loading, refreshing, refresh, toggleLike } = useCommunityFeed();

  const [filters, setFilters] = useState<CommunityFilters>(DEFAULT_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location for radius filter
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  const activeFilterCount = (filters.species ? 1 : 0) + (filters.radiusKm ? 1 : 0) + (filters.club ? 1 : 0);

  // Client-side filtering
  const filteredFeed = useMemo(() => {
    let result = feed;
    if (filters.species) {
      result = result.filter(item =>
        item.fish_species.toLowerCase() === filters.species!.toLowerCase()
      );
    }
    if (filters.radiusKm && userLocation) {
      result = result.filter(item => {
        if (!item.latitude || !item.longitude) return true;
        const dist = haversineKm(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
        return dist <= filters.radiusKm!;
      });
    }
    // Club filter: placeholder — when clubs have real data, filter by club membership
    return result;
  }, [feed, filters, userLocation]);

  const renderItem = useCallback(({ item }: { item: SharedCatchCard }) => (
    <CatchCard item={item} isDark={isDark} onLike={toggleLike} />
  ), [isDark, toggleLike]);

  const keyExtractor = useCallback((item: SharedCatchCard) => item.id, []);

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>Feed laden...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Title Bar */}
      <View style={[styles.titleBar, isDark && styles.titleBarDark, { paddingTop: insets.top + 8 }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, isDark && styles.textDark]}>Community</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Was fangen die anderen?
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, isDark && styles.filterBtnDark, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilterModal(true);
            }}
            activeOpacity={0.7}
          >
            <SlidersHorizontal
              size={18}
              color={activeFilterCount > 0 ? COLORS.primary : (isDark ? COLORS.white : '#374151')}
              strokeWidth={2.2}
            />
            {activeFilterCount > 0 && (
              <Text style={styles.filterBtnLabel}>({activeFilterCount})</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
            {filters.species && (
              <TouchableOpacity
                style={[styles.activeChip, isDark && styles.activeChipDark]}
                onPress={() => setFilters(prev => ({ ...prev, species: null }))}
              >
                <Text style={styles.activeChipText}>{getFishEmoji(filters.species)} {filters.species}</Text>
                <X size={12} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {filters.radiusKm && (
              <TouchableOpacity
                style={[styles.activeChip, isDark && styles.activeChipDark]}
                onPress={() => setFilters(prev => ({ ...prev, radiusKm: null }))}
              >
                <Navigation size={12} color={COLORS.primary} />
                <Text style={styles.activeChipText}>{filters.radiusKm} km</Text>
                <X size={12} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {filters.club && (
              <TouchableOpacity
                style={[styles.activeChip, isDark && styles.activeChipDark]}
                onPress={() => setFilters(prev => ({ ...prev, club: null }))}
              >
                <Building2 size={12} color={COLORS.primary} />
                <Text style={styles.activeChipText}>{filters.club}</Text>
                <X size={12} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={filteredFeed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListHeaderComponent={<FeedHeader isDark={isDark} feedCount={filteredFeed.length} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Fish size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
            <Text style={[styles.emptyText, isDark && styles.textDark]}>
              {activeFilterCount > 0 ? 'Keine Ergebnisse f\u00fcr diese Filter' : 'Noch keine geteilten F\u00e4nge'}
            </Text>
            <Text style={[styles.emptySubtext, isDark && styles.subtitleDark]}>
              {activeFilterCount > 0
                ? 'Passe deine Filter an oder setze sie zur\u00fcck.'
                : 'Teile deinen ersten Fang mit der Community!'}
            </Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity
                style={styles.resetFiltersBtn}
                onPress={() => setFilters(DEFAULT_FILTERS)}
              >
                <Text style={styles.resetFiltersBtnText}>Filter zur\u00fccksetzen</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <CommunityFilterModal
        visible={showFilterModal}
        isDark={isDark}
        filters={filters}
        onApply={setFilters}
        onClose={() => setShowFilterModal(false)}
      />
    </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title Bar
  titleBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  titleBarDark: {
    backgroundColor: '#0F2744',
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  textDark: {
    color: '#F9FAFB',
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Header Section
  headerSection: {
    marginBottom: 8,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statsCardDark: {
    backgroundColor: '#132337',
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statsLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  statsLabelDark: {
    color: '#9CA3AF',
  },
  statsDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  statsDividerDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Privacy Info Banner
  privacyInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  privacyInfoBannerDark: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  privacyInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  privacyInfoTextDark: {
    color: '#93C5FD',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#132337',
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDark: {
    backgroundColor: '#1E3A5F',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  timeTextDark: {
    color: '#6B7280',
  },

  // Privacy Badge
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    gap: 3,
    marginLeft: 2,
  },
  privacyBadgeDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  privacyText: {
    fontSize: 10,
    color: '#6B7280',
  },
  privacyTextDark: {
    color: '#9CA3AF',
  },

  // Catch Info
  catchInfo: {
    margin: 14,
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  catchInfoDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  catchMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fishEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  catchDetails: {
    flex: 1,
  },
  fishSpecies: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statTextDark: {
    color: '#9CA3AF',
  },
  statDivider: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  baitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  baitLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  baitLabelDark: {
    color: '#6B7280',
  },
  baitValue: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Notes
  notes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  notesDark: {
    color: '#D1D5DB',
  },

  // Photo
  photoPlaceholder: {
    marginHorizontal: 14,
    marginBottom: 10,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  photoPlaceholderDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },

  // Actions
  actionsBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionsBarDark: {
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  actionTextDark: {
    color: '#6B7280',
  },
  actionTextActive: {
    color: '#EF4444',
  },

  // Reaction Picker
  reactionPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  reactionPickerDark: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  reactionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  reactionEmoji: {
    fontSize: 24,
  },
  reactionLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  reactionLabelDark: {
    color: '#9CA3AF',
  },

  // Loading
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  resetFiltersBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
  },
  resetFiltersBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Title Row
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Filter Button (top right)
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  filterBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  filterBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Active Filter Chips
  activeFiltersScroll: {
    marginTop: 10,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  activeChipDark: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary + '30',
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Filter Modal
  filterModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  filterModalDark: {
    backgroundColor: '#0A1A2F',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: 8,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  filterResetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
  },

  // Fish Species Grid
  filterChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipItemDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterChipItemActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  filterChipIcon: {
    fontSize: 16,
  },
  filterChipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  filterChipLabelDark: {
    color: '#D1D5DB',
  },
  filterChipLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Radius Chips
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radiusChipDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  radiusChipActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  radiusChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  radiusChipTextDark: {
    color: '#D1D5DB',
  },
  radiusChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Filter Hint
  filterHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    lineHeight: 16,
  },
  filterHintDark: {
    color: '#6B7280',
  },

  // Club Rows
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  clubRowDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  clubRowActive: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '30',
  },
  clubName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  clubMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  clubMetaDark: {
    color: '#6B7280',
  },
  clubCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Apply Button
  filterApplyWrap: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  filterApplyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  filterApplyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
