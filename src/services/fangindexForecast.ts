/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BISS FANGINDEX FORECAST SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "Bester Tag diese Woche" — Kombiniert DWD Wettervorhersage mit Solunar-Daten
 * und Mondphasen zu einer 7-Tage Fangindex-Prognose.
 * 
 * Keine andere Angel-App in Deutschland kann das.
 * Alle Daten kostenlos (DWD + lokale Berechnung).
 */

import { getDWDForecast } from './weatherDWD';

// ─── Types ───

export interface ForecastHour {
  timestamp: Date;
  score: number;
  factors: {
    weather: number;
    timeOfDay: number;
    moonPhase: number;
    solunar: number;
  };
  weather: {
    temp: number;
    windSpeed: number;
    clouds: number;
    precipitation: number;
    icon: string;
    condition: string;
  };
  isGoldenHour: boolean;
  isSolunarPeriod: boolean;
  solunarType?: 'major' | 'minor';
}

export interface ForecastDay {
  date: Date;
  dateLabel: string;
  dayScore: number;
  bestHour: ForecastHour;
  worstHour: ForecastHour;
  hours: ForecastHour[];
  moonPhase: string;
  moonEmoji: string;
  weatherSummary: string;
  recommendation: string;
}

export interface WeekForecast {
  days: ForecastDay[];
  bestDay: ForecastDay;
  bestMoment: ForecastHour;
  generatedAt: Date;
}

// ─── Score Calculation (same logic as fangindex.ts, adapted for forecast) ───

const calculateWeatherScore = (temp: number, windSpeed: number, clouds: number, precipitation: number): number => {
  let score = 50;

  // Luftdruck nicht in Forecast, aber Temperatur/Wind/Wolken
  if (temp >= 10 && temp <= 20) score += 15;
  else if (temp >= 5 && temp <= 25) score += 5;
  else if (temp < 5 || temp > 28) score -= 20;

  // Wind (m/s)
  if (windSpeed < 3) score += 15;
  else if (windSpeed < 5) score += 5;
  else if (windSpeed > 8) score -= 15;
  else if (windSpeed > 12) score -= 25;

  // Bewölkung (leicht bewölkt = ideal)
  if (clouds >= 30 && clouds <= 70) score += 10;
  else if (clouds > 90) score -= 5;

  // Niederschlag (leichter Regen ok, starker schlecht)
  if (precipitation > 0 && precipitation < 1) score += 5;
  else if (precipitation >= 1 && precipitation < 3) score -= 5;
  else if (precipitation >= 3) score -= 20;

  return Math.max(0, Math.min(100, score));
};

const calculateTimeScore = (hour: number): number => {
  // Golden Hours: Morgen/Abend-Dämmerung
  if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 21)) return 90;
  if ((hour >= 9 && hour <= 11) || (hour >= 15 && hour <= 16)) return 65;
  if (hour >= 12 && hour <= 14) return 35;
  return 20; // Nacht
};

const calculateMoonScore = (date: Date): { score: number; phase: string; emoji: string } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  const phaseIndex = Math.floor((phase - Math.floor(phase)) * 8);

  const scores = [85, 60, 45, 60, 90, 60, 45, 60];
  const phases = ['Neumond', 'Zunehmend', 'Erstes Viertel', 'Zunehmend', 'Vollmond', 'Abnehmend', 'Letztes Viertel', 'Abnehmend'];
  const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  return { score: scores[phaseIndex], phase: phases[phaseIndex], emoji: emojis[phaseIndex] };
};

const calculateSolunarScore = (date: Date, lat: number, lng: number): { score: number; isPeriod: boolean; type?: 'major' | 'minor' } => {
  const hour = date.getHours();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const moonCycleDay = (dayOfYear + 10) % 29.5;

  // Approximate moon transit hour for this day
  const transitHour = (6 + (moonCycleDay * 0.8) + 6.25) % 24;
  const lowerTransitHour = (transitHour + 12) % 24;
  const riseHour = (6 + (moonCycleDay * 0.8)) % 24;
  const setHour = (riseHour + 12.5) % 24;

  // Check if current hour falls in a solunar period
  const isNearHour = (target: number, range: number) => {
    const diff = Math.abs(hour - target);
    return diff <= range || diff >= (24 - range);
  };

  // Major: ±1h around transit
  if (isNearHour(transitHour, 1) || isNearHour(lowerTransitHour, 1)) {
    return { score: 95, isPeriod: true, type: 'major' };
  }
  // Minor: ±0.5h around rise/set
  if (isNearHour(riseHour, 0.5) || isNearHour(setHour, 0.5)) {
    return { score: 80, isPeriod: true, type: 'minor' };
  }
  // Close to a period
  if (isNearHour(transitHour, 2) || isNearHour(lowerTransitHour, 2)) {
    return { score: 65, isPeriod: false };
  }

  return { score: 50, isPeriod: false };
};

// ─── Main Forecast Function ───

/**
 * Berechnet eine 48h Fangindex-Prognose für eine Position
 * Nutzt DWD Bright Sky API (kostenlos) + lokale Solunar-Berechnung
 */
export const getFangindexForecast = async (
  lat: number = 53.33,
  lng: number = 9.97
): Promise<WeekForecast> => {
  // DWD 48h Vorhersage holen
  const dwdForecast = await getDWDForecast(lat, lng);

  if (dwdForecast.length === 0) {
    throw new Error('Keine DWD-Vorhersagedaten verfügbar');
  }

  // Für jeden Stunde einen ForecastHour berechnen
  const forecastHours: ForecastHour[] = dwdForecast.map((dwd) => {
    const timestamp = new Date(dwd.timestamp);
    const hour = timestamp.getHours();

    const weatherScore = calculateWeatherScore(dwd.temp, dwd.wind_speed, dwd.clouds, dwd.precipitation);
    const timeScore = calculateTimeScore(hour);
    const moonData = calculateMoonScore(timestamp);
    const solunarData = calculateSolunarScore(timestamp, lat, lng);

    const totalScore = Math.round(
      weatherScore * 0.30 +
      timeScore * 0.25 +
      moonData.score * 0.20 +
      solunarData.score * 0.15 +
      60 * 0.10 // Wasserstand: default 60 (kein Forecast)
    );

    const isGoldenHour = (hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 21);

    return {
      timestamp,
      score: totalScore,
      factors: {
        weather: weatherScore,
        timeOfDay: timeScore,
        moonPhase: moonData.score,
        solunar: solunarData.score,
      },
      weather: {
        temp: dwd.temp,
        windSpeed: dwd.wind_speed,
        clouds: dwd.clouds,
        precipitation: dwd.precipitation,
        icon: dwd.icon,
        condition: dwd.condition,
      },
      isGoldenHour,
      isSolunarPeriod: solunarData.isPeriod,
      solunarType: solunarData.type,
    };
  });

  // Gruppierung nach Tag
  const dayMap = new Map<string, ForecastHour[]>();
  for (const fh of forecastHours) {
    const key = fh.timestamp.toISOString().split('T')[0];
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(fh);
  }

  // ForecastDays erstellen
  const days: ForecastDay[] = [];
  for (const [dateKey, hours] of dayMap.entries()) {
    if (hours.length < 4) continue; // Brauchen mindestens 4h Daten

    const date = new Date(dateKey);
    const moonData = calculateMoonScore(date);

    // Tages-Score: Durchschnitt der Anglerrelevanten Stunden (5-22 Uhr)
    const fishingHours = hours.filter(h => {
      const hr = h.timestamp.getHours();
      return hr >= 5 && hr <= 22;
    });
    const dayScore = fishingHours.length > 0
      ? Math.round(fishingHours.reduce((sum, h) => sum + h.score, 0) / fishingHours.length)
      : Math.round(hours.reduce((sum, h) => sum + h.score, 0) / hours.length);

    const bestHour = hours.reduce((best, h) => h.score > best.score ? h : best, hours[0]);
    const worstHour = hours.reduce((worst, h) => h.score < worst.score ? h : worst, hours[0]);

    // Wetter-Zusammenfassung
    const avgTemp = Math.round(fishingHours.reduce((s, h) => s + h.weather.temp, 0) / (fishingHours.length || 1));
    const maxPrec = Math.max(...hours.map(h => h.weather.precipitation));
    const avgWind = Math.round(fishingHours.reduce((s, h) => s + h.weather.windSpeed, 0) / (fishingHours.length || 1) * 10) / 10;

    let weatherSummary = `${avgTemp}°C`;
    if (maxPrec > 3) weatherSummary += ', Regen';
    else if (maxPrec > 0) weatherSummary += ', leichter Regen';
    if (avgWind > 6) weatherSummary += ', windig';

    // Empfehlung
    let recommendation = '';
    if (dayScore >= 75) {
      recommendation = `Hervorragender Angeltag! Beste Zeit: ${formatHour(bestHour.timestamp)}`;
    } else if (dayScore >= 60) {
      recommendation = `Guter Tag zum Angeln. ${formatHour(bestHour.timestamp)} ist optimal`;
    } else if (dayScore >= 45) {
      recommendation = `Durchschnittlich. Am besten um ${formatHour(bestHour.timestamp)}`;
    } else {
      recommendation = `Schwierige Bedingungen. Wenn, dann um ${formatHour(bestHour.timestamp)}`;
    }

    if (bestHour.isSolunarPeriod) {
      recommendation += bestHour.solunarType === 'major'
        ? ' 🔥 MAJOR Beißzeit!'
        : ' ⭐ Solunar-Fenster!';
    }

    days.push({
      date,
      dateLabel: formatDayLabel(date),
      dayScore,
      bestHour,
      worstHour,
      hours,
      moonPhase: moonData.phase,
      moonEmoji: moonData.emoji,
      weatherSummary,
      recommendation,
    });
  }

  // Sortiere nach Datum
  days.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Bester Tag + bester Moment
  const bestDay = days.reduce((best, d) => d.dayScore > best.dayScore ? d : best, days[0]);
  const bestMoment = forecastHours.reduce((best, h) => h.score > best.score ? h : best, forecastHours[0]);

  return {
    days,
    bestDay,
    bestMoment,
    generatedAt: new Date(),
  };
};

// ─── Helpers ───

const formatHour = (date: Date): string => {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} Uhr`;
};

const formatDayLabel = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Morgen';
  if (diffDays === 2) return 'Übermorgen';

  return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
};

/**
 * Gibt einen kurzen Tipp basierend auf der Prognose
 * Für Push-Notifications und Dashboard
 */
export const getForecastTip = (forecast: WeekForecast): string => {
  const best = forecast.bestMoment;
  const bestDay = forecast.bestDay;

  if (best.score >= 80) {
    return `🔥 ${bestDay.dateLabel} um ${formatHour(best.timestamp)}: Fangindex ${best.score}! ${best.isSolunarPeriod ? 'Solunar-Fenster!' : 'Perfektes Wetter!'}`;
  }
  if (best.score >= 65) {
    return `👍 ${bestDay.dateLabel}: Fangindex ${best.score}. Beste Zeit ${formatHour(best.timestamp)}`;
  }
  return `📊 Bester Moment: ${bestDay.dateLabel} ${formatHour(best.timestamp)} (Score: ${best.score})`;
};

/**
 * Erstellt die Score-Farbe (gleiche Logik wie getScoreColor)
 */
export const getForecastScoreColor = (score: number): string => {
  if (score >= 70) return '#4ADE80';
  if (score >= 50) return '#FACC15';
  return '#EF4444';
};

export default {
  getFangindexForecast,
  getForecastTip,
  getForecastScoreColor,
};
