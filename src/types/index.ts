// BISS App - Type Definitions

export interface User {
  id: string;
  email: string;
  full_name?: string;
  fishing_license_verified: boolean;
  created_at: string;
}

export interface FishingLicense {
  id: string;
  user_id: string;
  license_number: string;
  issuing_authority: string;
  valid_from: string;
  valid_until: string;
  image_url?: string;
  verified: boolean;
  ocr_data?: OCRResult;
}

export interface OCRResult {
  raw_text: string;
  extracted_data: {
    name?: string;
    license_number?: string;
    valid_until?: string;
    issuing_authority?: string;
  };
  confidence: number;
}

export interface WaterBody {
  id: string;
  name: string;
  type: 'see' | 'fluss' | 'teich' | 'kanal';
  latitude: number;
  longitude: number;
  region: string;
  fish_species: string[];
  requires_permit: boolean;
  permit_price?: number;
}

export interface FangIndex {
  score: number; // 0-100
  reasoning: string;
  factors: {
    weather: number;
    water_level: number;
    moon_phase: number;
    time_of_day: number;
    solunar?: number;
  };
  best_fish: string[];
  recommendation: string;
  solunar?: {
    moonrise: Date | null;
    moonset: Date | null;
    moonTransit: Date | null;
    moonUnderfoot: Date | null;
    periods: Array<{ type: 'major' | 'minor'; start: Date; end: Date; label: string }>;
    currentPeriod: { type: 'major' | 'minor'; start: Date; end: Date; label: string } | null;
    nextPeriod: { type: 'major' | 'minor'; start: Date; end: Date; label: string } | null;
    solunarScore: number;
  };
}

export interface WeatherData {
  temp: number;
  pressure: number;
  humidity: number;
  wind_speed: number;
  clouds: number;
  description: string;
}

export interface PegelData {
  station: string;
  water_level: number;
  trend: 'steigend' | 'fallend' | 'gleichbleibend';
  timestamp: string;
}

export interface Catch {
  id: string;
  user_id: string;
  water_body_id?: string;
  water_body_name: string;
  fish_species: string;
  weight_kg?: number;
  length_cm?: number;
  method?: string;
  bait?: string;
  photo_url?: string;
  notes?: string;
  weather_temp?: number;
  weather_desc?: string;
  fang_index?: number;
  latitude?: number;
  longitude?: number;
  caught_at: string;
  created_at: string;
  updated_at: string;
}
