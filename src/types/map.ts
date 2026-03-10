/**
 * BISS Map Types
 */

import { SpotCategory } from '../constants/fishing';

export interface MapWaterBody {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  region: string;
  fish_species: string[];
  permit_price: number | null;
  is_assumed: boolean;
  fangIndex: number;
  fangIndexFactors?: {
    weather: number;
    water_level: number;
    moon_phase: number;
    time_of_day: number;
    solunar: number;
  };
  category: SpotCategory;
  placePhoto?: string;
  placeRating?: number;
  placeOpenNow?: boolean;
  placeHours?: string[];
  placeId?: string;
  placeAddress?: string;
  placePhone?: string;
  placeWebsite?: string;
  coordinateSource?: 'google' | 'manual' | 'osm';
  lastCaughtAt?: string;
  catchCount?: number;
  // Angelerlaubnis-Daten (Spot-Daten 2.0)
  permit_required?: boolean;
  permit_url?: string;
  permit_contact?: string;
  permit_info?: string;
  regulations?: SpotRegulations;
  // Pegel-Daten für Flüsse (Spot-Daten 2.0)
  pegelStation?: string;
  pegelLevel?: number;
  pegelTrend?: 'rising' | 'stable' | 'falling';
  pegelForecast?: string;
  // Fluss-Segment Info
  riverSegment?: string;
}

export interface SpotRegulations {
  minSizes?: Record<string, number>;
  dailyLimit?: number;
  nightFishing?: boolean;
  allowedMethods?: string[];
  specialRules?: string;
}
