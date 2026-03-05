/**
 * BISS Achievement Definitions
 * Badge-System für Gamification
 */

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'fishing' | 'exploration' | 'social' | 'streak';
  tier: 'bronze' | 'silver' | 'gold';
  requirement: number;
  trackingKey: AchievementTrackingKey;
}

export type AchievementTrackingKey =
  | 'catches_logged'
  | 'spots_visited'
  | 'spots_favorited'
  | 'spots_rated'
  | 'fish_species_caught'
  | 'license_added'
  | 'app_days_streak'
  | 'top_spots_found';

export const ACHIEVEMENTS: AchievementDef[] = [
  // ─── Fishing ───
  {
    id: 'first_catch',
    title: 'Erster Fang',
    description: 'Logge deinen ersten Fang',
    icon: '🐟',
    category: 'fishing',
    tier: 'bronze',
    requirement: 1,
    trackingKey: 'catches_logged',
  },
  {
    id: 'catch_10',
    title: 'Routine-Angler',
    description: '10 Fänge geloggt',
    icon: '🎣',
    category: 'fishing',
    tier: 'silver',
    requirement: 10,
    trackingKey: 'catches_logged',
  },
  {
    id: 'catch_50',
    title: 'Profi-Angler',
    description: '50 Fänge geloggt',
    icon: '🏆',
    category: 'fishing',
    tier: 'gold',
    requirement: 50,
    trackingKey: 'catches_logged',
  },
  {
    id: 'species_3',
    title: 'Vielseitig',
    description: '3 verschiedene Fischarten gefangen',
    icon: '🐠',
    category: 'fishing',
    tier: 'bronze',
    requirement: 3,
    trackingKey: 'fish_species_caught',
  },
  {
    id: 'species_10',
    title: 'Artenjäger',
    description: '10 verschiedene Fischarten gefangen',
    icon: '🦈',
    category: 'fishing',
    tier: 'gold',
    requirement: 10,
    trackingKey: 'fish_species_caught',
  },

  // ─── Exploration ───
  {
    id: 'first_spot',
    title: 'Entdecker',
    description: 'Besuche deinen ersten Spot',
    icon: '📍',
    category: 'exploration',
    tier: 'bronze',
    requirement: 1,
    trackingKey: 'spots_visited',
  },
  {
    id: 'spots_10',
    title: 'Wanderangler',
    description: '10 verschiedene Spots besucht',
    icon: '🗺️',
    category: 'exploration',
    tier: 'silver',
    requirement: 10,
    trackingKey: 'spots_visited',
  },
  {
    id: 'spots_25',
    title: 'Spot-Meister',
    description: '25 verschiedene Spots besucht',
    icon: '🌍',
    category: 'exploration',
    tier: 'gold',
    requirement: 25,
    trackingKey: 'spots_visited',
  },
  {
    id: 'top_spot_1',
    title: 'Goldenes Gewässer',
    description: 'Einen Spot mit Fangindex 80+ entdeckt',
    icon: '⭐',
    category: 'exploration',
    tier: 'silver',
    requirement: 1,
    trackingKey: 'top_spots_found',
  },

  // ─── Social ───
  {
    id: 'first_fav',
    title: 'Lieblingsspot',
    description: 'Speichere deinen ersten Favoriten',
    icon: '❤️',
    category: 'social',
    tier: 'bronze',
    requirement: 1,
    trackingKey: 'spots_favorited',
  },
  {
    id: 'fav_5',
    title: 'Spot-Sammler',
    description: '5 Spots favorisiert',
    icon: '💎',
    category: 'social',
    tier: 'silver',
    requirement: 5,
    trackingKey: 'spots_favorited',
  },
  {
    id: 'first_rating',
    title: 'Kritiker',
    description: 'Bewerte deinen ersten Spot',
    icon: '⭐',
    category: 'social',
    tier: 'bronze',
    requirement: 1,
    trackingKey: 'spots_rated',
  },
  {
    id: 'rating_10',
    title: 'Bewertungs-Profi',
    description: '10 Spots bewertet',
    icon: '📝',
    category: 'social',
    tier: 'silver',
    requirement: 10,
    trackingKey: 'spots_rated',
  },
  {
    id: 'license_added',
    title: 'Offiziell',
    description: 'Fischereischein hinterlegt',
    icon: '📋',
    category: 'social',
    tier: 'bronze',
    requirement: 1,
    trackingKey: 'license_added',
  },

  // ─── Streak ───
  {
    id: 'streak_3',
    title: 'Dranbleiber',
    description: '3 Tage in Folge aktiv',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    requirement: 3,
    trackingKey: 'app_days_streak',
  },
  {
    id: 'streak_7',
    title: 'Wochenangler',
    description: '7 Tage in Folge aktiv',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
    requirement: 7,
    trackingKey: 'app_days_streak',
  },
  {
    id: 'streak_30',
    title: 'Monats-Champion',
    description: '30 Tage in Folge aktiv',
    icon: '👑',
    category: 'streak',
    tier: 'gold',
    requirement: 30,
    trackingKey: 'app_days_streak',
  },
];

export const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
} as const;

export const CATEGORY_LABELS = {
  fishing: 'Angeln',
  exploration: 'Entdecken',
  social: 'Community',
  streak: 'Streaks',
} as const;
