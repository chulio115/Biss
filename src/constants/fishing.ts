/**
 * BISS Fishing Constants
 * Spot-Kategorien, Fischarten, Schonzeiten, Filter
 */

// Spot Categories - USP Feature
export type SpotCategory = 'fangindex' | 'official' | 'hidden' | 'mystery' | 'river';

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
  river: {
    id: 'river',
    name: 'Fluss',
    icon: '🌊',
    color: '#3B82F6',
    description: 'Flüsse & Kanäle',
  },
} as const;

// Fish Season Data - Germany
export interface FishSeason {
  name: string;
  icon: string;
  schonzeit: [number, number][];
  bestMonths: number[];
  minSizes?: Record<string, number>;
}

export const FISH_SEASONS: Record<string, FishSeason> = {
  forelle: {
    name: 'Forelle',
    icon: '🐟',
    schonzeit: [[10, 3]],
    bestMonths: [4, 5, 6, 9],
    minSizes: { 'Niedersachsen': 25, 'Hamburg': 25, 'Schleswig-Holstein': 25 },
  },
  karpfen: {
    name: 'Karpfen',
    icon: '🐡',
    schonzeit: [],
    bestMonths: [5, 6, 7, 8, 9],
    minSizes: { 'Niedersachsen': 35, 'Hamburg': 35, 'Schleswig-Holstein': 35 },
  },
  hecht: {
    name: 'Hecht',
    icon: '🦈',
    schonzeit: [[2, 4]],
    bestMonths: [5, 6, 10, 11],
    minSizes: { 'Niedersachsen': 50, 'Hamburg': 50, 'Schleswig-Holstein': 45 },
  },
  zander: {
    name: 'Zander',
    icon: '🐠',
    schonzeit: [[3, 5]],
    bestMonths: [6, 7, 8, 9, 10],
    minSizes: { 'Niedersachsen': 45, 'Hamburg': 45, 'Schleswig-Holstein': 40 },
  },
  barsch: {
    name: 'Barsch',
    icon: '🎣',
    schonzeit: [],
    bestMonths: [3, 4, 5, 9, 10, 11],
    minSizes: {},
  },
  aal: {
    name: 'Aal',
    icon: '🐍',
    schonzeit: [],
    bestMonths: [5, 6, 7, 8, 9],
    minSizes: { 'Niedersachsen': 45, 'Hamburg': 45, 'Schleswig-Holstein': 45 },
  },
  wels: {
    name: 'Wels',
    icon: '🐋',
    schonzeit: [[5, 6]],
    bestMonths: [7, 8, 9],
    minSizes: { 'Niedersachsen': 0, 'Hamburg': 0, 'Schleswig-Holstein': 0 },
  },
  schleie: {
    name: 'Schleie',
    icon: '🐟',
    schonzeit: [],
    bestMonths: [5, 6, 7, 8, 9],
    minSizes: { 'Niedersachsen': 25, 'Hamburg': 25, 'Schleswig-Holstein': 25 },
  },
  brassen: {
    name: 'Brassen',
    icon: '🐟',
    schonzeit: [],
    bestMonths: [5, 6, 7, 8, 9],
    minSizes: {},
  },
  rotauge: {
    name: 'Rotauge',
    icon: '🐟',
    schonzeit: [],
    bestMonths: [4, 5, 6, 9, 10],
    minSizes: {},
  },
  doebel: {
    name: 'Döbel',
    icon: '🐟',
    schonzeit: [],
    bestMonths: [5, 6, 7, 8, 9],
    minSizes: {},
  },
  rapfen: {
    name: 'Rapfen',
    icon: '🐟',
    schonzeit: [],
    bestMonths: [6, 7, 8, 9],
    minSizes: { 'Niedersachsen': 40, 'Schleswig-Holstein': 40 },
  },
  barbe: {
    name: 'Barbe',
    icon: '🐟',
    schonzeit: [[5, 6]],
    bestMonths: [7, 8, 9],
    minSizes: { 'Niedersachsen': 35 },
  },
  quappe: {
    name: 'Quappe',
    icon: '🐟',
    schonzeit: [[1, 2]],
    bestMonths: [10, 11, 12],
    minSizes: { 'Niedersachsen': 30 },
  },
  regenbogenforelle: {
    name: 'Regenbogenforelle',
    icon: '🌈',
    schonzeit: [],
    bestMonths: [3, 4, 5, 9, 10, 11],
    minSizes: { 'Niedersachsen': 25, 'Hamburg': 25, 'Schleswig-Holstein': 25 },
  },
  meerforelle: {
    name: 'Meerforelle',
    icon: '🐟',
    schonzeit: [[10, 2]],
    bestMonths: [3, 4, 5, 9],
    minSizes: { 'Schleswig-Holstein': 40 },
  },
};

// Fish filter options for map
export const FISH_FILTERS = [
  { id: 'hecht', name: 'Hecht', confidence: 'high' as const },
  { id: 'zander', name: 'Zander', confidence: 'high' as const },
  { id: 'barsch', name: 'Barsch', confidence: 'high' as const },
  { id: 'karpfen', name: 'Karpfen', confidence: 'high' as const },
  { id: 'forelle', name: 'Forelle', confidence: 'high' as const },
  { id: 'aal', name: 'Aal', confidence: 'medium' as const },
  { id: 'wels', name: 'Wels', confidence: 'medium' as const },
  { id: 'schleie', name: 'Schleie', confidence: 'medium' as const },
  { id: 'brassen', name: 'Brassen', confidence: 'medium' as const },
  { id: 'rapfen', name: 'Rapfen', confidence: 'low' as const },
  { id: 'meerforelle', name: 'Meerforelle', confidence: 'low' as const },
];

// Water type filter options for map (Spot-Daten 2.0)
export const WATER_TYPE_FILTERS = [
  { id: 'lake', name: 'See', icon: '🏞️' },
  { id: 'pond', name: 'Teich', icon: '🐟' },
  { id: 'river', name: 'Fluss', icon: '🌊' },
  { id: 'canal', name: 'Kanal', icon: '🚢' },
  { id: 'reservoir', name: 'Stausee', icon: '🏔️' },
  { id: 'stream', name: 'Bach', icon: '💧' },
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
  kanal: 'Kanal',
  bach: 'Bach',
  stausee: 'Stausee',
};

// Bekannte Flüsse in Norddeutschland (für Erkennung + Fischarten)
export const KNOWN_RIVERS: Record<string, { fish: string[]; region: string }> = {
  'elbe': { fish: ['Zander', 'Aal', 'Hecht', 'Barsch', 'Brassen', 'Rapfen', 'Wels'], region: 'Norddeutschland' },
  'weser': { fish: ['Zander', 'Hecht', 'Barsch', 'Aal', 'Döbel', 'Brassen'], region: 'Niedersachsen' },
  'aller': { fish: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Döbel'], region: 'Niedersachsen' },
  'leine': { fish: ['Hecht', 'Barsch', 'Döbel', 'Aal', 'Forelle', 'Barbe'], region: 'Niedersachsen' },
  'oste': { fish: ['Hecht', 'Barsch', 'Aal', 'Zander', 'Brassen'], region: 'Niedersachsen' },
  'este': { fish: ['Forelle', 'Barsch', 'Hecht', 'Aal'], region: 'Niedersachsen' },
  'seeve': { fish: ['Forelle', 'Barsch', 'Döbel', 'Aal'], region: 'Niedersachsen' },
  'ilmenau': { fish: ['Hecht', 'Barsch', 'Aal', 'Döbel', 'Forelle'], region: 'Niedersachsen' },
  'luhe': { fish: ['Forelle', 'Barsch', 'Hecht', 'Aal'], region: 'Niedersachsen' },
  'stör': { fish: ['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander'], region: 'Schleswig-Holstein' },
  'eider': { fish: ['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander'], region: 'Schleswig-Holstein' },
  'trave': { fish: ['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander'], region: 'Schleswig-Holstein' },
  'alster': { fish: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen'], region: 'Hamburg' },
  'bille': { fish: ['Hecht', 'Barsch', 'Aal', 'Forelle'], region: 'Hamburg' },
  'nord-ostsee-kanal': { fish: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Brassen'], region: 'Schleswig-Holstein' },
  'elbe-lübeck-kanal': { fish: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen'], region: 'Schleswig-Holstein' },
  'mittellandkanal': { fish: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal'], region: 'Niedersachsen' },
};
