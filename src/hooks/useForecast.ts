/**
 * useForecast - Hook für die 7-Tage Fangindex-Prognose
 * Lädt DWD Forecast + berechnet Fangindex pro Stunde/Tag
 */

import { useState, useCallback } from 'react';
import { getFangindexForecast, WeekForecast } from '../services/fangindexForecast';

export const useForecast = () => {
  const [forecast, setForecast] = useState<WeekForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = useCallback(async (lat: number = 53.33, lng: number = 9.97) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFangindexForecast(lat, lng);
      setForecast(result);
      console.log(`📊 Forecast geladen: ${result.days.length} Tage, bester Moment: Score ${result.bestMoment.score}`);
    } catch (e: any) {
      console.error('Forecast error:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    forecast,
    loading,
    error,
    loadForecast,
  };
};
