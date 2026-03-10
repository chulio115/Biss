/**
 * BISS Fang-Tagebuch Screen
 * Lists catches, allows adding new ones with photo, species, weight, location.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Plus, Camera, Fish, MapPin, Scale, Ruler, X, ChevronDown, Calendar, Share2, Eye, EyeOff, Users, Globe } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Catch, CatchVisibility, LocationSharing } from '../types';
import { COLORS } from '../constants/colors';
import { FISH_SEASONS } from '../constants/fishing';
import {
  cacheCatches,
  getCachedCatches,
  addToOfflineQueue,
  getOfflineQueue,
  removeFromOfflineQueue,
  OfflineCatch,
} from '../services/offlineStorage';
import { useCommunityFeed } from '../hooks/useCommunityFeed';
import { useTheme } from '../contexts/ThemeContext';

const FISH_OPTIONS = Object.entries(FISH_SEASONS).map(([key, val]) => ({
  id: key,
  name: val.name,
  icon: val.icon,
}));

const METHOD_OPTIONS = [
  'Spinnfischen', 'Grundangeln', 'Posenangeln', 'Fliegenfischen',
  'Drop Shot', 'Feedern', 'Stippen', 'Nachtangeln',
];

export const CatchBookScreen: React.FC = () => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isOffline, onReconnect } = useNetworkStatus();
  const { shareCatch } = useCommunityFeed();

  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  // Load catches (with offline cache fallback)
  const loadCatches = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('catches')
        .select('*')
        .eq('user_id', user.id)
        .order('caught_at', { ascending: false });

      if (error) {
        console.warn('Load catches error (fallback to cache):', error.message);
        const cached = await getCachedCatches();
        if (cached.data) {
          setCatches(cached.data as Catch[]);
        }
      } else if (data) {
        setCatches(data);
        cacheCatches(data);
      }
    } catch (e) {
      console.warn('⚠️ Loading cached catches (exception)...');
      const cached = await getCachedCatches();
      if (cached.data) {
        setCatches(cached.data as Catch[]);
      }
    } finally {
      setLoading(false);
    }

    // Check offline queue
    const queue = await getOfflineQueue();
    setPendingSync(queue.length);
  }, [user]);

  // Sync offline catches when back online
  const syncOfflineCatches = useCallback(async () => {
    if (!user) return;
    const queue = await getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`🔄 Syncing ${queue.length} offline catches...`);
    const synced: string[] = [];

    for (const offlineCatch of queue) {
      try {
        const { id: _localId, ...catchData } = offlineCatch;
        const { error } = await supabase
          .from('catches')
          .insert({ ...catchData, user_id: user.id });

        if (!error) {
          synced.push(offlineCatch.id);
        } else {
          console.warn('Sync failed for catch:', error.message);
        }
      } catch (e) {
        console.warn('Sync error:', e);
      }
    }

    if (synced.length > 0) {
      await removeFromOfflineQueue(synced);
      setPendingSync((prev) => Math.max(0, prev - synced.length));
      // Reload from server to get proper IDs
      loadCatches();
    }
  }, [user, loadCatches]);

  useEffect(() => {
    loadCatches().then(() => {
      // Also sync any pending offline catches on mount (in case we're already online)
      syncOfflineCatches();
    });
  }, [loadCatches, syncOfflineCatches]);

  // Auto-sync when coming back online
  useEffect(() => {
    const cleanup = onReconnect(() => {
      syncOfflineCatches();
    });
    return cleanup;
  }, [onReconnect, syncOfflineCatches]);

  const handleDelete = useCallback(
    (catchId: string) => {
      Alert.alert('Fang löschen?', 'Dieser Eintrag wird dauerhaft entfernt.', [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('catches').delete().eq('id', catchId);
            setCatches((prev) => prev.filter((c) => c.id !== catchId));
          },
        },
      ]);
    },
    []
  );

  const stats = {
    total: catches.length,
    species: new Set(catches.map((c) => c.fish_species)).size,
    heaviest: catches.reduce((max, c) => Math.max(max, c.weight_kg || 0), 0),
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textLight]}>Fang-Tagebuch</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAddModal(true);
          }}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Fang</Text>
        </TouchableOpacity>
      </View>

      {/* Offline / Sync Status */}
      {(isOffline || pendingSync > 0) && (
        <View style={[styles.syncBanner, isOffline ? styles.syncBannerOffline : styles.syncBannerPending]}>
          <Text style={styles.syncBannerText}>
            {isOffline
              ? '📡 Offline-Modus — Fänge werden lokal gespeichert'
              : `🔄 ${pendingSync} ${pendingSync === 1 ? 'Fang wird' : 'Fänge werden'} synchronisiert...`}
          </Text>
        </View>
      )}

      {/* Stats Bar */}
      <View style={[styles.statsBar, isDark && styles.statsBarDark]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, isDark && styles.textLight]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Fänge</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, isDark && styles.textLight]}>{stats.species}</Text>
          <Text style={styles.statLabel}>Arten</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, isDark && styles.textLight]}>
            {stats.heaviest > 0 ? `${stats.heaviest.toFixed(1)}kg` : '–'}
          </Text>
          <Text style={styles.statLabel}>Rekord</Text>
        </View>
      </View>

      {/* Catches List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : catches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎣</Text>
          <Text style={[styles.emptyTitle, isDark && styles.textLight]}>Noch keine Fänge</Text>
          <Text style={styles.emptyDesc}>
            Dokumentiere deinen ersten Fang und baue dein persönliches Angeltagebuch auf.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.emptyBtnText}>Ersten Fang eintragen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CatchCard
              item={item}
              isDark={isDark}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}

      {/* Add Catch Modal */}
      <AddCatchModal
        visible={showAddModal}
        isDark={isDark}
        userId={user?.id || ''}
        onClose={() => setShowAddModal(false)}
        onSaved={(newCatch) => {
          setCatches((prev) => [newCatch, ...prev]);
          setShowAddModal(false);
        }}
        onShareCatch={shareCatch}
      />
    </View>
  );
};

// ─── Catch Card ───

const CatchCard: React.FC<{
  item: Catch;
  isDark: boolean;
  onDelete: () => void;
}> = ({ item, isDark, onDelete }) => {
  const fishData = FISH_SEASONS[item.fish_species.toLowerCase()];
  const date = new Date(item.caught_at);
  const dateStr = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onLongPress={onDelete}
      activeOpacity={0.9}
    >
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={styles.cardPhoto} resizeMode="cover" />
      ) : (
        <View style={[styles.cardPhotoPlaceholder, isDark && styles.cardPhotoPlaceholderDark]}>
          <Text style={styles.cardPhotoIcon}>{fishData?.icon || '🐟'}</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardSpecies, isDark && styles.textLight]}>
            {fishData?.icon || '🐟'} {item.fish_species}
          </Text>
          <Text style={styles.cardDate}>{dateStr}</Text>
        </View>

        <Text style={[styles.cardLocation, isDark && styles.textMuted]} numberOfLines={1}>
          📍 {item.water_body_name}
        </Text>

        <View style={styles.cardMeta}>
          {item.weight_kg != null && (
            <View style={styles.metaChip}>
              <Scale size={12} color={COLORS.gray600} />
              <Text style={styles.metaText}>{item.weight_kg}kg</Text>
            </View>
          )}
          {item.length_cm != null && (
            <View style={styles.metaChip}>
              <Ruler size={12} color={COLORS.gray600} />
              <Text style={styles.metaText}>{item.length_cm}cm</Text>
            </View>
          )}
          {item.method && (
            <View style={styles.metaChip}>
              <Fish size={12} color={COLORS.gray600} />
              <Text style={styles.metaText}>{item.method}</Text>
            </View>
          )}
        </View>

        {item.notes && (
          <Text style={styles.cardNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Add Catch Modal ───

const AddCatchModal: React.FC<{
  visible: boolean;
  isDark: boolean;
  userId: string;
  onClose: () => void;
  onSaved: (c: Catch) => void;
  onShareCatch: (catchData: Catch, visibility: CatchVisibility, locationSharing: LocationSharing, displayName?: string) => Promise<boolean>;
}> = ({ visible, isDark, userId, onClose, onSaved, onShareCatch }) => {
  const insets = useSafeAreaInsets();
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [method, setMethod] = useState('');
  const [bait, setBait] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showFishPicker, setShowFishPicker] = useState(false);
  const [shareToFeed, setShareToFeed] = useState(false);
  const [visibility, setVisibility] = useState<CatchVisibility>('community');
  const [locationSharing, setLocationSharing] = useState<LocationSharing>('fuzzy');

  const resetForm = () => {
    setSpecies('');
    setLocation('');
    setWeight('');
    setLength('');
    setMethod('');
    setBait('');
    setNotes('');
    setPhotoUri(null);
    setShareToFeed(false);
    setVisibility('community');
    setLocationSharing('fuzzy');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung benötigt', 'Bitte erlaube Zugriff auf deine Fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung benötigt', 'Bitte erlaube Kamerazugriff.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!species || !location) {
      Alert.alert('Pflichtfelder', 'Bitte Fischart und Gewässer angeben.');
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const catchPayload = {
      user_id: userId,
      fish_species: species,
      water_body_name: location,
      weight_kg: weight ? parseFloat(weight) : null,
      length_cm: length ? parseInt(length, 10) : null,
      method: method || null,
      bait: bait || null,
      notes: notes || null,
      photo_url: photoUri || null,
      caught_at: now,
    };

    try {
      const { data, error } = await supabase
        .from('catches')
        .insert(catchPayload)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const savedCatch = data as Catch;
        onSaved(savedCatch);

        // Share to community feed if toggle is on
        if (shareToFeed) {
          await onShareCatch(savedCatch, visibility, locationSharing, 'Angler');
        }
        resetForm();
      }
    } catch (e: any) {
      // Offline fallback: save to local queue
      const localId = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const offlineCatch: OfflineCatch = {
        id: localId,
        fish_species: species,
        water_body_name: location,
        weight_kg: weight ? parseFloat(weight) : undefined,
        length_cm: length ? parseInt(length, 10) : undefined,
        method: method || undefined,
        bait: bait || undefined,
        notes: notes || undefined,
        photo_url: photoUri || undefined,
        caught_at: now,
        created_at: now,
      };
      await addToOfflineQueue(offlineCatch);

      // Show locally as if saved
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved({
        ...catchPayload,
        id: localId,
        created_at: now,
        updated_at: now,
      } as unknown as Catch);
      resetForm();

      // Subtle feedback that it's saved offline
      Alert.alert('Offline gespeichert', 'Dein Fang wird automatisch synchronisiert, sobald du wieder online bist.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalContainer, isDark && styles.containerDark]}
      >
        {/* Modal Header */}
        <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => { onClose(); resetForm(); }}>
            <X size={24} color={isDark ? COLORS.white : COLORS.gray900} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, isDark && styles.textLight]}>Neuer Fang</Text>
          <TouchableOpacity
            style={[styles.saveBtn, (!species || !location) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving || !species || !location}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Speichern</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            {photoUri ? (
              <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: photoUri }} style={styles.previewPhoto} resizeMode="cover" />
                <View style={styles.photoOverlay}>
                  <Camera size={20} color="#FFFFFF" />
                  <Text style={styles.photoOverlayText}>Ändern</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={[styles.photoBtn, isDark && styles.photoBtnDark]} onPress={takePhoto}>
                  <Camera size={24} color={COLORS.primary} />
                  <Text style={[styles.photoBtnText, isDark && styles.textLight]}>Kamera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBtn, isDark && styles.photoBtnDark]} onPress={pickImage}>
                  <Image
                    source={{ uri: 'https://via.placeholder.com/1' }}
                    style={{ width: 0, height: 0 }}
                  />
                  <Text style={styles.photoEmoji}>🖼️</Text>
                  <Text style={[styles.photoBtnText, isDark && styles.textLight]}>Galerie</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Fish Species */}
          <Text style={[styles.label, isDark && styles.textLight]}>Fischart *</Text>
          <TouchableOpacity
            style={[styles.picker, isDark && styles.pickerDark]}
            onPress={() => setShowFishPicker(true)}
          >
            <Text style={[styles.pickerText, !species && styles.placeholder, isDark && species && styles.textLight]}>
              {species
                ? `${FISH_SEASONS[species.toLowerCase()]?.icon || '🐟'} ${species}`
                : 'Fischart wählen'}
            </Text>
            <ChevronDown size={18} color={COLORS.gray400} />
          </TouchableOpacity>

          {/* Fish Picker Dropdown */}
          {showFishPicker && (
            <View style={[styles.dropdown, isDark && styles.dropdownDark]}>
              {FISH_OPTIONS.map((fish) => (
                <TouchableOpacity
                  key={fish.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSpecies(fish.name);
                    setShowFishPicker(false);
                  }}
                >
                  <Text style={styles.dropdownIcon}>{fish.icon}</Text>
                  <Text style={[styles.dropdownText, isDark && styles.textLight]}>{fish.name}</Text>
                </TouchableOpacity>
              ))}
              {/* Custom input */}
              <View style={styles.dropdownCustom}>
                <TextInput
                  style={[styles.dropdownInput, isDark && styles.inputDark]}
                  placeholder="Andere Art..."
                  placeholderTextColor={COLORS.gray400}
                  onSubmitEditing={(e) => {
                    if (e.nativeEvent.text.trim()) {
                      setSpecies(e.nativeEvent.text.trim());
                      setShowFishPicker(false);
                    }
                  }}
                />
              </View>
            </View>
          )}

          {/* Location */}
          <Text style={[styles.label, isDark && styles.textLight]}>Gewässer *</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="z.B. Forellenhof Bendestorf"
            placeholderTextColor={COLORS.gray400}
            value={location}
            onChangeText={setLocation}
          />

          {/* Weight + Length row */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={[styles.label, isDark && styles.textLight]}>Gewicht (kg)</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="z.B. 2.5"
                placeholderTextColor={COLORS.gray400}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={[styles.label, isDark && styles.textLight]}>Länge (cm)</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="z.B. 45"
                placeholderTextColor={COLORS.gray400}
                keyboardType="number-pad"
                value={length}
                onChangeText={setLength}
              />
            </View>
          </View>

          {/* Method */}
          <Text style={[styles.label, isDark && styles.textLight]}>Methode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {METHOD_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodChip, method === m && styles.methodChipActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMethod(method === m ? '' : m);
                }}
              >
                <Text style={[styles.methodChipText, method === m && styles.methodChipTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bait */}
          <Text style={[styles.label, isDark && styles.textLight]}>Köder</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="z.B. Spinner, Wurm, Mais..."
            placeholderTextColor={COLORS.gray400}
            value={bait}
            onChangeText={setBait}
          />

          {/* Notes */}
          <Text style={[styles.label, isDark && styles.textLight]}>Notizen</Text>
          <TextInput
            style={[styles.input, styles.textArea, isDark && styles.inputDark]}
            placeholder="Wetter, Besonderheiten, Erfahrungen..."
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          {/* ─── Privacy-First Sharing (Opas Rat #2) ─── */}
          <View style={[styles.sharingSection, isDark && styles.sharingSectionDark]}>
            <TouchableOpacity
              style={styles.shareToggle}
              onPress={() => {
                Haptics.selectionAsync();
                setShareToFeed(!shareToFeed);
              }}
              activeOpacity={0.7}
            >
              <Share2 size={18} color={shareToFeed ? COLORS.primary : (isDark ? '#6B7280' : COLORS.gray400)} />
              <View style={styles.shareToggleInfo}>
                <Text style={[styles.shareToggleTitle, isDark && styles.textLight]}>
                  Mit Community teilen
                </Text>
                <Text style={[styles.shareToggleDesc, isDark && { color: '#6B7280' }]}>
                  Zeige deinen Fang im Community-Feed
                </Text>
              </View>
              <View style={[styles.toggleTrack, shareToFeed && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, shareToFeed && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            {shareToFeed && (
              <View style={styles.privacyOptions}>
                {/* Visibility */}
                <Text style={[styles.privacyLabel, isDark && { color: '#9CA3AF' }]}>
                  Wer sieht das?
                </Text>
                <View style={styles.privacyChips}>
                  {([
                    { key: 'community' as CatchVisibility, label: 'Community', icon: Users, desc: 'Nur BISS-Nutzer' },
                    { key: 'public' as CatchVisibility, label: 'Öffentlich', icon: Globe, desc: 'Alle' },
                  ]).map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.privacyChip,
                        isDark && styles.privacyChipDark,
                        visibility === opt.key && styles.privacyChipActive,
                      ]}
                      onPress={() => { Haptics.selectionAsync(); setVisibility(opt.key); }}
                    >
                      <opt.icon size={14} color={visibility === opt.key ? '#FFFFFF' : (isDark ? '#9CA3AF' : COLORS.gray600)} />
                      <Text style={[
                        styles.privacyChipText,
                        visibility === opt.key && styles.privacyChipTextActive,
                        isDark && visibility !== opt.key && { color: '#9CA3AF' },
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Location Sharing */}
                <Text style={[styles.privacyLabel, isDark && { color: '#9CA3AF' }]}>
                  Standort-Genauigkeit
                </Text>
                <View style={styles.privacyChips}>
                  {([
                    { key: 'fuzzy' as LocationSharing, label: '~Bereich', icon: Eye, desc: '±2 km' },
                    { key: 'none' as LocationSharing, label: 'Verborgen', icon: EyeOff, desc: 'Kein Spot' },
                    { key: 'exact' as LocationSharing, label: 'Exakt', icon: MapPin, desc: 'Genau' },
                  ]).map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.privacyChip,
                        isDark && styles.privacyChipDark,
                        locationSharing === opt.key && styles.privacyChipActive,
                      ]}
                      onPress={() => { Haptics.selectionAsync(); setLocationSharing(opt.key); }}
                    >
                      <opt.icon size={14} color={locationSharing === opt.key ? '#FFFFFF' : (isDark ? '#9CA3AF' : COLORS.gray600)} />
                      <Text style={[
                        styles.privacyChipText,
                        locationSharing === opt.key && styles.privacyChipTextActive,
                        isDark && locationSharing !== opt.key && { color: '#9CA3AF' },
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.privacyHint, isDark && styles.privacyHintDark]}>
                  <EyeOff size={12} color={isDark ? '#60A5FA' : COLORS.primary} />
                  <Text style={[styles.privacyHintText, isDark && { color: '#93C5FD' }]}>
                    {locationSharing === 'fuzzy'
                      ? 'Dein Spot wird um ~2 km versetzt angezeigt.'
                      : locationSharing === 'none'
                      ? 'Dein Spot wird komplett verborgen. Nur der Fang wird geteilt.'
                      : 'Dein exakter Spot wird angezeigt. Nur wenn du dem Spot vertraust!'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ───

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  containerDark: { backgroundColor: COLORS.dark.bg },
  textLight: { color: COLORS.white },
  textMuted: { color: COLORS.gray400 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.gray900 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Stats
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsBarDark: { backgroundColor: COLORS.dark.surface },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.gray900 },
  statLabel: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.gray200, marginVertical: 4 },

  // Sync Banner (Offline-Modus)
  syncBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  syncBannerOffline: { backgroundColor: '#FEF3C7' },
  syncBannerPending: { backgroundColor: '#DBEAFE' },
  syncBannerText: { fontSize: 12, fontWeight: '600' as const, color: '#92400E' },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Empty State
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray900, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.gray400, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  emptyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: { backgroundColor: COLORS.dark.surface },
  cardPhoto: { width: '100%', height: 160 },
  cardPhotoPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPhotoPlaceholderDark: { backgroundColor: COLORS.dark.card },
  cardPhotoIcon: { fontSize: 32 },
  cardContent: { padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardSpecies: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  cardDate: { fontSize: 12, color: COLORS.gray400 },
  cardLocation: { fontSize: 13, color: COLORS.gray600, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  metaText: { fontSize: 12, color: COLORS.gray600, fontWeight: '500' },
  cardNotes: { fontSize: 13, color: COLORS.gray400, marginTop: 10, lineHeight: 18, fontStyle: 'italic' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Form
  form: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.gray600, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.gray900,
  },
  inputDark: { backgroundColor: COLORS.dark.surface, borderColor: COLORS.dark.card, color: COLORS.white },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  placeholder: { color: COLORS.gray400 },

  // Picker
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerDark: { backgroundColor: COLORS.dark.surface, borderColor: COLORS.dark.card },
  pickerText: { fontSize: 15, color: COLORS.gray900 },

  // Dropdown
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownDark: { backgroundColor: COLORS.dark.surface, borderColor: COLORS.dark.card },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray200,
  },
  dropdownIcon: { fontSize: 18 },
  dropdownText: { fontSize: 15, color: COLORS.gray900 },
  dropdownCustom: { paddingHorizontal: 16, paddingVertical: 8 },
  dropdownInput: {
    fontSize: 15,
    color: COLORS.gray900,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },

  // Photo
  photoSection: { marginBottom: 8 },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderStyle: 'dashed',
    paddingVertical: 24,
    gap: 8,
  },
  photoBtnDark: { backgroundColor: COLORS.dark.surface, borderColor: COLORS.dark.card },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  photoEmoji: { fontSize: 24 },
  previewPhoto: { width: '100%', height: 200, borderRadius: 16 },
  photoOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  photoOverlayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // Method Chips
  chipScroll: { marginBottom: 4 },
  methodChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    marginRight: 8,
  },
  methodChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  methodChipText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  methodChipTextActive: { color: '#FFFFFF' },

  // Privacy-First Sharing
  sharingSection: {
    marginTop: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sharingSectionDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shareToggle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  shareToggleInfo: {
    flex: 1,
  },
  shareToggleTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#111827',
  },
  shareToggleDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center' as const,
  },
  toggleTrackActive: {
    backgroundColor: COLORS.primary,
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
    alignSelf: 'flex-end' as const,
  },
  privacyOptions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  privacyLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 4,
  },
  privacyChips: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 12,
  },
  privacyChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  privacyChipDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  privacyChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  privacyChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  privacyChipTextActive: {
    color: '#FFFFFF',
  },
  privacyHint: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  privacyHintDark: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  privacyHintText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
});

export default CatchBookScreen;
