/**
 * useMapData Hook
 * Extrahiert die gesamte Datenlade-Logik aus MapScreen.
 * Lädt: Location, Water Bodies, Weather, Fangindex, Sun Times
 * 
 * Offline-Modus (Opas Rat #4):
 * - Cached Water Bodies + Weather nach jedem erfolgreichen Fetch
 * - Bei Netzwerkfehler: Fallback auf gecachte Daten
 * - Fangindex-Berechnung funktioniert komplett lokal
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import { getWeather } from '../services/weather';
import { calculateFangIndex } from '../utils/fangindex';
import { calculateSunTimes, isGoldenHour, detectCategory, getCorrectedCoordinates } from '../utils/fishing';
import { CAMERA_CONFIG } from '../config/map.config';
import { MapWaterBody } from '../types/map';
import {
  cacheWaterBodies,
  getCachedWaterBodies,
  cacheWeather,
  getCachedWeather,
  formatCacheAge,
} from '../services/offlineStorage';
import { getPegelForSpot } from '../services/pegelonline';

const BENDESTORF_COORDS: [number, number] = [9.9732, 53.3355];

// Deduplicate spots within ~200m of each other (keeps the one with more data)
const deduplicateSpots = (spots: MapWaterBody[]): MapWaterBody[] => {
  const THRESHOLD_KM = 0.2; // 200 meters
  const seen = new Set<string>();
  const result: MapWaterBody[] = [];

  // Sort so spots with more data (photo, rating, permit_price) come first
  const sorted = [...spots].sort((a, b) => {
    const scoreA = (a.placePhoto ? 3 : 0) + (a.placeRating ? 2 : 0) + (a.permit_price ? 1 : 0);
    const scoreB = (b.placePhoto ? 3 : 0) + (b.placeRating ? 2 : 0) + (b.permit_price ? 1 : 0);
    return scoreB - scoreA;
  });

  for (const spot of sorted) {
    if (seen.has(spot.id)) continue;

    // Check if any already-accepted spot is too close
    const isDuplicate = result.some((existing) => {
      const dLat = Math.abs(existing.latitude - spot.latitude);
      const dLng = Math.abs(existing.longitude - spot.longitude);
      // Quick rectangular check (~111m per degree lat, ~65m per degree lng at 53°N)
      const distKm = Math.sqrt((dLat * 111) ** 2 + (dLng * 65) ** 2);
      return distKm < THRESHOLD_KM;
    });

    if (!isDuplicate) {
      result.push(spot);
      seen.add(spot.id);
    }
  }

  if (result.length < spots.length) {
    console.log(`🔄 Deduplicated: ${spots.length} → ${result.length} spots`);
  }
  return result;
};

interface UseMapDataReturn {
  waterBodies: MapWaterBody[];
  top3: MapWaterBody[];
  userLocation: [number, number];
  loading: boolean;
  sunTimes: { sunrise: Date; sunset: Date } | null;
  goldenHourInfo: { isGolden: boolean; nextGolden: string };
  reload: () => Promise<void>;
  isOfflineData: boolean;
  cacheAge: string | null;
}

export const useMapData = (): UseMapDataReturn => {
  const [waterBodies, setWaterBodies] = useState<MapWaterBody[]>([]);
  const [top3, setTop3] = useState<MapWaterBody[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    CAMERA_CONFIG.initial.center.longitude,
    CAMERA_CONFIG.initial.center.latitude,
  ]);
  const [loading, setLoading] = useState(true);
  const [sunTimes, setSunTimes] = useState<{ sunrise: Date; sunset: Date } | null>(null);
  const [goldenHourInfo, setGoldenHourInfo] = useState<{ isGolden: boolean; nextGolden: string }>({
    isGolden: false,
    nextGolden: '',
  });
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [cacheAge, setCacheAge] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Get user location
      let loc: [number, number] = BENDESTORF_COORDS;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          const { longitude, latitude } = location.coords;
          if (longitude && latitude && longitude > 5 && longitude < 16 && latitude > 47 && latitude < 56) {
            loc = [longitude, latitude];
          }
        } catch (e) {
          console.log('Location error, using fallback');
        }
      }
      setUserLocation(loc);

      // Fetch water bodies from Supabase (with offline cache fallback)
      console.log('📡 Fetching water bodies from Supabase...');
      let transformedData: any[] = [];
      let usingCache = false;
      
      try {
        const { data, error: supabaseError } = await supabase.from('water_bodies').select('*');
        
        if (supabaseError) {
          console.error('❌ Supabase error:', supabaseError.message);
          throw new Error(supabaseError.message);
        }
        
        if (!data || data.length === 0) {
          throw new Error('No data returned');
        }
        
        console.log('✅ Supabase returned', data.length, 'water bodies');
        
        transformedData = data.map((wb) => ({
          ...wb,
          placePhoto: wb.place_photo,
          placeRating: wb.place_rating,
          placeId: wb.place_id,
          placeOpenNow: wb.place_open_now,
        }));

        // Cache for offline use
        cacheWaterBodies(transformedData);
      } catch (fetchError: any) {
        console.warn('⚠️ Supabase fetch failed, trying offline cache...');
        const cached = await getCachedWaterBodies();
        if (cached.data && cached.data.length > 0) {
          transformedData = cached.data;
          usingCache = true;
          setCacheAge(formatCacheAge(cached.age));
          console.log(`📦 Using cached data: ${cached.data.length} water bodies (${formatCacheAge(cached.age)})`);
        } else {
          console.error('❌ No cached data available — cannot load offline');
          throw fetchError;
        }
      }

      // Skip auto-enrich for fallback data (no network calls)
      // Auto-enrich is only useful when we have real Supabase data

      const waterBodyData = transformedData || [];

      // Get weather for scoring (with offline cache fallback)
      let weather;
      try {
        weather = await getWeather(loc[1], loc[0]);
        // Cache for offline use
        cacheWeather({ ...weather, lat: loc[1], lon: loc[0] });
      } catch {
        // Try cached weather first, then use sensible defaults
        const cachedWeather = await getCachedWeather();
        if (cachedWeather.data) {
          weather = cachedWeather.data;
          console.log(`📦 Using cached weather (${formatCacheAge(cachedWeather.age)})`);
        } else {
          weather = { temp: 15, pressure: 1013, humidity: 60, wind_speed: 3, clouds: 50, description: 'bewölkt' };
          console.log('⚡ Using default weather (no cache available)');
        }
      }

      // Calculate fangindex and detect categories
      console.log('🎯 Scoring', waterBodyData.length, 'water bodies...');
      const scored = await Promise.all(
        waterBodyData.map(async (wb: any) => {
          const result = await calculateFangIndex(wb.name, weather, null);
          // Use existing category from fallback data, or detect it
          const category = wb.category || detectCategory(wb);

          const coords = getCorrectedCoordinates(
            wb.name,
            parseFloat(wb.latitude),
            parseFloat(wb.longitude),
            wb.placeId ? parseFloat(wb.latitude) : undefined,
            wb.placeId ? parseFloat(wb.longitude) : undefined
          );

          return {
            ...wb,
            latitude: coords.lat,
            longitude: coords.lng,
            coordinateSource: coords.source,
            fangIndex: result.score,
            fangIndexFactors: {
              weather: result.factors.weather,
              water_level: result.factors.water_level,
              moon_phase: result.factors.moon_phase,
              time_of_day: result.factors.time_of_day,
              solunar: result.factors.solunar ?? 50,
            },
            category,
            placePhoto: wb.place_photo || wb.placePhoto,
            placeRating: wb.place_rating || wb.placeRating,
            placeId: wb.place_id || wb.placeId,
            placeOpenNow: wb.place_open_now || wb.placeOpenNow,
            placeAddress: wb.place_address || wb.placeAddress || wb.address,
            placePhone: wb.place_phone || wb.placePhone,
            placeWebsite: wb.place_website || wb.placeWebsite,
          } as MapWaterBody;
        })
      );

      // Deduplicate spots that are too close together (< 200m)
      const deduped = deduplicateSpots(scored);

      // Enrich with catch freshness data (Opas Rat: Datenfrische / Schicht 3)
      try {
        const { data: catches } = await supabase
          .from('catches')
          .select('water_body_name, caught_at')
          .order('caught_at', { ascending: false });

        if (catches && catches.length > 0) {
          const catchMap = new Map<string, { lastCaughtAt: string; count: number }>();
          for (const c of catches) {
            const name = c.water_body_name?.toLowerCase();
            if (!name) continue;
            const existing = catchMap.get(name);
            if (existing) {
              existing.count++;
            } else {
              catchMap.set(name, { lastCaughtAt: c.caught_at, count: 1 });
            }
          }

          for (const spot of deduped) {
            const info = catchMap.get(spot.name?.toLowerCase());
            if (info) {
              spot.lastCaughtAt = info.lastCaughtAt;
              spot.catchCount = info.count;
            }
          }
          console.log(`🐟 Catch freshness: ${catchMap.size} spots with catches`);
        }
      } catch (e) {
        console.log('Catch freshness query failed (non-critical):', e);
      }

      // Enrich river spots with PEGELONLINE data (non-blocking, non-critical)
      try {
        const riverSpots = deduped.filter(
          s => s.type === 'river' || s.type === 'canal'
        );
        if (riverSpots.length > 0) {
          console.log(`🌊 Enriching ${riverSpots.length} river spots with pegel data...`);
          // Batch: max 5 parallel requests to be nice to the API
          const BATCH_SIZE = 5;
          for (let i = 0; i < riverSpots.length; i += BATCH_SIZE) {
            const batch = riverSpots.slice(i, i + BATCH_SIZE);
            await Promise.allSettled(
              batch.map(async (spot) => {
                const pegel = await getPegelForSpot(
                  spot.name,
                  spot.latitude,
                  spot.longitude
                );
                if (pegel) {
                  spot.pegelStation = pegel.stationName;
                  spot.pegelLevel = pegel.currentLevel;
                  spot.pegelTrend = pegel.trend;
                }
              })
            );
          }
          const enriched = riverSpots.filter(s => s.pegelStation).length;
          console.log(`📈 Pegel data: ${enriched}/${riverSpots.length} river spots enriched`);
        }
      } catch (e) {
        console.log('Pegel enrichment failed (non-critical):', e);
      }

      setWaterBodies(deduped);
      setIsOfflineData(usingCache);
      if (!usingCache) setCacheAge(null);

      const sorted = [...deduped].sort((a, b) => b.fangIndex - a.fangIndex);
      setTop3(sorted.slice(0, 3));

      const times = calculateSunTimes(loc[1], loc[0]);
      setSunTimes({ sunrise: times.sunrise, sunset: times.sunset });
      setGoldenHourInfo(isGoldenHour(loc[1], loc[0]));
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    waterBodies,
    top3,
    userLocation,
    loading,
    sunTimes,
    goldenHourInfo,
    reload: loadData,
    isOfflineData,
    cacheAge,
  };
};
