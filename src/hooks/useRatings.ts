/**
 * useRatings Hook
 * Manages spot ratings using AsyncStorage for offline-first experience.
 * Ready for future Supabase sync when auth is required.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@biss_ratings';

export interface SpotRating {
  spotId: string;
  stars: number;
  comment?: string;
  createdAt: string;
}

export interface SpotRatingSummary {
  avgRating: number;
  ratingCount: number;
  userRating?: SpotRating;
}

export const useRatings = () => {
  const [ratings, setRatings] = useState<SpotRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRatings(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load ratings:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (data: SpotRating[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save ratings:', e);
    }
  }, []);

  const submitRating = useCallback((spotId: string, stars: number, comment?: string) => {
    setRatings((prev) => {
      const existing = prev.findIndex((r) => r.spotId === spotId);
      const rating: SpotRating = {
        spotId,
        stars,
        comment,
        createdAt: new Date().toISOString(),
      };

      let next: SpotRating[];
      if (existing >= 0) {
        next = [...prev];
        next[existing] = rating;
      } else {
        next = [...prev, rating];
      }
      persist(next);
      return next;
    });
  }, [persist]);

  const getRatingForSpot = useCallback(
    (spotId: string): SpotRating | undefined => {
      return ratings.find((r) => r.spotId === spotId);
    },
    [ratings]
  );

  const getSummaryForSpot = useCallback(
    (spotId: string): SpotRatingSummary => {
      const spotRatings = ratings.filter((r) => r.spotId === spotId);
      const userRating = spotRatings[0]; // In local mode, there's only one user
      return {
        avgRating: spotRatings.length > 0
          ? spotRatings.reduce((sum, r) => sum + r.stars, 0) / spotRatings.length
          : 0,
        ratingCount: spotRatings.length,
        userRating,
      };
    },
    [ratings]
  );

  return {
    ratings,
    loading,
    submitRating,
    getRatingForSpot,
    getSummaryForSpot,
  };
};
