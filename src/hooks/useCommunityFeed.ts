/**
 * useCommunityFeed Hook
 * Lädt den Community-Feed mit geteilten Fängen.
 * Privacy-First: Fuzzy Locations, Visibility-Filter.
 * Offline-First: AsyncStorage-Fallback.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CatchShare,
  SharedCatchCard,
  CommunityReaction,
  CatchVisibility,
  LocationSharing,
  Catch,
} from '../types';

const CACHE_KEY = 'biss_community_feed';
const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

// ─── Fuzzy Location: ±1-3km Versatz für Privacy ───
const fuzzyLocation = (lat: number, lng: number): { latitude: number; longitude: number } => {
  const offset = () => (Math.random() - 0.5) * 0.04; // ~2km Radius
  return {
    latitude: lat + offset(),
    longitude: lng + offset(),
  };
};

// ─── Time Ago (German) ───
const formatTimeAgo = (dateStr: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  const diffW = Math.floor(diffD / 7);

  if (diffMin < 1) return 'Gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffH < 24) return `vor ${diffH} Std.`;
  if (diffD < 7) return `vor ${diffD} Tag${diffD > 1 ? 'en' : ''}`;
  if (diffW < 5) return `vor ${diffW} Woche${diffW > 1 ? 'n' : ''}`;
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
};

// ─── Mock Feed für MVP (solange Supabase catch_shares leer ist) ───
const MOCK_FEED: SharedCatchCard[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user-1',
    catch_id: 'mock-catch-1',
    visibility: 'community',
    location_sharing: 'fuzzy',
    fish_species: 'Hecht',
    weight_kg: 4.2,
    length_cm: 72,
    method: 'Spinnfischen',
    bait: 'Gummifisch',
    notes: 'Brutaler Drill am Schilfrand! 💪',
    photo_url: undefined,
    caught_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    water_body_name: 'Elbe-Seitenkanal',
    latitude: 53.25,
    longitude: 10.41,
    display_name: 'NordAngler92',
    likes_count: 12,
    comments_count: 3,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_has_liked: false,
    time_ago: 'vor 2 Std.',
  },
  {
    id: 'mock-2',
    user_id: 'mock-user-2',
    catch_id: 'mock-catch-2',
    visibility: 'community',
    location_sharing: 'none',
    fish_species: 'Karpfen',
    weight_kg: 8.7,
    length_cm: 68,
    method: 'Grundangeln',
    bait: 'Boilie',
    notes: 'Neuer PB! 🎉 Boilie in Erdbeer-Knoblauch.',
    photo_url: undefined,
    caught_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    water_body_name: undefined,
    latitude: undefined,
    longitude: undefined,
    display_name: 'KarpfenKönig',
    likes_count: 24,
    comments_count: 7,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user_has_liked: true,
    user_reaction: 'trophy',
    time_ago: 'vor 5 Std.',
  },
  {
    id: 'mock-3',
    user_id: 'mock-user-3',
    catch_id: 'mock-catch-3',
    visibility: 'community',
    location_sharing: 'fuzzy',
    fish_species: 'Zander',
    weight_kg: 3.1,
    length_cm: 55,
    method: 'Spinnfischen',
    bait: 'Wobbler',
    notes: 'Morgenrunde hat sich gelohnt 🌅',
    photo_url: undefined,
    caught_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    water_body_name: 'Ilmenau',
    latitude: 53.15,
    longitude: 10.38,
    display_name: 'Frühaufsteher_HH',
    likes_count: 8,
    comments_count: 1,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    user_has_liked: false,
    time_ago: 'vor 18 Std.',
  },
  {
    id: 'mock-4',
    user_id: 'mock-user-4',
    catch_id: 'mock-catch-4',
    visibility: 'community',
    location_sharing: 'exact',
    fish_species: 'Forelle',
    weight_kg: 1.8,
    length_cm: 42,
    method: 'Fliegenfischen',
    bait: 'Trockenfliege',
    notes: 'Erste Forelle der Saison! Die Eintagsfliegen sind da.',
    photo_url: undefined,
    caught_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    water_body_name: 'Luhe',
    latitude: 53.31,
    longitude: 10.02,
    display_name: 'FliegenPeter',
    likes_count: 15,
    comments_count: 4,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user_has_liked: false,
    time_ago: 'vor 1 Tag',
  },
  {
    id: 'mock-5',
    user_id: 'mock-user-5',
    catch_id: 'mock-catch-5',
    visibility: 'community',
    location_sharing: 'fuzzy',
    fish_species: 'Barsch',
    weight_kg: 0.9,
    length_cm: 32,
    method: 'Spinnfischen',
    bait: 'Spinner',
    notes: '5 Barsche in einer Stunde! Der Schwarm war direkt unter der Brücke 🎣',
    photo_url: undefined,
    caught_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    water_body_name: 'Este',
    latitude: 53.48,
    longitude: 9.78,
    display_name: 'BarschAlarm',
    likes_count: 6,
    comments_count: 2,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user_has_liked: false,
    time_ago: 'vor 2 Tagen',
  },
];

export const useCommunityFeed = () => {
  const [feed, setFeed] = useState<SharedCatchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Versuche Supabase Feed zu laden
      const { data, error: fetchError } = await supabase
        .from('catch_shares')
        .select('*')
        .in('visibility', ['community', 'public'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const cards: SharedCatchCard[] = data.map((share: CatchShare) => ({
          ...share,
          // Fuzzy location anwenden
          latitude: share.location_sharing === 'fuzzy' && share.latitude
            ? fuzzyLocation(share.latitude, share.longitude!).latitude
            : share.location_sharing === 'none' ? undefined : share.latitude,
          longitude: share.location_sharing === 'fuzzy' && share.longitude
            ? fuzzyLocation(share.latitude!, share.longitude).longitude
            : share.location_sharing === 'none' ? undefined : share.longitude,
          water_body_name: share.location_sharing === 'none' ? undefined : share.water_body_name,
          user_has_liked: false, // TODO: Check per User
          time_ago: formatTimeAgo(share.created_at),
        }));

        setFeed(cards);
        // Cache
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          data: cards,
          timestamp: Date.now(),
        }));
      } else {
        // Fallback: Mock-Feed für MVP
        const mockWithTimes = MOCK_FEED.map(m => ({
          ...m,
          time_ago: formatTimeAgo(m.caught_at),
        }));
        setFeed(mockWithTimes);
      }
    } catch (err) {
      console.warn('Community feed error, using cache/mock:', err);
      // Cache-Fallback
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data } = JSON.parse(cached);
          setFeed(data.map((d: SharedCatchCard) => ({ ...d, time_ago: formatTimeAgo(d.caught_at) })));
        } else {
          // Mock als letzter Fallback
          setFeed(MOCK_FEED.map(m => ({ ...m, time_ago: formatTimeAgo(m.caught_at) })));
        }
      } catch {
        setFeed(MOCK_FEED.map(m => ({ ...m, time_ago: formatTimeAgo(m.caught_at) })));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Like/Unlike
  const toggleLike = useCallback(async (shareId: string, reaction: CommunityReaction = 'petri_heil') => {
    setFeed(prev => prev.map(item => {
      if (item.id !== shareId) return item;
      if (item.user_has_liked) {
        return {
          ...item,
          user_has_liked: false,
          user_reaction: undefined,
          likes_count: Math.max(0, item.likes_count - 1),
        };
      }
      return {
        ...item,
        user_has_liked: true,
        user_reaction: reaction,
        likes_count: item.likes_count + 1,
      };
    }));

    // Supabase sync (best-effort)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const existing = feed.find(f => f.id === shareId);
      if (existing?.user_has_liked) {
        await supabase
          .from('community_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('share_id', shareId);
      } else {
        await supabase
          .from('community_likes')
          .upsert({ user_id: user.id, share_id: shareId, reaction });
      }
    } catch (e) {
      console.warn('Like sync error:', e);
    }
  }, [feed]);

  // Share a catch to community
  const shareCatch = useCallback(async (
    catchData: Catch,
    visibility: CatchVisibility,
    locationSharing: LocationSharing,
    displayName: string = 'Angler',
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let lat = catchData.latitude;
      let lng = catchData.longitude;

      if (locationSharing === 'fuzzy' && lat && lng) {
        const fuzzy = fuzzyLocation(lat, lng);
        lat = fuzzy.latitude;
        lng = fuzzy.longitude;
      } else if (locationSharing === 'none') {
        lat = undefined;
        lng = undefined;
      }

      const shareData = {
        user_id: user.id,
        catch_id: catchData.id,
        visibility,
        location_sharing: locationSharing,
        fish_species: catchData.fish_species,
        weight_kg: catchData.weight_kg,
        length_cm: catchData.length_cm,
        method: catchData.method,
        bait: catchData.bait,
        notes: catchData.notes,
        photo_url: catchData.photo_url,
        caught_at: catchData.caught_at,
        water_body_name: locationSharing === 'none' ? null : catchData.water_body_name,
        latitude: lat,
        longitude: lng,
        display_name: displayName,
      };

      const { error } = await supabase.from('catch_shares').insert(shareData);
      if (error) throw error;

      // Feed neu laden
      await loadFeed(true);
      return true;
    } catch (e) {
      console.error('Share catch error:', e);
      return false;
    }
  }, [loadFeed]);

  return {
    feed,
    loading,
    refreshing,
    error,
    refresh: () => loadFeed(true),
    toggleLike,
    shareCatch,
  };
};
