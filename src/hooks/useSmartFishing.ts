/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useSmartFishing Hook
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * React Hook für die Smart Fishing Intelligence.
 * Lädt und cached den Smart State für optimale Performance.
 * 
 * Features:
 * - Auto-refresh alle 5 Minuten
 * - Memoized für Performance
 * - Error Boundary ready
 * - Loading States
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SmartFishingState,
  SmartInsight,
  SmartRecommendation,
  FishingContext,
  getSmartFishingState,
  generateInsights,
  generateHeadline,
} from '../services/smartFishing';

interface WaterBody {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  region: string;
  fish_species: string[];
  fangIndex: number;
}

interface UseSmartFishingOptions {
  /** Auto-refresh interval in ms (default: 5 min) */
  refreshInterval?: number;
  /** Enable/disable auto-refresh */
  autoRefresh?: boolean;
}

interface UseSmartFishingReturn {
  // State
  state: SmartFishingState | null;
  loading: boolean;
  error: Error | null;
  
  // Derived
  headline: string;
  subheadline: string;
  insights: SmartInsight[];
  recommendations: SmartRecommendation[];
  context: FishingContext | null;
  
  // Actions
  refresh: () => Promise<void>;
  
  // Helpers
  isGoldenHour: boolean;
  timeOfDay: string;
  currentCondition: 'excellent' | 'good' | 'moderate' | 'poor';
}

const DEFAULT_OPTIONS: UseSmartFishingOptions = {
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  autoRefresh: true,
};

/**
 * Hook für Smart Fishing Intelligence
 * 
 * @example
 * const { 
 *   headline, 
 *   insights, 
 *   recommendations, 
 *   isGoldenHour 
 * } = useSmartFishing(waterBodies, [lat, lon]);
 */
export const useSmartFishing = (
  waterBodies: WaterBody[],
  userLocation: [number, number],
  options: UseSmartFishingOptions = DEFAULT_OPTIONS
): UseSmartFishingReturn => {
  const [state, setState] = useState<SmartFishingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const { refreshInterval, autoRefresh } = { ...DEFAULT_OPTIONS, ...options };
  const [userLon, userLat] = userLocation;

  // ─── Main Fetch Function ───
  const refresh = useCallback(async () => {
    if (!userLat || !userLon) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const smartState = await getSmartFishingState(
        waterBodies,
        userLat,
        userLon
      );
      
      setState(smartState);
      setLastRefresh(Date.now());
    } catch (e) {
      console.error('Smart Fishing Error:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
      
      // Fallback: Still provide basic state
      const fallbackHeadline = generateHeadline({
        timeOfDay: getTimeOfDay(),
        hour: new Date().getHours(),
        isGoldenHour: isCurrentlyGoldenHour(),
        moonPhase: 'Unbekannt',
        moonPhaseIndex: 0,
        weather: null,
        season: 'summer',
        dayOfWeek: new Date().getDay(),
        isWeekend: [0, 6].includes(new Date().getDay()),
      });
      
      setState({
        context: {
          timeOfDay: getTimeOfDay(),
          hour: new Date().getHours(),
          isGoldenHour: isCurrentlyGoldenHour(),
          moonPhase: 'Unbekannt',
          moonPhaseIndex: 0,
          weather: null,
          season: 'summer',
          dayOfWeek: new Date().getDay(),
          isWeekend: [0, 6].includes(new Date().getDay()),
        },
        insights: [],
        recommendations: [],
        headline: fallbackHeadline.headline,
        subheadline: 'Daten werden geladen...',
      });
    } finally {
      setLoading(false);
    }
  }, [waterBodies, userLat, userLon]);

  // ─── Initial Load ───
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ─── Auto Refresh ───
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      // Only refresh if data is stale
      if (Date.now() - lastRefresh > refreshInterval) {
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, lastRefresh, refresh]);

  // ─── Memoized Derived State ───
  const derivedState = useMemo(() => {
    if (!state) {
      return {
        headline: '🎣 Lade...',
        subheadline: 'Analysiere Bedingungen',
        insights: [] as SmartInsight[],
        recommendations: [] as SmartRecommendation[],
        context: null,
        isGoldenHour: false,
        timeOfDay: 'unknown',
        currentCondition: 'moderate' as const,
      };
    }

    // Determine overall condition
    let currentCondition: 'excellent' | 'good' | 'moderate' | 'poor' = 'moderate';
    if (state.insights.some(i => i.priority === 'high' && i.type === 'opportunity')) {
      currentCondition = 'excellent';
    } else if (state.recommendations.some(r => r.score >= 75)) {
      currentCondition = 'good';
    } else if (state.insights.some(i => i.type === 'warning')) {
      currentCondition = 'poor';
    }

    return {
      headline: state.headline,
      subheadline: state.subheadline,
      insights: state.insights,
      recommendations: state.recommendations,
      context: state.context,
      isGoldenHour: state.context?.isGoldenHour || false,
      timeOfDay: state.context?.timeOfDay || 'unknown',
      currentCondition,
    };
  }, [state]);

  return {
    state,
    loading,
    error,
    ...derivedState,
    refresh,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getTimeOfDay(): FishingContext['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'earlyMorning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function isCurrentlyGoldenHour(): boolean {
  const hour = new Date().getHours();
  return (hour >= 5 && hour <= 7) || (hour >= 18 && hour <= 20);
}

export default useSmartFishing;
