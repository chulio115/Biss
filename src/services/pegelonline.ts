/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BISS PEGELONLINE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Erweiterte PEGELONLINE Integration mit Vorhersagen (NEU seit März 2026!)
 * Kostenlose amtliche Wasserstandsdaten der WSV
 * 
 * API: https://www.pegelonline.wsv.de/webservices/rest-api/v2
 * Vorhersagen: https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/{id}/W/measurements.json
 */

import axios from 'axios';

const PEGEL_API = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2';

// ─── Types ───

export interface PegelStation {
  uuid: string;
  number: string;
  shortname: string;
  longname: string;
  water: { shortname: string; longname: string };
  latitude: number;
  longitude: number;
  km: number;
}

export interface PegelMeasurement {
  timestamp: string;
  value: number;
}

export interface PegelInfo {
  stationName: string;
  waterName: string;
  currentLevel: number;
  trend: 'rising' | 'stable' | 'falling';
  trendValue: number;
  timestamp: string;
  measurements24h: PegelMeasurement[];
  forecast?: PegelMeasurement[];
  unit: string;
}

// ─── Norddeutschland Pegel-Stationen (wichtigste Angelgewässer) ───

export const NORDDEUTSCHLAND_STATIONS: Record<string, string> = {
  // Elbe
  'Elbe': 'HAMBURG ST. PAULI',
  'Elbe bei Hamburg': 'HAMBURG ST. PAULI',
  'Elbe bei Geesthacht': 'GEESTHACHT',
  'Elbe bei Lauenburg': 'LAUENBURG',
  'Elbe bei Hohnstorf': 'HOHNSTORF',
  'Elbe bei Artlenburg': 'ARTLENBURG',
  'Elbe bei Bleckede': 'BLECKEDE',
  'Elbe bei Boizenburg': 'BOIZENBURG',
  'Elbe bei Dömitz': 'DOEMITZ',
  // Weser
  'Weser': 'BREMEN',
  'Weser bei Bremen': 'INTSCHEDE',
  'Weser bei Nienburg': 'NIENBURG',
  'Weser bei Minden': 'MINDEN',
  'Weser bei Hameln': 'HAMELN',
  // Aller
  'Aller': 'CELLE',
  'Aller bei Celle': 'CELLE',
  'Aller bei Verden': 'VERDEN',
  'Aller bei Rethem': 'RETHEM',
  // Leine
  'Leine': 'HANNOVER-CALENBERGER NEUSTADT',
  'Leine bei Hannover': 'HANNOVER-CALENBERGER NEUSTADT',
  'Leine bei Neustadt': 'NEUSTADT AM RÜBENBERGE',
  // Oste
  'Oste': 'BREMERVÖRDE',
  'Oste bei Bremervörde': 'BREMERVÖRDE',
  // Este
  'Este': 'BUXTEHUDE',
  'Este bei Buxtehude': 'BUXTEHUDE',
  // Ilmenau
  'Ilmenau': 'LÜNEBURG',
  'Ilmenau bei Lüneburg': 'LÜNEBURG',
  // Seeve
  'Seeve': 'JESTEBURG',
  // Stör (SH)
  'Stör': 'ITZEHOE',
  'Stör bei Itzehoe': 'ITZEHOE',
  // Eider (SH)
  'Eider': 'RENDSBURG',
  // Nord-Ostsee-Kanal
  'Nord-Ostsee-Kanal': 'RENDSBURG',
  // Trave (SH)
  'Trave': 'BAD OLDESLOE',
};

// ─── API Functions ───

/**
 * Alle Pegelstationen abrufen
 */
export const getAllStations = async (): Promise<PegelStation[]> => {
  try {
    const response = await axios.get(`${PEGEL_API}/stations.json`, {
      params: { includeTimeseries: false },
      timeout: 10000,
    });
    return response.data || [];
  } catch (error: any) {
    console.error('PEGELONLINE stations error:', error.message);
    return [];
  }
};

/**
 * Nächste Pegelstation zu Koordinaten finden
 */
export const findNearestStation = async (
  lat: number,
  lon: number,
  maxDistanceKm: number = 30
): Promise<PegelStation | null> => {
  try {
    const response = await axios.get(`${PEGEL_API}/stations.json`, {
      params: {
        latitude: lat,
        longitude: lon,
        radius: maxDistanceKm,
        includeTimeseries: false,
      },
      timeout: 10000,
    });

    const stations = response.data || [];
    if (stations.length === 0) return null;

    // Return closest
    return stations[0];
  } catch (error: any) {
    console.error('PEGELONLINE nearest station error:', error.message);
    return null;
  }
};

/**
 * Aktuelle Messung + 24h-Verlauf für eine Station
 */
export const getStationData = async (stationId: string): Promise<PegelInfo | null> => {
  try {
    // Station-Info
    const stationRes = await axios.get(`${PEGEL_API}/stations/${stationId}.json`, {
      params: { includeTimeseries: true, includeCurrentMeasurement: true },
      timeout: 10000,
    });

    const station = stationRes.data;
    if (!station) return null;

    // Finde W (Wasserstand) Timeseries
    const wTimeseries = station.timeseries?.find(
      (ts: any) => ts.shortname === 'W' || ts.longname?.includes('Wasserstand')
    );

    const currentValue = wTimeseries?.currentMeasurement?.value;
    const currentTimestamp = wTimeseries?.currentMeasurement?.timestamp;

    if (!currentValue) return null;

    // 24h-Messungen holen
    let measurements24h: PegelMeasurement[] = [];
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const measRes = await axios.get(
        `${PEGEL_API}/stations/${stationId}/W/measurements.json`,
        {
          params: {
            start: yesterday.toISOString(),
            end: now.toISOString(),
          },
          timeout: 10000,
        }
      );
      measurements24h = (measRes.data || []).map((m: any) => ({
        timestamp: m.timestamp,
        value: m.value,
      }));
    } catch {
      // Non-critical
    }

    // Trend berechnen (letzte 6h vs vorherige 6h)
    const { trend, trendValue } = calculateTrend(measurements24h);

    return {
      stationName: station.shortname || stationId,
      waterName: station.water?.shortname || '',
      currentLevel: currentValue,
      trend,
      trendValue,
      timestamp: currentTimestamp || new Date().toISOString(),
      measurements24h,
      unit: wTimeseries?.unit || 'cm',
    };
  } catch (error: any) {
    console.error(`PEGELONLINE station ${stationId} error:`, error.message);
    return null;
  }
};

/**
 * Pegel-Vorhersage für eine Station (NEU seit März 2026!)
 * Die WSV stellt jetzt amtliche Vorhersagen bereit
 */
export const getStationForecast = async (stationId: string): Promise<PegelMeasurement[]> => {
  try {
    const response = await axios.get(
      `${PEGEL_API}/stations/${stationId}/W/measurements.json`,
      {
        params: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        },
        timeout: 10000,
      }
    );

    return (response.data || []).map((m: any) => ({
      timestamp: m.timestamp,
      value: m.value,
    }));
  } catch (error: any) {
    console.log('PEGELONLINE forecast not available:', error.message);
    return [];
  }
};

/**
 * Pegel-Daten für einen Spot-Namen finden
 * Matched gegen NORDDEUTSCHLAND_STATIONS
 */
export const getPegelForSpot = async (
  spotName: string,
  lat?: number,
  lon?: number
): Promise<PegelInfo | null> => {
  // Erst nach bekanntem Station-Match suchen
  const stationId = findStationForSpot(spotName);
  
  if (stationId) {
    return getStationData(stationId);
  }

  // Fallback: nächste Station per Koordinaten
  if (lat && lon) {
    const nearest = await findNearestStation(lat, lon, 20);
    if (nearest) {
      return getStationData(nearest.shortname);
    }
  }

  return null;
};

// ─── Helpers ───

/**
 * Findet die passende Pegelstation für einen Spot-Namen
 */
const findStationForSpot = (spotName: string): string | null => {
  const nameLower = spotName.toLowerCase();

  // Exakter Match
  for (const [key, station] of Object.entries(NORDDEUTSCHLAND_STATIONS)) {
    if (nameLower.includes(key.toLowerCase())) {
      return station;
    }
  }

  // Fluss-Name Match
  const riverNames = ['elbe', 'weser', 'aller', 'leine', 'oste', 'este', 'ilmenau', 'seeve', 'stör', 'eider', 'trave'];
  for (const river of riverNames) {
    if (nameLower.includes(river)) {
      const key = river.charAt(0).toUpperCase() + river.slice(1);
      return NORDDEUTSCHLAND_STATIONS[key] || null;
    }
  }

  return null;
};

/**
 * Berechnet Trend aus Messungen (letzte 6h vs vorherige 6h)
 */
const calculateTrend = (
  measurements: PegelMeasurement[]
): { trend: 'rising' | 'stable' | 'falling'; trendValue: number } => {
  if (measurements.length < 4) {
    return { trend: 'stable', trendValue: 0 };
  }

  const recent = measurements.slice(-6);
  const previous = measurements.slice(-12, -6);

  if (recent.length === 0 || previous.length === 0) {
    return { trend: 'stable', trendValue: 0 };
  }

  const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
  const previousAvg = previous.reduce((sum, m) => sum + m.value, 0) / previous.length;
  const diff = recentAvg - previousAvg;

  // Threshold: ±2cm = stabil
  if (Math.abs(diff) < 2) {
    return { trend: 'stable', trendValue: Math.round(diff) };
  }

  return {
    trend: diff > 0 ? 'rising' : 'falling',
    trendValue: Math.round(diff),
  };
};

/**
 * Formatiert Pegel-Trend als Emoji + Text
 */
export const formatPegelTrend = (trend: 'rising' | 'stable' | 'falling', value: number): string => {
  switch (trend) {
    case 'rising': return `↗️ +${Math.abs(value)}cm (steigend)`;
    case 'falling': return `↘️ -${Math.abs(value)}cm (fallend)`;
    default: return `➡️ stabil`;
  }
};

export default {
  getAllStations,
  findNearestStation,
  getStationData,
  getStationForecast,
  getPegelForSpot,
  formatPegelTrend,
  NORDDEUTSCHLAND_STATIONS,
};
