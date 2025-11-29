// xAI/Grok API Service - OCR & Fangindex
import axios from 'axios';
import { OCRResult, FangIndex, WeatherData, PegelData } from '../types';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_API_KEY = process.env.EXPO_PUBLIC_XAI_API_KEY || '';

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
        model: 'grok-2-latest', // aktuelles Grok Model
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

// Fangindex: Calculate fishing score based on conditions (LOCAL - no API needed)
export const calculateFangIndex = async (
  waterBodyName: string,
  weather: WeatherData,
  pegel: PegelData | null,
  targetFish?: string
): Promise<FangIndex> => {
  const moonPhase = getMoonPhase();
  const moonPhaseIndex = getMoonPhaseIndex();
  const timeOfDay = new Date().getHours();

  // === LOKALE BERECHNUNG (kein API-Call) ===
  
  // 1. Wetter-Score (0-100)
  let weatherScore = 50;
  // Luftdruck: 1010-1020 hPa ist optimal
  if (weather.pressure >= 1010 && weather.pressure <= 1020) weatherScore += 20;
  else if (weather.pressure < 1000 || weather.pressure > 1030) weatherScore -= 15;
  // Temperatur: 10-20°C optimal für die meisten Fische
  if (weather.temp >= 10 && weather.temp <= 20) weatherScore += 15;
  else if (weather.temp < 5 || weather.temp > 28) weatherScore -= 20;
  // Wind: leichter Wind gut, starker Wind schlecht
  if (weather.wind_speed < 3) weatherScore += 10;
  else if (weather.wind_speed > 8) weatherScore -= 15;
  // Bewölkung: leicht bewölkt ist gut
  if (weather.clouds >= 30 && weather.clouds <= 70) weatherScore += 10;
  weatherScore = Math.max(0, Math.min(100, weatherScore));

  // 2. Tageszeit-Score (0-100)
  let timeScore = 50;
  // Früh morgens (5-8) und abends (17-21) sind beste Beißzeiten
  if ((timeOfDay >= 5 && timeOfDay <= 8) || (timeOfDay >= 17 && timeOfDay <= 21)) {
    timeScore = 90;
  } else if ((timeOfDay >= 9 && timeOfDay <= 11) || (timeOfDay >= 15 && timeOfDay <= 16)) {
    timeScore = 65;
  } else if (timeOfDay >= 12 && timeOfDay <= 14) {
    timeScore = 35; // Mittagshitze schlecht
  } else {
    timeScore = 20; // Nacht
  }

  // 3. Mondphasen-Score (0-100)
  // Neumond und Vollmond sind gut, Halbmonde weniger
  const moonScores = [85, 60, 45, 60, 90, 60, 45, 60]; // Index 0=Neumond, 4=Vollmond
  const moonScore = moonScores[moonPhaseIndex];

  // 4. Wasserstand-Score (0-100)
  let waterScore = 60; // Default wenn keine Daten
  if (pegel) {
    if (pegel.trend === 'gleichbleibend') waterScore = 75;
    else if (pegel.trend === 'steigend') waterScore = 85; // Steigend ist oft gut
    else waterScore = 50; // Fallend weniger gut
  }

  // Gesamtscore berechnen (gewichtet)
  const totalScore = Math.round(
    weatherScore * 0.35 + 
    timeScore * 0.30 + 
    moonScore * 0.20 + 
    waterScore * 0.15
  );

  // Beste Fische basierend auf Bedingungen
  const bestFish: string[] = [];
  if (weather.temp < 12) {
    bestFish.push('Forelle', 'Äsche');
  } else if (weather.temp >= 12 && weather.temp <= 20) {
    bestFish.push('Hecht', 'Zander', 'Barsch');
  } else {
    bestFish.push('Karpfen', 'Schleie', 'Wels');
  }
  if (weather.clouds > 60) bestFish.push('Aal');

  // Empfehlung generieren
  let recommendation = '';
  if (totalScore >= 75) {
    recommendation = `Hervorragende Bedingungen am ${waterBodyName}! Die ${moonPhase} und das aktuelle Wetter versprechen gute Fänge.`;
  } else if (totalScore >= 50) {
    recommendation = `Ordentliche Chancen heute. Konzentriere dich auf die frühen Morgen- oder späten Abendstunden.`;
  } else {
    recommendation = `Schwierige Bedingungen. Versuche es mit Grundangeln oder warte auf besseres Wetter.`;
  }

  // Begründung
  const reasoning = `${moonPhase}, ${weather.temp.toFixed(0)}°C, Luftdruck ${weather.pressure} hPa. ` +
    (timeScore >= 70 ? 'Gute Beißzeit!' : 'Nicht die optimale Tageszeit.');

  return {
    score: totalScore,
    reasoning,
    factors: {
      weather: weatherScore,
      water_level: waterScore,
      moon_phase: moonScore,
      time_of_day: timeScore,
    },
    best_fish: bestFish.slice(0, 3),
    recommendation,
  };
};

// Helper: Get moon phase index (0-7)
const getMoonPhaseIndex = (): number => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  return Math.floor((phase - Math.floor(phase)) * 8);
};

// Helper: Calculate moon phase name
const getMoonPhase = (): string => {
  const phaseIndex = getMoonPhaseIndex();
  const phases = ['Neumond', 'Zunehmend', 'Erstes Viertel', 'Zunehmend', 
                  'Vollmond', 'Abnehmend', 'Letztes Viertel', 'Abnehmend'];
  return phases[phaseIndex];
};

