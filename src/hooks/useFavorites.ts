/**
 * useFavorites Hook
 * Manages favorite spots using AsyncStorage for offline-first experience.
 * Ready for future Supabase sync when auth is required.
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@biss_favorites';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setFavoriteIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load favorites:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Persist to AsyncStorage
  const persist = useCallback(async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, []);

  const toggleFavorite = useCallback((spotId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(spotId)
        ? prev.filter((id) => id !== spotId)
        : [...prev, spotId];
      persist(next);
      return next;
    });
  }, [persist]);

  const isFavorite = useCallback(
    (spotId: string) => favoriteIds.includes(spotId),
    [favoriteIds]
  );

  const favoritesCount = favoriteIds.length;

  return {
    favoriteIds,
    loading,
    toggleFavorite,
    isFavorite,
    favoritesCount,
  };
};
