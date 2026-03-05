/**
 * useOfflineMaps Hook
 * Verwaltet Mapbox Offline-Packs für die Heimatregion.
 * Lädt Kartenausschnitte herunter, damit die Karte ohne Internet funktioniert.
 *
 * Opas Rat #4: "Sobald ein Angler einmal mit BISS am Wasser war und alles
 * funktioniert hat, obwohl er keinen Empfang hatte, ist er gewonnen."
 */
import { useState, useEffect, useCallback } from 'react';
import MapboxGL from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGIONS } from '../config/map.config';

const STORAGE_KEY = '@biss_offline_map_status';

export interface OfflinePackStatus {
  name: string;
  percentage: number;
  completedSize: number;
  isComplete: boolean;
  downloadedAt?: string;
}

interface OfflineMapState {
  packs: OfflinePackStatus[];
  isDownloading: boolean;
  error: string | null;
}

const PACK_CONFIG = {
  name: 'biss-norddeutschland',
  // Bounding box for NDS/HH/SH (from map.config.ts REGIONS)
  bounds: [
    [REGIONS.bounds.southwest[0], REGIONS.bounds.southwest[1]], // SW: [7.0, 51.3]
    [REGIONS.bounds.northeast[0], REGIONS.bounds.northeast[1]], // NE: [11.8, 54.9]
  ] as [[number, number], [number, number]],
  minZoom: 7,
  maxZoom: 14, // Enough for spot-level detail without huge download
  styleURL: 'mapbox://styles/mapbox/outdoors-v12',
};

export const useOfflineMaps = () => {
  const [state, setState] = useState<OfflineMapState>({
    packs: [],
    isDownloading: false,
    error: null,
  });

  // Load saved pack status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setState((prev) => ({ ...prev, packs: JSON.parse(stored) }));
        }
      } catch (e) {
        console.error('Failed to load offline map status:', e);
      }
    };
    loadStatus();
  }, []);

  // Check if pack already exists
  const checkExistingPacks = useCallback(async () => {
    try {
      const packs = await MapboxGL.offlineManager.getPacks();
      if (packs && packs.length > 0) {
        const packStatuses: OfflinePackStatus[] = packs.map((p: any) => ({
          name: p.name || PACK_CONFIG.name,
          percentage: 100,
          completedSize: p.completedResourceSize || 0,
          isComplete: true,
        }));
        setState((prev) => ({ ...prev, packs: packStatuses }));
        return packStatuses;
      }
    } catch (e) {
      console.log('Could not check existing packs:', e);
    }
    return [];
  }, []);

  // Download offline map pack for Norddeutschland
  const downloadPack = useCallback(async () => {
    setState((prev) => ({ ...prev, isDownloading: true, error: null }));

    try {
      console.log('🗺️ Starting offline map download...');

      await MapboxGL.offlineManager.createPack(
        {
          name: PACK_CONFIG.name,
          styleURL: PACK_CONFIG.styleURL,
          bounds: PACK_CONFIG.bounds,
          minZoom: PACK_CONFIG.minZoom,
          maxZoom: PACK_CONFIG.maxZoom,
        },
        (region: any, status: any) => {
          // Progress callback
          const percentage = status.percentage ?? 0;
          const packStatus: OfflinePackStatus = {
            name: PACK_CONFIG.name,
            percentage: Math.round(percentage),
            completedSize: status.completedResourceSize || 0,
            isComplete: percentage >= 100,
            downloadedAt: percentage >= 100 ? new Date().toISOString() : undefined,
          };

          setState((prev) => ({
            ...prev,
            packs: [packStatus],
            isDownloading: percentage < 100,
          }));

          if (percentage >= 100) {
            console.log('✅ Offline map download complete');
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([packStatus]));
          }
        },
        (region: any, error: any) => {
          // Error callback
          console.error('❌ Offline map download error:', error);
          setState((prev) => ({
            ...prev,
            isDownloading: false,
            error: error?.message || 'Download fehlgeschlagen',
          }));
        }
      );
    } catch (e: any) {
      console.error('❌ Failed to start offline map download:', e);
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        error: e?.message || 'Download fehlgeschlagen',
      }));
    }
  }, []);

  // Delete offline pack
  const deletePack = useCallback(async () => {
    try {
      await MapboxGL.offlineManager.deletePack(PACK_CONFIG.name);
      setState({ packs: [], isDownloading: false, error: null });
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Offline map pack deleted');
    } catch (e) {
      console.error('Failed to delete offline pack:', e);
    }
  }, []);

  // Format download size for display
  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const hasOfflinePack = state.packs.some((p) => p.isComplete);
  const currentPack = state.packs[0] || null;

  return {
    ...state,
    hasOfflinePack,
    currentPack,
    downloadPack,
    deletePack,
    checkExistingPacks,
    formatSize,
  };
};
