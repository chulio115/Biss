// xAI/Grok API Service - OCR & Fangindex
import axios from 'axios';
import { OCRResult, FangIndex, WeatherData, PegelData } from '../types';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_API_KEY = process.env.XAI_API_KEY || '';

// Generic xAI API call
const callXAI = async (prompt: string, imageBase64?: string): Promise<string> => {
  try {
    const messages: any[] = [];
    
    if (imageBase64) {
      // Vision request with image
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const response = await axios.post(
      XAI_API_URL,
      {
        model: 'grok-vision-beta', // oder grok-beta für Text-only
        messages,
        max_tokens: 1000,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('xAI API Error:', error.response?.data || error.message);
    throw new Error(`xAI API Fehler: ${error.message}`);
  }
};

// OCR: Extract fishing license data from image
export const extractLicenseData = async (imageBase64: string): Promise<OCRResult> => {
  const prompt = `Analysiere dieses Bild eines deutschen Fischereischeins und extrahiere folgende Daten im JSON-Format:
{
  "raw_text": "kompletter erkannter Text",
  "extracted_data": {
    "name": "Name des Inhabers",
    "license_number": "Scheinnummer",
    "valid_until": "Gültig bis Datum (YYYY-MM-DD)",
    "issuing_authority": "Ausstellende Behörde"
  },
  "confidence": 0.0-1.0
}
Antworte NUR mit dem JSON, keine Erklärungen.`;

  const response = await callXAI(prompt, imageBase64);
  
  try {
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Kein JSON in Antwort gefunden');
    return JSON.parse(jsonMatch[0]) as OCRResult;
  } catch (e) {
    console.error('OCR Parse Error:', e);
    return {
      raw_text: response,
      extracted_data: {},
      confidence: 0,
    };
  }
};

// Fangindex: Calculate fishing score based on conditions
export const calculateFangIndex = async (
  waterBodyName: string,
  weather: WeatherData,
  pegel: PegelData | null,
  targetFish?: string
): Promise<FangIndex> => {
  // Calculate moon phase (simplified)
  const moonPhase = getMoonPhase();
  const timeOfDay = new Date().getHours();

  const prompt = `Du bist ein erfahrener Angelexperte. Berechne einen Fangindex (0-100) für folgende Bedingungen:

GEWÄSSER: ${waterBodyName}
WETTER:
- Temperatur: ${weather.temp}°C
- Luftdruck: ${weather.pressure} hPa
- Luftfeuchtigkeit: ${weather.humidity}%
- Wind: ${weather.wind_speed} m/s
- Bewölkung: ${weather.clouds}%
- Beschreibung: ${weather.description}

WASSERSTAND: ${pegel ? `${pegel.water_level}cm (${pegel.trend})` : 'Keine Daten'}
MONDPHASE: ${moonPhase}
UHRZEIT: ${timeOfDay}:00 Uhr
${targetFish ? `ZIELFISCH: ${targetFish}` : ''}

Antworte im JSON-Format:
{
  "score": 0-100,
  "reasoning": "Kurze Begründung auf Deutsch",
  "factors": {
    "weather": 0-100,
    "water_level": 0-100,
    "moon_phase": 0-100,
    "time_of_day": 0-100
  },
  "best_fish": ["Fisch1", "Fisch2"],
  "recommendation": "Konkrete Empfehlung für heute"
}`;

  const response = await callXAI(prompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Kein JSON in Antwort');
    return JSON.parse(jsonMatch[0]) as FangIndex;
  } catch (e) {
    console.error('Fangindex Parse Error:', e);
    return {
      score: 50,
      reasoning: 'Konnte Bedingungen nicht vollständig analysieren',
      factors: { weather: 50, water_level: 50, moon_phase: 50, time_of_day: 50 },
      best_fish: [],
      recommendation: 'Probiere es einfach aus!',
    };
  }
};

// Helper: Calculate moon phase (0-7, 0=Neumond, 4=Vollmond)
const getMoonPhase = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simplified moon phase calculation
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  const phaseIndex = Math.floor((phase - Math.floor(phase)) * 8);
  
  const phases = ['Neumond', 'Zunehmend', 'Erstes Viertel', 'Zunehmend', 
                  'Vollmond', 'Abnehmend', 'Letztes Viertel', 'Abnehmend'];
  return phases[phaseIndex];
};
