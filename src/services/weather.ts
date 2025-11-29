// OpenWeather & PEGELONLINE API Services
import axios from 'axios';
import { WeatherData, PegelData } from '../types';

const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const PEGELONLINE_URL = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2';

// Fetch current weather for coordinates
export const getWeather = async (lat: number, lon: number): Promise<WeatherData> => {
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

// Get all available pegel stations (cached list for common rivers)
export const COMMON_PEGEL_STATIONS: Record<string, string> = {
  'Rhein-Köln': 'KOELN',
  'Rhein-Düsseldorf': 'DUESSELDORF',
  'Elbe-Hamburg': 'HAMBURG ST. PAULI',
  'Donau-Passau': 'PASSAU DONAU',
  'Main-Frankfurt': 'FRANKFURT OSTHAFEN',
  'Weser-Bremen': 'BREMEN',
  'Mosel-Trier': 'TRIER',
  'Neckar-Heidelberg': 'HEIDELBERG',
};
