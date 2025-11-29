/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BISS SMART FISHING INTELLIGENCE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Das Herzstück der BISS App - Kontextbewusste Empfehlungen für Angler.
 * 
 * ABOVE AND BEYOND:
 * - Nicht nur Daten anzeigen, sondern INTERPRETIEREN
 * - Nicht nur Spots listen, sondern EMPFEHLEN
 * - Nicht nur heute, sondern VORHERSAGEN
 * 
 * „Der Angler um 5 Uhr morgens am See will nicht 50 Marker sehen,
 *  er will EINEN Tipp: Wo beißt es JETZT?"
 */

import { WeatherData, PegelData, FangIndex } from '../types';
import { getWeather } from './weather';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface FishingContext {
  timeOfDay: 'earlyMorning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  hour: number;
  isGoldenHour: boolean;
  moonPhase: string;
  moonPhaseIndex: number;
  weather: WeatherData | null;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  dayOfWeek: number;
  isWeekend: boolean;
}

export interface SmartInsight {
  type: 'tip' | 'warning' | 'opportunity' | 'timing';
  icon: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable?: {
    label: string;
    action: 'filter' | 'navigate' | 'info';
    payload?: any;
  };
}

export interface SmartRecommendation {
  id: string;
  spotId: string;
  spotName: string;
  category: 'perfect_now' | 'nearby' | 'golden_hour' | 'hidden_gem' | 'weather_pick';
  categoryLabel: string;
  categoryIcon: string;
  score: number;
  distance: number;
  reason: string;
  bestFish: string[];
  timing: string;
}

export interface SmartFishingState {
  context: FishingContext;
  insights: SmartInsight[];
  recommendations: SmartRecommendation[];
  headline: string;
  subheadline: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analysiert den aktuellen Kontext des Anglers
 * - Tageszeit, Wetter, Mondphase, Saison
 * - Bildet die Basis für alle Empfehlungen
 */
export const detectFishingContext = async (
  userLat: number,
  userLon: number
): Promise<FishingContext> => {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;
  const dayOfWeek = now.getDay();
  
  // Time of Day Classification
  let timeOfDay: FishingContext['timeOfDay'];
  if (hour >= 5 && hour < 8) timeOfDay = 'earlyMorning';
  else if (hour >= 8 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 14) timeOfDay = 'midday';
  else if (hour >= 14 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  // Golden Hour Detection (more sophisticated than simple check)
  const isGoldenHour = (hour >= 5 && hour <= 7) || (hour >= 18 && hour <= 20);
  
  // Season Detection
  let season: FishingContext['season'];
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'autumn';
  else season = 'winter';
  
  // Moon Phase
  const moonPhaseIndex = getMoonPhaseIndex();
  const moonPhases = ['Neumond', 'Zunehmend', 'Erstes Viertel', 'Zunehmend', 
                      'Vollmond', 'Abnehmend', 'Letztes Viertel', 'Abnehmend'];
  const moonPhase = moonPhases[moonPhaseIndex];
  
  // Fetch Weather (with fallback)
  let weather: WeatherData | null = null;
  try {
    weather = await getWeather(userLat, userLon);
  } catch (e) {
    console.log('Weather fetch failed, continuing without');
  }
  
  return {
    timeOfDay,
    hour,
    isGoldenHour,
    moonPhase,
    moonPhaseIndex,
    weather,
    season,
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SMART INSIGHTS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generiert kontextbezogene Insights für den Angler
 * - Tipps basierend auf Tageszeit
 * - Warnungen bei schlechtem Wetter
 * - Chancen bei besonderen Konditionen
 */
export const generateInsights = (context: FishingContext): SmartInsight[] => {
  const insights: SmartInsight[] = [];
  
  // ─── Time-Based Insights ───
  
  if (context.timeOfDay === 'earlyMorning') {
    insights.push({
      type: 'opportunity',
      icon: '☕',
      title: 'Früh dran!',
      message: 'Perfekte Zeit für Raubfische. Hechte und Zander sind jetzt aktiv.',
      priority: 'high',
      actionable: {
        label: 'Raubfisch-Spots',
        action: 'filter',
        payload: { fish: ['Hecht', 'Zander', 'Barsch'] },
      },
    });
  }
  
  if (context.isGoldenHour) {
    insights.push({
      type: 'timing',
      icon: '🌅',
      title: 'Goldene Stunde!',
      message: 'Die beste Beißzeit des Tages. Jetzt los ans Wasser!',
      priority: 'high',
    });
  }
  
  if (context.timeOfDay === 'midday') {
    insights.push({
      type: 'tip',
      icon: '☀️',
      title: 'Mittagshitze',
      message: 'Fische ziehen sich in tiefere Bereiche zurück. Grundangeln empfohlen.',
      priority: 'medium',
    });
  }
  
  if (context.timeOfDay === 'night' && context.moonPhaseIndex === 4) {
    insights.push({
      type: 'opportunity',
      icon: '🌕',
      title: 'Vollmond-Nacht',
      message: 'Aale und Welse sind bei Vollmond besonders aktiv!',
      priority: 'high',
      actionable: {
        label: 'Nachtangel-Spots',
        action: 'filter',
        payload: { fish: ['Aal', 'Wels'] },
      },
    });
  }
  
  // ─── Weather-Based Insights ───
  
  if (context.weather) {
    const { temp, pressure, wind_speed, clouds } = context.weather;
    
    // Pressure Drop = Fish Feeding!
    if (pressure < 1010) {
      insights.push({
        type: 'opportunity',
        icon: '📉',
        title: 'Druckabfall!',
        message: 'Niedriger Luftdruck aktiviert die Fische. Sehr gute Chancen heute!',
        priority: 'high',
      });
    }
    
    // High Pressure = Slow Fishing
    if (pressure > 1025) {
      insights.push({
        type: 'tip',
        icon: '📈',
        title: 'Hoher Luftdruck',
        message: 'Fische sind träge. Versuche kleinere Köder und langsamere Führung.',
        priority: 'medium',
      });
    }
    
    // Wind Warning
    if (wind_speed > 10) {
      insights.push({
        type: 'warning',
        icon: '💨',
        title: 'Starker Wind',
        message: `${wind_speed.toFixed(0)} km/h Wind. Such dir windgeschützte Stellen.`,
        priority: 'medium',
      });
    }
    
    // Perfect Conditions
    if (pressure >= 1010 && pressure <= 1020 && 
        temp >= 12 && temp <= 22 && 
        wind_speed < 5 && 
        clouds >= 30 && clouds <= 70) {
      insights.push({
        type: 'opportunity',
        icon: '✨',
        title: 'Perfekte Bedingungen!',
        message: 'Alle Faktoren stimmen. Heute ist DEIN Tag!',
        priority: 'high',
      });
    }
    
    // Temperature-based fish suggestions
    if (temp < 10) {
      insights.push({
        type: 'tip',
        icon: '🥶',
        title: 'Kaltes Wasser',
        message: 'Forellen und Äschen lieben das! Salmoniden-Zeit.',
        priority: 'low',
      });
    } else if (temp > 25) {
      insights.push({
        type: 'tip',
        icon: '🌡️',
        title: 'Warmes Wasser',
        message: 'Karpfen, Schleien und Welse sind jetzt am aktivsten.',
        priority: 'low',
      });
    }
  }
  
  // ─── Moon Phase Insights ───
  
  if (context.moonPhaseIndex === 0) { // Neumond
    insights.push({
      type: 'tip',
      icon: '🌑',
      title: 'Neumond',
      message: 'Dunkle Nächte = aktive Raubfische. Gute Zeit für Nachtangeln.',
      priority: 'low',
    });
  }
  
  // ─── Weekend Insight ───
  
  if (context.isWeekend) {
    insights.push({
      type: 'tip',
      icon: '👥',
      title: 'Wochenende',
      message: 'Beliebte Spots könnten voll sein. Früh da sein oder Geheimtipps nutzen.',
      priority: 'low',
    });
  }
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return insights.slice(0, 3); // Max 3 insights at a time
};

// ─────────────────────────────────────────────────────────────────────────────
// SMART RECOMMENDATIONS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

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

/**
 * Generiert intelligente Spot-Empfehlungen
 * - Nicht nur nach Score sortiert, sondern nach KONTEXT
 * - Kategorisiert für verschiedene Angler-Bedürfnisse
 */
export const generateRecommendations = (
  waterBodies: WaterBody[],
  context: FishingContext,
  userLat: number,
  userLon: number
): SmartRecommendation[] => {
  if (!waterBodies || waterBodies.length === 0) return [];
  
  const recommendations: SmartRecommendation[] = [];
  
  // Calculate distances
  const spotsWithDistance = waterBodies.map(wb => ({
    ...wb,
    distance: calculateDistance(userLat, userLon, wb.latitude, wb.longitude),
  }));
  
  // ─── Category 1: Perfect NOW ───
  // Highest Fangindex considering current time
  const bestNow = [...spotsWithDistance]
    .sort((a, b) => {
      // Weight by Fangindex + time bonus
      const aScore = a.fangIndex + (context.isGoldenHour ? 10 : 0);
      const bScore = b.fangIndex + (context.isGoldenHour ? 10 : 0);
      return bScore - aScore;
    })[0];
    
  if (bestNow) {
    recommendations.push({
      id: `perfect_now_${bestNow.id}`,
      spotId: bestNow.id,
      spotName: bestNow.name,
      category: 'perfect_now',
      categoryLabel: 'Perfekt für JETZT',
      categoryIcon: '🔥',
      score: bestNow.fangIndex,
      distance: bestNow.distance,
      reason: getReason(bestNow.fangIndex, context),
      bestFish: bestNow.fish_species.slice(0, 2),
      timing: context.isGoldenHour ? 'Goldene Stunde aktiv!' : getTimingMessage(context),
    });
  }
  
  // ─── Category 2: Nearby with Good Score ───
  // Best combination of distance AND score
  const nearbyGood = [...spotsWithDistance]
    .filter(s => s.id !== bestNow?.id)
    .sort((a, b) => {
      // Score = Fangindex - (Distance in km * 2)
      // Closer spots get priority unless Fangindex is much higher
      const aCombo = a.fangIndex - (a.distance * 2);
      const bCombo = b.fangIndex - (b.distance * 2);
      return bCombo - aCombo;
    })[0];
    
  if (nearbyGood) {
    recommendations.push({
      id: `nearby_${nearbyGood.id}`,
      spotId: nearbyGood.id,
      spotName: nearbyGood.name,
      category: 'nearby',
      categoryLabel: 'Nah & gut',
      categoryIcon: '📍',
      score: nearbyGood.fangIndex,
      distance: nearbyGood.distance,
      reason: `Nur ${nearbyGood.distance.toFixed(1)}km entfernt`,
      bestFish: nearbyGood.fish_species.slice(0, 2),
      timing: `~${Math.ceil(nearbyGood.distance * 2)} min Fahrt`,
    });
  }
  
  // ─── Category 3: Weather Pick ───
  // Best for current weather conditions
  if (context.weather) {
    const weatherPick = [...spotsWithDistance]
      .filter(s => s.id !== bestNow?.id && s.id !== nearbyGood?.id)
      .sort((a, b) => {
        // Boost based on weather-appropriate fish
        const aBoost = getWeatherBoost(a.fish_species, context.weather!);
        const bBoost = getWeatherBoost(b.fish_species, context.weather!);
        return (b.fangIndex + bBoost) - (a.fangIndex + aBoost);
      })[0];
      
    if (weatherPick) {
      const weatherFish = getWeatherFish(context.weather);
      recommendations.push({
        id: `weather_${weatherPick.id}`,
        spotId: weatherPick.id,
        spotName: weatherPick.name,
        category: 'weather_pick',
        categoryLabel: 'Wetter-Tipp',
        categoryIcon: '🌤️',
        score: weatherPick.fangIndex,
        distance: weatherPick.distance,
        reason: `Ideal bei ${context.weather.temp.toFixed(0)}°C`,
        bestFish: weatherFish,
        timing: context.weather.description,
      });
    }
  }
  
  return recommendations;
};

// ─────────────────────────────────────────────────────────────────────────────
// HEADLINE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generiert eine kontextbezogene Headline
 * - Begrüßt den Angler passend zur Tageszeit
 * - Gibt einen sofortigen Überblick
 */
export const generateHeadline = (context: FishingContext): { headline: string; subheadline: string } => {
  let headline = '';
  let subheadline = '';
  
  switch (context.timeOfDay) {
    case 'earlyMorning':
      headline = '🌅 Früh dran!';
      subheadline = 'Die Raubfische warten schon.';
      break;
    case 'morning':
      headline = '☀️ Guten Morgen';
      subheadline = 'Noch gute Chancen bis Mittag.';
      break;
    case 'midday':
      headline = '☀️ Mittagspause?';
      subheadline = 'Grundangeln ist jetzt am besten.';
      break;
    case 'afternoon':
      headline = '🎣 Nachmittags-Session';
      subheadline = 'Gleich beginnt die goldene Stunde.';
      break;
    case 'evening':
      headline = '🌅 Goldene Stunde!';
      subheadline = 'Beste Beißzeit des Tages – los!';
      break;
    case 'night':
      headline = '🌙 Nachtangeln?';
      subheadline = context.moonPhase === 'Vollmond' 
        ? 'Vollmond macht Aale aktiv!' 
        : 'Ruhe am Wasser genießen.';
      break;
  }
  
  // Weather override for extreme conditions
  if (context.weather) {
    if (context.weather.wind_speed > 15) {
      subheadline = '💨 Vorsicht, starker Wind heute!';
    }
    if (context.weather.pressure < 1005) {
      subheadline = '📉 Druckabfall = Fische beißen!';
    }
  }
  
  return { headline, subheadline };
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

const getReason = (fangIndex: number, context: FishingContext): string => {
  if (fangIndex >= 80) return 'Hervorragende Bedingungen!';
  if (fangIndex >= 65) return 'Gute Chancen heute';
  if (context.isGoldenHour) return 'Goldene Stunde aktiv';
  return 'Ordentliche Bedingungen';
};

const getTimingMessage = (context: FishingContext): string => {
  const messages: Record<FishingContext['timeOfDay'], string> = {
    earlyMorning: 'Morgenbiss läuft!',
    morning: 'Noch 2-3h gute Zeit',
    midday: 'Ruhigere Phase',
    afternoon: 'Abendbiss startet bald',
    evening: 'Beste Beißzeit!',
    night: 'Nachtangeln',
  };
  return messages[context.timeOfDay];
};

const getWeatherBoost = (fishSpecies: string[], weather: WeatherData): number => {
  let boost = 0;
  const temp = weather.temp;
  
  // Cold water fish
  if (temp < 12 && fishSpecies.some(f => ['Forelle', 'Äsche', 'Saibling'].includes(f))) {
    boost += 15;
  }
  // Warm water fish
  if (temp > 18 && fishSpecies.some(f => ['Karpfen', 'Schleie', 'Wels'].includes(f))) {
    boost += 15;
  }
  // Cloudy = good for predators
  if (weather.clouds > 60 && fishSpecies.some(f => ['Hecht', 'Zander', 'Aal'].includes(f))) {
    boost += 10;
  }
  
  return boost;
};

const getWeatherFish = (weather: WeatherData): string[] => {
  const temp = weather.temp;
  if (temp < 10) return ['Forelle', 'Äsche'];
  if (temp < 15) return ['Hecht', 'Barsch'];
  if (temp < 22) return ['Zander', 'Karpfen'];
  return ['Karpfen', 'Wels'];
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: Get Complete Smart State
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hauptfunktion: Generiert den kompletten Smart Fishing State
 * Kombiniert alle Intelligenz-Module zu einem kohärenten Erlebnis
 */
export const getSmartFishingState = async (
  waterBodies: WaterBody[],
  userLat: number,
  userLon: number
): Promise<SmartFishingState> => {
  // 1. Detect Context
  const context = await detectFishingContext(userLat, userLon);
  
  // 2. Generate Insights
  const insights = generateInsights(context);
  
  // 3. Generate Recommendations
  const recommendations = generateRecommendations(waterBodies, context, userLat, userLon);
  
  // 4. Generate Headline
  const { headline, subheadline } = generateHeadline(context);
  
  return {
    context,
    insights,
    recommendations,
    headline,
    subheadline,
  };
};

export default {
  detectFishingContext,
  generateInsights,
  generateRecommendations,
  generateHeadline,
  getSmartFishingState,
};
