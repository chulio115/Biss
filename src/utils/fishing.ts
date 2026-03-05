/**
 * BISS Fishing Utilities
 * Sun times, golden hour, fish season logic, coordinate corrections, distance
 */

import { FISH_SEASONS, WATER_TYPE_NAMES, SpotCategory } from '../constants/fishing';

// ─── Sun Time Calculation ───

export const calculateSunTimes = (
  lat: number,
  lng: number
): { sunrise: Date; sunset: Date; goldenHour: { morning: Date; evening: Date } } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const zenith = 90.833;
  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;

  const lngHour = lng / 15;
  const t_rise = dayOfYear + (6 - lngHour) / 24;
  const t_set = dayOfYear + (18 - lngHour) / 24;

  const M_rise = 0.9856 * t_rise - 3.289;
  const M_set = 0.9856 * t_set - 3.289;

  let L_rise =
    M_rise + 1.916 * Math.sin(M_rise * D2R) + 0.02 * Math.sin(2 * M_rise * D2R) + 282.634;
  let L_set =
    M_set + 1.916 * Math.sin(M_set * D2R) + 0.02 * Math.sin(2 * M_set * D2R) + 282.634;

  L_rise = L_rise % 360;
  L_set = L_set % 360;

  const sinDec_rise = 0.39782 * Math.sin(L_rise * D2R);
  const sinDec_set = 0.39782 * Math.sin(L_set * D2R);
  const cosDec_rise = Math.cos(Math.asin(sinDec_rise));
  const cosDec_set = Math.cos(Math.asin(sinDec_set));

  const cosH_rise =
    (Math.cos(zenith * D2R) - sinDec_rise * Math.sin(lat * D2R)) /
    (cosDec_rise * Math.cos(lat * D2R));
  const cosH_set =
    (Math.cos(zenith * D2R) - sinDec_set * Math.sin(lat * D2R)) /
    (cosDec_set * Math.cos(lat * D2R));

  const H_rise = 360 - Math.acos(cosH_rise) * R2D;
  const H_set = Math.acos(cosH_set) * R2D;

  const T_rise = H_rise / 15 + 0.06571 * t_rise - 6.622 - lngHour + 1;
  const T_set = H_set / 15 + 0.06571 * t_set - 6.622 - lngHour + 1;

  const sunrise = new Date(now);
  sunrise.setHours(Math.floor(T_rise % 24), Math.floor((T_rise % 1) * 60), 0);

  const sunset = new Date(now);
  sunset.setHours(Math.floor(T_set % 24), Math.floor((T_set % 1) * 60), 0);

  const goldenMorning = new Date(sunrise.getTime() + 60 * 60 * 1000);
  const goldenEvening = new Date(sunset.getTime() - 60 * 60 * 1000);

  return { sunrise, sunset, goldenHour: { morning: goldenMorning, evening: goldenEvening } };
};

export const isGoldenHour = (
  lat: number,
  lng: number
): { isGolden: boolean; nextGolden: string } => {
  const now = new Date();
  const { sunrise, sunset, goldenHour } = calculateSunTimes(lat, lng);

  const nearSunrise = Math.abs(now.getTime() - sunrise.getTime()) < 60 * 60 * 1000;
  const nearSunset = Math.abs(now.getTime() - sunset.getTime()) < 60 * 60 * 1000;

  if (nearSunrise || nearSunset) {
    return { isGolden: true, nextGolden: 'JETZT! 🔥' };
  }

  if (now < goldenHour.morning) {
    return {
      isGolden: false,
      nextGolden: `${goldenHour.morning.getHours()}:${String(goldenHour.morning.getMinutes()).padStart(2, '0')}`,
    };
  } else if (now < goldenHour.evening) {
    return {
      isGolden: false,
      nextGolden: `${goldenHour.evening.getHours()}:${String(goldenHour.evening.getMinutes()).padStart(2, '0')}`,
    };
  }

  return { isGolden: false, nextGolden: 'Morgen früh' };
};

// ─── Fish Season Logic ───

const isBesatzteich = (spotName: string, spotType: string): boolean => {
  const nameLower = spotName.toLowerCase();
  const typeLower = spotType.toLowerCase();
  const besatzKeywords = [
    'forellenteich', 'forellenhof', 'angelteich', 'angelpark',
    'fischteich', 'karpfenteich', 'put and take', 'put & take',
  ];
  return besatzKeywords.some((keyword) => nameLower.includes(keyword) || typeLower.includes(keyword));
};

export const getFishSeasonStatus = (
  fishName: string,
  options?: { spotName?: string; spotType?: string }
): 'open' | 'closed' | 'best' => {
  const fish = FISH_SEASONS[fishName.toLowerCase()];
  if (!fish) return 'open';

  const currentMonth = new Date().getMonth() + 1;

  if (options?.spotName && options?.spotType) {
    if (isBesatzteich(options.spotName, options.spotType)) {
      const besatzFische = ['forelle', 'saibling', 'regenbogenforelle', 'bachforelle', 'lachs'];
      if (besatzFische.includes(fishName.toLowerCase())) {
        if (fish.bestMonths.includes(currentMonth)) return 'best';
        return 'open';
      }
    }
  }

  for (const [start, end] of fish.schonzeit) {
    if (start <= end) {
      if (currentMonth >= start && currentMonth <= end) return 'closed';
    } else {
      if (currentMonth >= start || currentMonth <= end) return 'closed';
    }
  }

  if (fish.bestMonths.includes(currentMonth)) return 'best';
  return 'open';
};

// ─── Water Type Name ───

export const getWaterTypeName = (type: string): string => {
  if (!type) return 'Gewässer';
  const normalized = type.toLowerCase().trim();
  return WATER_TYPE_NAMES[normalized] || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

// ─── Category Detection ───

export const detectCategory = (wb: any): SpotCategory => {
  const name = wb.name?.toLowerCase() || '';
  const type = wb.type?.toLowerCase() || '';

  const officialKeywords = [
    'angelteich', 'forellenteich', 'forellenhof', 'fischzucht',
    'angelsee', 'angelpark', 'angelverein',
  ];
  const hasGooglePlace = wb.placeId || wb.place_id;
  if (officialKeywords.some((k) => name.includes(k)) || hasGooglePlace) {
    return 'official';
  }

  if ((type === 'pond' || type.includes('teich')) && !name.includes('see') && !name.includes('angel')) {
    return 'hidden';
  }

  return 'fangindex';
};

// ─── Coordinate Corrections ───

const KNOWN_SPOT_CORRECTIONS: Record<string, { lat: number; lng: number }> = {
  // Bendestorf Area - Corrected to actual pond locations (Bendestorfer Mühle complex)
  'Forellenhof Bendestorf': { lat: 53.3395, lng: 9.9785 },
  'Forellenteich Bendestorf': { lat: 53.3395, lng: 9.9785 },
  'Angelsee Bendestorfer Mühle': { lat: 53.3390, lng: 9.9800 },
  // Jesteburg Area
  'Angelteich Jesteburg': { lat: 53.3035, lng: 9.9618 },
  'Forellenteich Jesteburg': { lat: 53.3035, lng: 9.9618 },
  'Mühlenteich Jesteburg': { lat: 53.3067, lng: 9.9667 },
  // Buchholz Area
  'Angelteich Buchholz': { lat: 53.3281, lng: 9.88 },
  'Buchholzer Stadtteich': { lat: 53.3267, lng: 9.8667 },
  // Seevetal Area
  'Forellenteich Seevetal': { lat: 53.418, lng: 10.0325 },
  'Seevetal See': { lat: 53.3833, lng: 9.9667 },
  // Hittfeld Area
  'Angelteich Hittfeld': { lat: 53.3632, lng: 9.9831 },
  'Forellenteich Hittfeld': { lat: 53.3632, lng: 9.9831 },
  // Harmstorf / Helmstorf Area
  'Angelteich Harmstorf': { lat: 53.3600, lng: 10.0100 },
  'Waldteich Helmstorf': { lat: 53.3700, lng: 10.0300 },
};

export const getCorrectedCoordinates = (
  name: string,
  originalLat: number,
  originalLng: number,
  googleLat?: number,
  googleLng?: number
) => {
  if (googleLat && googleLng) {
    return { lat: googleLat, lng: googleLng, source: 'google' as const };
  }
  const correction = KNOWN_SPOT_CORRECTIONS[name];
  if (correction) {
    return { lat: correction.lat, lng: correction.lng, source: 'manual' as const };
  }
  return { lat: originalLat, lng: originalLng, source: 'osm' as const };
};

// ─── Distance Calculation ───

export const getDistanceKm = (
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (
  lon: number,
  lat: number,
  userLocation: [number, number]
): string => {
  const d = getDistanceKm(userLocation[0], userLocation[1], lon, lat);
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
};
