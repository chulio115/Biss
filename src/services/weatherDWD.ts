/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BISS DWD WEATHER SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Deutscher Wetterdienst Open Data Integration
 * Kostenlos, kein API-Key, kein Limit, 2000+ Messstationen
 * Präziser als OpenWeather für Deutschland
 * 
 * API: https://dwd.api.proxy.bund.dev/
 * Docs: https://opendata.dwd.de/
 */

import axios from 'axios';

// ─── DWD Bright Sky API (Free Proxy) ───
// Bright Sky ist ein freier Proxy für DWD Open Data, JSON-Format
const BRIGHT_SKY_URL = 'https://api.brightsky.dev';

export interface DWDWeatherData {
  temp: number;
  pressure: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  clouds: number;
  description: string;
  precipitation: number;
  sunshine: number;
  icon: string;
  // DWD-spezifisch
  dew_point?: number;
  visibility?: number;
  solar_radiation?: number;
  source_station?: string;
  source_distance_km?: number;
}

export interface DWDForecastHour {
  timestamp: string;
  temp: number;
  wind_speed: number;
  wind_direction: number;
  precipitation: number;
  clouds: number;
  icon: string;
  condition: string;
}

export interface DWDStormWarning {
  headline: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  event: string;
  effective: string;
  expires: string;
}

// ─── Map DWD icon to description ───
const DWD_CONDITIONS: Record<string, string> = {
  'clear-day': 'Klar',
  'clear-night': 'Klar',
  'partly-cloudy-day': 'Teilweise bewölkt',
  'partly-cloudy-night': 'Teilweise bewölkt',
  'cloudy': 'Bewölkt',
  'fog': 'Nebel',
  'wind': 'Windig',
  'rain': 'Regen',
  'sleet': 'Schneeregen',
  'snow': 'Schnee',
  'hail': 'Hagel',
  'thunderstorm': 'Gewitter',
};

/**
 * Aktuelles Wetter von DWD (Bright Sky API)
 * Kostenlos, kein API-Key, keine Limits
 */
export const getDWDWeather = async (lat: number, lon: number): Promise<DWDWeatherData> => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hour = now.getHours();

    const response = await axios.get(`${BRIGHT_SKY_URL}/weather`, {
      params: {
        lat,
        lon,
        date: dateStr,
        last_date: dateStr,
      },
      timeout: 10000,
    });

    const weatherData = response.data.weather;
    if (!weatherData || weatherData.length === 0) {
      throw new Error('Keine DWD-Wetterdaten verfügbar');
    }

    // Finde den nächsten Zeitpunkt zum aktuellen Zeitpunkt
    const closest = weatherData.reduce((prev: any, curr: any) => {
      const prevDiff = Math.abs(new Date(prev.timestamp).getHours() - hour);
      const currDiff = Math.abs(new Date(curr.timestamp).getHours() - hour);
      return currDiff < prevDiff ? curr : prev;
    });

    // Source station info
    const sources = response.data.sources || [];
    const source = sources.length > 0 ? sources[0] : null;

    return {
      temp: closest.temperature ?? 15,
      pressure: closest.pressure_msl ?? 1013,
      humidity: closest.relative_humidity ?? 60,
      wind_speed: closest.wind_speed ? closest.wind_speed / 3.6 : 3, // km/h → m/s
      wind_direction: closest.wind_direction ?? 0,
      clouds: closest.cloud_cover ?? 50,
      description: DWD_CONDITIONS[closest.icon] || closest.condition || 'Bewölkt',
      precipitation: closest.precipitation ?? 0,
      sunshine: closest.sunshine ?? 0,
      icon: closest.icon || 'cloudy',
      dew_point: closest.dew_point,
      visibility: closest.visibility,
      solar_radiation: closest.solar,
      source_station: source?.station_name,
      source_distance_km: source?.distance ? Math.round(source.distance / 1000) : undefined,
    };
  } catch (error: any) {
    console.error('DWD Weather Error:', error.message);
    throw new Error('DWD-Wetterdaten konnten nicht geladen werden');
  }
};

/**
 * 48h Wettervorhersage von DWD
 * Stündliche Vorhersage — perfekt für Fangindex-Prognose
 */
export const getDWDForecast = async (lat: number, lon: number): Promise<DWDForecastHour[]> => {
  try {
    const now = new Date();
    const endDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const response = await axios.get(`${BRIGHT_SKY_URL}/weather`, {
      params: {
        lat,
        lon,
        date: now.toISOString(),
        last_date: endDate.toISOString(),
      },
      timeout: 10000,
    });

    const weatherData = response.data.weather || [];

    return weatherData.map((hour: any) => ({
      timestamp: hour.timestamp,
      temp: hour.temperature ?? 15,
      wind_speed: hour.wind_speed ? hour.wind_speed / 3.6 : 3,
      wind_direction: hour.wind_direction ?? 0,
      precipitation: hour.precipitation ?? 0,
      clouds: hour.cloud_cover ?? 50,
      icon: hour.icon || 'cloudy',
      condition: DWD_CONDITIONS[hour.icon] || hour.condition || 'Bewölkt',
    }));
  } catch (error: any) {
    console.error('DWD Forecast Error:', error.message);
    return [];
  }
};

/**
 * DWD Wetterwarnungen für eine Position
 * Gewitterwarnungen, Sturmwarnungen etc.
 */
export const getDWDWarnings = async (lat: number, lon: number): Promise<DWDStormWarning[]> => {
  try {
    const response = await axios.get(`${BRIGHT_SKY_URL}/alerts`, {
      params: { lat, lon },
      timeout: 10000,
    });

    const alerts = response.data.alerts || [];

    return alerts.map((alert: any) => ({
      headline: alert.headline || 'Wetterwarnung',
      description: alert.description || '',
      severity: mapDWDSeverity(alert.severity),
      event: alert.event || 'Warnung',
      effective: alert.effective,
      expires: alert.expires,
    }));
  } catch (error: any) {
    console.log('DWD Warnings not available:', error.message);
    return [];
  }
};

const mapDWDSeverity = (severity: string): DWDStormWarning['severity'] => {
  switch (severity?.toLowerCase()) {
    case 'extreme': return 'extreme';
    case 'severe': return 'severe';
    case 'moderate': return 'moderate';
    default: return 'minor';
  }
};

export default {
  getDWDWeather,
  getDWDForecast,
  getDWDWarnings,
};
