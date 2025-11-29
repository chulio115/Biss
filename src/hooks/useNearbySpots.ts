// Hook: Top 3 Nearby Fishing Spots with Scoring
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import { calculateFangIndex } from '../services/xai';
import { getWeather } from '../services/weather';
import { WeatherData } from '../types';

export interface NearbySpot {
  id: string;
  name: string;
  type: string;
  distance: number;
  fangIndex: number;
  totalScore: number;
  isAssumed: boolean;
  fishSpecies: string[];
  permitPrice: number | null;
}

// Haversine formula for distance calculation
const calculateDistance = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate spot score based on distance, fangindex, and type
const calculateSpotScore = (
  distanceKm: number,
  fangIndex: number,
  waterType: string,
  radiusKm: number
): number => {
  // Distance score: closer = better (100 at 0km, 0 at radiusKm)
  const distanceScore = Math.max(0, 100 - (distanceKm * (100 / radiusKm)));
  
  // Type bonus for small/private waters (Teiche sind die Geheimtipps!)
  const smallWaterTypes = ['teich', 'forellensee', 'angelteich', 'karpfenteich', 'forellenteich'];
  const typeBonus = smallWaterTypes.some(t => 
    waterType?.toLowerCase().includes(t)
  ) ? 20 : 0;
  
  // Weighted total: Distance 40% + FangIndex 40% + TypeBonus 20%
  return Math.round(distanceScore * 0.4 + fangIndex * 0.4 + typeBonus);
};

export const useNearbySpots = (radiusKm: number = 20, limit: number = 3) => {
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [userCoords, setUserCoords] = useState({ latitude: 53.3347, longitude: 9.9717 }); // Bendestorf default

  const loadNearbySpots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Get user location (or use fallback)
      let coords = { latitude: 53.3347, longitude: 9.9717 }; // Bendestorf default
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        } catch (locError) {
          console.log('Location error, using default:', locError);
        }
      }
      setUserCoords(coords);

      // 2. Fetch all water bodies from Supabase
      const { data: waterBodies, error: dbError } = await supabase
        .from('water_bodies')
        .select('*');

      if (dbError) throw dbError;
      if (!waterBodies || waterBodies.length === 0) {
        setSpots([]);
        return;
      }

      // 3. Calculate distance for each and filter by radius
      const nearbyWaters = waterBodies
        .map(wb => ({
          ...wb,
          distance: calculateDistance(
            coords.latitude, coords.longitude,
            parseFloat(wb.latitude), parseFloat(wb.longitude)
          )
        }))
        .filter(wb => wb.distance <= radiusKm);

      if (nearbyWaters.length === 0) {
        // Expand radius if no results
        const expandedWaters = waterBodies
          .map(wb => ({
            ...wb,
            distance: calculateDistance(
              coords.latitude, coords.longitude,
              parseFloat(wb.latitude), parseFloat(wb.longitude)
            )
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit);
        
        nearbyWaters.push(...expandedWaters);
      }

      // 4. Get weather for fangindex calculation
      const weather = await getWeather(coords.latitude, coords.longitude);

      // 5. Calculate fangindex and total score for each spot
      const scoredSpots: NearbySpot[] = await Promise.all(
        nearbyWaters.map(async (wb) => {
          const fangResult = await calculateFangIndex(wb.name, weather, null);
          const totalScore = calculateSpotScore(
            wb.distance, 
            fangResult.score, 
            wb.type,
            radiusKm
          );

          return {
            id: wb.id,
            name: wb.name,
            type: wb.type,
            distance: Math.round(wb.distance * 10) / 10,
            fangIndex: fangResult.score,
            totalScore,
            isAssumed: wb.is_assumed || false,
            fishSpecies: wb.fish_species || [],
            permitPrice: wb.permit_price,
          };
        })
      );

      // 6. Sort by total score and take top N
      const topSpots = scoredSpots
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);

      setSpots(topSpots);
    } catch (err: any) {
      console.error('useNearbySpots error:', err);
      setError(err.message || 'Fehler beim Laden der Gewässer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNearbySpots();
  }, [radiusKm, limit]);

  return { 
    spots, 
    loading, 
    error, 
    refresh: loadNearbySpots,
    locationGranted,
    userCoords,
  };
};
