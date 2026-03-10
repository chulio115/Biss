/**
 * BISS Design Tokens - Zentrale Farb-Definition
 * Wird in der gesamten App verwendet.
 */

export const COLORS = {
  // Brand Colors
  primary: '#0066FF',
  accent: '#00A3FF',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F5F5F5',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Semantic Colors
  green: '#4ADE80',
  greenDark: '#22C55E',
  yellow: '#FACC15',
  yellowDark: '#EAB308',
  red: '#EF4444',
  redDark: '#DC2626',
  orange: '#F59E0B',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  
  // Category Colors
  fangindex: '#F59E0B',
  official: '#10B981',
  hidden: '#8B5CF6',
  mystery: '#06B6D4',
  
  // Tab Bar
  tab: {
    active: '#0066FF',
    inactive: '#9CA3AF',
    bg: 'rgba(255, 255, 255, 0.92)',
    bgDark: 'rgba(10, 26, 47, 0.95)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderDark: 'rgba(255, 255, 255, 0.08)',
    activeBg: 'rgba(0, 102, 255, 0.12)',
    activeBgDark: 'rgba(0, 163, 255, 0.2)',
  },
  
  // Overlays & Transparency
  overlay: {
    light: 'rgba(255,255,255,0.95)',
    dark: 'rgba(10,26,47,0.95)',
    scrim: 'rgba(0,0,0,0.6)',
  },
  
  // Dark Mode
  dark: {
    bg: '#0A1A2F',
    surface: '#132337',
    card: '#1A2D44',
    border: '#1E3A5F',
    water: '#00A3FF',
  },
  
  // App-wide Background & Text Colors
  background: '#FFFFFF',
  backgroundDark: '#0A1A2F',
  text: '#111827',
  border: '#E5E7EB',
  borderDark: '#1E3A5F',
  
  // Gradients (for reference)
  gradients: {
    primary: ['#0066FF', '#00A3FF'],
    score: ['#4ADE80', '#22C55E'],
    gold: ['#F59E0B', '#EAB308'],
    premium: ['#8B5CF6', '#6366F1'],
  },
} as const;

// Score color helper
export const getScoreColor = (score: number): string => {
  if (score >= 70) return COLORS.green;
  if (score >= 50) return COLORS.yellow;
  return COLORS.red;
};

// Score gradient for rings
export const getScoreGradient = (score: number): readonly [string, string] => {
  if (score >= 70) return ['#4ADE80', '#22C55E'] as const;
  if (score >= 50) return ['#FACC15', '#EAB308'] as const;
  return ['#EF4444', '#DC2626'] as const;
};

// Category color helper
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    fangindex: COLORS.fangindex,
    official: COLORS.official,
    hidden: COLORS.hidden,
    mystery: COLORS.mystery,
  };
  return colors[category] || COLORS.fangindex;
};
