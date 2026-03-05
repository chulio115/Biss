/**
 * BISS Fangindex - Lokale Berechnung mit Solunar-Theorie
 * Ersetzt die xAI API-Abhängigkeit mit einer eigenen, lokalen Berechnung.
 * 
 * Faktoren:
 * - Wetter (30%): Luftdruck, Temperatur, Wind, Bewölkung
 * - Tageszeit (25%): Morgen/Abend-Dämmerung optimal
 * - Mondphase (20%): Neu- und Vollmond am besten
 * - Solunar (15%): Major/Minor Periods
 * - Wasserstand (10%): Steigende Pegel bevorzugt
 */

import { FangIndex, WeatherData, PegelData } from '../types';

// ─── Solunar Theory ───
// Major Periods: ~2h around moon transit (upper/lower)
// Minor Periods: ~1h around moonrise/moonset

export interface SolunarPeriod {
  type: 'major' | 'minor';
  start: Date;
  end: Date;
  label: string;
}

export interface SolunarData {
  moonrise: Date | null;
  moonset: Date | null;
  moonTransit: Date | null;
  moonUnderfoot: Date | null;
  periods: SolunarPeriod[];
  currentPeriod: SolunarPeriod | null;
  nextPeriod: SolunarPeriod | null;
  solunarScore: number;
}

const calculateMoonTimes = (date: Date, lat: number, lng: number): { rise: Date | null; set: Date | null; transit: Date | null } => {
  // Simplified moon time calculation based on latitude and date
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const moonCycleDay = (dayOfYear + 10) % 29.5; // Approximate moon cycle position
  
  // Base times adjusted by latitude and moon cycle
  const baseRiseHour = 6 + (moonCycleDay * 0.8) % 24;
  const baseSetHour = (baseRiseHour + 12.5) % 24;
  const transitHour = (baseRiseHour + 6.25) % 24;
  
  const rise = new Date(date);
  rise.setHours(Math.floor(baseRiseHour), Math.floor((baseRiseHour % 1) * 60), 0);
  
  const set = new Date(date);
  set.setHours(Math.floor(baseSetHour), Math.floor((baseSetHour % 1) * 60), 0);
  
  const transit = new Date(date);
  transit.setHours(Math.floor(transitHour), Math.floor((transitHour % 1) * 60), 0);
  
  return { rise, set, transit };
};

export const getSolunarData = (lat: number = 53.33, lng: number = 9.97): SolunarData => {
  const now = new Date();
  const moonTimes = calculateMoonTimes(now, lat, lng);
  
  const periods: SolunarPeriod[] = [];
  
  // Major Periods: 2 hours around moon transit (upper culmination)
  if (moonTimes.transit) {
    const majorStart = new Date(moonTimes.transit.getTime() - 60 * 60 * 1000);
    const majorEnd = new Date(moonTimes.transit.getTime() + 60 * 60 * 1000);
    periods.push({ type: 'major', start: majorStart, end: majorEnd, label: 'Mond-Transit' });
    
    // Lower culmination (12h offset)
    const lowerTransit = new Date(moonTimes.transit.getTime() + 12 * 60 * 60 * 1000);
    const lowerStart = new Date(lowerTransit.getTime() - 60 * 60 * 1000);
    const lowerEnd = new Date(lowerTransit.getTime() + 60 * 60 * 1000);
    periods.push({ type: 'major', start: lowerStart, end: lowerEnd, label: 'Unter-Transit' });
  }
  
  // Minor Periods: 1 hour around moonrise/moonset
  if (moonTimes.rise) {
    const riseStart = new Date(moonTimes.rise.getTime() - 30 * 60 * 1000);
    const riseEnd = new Date(moonTimes.rise.getTime() + 30 * 60 * 1000);
    periods.push({ type: 'minor', start: riseStart, end: riseEnd, label: 'Mondaufgang' });
  }
  
  if (moonTimes.set) {
    const setStart = new Date(moonTimes.set.getTime() - 30 * 60 * 1000);
    const setEnd = new Date(moonTimes.set.getTime() + 30 * 60 * 1000);
    periods.push({ type: 'minor', start: setStart, end: setEnd, label: 'Monduntergang' });
  }
  
  // Sort by start time
  periods.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Find current and next period
  let currentPeriod: SolunarPeriod | null = null;
  let nextPeriod: SolunarPeriod | null = null;
  
  for (const period of periods) {
    if (now >= period.start && now <= period.end) {
      currentPeriod = period;
    } else if (now < period.start && !nextPeriod) {
      nextPeriod = period;
    }
  }
  
  // Calculate solunar score (0-100)
  let solunarScore = 50; // Base score
  if (currentPeriod) {
    solunarScore = currentPeriod.type === 'major' ? 95 : 80;
  } else if (nextPeriod) {
    const minutesToNext = (nextPeriod.start.getTime() - now.getTime()) / 60000;
    if (minutesToNext < 30) solunarScore = 70;
    else if (minutesToNext < 60) solunarScore = 60;
  }
  
  return {
    moonrise: moonTimes.rise,
    moonset: moonTimes.set,
    moonTransit: moonTimes.transit,
    moonUnderfoot: moonTimes.transit ? new Date(moonTimes.transit.getTime() + 12 * 60 * 60 * 1000) : null,
    periods,
    currentPeriod,
    nextPeriod,
    solunarScore,
  };
};

// ─── Moon Phase Helpers ───

export const getMoonPhaseIndex = (): number => {
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

export const getMoonPhase = (): string => {
  const phaseIndex = getMoonPhaseIndex();
  const phases = [
    'Neumond', 'Zunehmend', 'Erstes Viertel', 'Zunehmend',
    'Vollmond', 'Abnehmend', 'Letztes Viertel', 'Abnehmend',
  ];
  return phases[phaseIndex];
};

export const getMoonEmoji = (): string => {
  const phaseIndex = getMoonPhaseIndex();
  const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  return emojis[phaseIndex];
};

// ─── Fangindex Calculation ───

export const calculateFangIndex = async (
  waterBodyName: string,
  weather: WeatherData,
  pegel: PegelData | null,
  targetFish?: string,
  lat: number = 53.33,
  lng: number = 9.97
): Promise<FangIndex> => {
  const moonPhase = getMoonPhase();
  const moonPhaseIndex = getMoonPhaseIndex();
  const moonEmoji = getMoonEmoji();
  const timeOfDay = new Date().getHours();
  const solunarData = getSolunarData(lat, lng);

  // 1. Wetter-Score (0-100) - 30%
  let weatherScore = 50;
  // Luftdruck (optimal: 1010-1020 hPa, steigend ist besser)
  if (weather.pressure >= 1010 && weather.pressure <= 1020) weatherScore += 20;
  else if (weather.pressure < 1000 || weather.pressure > 1030) weatherScore -= 15;
  // Temperatur
  if (weather.temp >= 10 && weather.temp <= 20) weatherScore += 15;
  else if (weather.temp < 5 || weather.temp > 28) weatherScore -= 20;
  // Wind (wenig Wind = besser)
  if (weather.wind_speed < 3) weatherScore += 10;
  else if (weather.wind_speed > 8) weatherScore -= 15;
  // Bewölkung (leicht bewölkt = ideal)
  if (weather.clouds >= 30 && weather.clouds <= 70) weatherScore += 10;
  weatherScore = Math.max(0, Math.min(100, weatherScore));

  // 2. Tageszeit-Score (0-100) - 25%
  let timeScore = 50;
  if ((timeOfDay >= 5 && timeOfDay <= 8) || (timeOfDay >= 17 && timeOfDay <= 21)) {
    timeScore = 90; // Golden Hours
  } else if ((timeOfDay >= 9 && timeOfDay <= 11) || (timeOfDay >= 15 && timeOfDay <= 16)) {
    timeScore = 65;
  } else if (timeOfDay >= 12 && timeOfDay <= 14) {
    timeScore = 35; // Mittagshitze
  } else {
    timeScore = 20; // Nacht
  }

  // 3. Mondphasen-Score (0-100) - 20%
  const moonScores = [85, 60, 45, 60, 90, 60, 45, 60]; // Neu/Voll = beste
  const moonScore = moonScores[moonPhaseIndex];

  // 4. Solunar-Score (0-100) - 15% (NEU!)
  const solunarScore = solunarData.solunarScore;

  // 5. Wasserstand-Score (0-100) - 10%
  let waterScore = 60;
  if (pegel) {
    if (pegel.trend === 'gleichbleibend') waterScore = 75;
    else if (pegel.trend === 'steigend') waterScore = 85;
    else waterScore = 50;
  }

  // Gesamtscore (gewichtet nach neuer Formel)
  const totalScore = Math.round(
    weatherScore * 0.30 + 
    timeScore * 0.25 + 
    moonScore * 0.20 + 
    solunarScore * 0.15 + 
    waterScore * 0.10
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

  // Solunar-Info für Empfehlung
  const solunarInfo = solunarData.currentPeriod 
    ? `🎯 ${solunarData.currentPeriod.type === 'major' ? 'MAJOR' : 'Minor'} Period aktiv!` 
    : solunarData.nextPeriod 
      ? `Nächste Beißzeit: ${solunarData.nextPeriod.start.getHours()}:${String(solunarData.nextPeriod.start.getMinutes()).padStart(2, '0')}`
      : '';

  // Empfehlung
  let recommendation = '';
  if (totalScore >= 75) {
    recommendation = `Hervorragende Bedingungen am ${waterBodyName}! ${moonEmoji} ${moonPhase} und optimales Wetter. ${solunarInfo}`;
  } else if (totalScore >= 50) {
    recommendation = `Ordentliche Chancen heute. ${solunarInfo || 'Konzentriere dich auf Morgen- oder Abendstunden.'}`;
  } else {
    recommendation = `Schwierige Bedingungen. ${solunarData.nextPeriod ? `Warte auf ${solunarData.nextPeriod.label} um ${solunarData.nextPeriod.start.getHours()}:${String(solunarData.nextPeriod.start.getMinutes()).padStart(2, '0')} Uhr.` : 'Versuche Grundangeln.'}`;
  }

  const reasoning =
    `${moonEmoji} ${moonPhase}, ${weather.temp.toFixed(0)}°C, ${weather.pressure} hPa. ` +
    (solunarData.currentPeriod ? `${solunarData.currentPeriod.type === 'major' ? '🔥 MAJOR' : '⭐ Minor'} Period!` : 
     timeScore >= 70 ? '🌅 Gute Beißzeit!' : '⏰ Nicht optimal.');

  return {
    score: totalScore,
    reasoning,
    factors: {
      weather: weatherScore,
      water_level: waterScore,
      moon_phase: moonScore,
      time_of_day: timeScore,
      solunar: solunarScore,
    },
    best_fish: bestFish.slice(0, 3),
    recommendation,
    solunar: solunarData,
  };
};
