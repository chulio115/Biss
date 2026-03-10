// Weather Services: DWD (Primary) + OpenWeather (Fallback) + PEGELONLINE
import axios from 'axios';
import { WeatherData, PegelData } from '../types';
import { getDWDWeather, DWDWeatherData } from './weatherDWD';

const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const PEGELONLINE_URL = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2';

// Fetch current weather — DWD first (kostenlos, präziser), OpenWeather als Fallback
export const getWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  // Try DWD first (kostenlos, kein API-Key, 2000+ DE-Stationen)
  try {
    const dwd = await getDWDWeather(lat, lon);
    console.log(`☀️ DWD Wetter: ${dwd.temp}°C, ${dwd.description} (Station: ${dwd.source_station || 'unbekannt'})`);
    return {
      temp: dwd.temp,
      pressure: dwd.pressure,
      humidity: dwd.humidity,
      wind_speed: dwd.wind_speed,
      clouds: dwd.clouds,
      description: dwd.description,
    };
  } catch (dwdError: any) {
    console.warn('⚠️ DWD nicht erreichbar, Fallback auf OpenWeather:', dwdError.message);
  }

  // Fallback: OpenWeather
  try {
    const response = await axios.get(OPENWEATHER_URL, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'de',
      },
    });

    const data = response.data;
    return {
      temp: data.main.temp,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      clouds: data.clouds.all,
      description: data.weather[0].description,
    };
  } catch (error: any) {
    console.error('Weather API Error:', error.message);
    throw new Error('Wetterdaten konnten nicht geladen werden');
  }
};

// Fetch water level from PEGELONLINE (German federal waterways)
export const getPegelData = async (stationId: string): Promise<PegelData | null> => {
  try {
    // Get current measurement
    const response = await axios.get(
      `${PEGELONLINE_URL}/stations/${stationId}/W/currentmeasurement.json`
    );

    const data = response.data;
    
    // Determine trend based on recent values
    let trend: 'steigend' | 'fallend' | 'gleichbleibend' = 'gleichbleibend';
    if (data.trend === 1) trend = 'steigend';
    else if (data.trend === -1) trend = 'fallend';

    return {
      station: stationId,
      water_level: data.value,
      trend,
      timestamp: data.timestamp,
    };
  } catch (error: any) {
    console.error('Pegel API Error:', error.message);
    // PEGELONLINE is public but not all stations have data
    return null;
  }
};

// Search for nearby pegel stations
export const searchPegelStations = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${PEGELONLINE_URL}/stations.json`, {
      params: { waters: query },
    });
    return response.data.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Pegel Search Error:', error);
    return [];
  }
};

// Pegel-Stationen für Norddeutschland (Hauptangelgewässer)
export const COMMON_PEGEL_STATIONS: Record<string, string> = {
  // Elbe (Hauptfluss Norddeutschland)
  'Elbe-Hamburg': 'HAMBURG ST. PAULI',
  'Elbe-Geesthacht': 'GEESTHACHT',
  'Elbe-Lauenburg': 'LAUENBURG',
  'Elbe-Hohnstorf': 'HOHNSTORF',
  'Elbe-Bleckede': 'BLECKEDE',
  'Elbe-Dömitz': 'DOEMITZ',
  // Weser
  'Weser-Bremen': 'BREMEN',
  'Weser-Nienburg': 'NIENBURG',
  'Weser-Minden': 'MINDEN',
  'Weser-Hameln': 'HAMELN',
  // Aller
  'Aller-Celle': 'CELLE',
  'Aller-Verden': 'VERDEN',
  'Aller-Rethem': 'RETHEM',
  // Leine
  'Leine-Hannover': 'HANNOVER-CALENBERGER NEUSTADT',
  'Leine-Neustadt': 'NEUSTADT AM RÜBENBERGE',
  // Weitere NDS Flüsse
  'Oste-Bremervörde': 'BREMERVÖRDE',
  'Este-Buxtehude': 'BUXTEHUDE',
  'Ilmenau-Lüneburg': 'LÜNEBURG',
  // Schleswig-Holstein
  'Stör-Itzehoe': 'ITZEHOE',
  'Eider-Rendsburg': 'RENDSBURG',
  'Trave-Bad Oldesloe': 'BAD OLDESLOE',
  // Überregional (Fallback)
  'Rhein-Köln': 'KOELN',
  'Donau-Passau': 'PASSAU DONAU',
  'Main-Frankfurt': 'FRANKFURT OSTHAFEN',
};
