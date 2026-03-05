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
}
