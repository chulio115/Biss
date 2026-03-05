/**
 * BISS Fishing Constants
 * Spot-Kategorien, Fischarten, Schonzeiten, Filter
 */

// Spot Categories - USP Feature
export type SpotCategory = 'fangindex' | 'official' | 'hidden' | 'mystery';

export const SPOT_CATEGORIES = {
  fangindex: {
    id: 'fangindex',
    name: 'Fangindex',
    icon: '🎯',
    color: '#F59E0B',
    description: 'Gebietsorientierter Fangindex',
  },
  official: {
    id: 'official',
    name: 'Offiziell',
    icon: '🏕️',
    color: '#10B981',
    description: 'Angelteiche & Forellenhöfe',
  },
  hidden: {
    id: 'hidden',
    name: 'Versteckt',
    icon: '💎',
    color: '#8B5CF6',
    description: 'Kleine Teiche & Gebiete',
  },
  mystery: {
    id: 'mystery',
    name: 'Mystery',
    icon: '🔮',
    color: '#06B6D4',
    description: 'Geheimtipps - wenig frequentiert',
  },
} as const;

// Fish Season Data - Germany
export interface FishSeason {
  name: string;
  icon: string;
  schonzeit: [number, number][];
  bestMonths: number[];
}

export const FISH_SEASONS: Record<string, FishSeason> = {
  forelle: {
    name: 'Forelle',
    icon: '🐟',
    schonzeit: [[10, 3]],
    bestMonths: [4, 5, 6, 9],
  },
  karpfen: {
    name: 'Karpfen',
    icon: '🐡',
    schonzeit: [],
    bestMonths: [5, 6, 7, 8, 9],
  },
  hecht: {
    name: 'Hecht',
    icon: '🦈',
    schonzeit: [[2, 4]],
    bestMonths: [5, 6, 10, 11],
  },
  zander: {
    name: 'Zander',
    icon: '🐠',
    schonzeit: [[3, 5]],
    bestMonths: [6, 7, 8, 9, 10],
  },
  barsch: {
    name: 'Barsch',
    icon: '🎣',
    schonzeit: [],
    bestMonths: [3, 4, 5, 9, 10, 11],
  },
  aal: {
    name: 'Aal',
    icon: '🐍',
    schonzeit: [],
    bestMonths: [5, 6, 7, 8, 9],
  },
  wels: {
    name: 'Wels',
    icon: '🐋',
    schonzeit: [[5, 6]],
    bestMonths: [7, 8, 9],
  },
};

// Fish filter options for map
export const FISH_FILTERS = [
  { id: 'forelle', name: 'Forelle', confidence: 'high' as const },
  { id: 'karpfen', name: 'Karpfen', confidence: 'high' as const },
  { id: 'hecht', name: 'Hecht', confidence: 'medium' as const },
  { id: 'zander', name: 'Zander', confidence: 'medium' as const },
  { id: 'barsch', name: 'Barsch', confidence: 'high' as const },
  { id: 'aal', name: 'Aal', confidence: 'low' as const },
];

// Water type translations
export const WATER_TYPE_NAMES: Record<string, string> = {
  lake: 'See',
  pond: 'Teich',
  river: 'Fluss',
  stream: 'Bach',
  canal: 'Kanal',
  reservoir: 'Stausee',
  see: 'See',
  teich: 'Teich',
  angelteich: 'Angelteich',
  forellenteich: 'Forellenteich',
  karpfenteich: 'Karpfenteich',
  fluss: 'Fluss',
};
