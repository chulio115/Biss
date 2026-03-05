/**
 * BISS Offline Storage Service
 * Zentraler Cache für alle netzwerkabhängigen Daten.
 * Ermöglicht vollständige Offline-Nutzung der App.
 *
 * Cached:
 * - Water Bodies (Supabase)
 * - Weather Data (OpenWeather API)
 * - Catches (Supabase) + Offline-Queue für neue Fänge
 *
 * Bereits offline (AsyncStorage direkt):
 * - Favoriten, Bewertungen, Achievements, Leaderboard, Fischereischein
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage Keys ───
const KEYS = {
  WATER_BODIES: '@biss_cache_water_bodies',
  WATER_BODIES_TIMESTAMP: '@biss_cache_water_bodies_ts',
  WEATHER: '@biss_cache_weather',
  WEATHER_TIMESTAMP: '@biss_cache_weather_ts',
  CATCHES: '@biss_cache_catches',
  CATCHES_TIMESTAMP: '@biss_cache_catches_ts',
  OFFLINE_CATCH_QUEUE: '@biss_offline_catch_queue',
} as const;

// Cache-Gültigkeit
const CACHE_TTL = {
  WATER_BODIES: 24 * 60 * 60 * 1000, // 24h — Spots ändern sich selten
  WEATHER: 30 * 60 * 1000,            // 30min — Wetter ist volatiler
  CATCHES: 60 * 60 * 1000,            // 1h — eigene Fänge
} as const;

// ─── Generic Cache Helpers ───

const setCache = async (key: string, data: any, tsKey: string): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(key, JSON.stringify(data)),
      AsyncStorage.setItem(tsKey, Date.now().toString()),
    ]);
  } catch (e) {
    console.error(`Cache write failed for ${key}:`, e);
  }
};

const getCache = async <T>(key: string, tsKey: string, ttl: number): Promise<{ data: T | null; isStale: boolean; age: number }> => {
  try {
    const [raw, tsRaw] = await Promise.all([
      AsyncStorage.getItem(key),
      AsyncStorage.getItem(tsKey),
    ]);

    if (!raw) return { data: null, isStale: true, age: Infinity };

    const data = JSON.parse(raw) as T;
    const timestamp = tsRaw ? parseInt(tsRaw, 10) : 0;
    const age = Date.now() - timestamp;
    const isStale = age > ttl;

    return { data, isStale, age };
  } catch (e) {
    console.error(`Cache read failed for ${key}:`, e);
    return { data: null, isStale: true, age: Infinity };
  }
};

// ─── Water Bodies Cache ───

export const cacheWaterBodies = async (waterBodies: any[]): Promise<void> => {
  await setCache(KEYS.WATER_BODIES, waterBodies, KEYS.WATER_BODIES_TIMESTAMP);
  console.log(`💾 Cached ${waterBodies.length} water bodies`);
};

export const getCachedWaterBodies = async (): Promise<{ data: any[] | null; isStale: boolean; age: number }> => {
  return getCache<any[]>(KEYS.WATER_BODIES, KEYS.WATER_BODIES_TIMESTAMP, CACHE_TTL.WATER_BODIES);
};

// ─── Weather Cache ───

export interface CachedWeather {
  temp: number;
  pressure: number;
  humidity: number;
  wind_speed: number;
  clouds: number;
  description: string;
  lat: number;
  lon: number;
}

export const cacheWeather = async (weather: CachedWeather): Promise<void> => {
  await setCache(KEYS.WEATHER, weather, KEYS.WEATHER_TIMESTAMP);
};

export const getCachedWeather = async (): Promise<{ data: CachedWeather | null; isStale: boolean; age: number }> => {
  return getCache<CachedWeather>(KEYS.WEATHER, KEYS.WEATHER_TIMESTAMP, CACHE_TTL.WEATHER);
};

// ─── Catches Cache ───

export const cacheCatches = async (catches: any[]): Promise<void> => {
  await setCache(KEYS.CATCHES, catches, KEYS.CATCHES_TIMESTAMP);
};

export const getCachedCatches = async (): Promise<{ data: any[] | null; isStale: boolean; age: number }> => {
  return getCache<any[]>(KEYS.CATCHES, KEYS.CATCHES_TIMESTAMP, CACHE_TTL.CATCHES);
};

// ─── Offline Catch Queue ───
// Fänge die offline erstellt wurden und bei Reconnect synchronisiert werden

export interface OfflineCatch {
  id: string; // lokale UUID
  water_body_name: string;
  water_body_id?: string;
  fish_species: string;
  weight_kg?: number;
  length_cm?: number;
  method?: string;
  bait?: string;
  photo_url?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  caught_at: string;
  created_at: string;
}

export const addToOfflineQueue = async (catchData: OfflineCatch): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.OFFLINE_CATCH_QUEUE);
    const queue: OfflineCatch[] = raw ? JSON.parse(raw) : [];
    queue.push(catchData);
    await AsyncStorage.setItem(KEYS.OFFLINE_CATCH_QUEUE, JSON.stringify(queue));
    console.log(`📥 Added catch to offline queue (${queue.length} pending)`);
  } catch (e) {
    console.error('Failed to add to offline queue:', e);
  }
};

export const getOfflineQueue = async (): Promise<OfflineCatch[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.OFFLINE_CATCH_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline queue:', e);
    return [];
  }
};

export const removeFromOfflineQueue = async (ids: string[]): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.OFFLINE_CATCH_QUEUE);
    if (!raw) return;
    const queue: OfflineCatch[] = JSON.parse(raw);
    const filtered = queue.filter((c) => !ids.includes(c.id));
    await AsyncStorage.setItem(KEYS.OFFLINE_CATCH_QUEUE, JSON.stringify(filtered));
    console.log(`✅ Synced ${ids.length} offline catches, ${filtered.length} remaining`);
  } catch (e) {
    console.error('Failed to update offline queue:', e);
  }
};

export const clearOfflineQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.OFFLINE_CATCH_QUEUE);
};

// ─── Cache Stats (for debugging / UI) ───

export const getCacheStats = async (): Promise<{
  waterBodies: { count: number; ageMinutes: number } | null;
  weather: { ageMinutes: number } | null;
  catches: { count: number; ageMinutes: number } | null;
  offlineQueue: number;
}> => {
  const [wb, w, c, q] = await Promise.all([
    getCachedWaterBodies(),
    getCachedWeather(),
    getCachedCatches(),
    getOfflineQueue(),
  ]);

  return {
    waterBodies: wb.data ? { count: wb.data.length, ageMinutes: Math.round(wb.age / 60000) } : null,
    weather: w.data ? { ageMinutes: Math.round(w.age / 60000) } : null,
    catches: c.data ? { count: c.data.length, ageMinutes: Math.round(c.age / 60000) } : null,
    offlineQueue: q.length,
  };
};

// ─── Format Cache Age for UI ───

export const formatCacheAge = (ageMs: number): string => {
  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 1) return 'Gerade aktualisiert';
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return `vor ${Math.floor(hours / 24)} Tagen`;
};
