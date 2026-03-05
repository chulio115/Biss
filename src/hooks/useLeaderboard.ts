/**
 * useLeaderboard Hook
 * Calculates user score from local data (achievements, catches, streak).
 * Offline-first with AsyncStorage, ready for Supabase sync later.
 * 
 * Scoring Algorithm:
 * - Each achievement unlocked: 50 points (+ tier bonus: bronze 0, silver 25, gold 50)
 * - Each catch logged: 20 points
 * - Current streak day: 10 points per day
 * - Each spot visited: 15 points
 * - Each rating submitted: 5 points
 * - Each favorite: 3 points
 * - Biggest catch bonus: weight_kg * 10
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementWithStatus } from './useAchievements';
import { StreakData } from './useAchievements';

const STORAGE_KEY = '@biss_leaderboard';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalScore: number;
  catchesCount: number;
  achievementsCount: number;
  currentStreak: number;
  longestStreak: number;
  spotsVisited: number;
  biggestCatchKg: number;
  totalWeightKg: number;
  rank: number;
  isCurrentUser: boolean;
}

interface ScoreBreakdown {
  achievements: number;
  catches: number;
  streak: number;
  spots: number;
  ratings: number;
  favorites: number;
  weight: number;
  total: number;
}

const TIER_BONUS: Record<string, number> = {
  bronze: 0,
  silver: 25,
  gold: 50,
};

export const useLeaderboard = (
  achievements: AchievementWithStatus[],
  streak: StreakData,
  catchesCount: number,
  favoritesCount: number,
  ratingsCount: number,
) => {
  const [mockEntries, setMockEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate current user's score breakdown
  const scoreBreakdown: ScoreBreakdown = useMemo(() => {
    const unlockedAchievements = achievements.filter((a) => a.unlocked);
    
    const achievementScore = unlockedAchievements.reduce((sum, a) => {
      return sum + 50 + (TIER_BONUS[a.tier] || 0);
    }, 0);

    const catchScore = catchesCount * 20;
    const streakScore = streak.currentStreak * 10;
    const spotScore = 0; // TODO: track unique spots visited
    const ratingScore = ratingsCount * 5;
    const favoriteScore = favoritesCount * 3;
    const weightScore = 0; // TODO: track from catches

    const total = achievementScore + catchScore + streakScore + spotScore + ratingScore + favoriteScore + weightScore;

    return {
      achievements: achievementScore,
      catches: catchScore,
      streak: streakScore,
      spots: spotScore,
      ratings: ratingScore,
      favorites: favoriteScore,
      weight: weightScore,
      total,
    };
  }, [achievements, catchesCount, streak, ratingsCount, favoritesCount]);

  // Generate mock leaderboard entries for MVP
  const generateMockEntries = useCallback((): LeaderboardEntry[] => {
    const names = [
      'FischFlüsterer', 'AngelProfi92', 'KarpfenKönig',
      'HechtJäger', 'ForellenFan', 'PetriHeil_Mike',
      'ZanderZone', 'BarschBaron', 'AalAngler',
      'WelsFischer', 'SpinnfischerMax', 'FliegenLena',
      'GrundangelGuru', 'NachtAnglerTom', 'UferRando',
    ];

    return names.map((name, i) => ({
      userId: `mock-${i}`,
      displayName: name,
      totalScore: Math.max(50, Math.floor(Math.random() * 800) + 100),
      catchesCount: Math.floor(Math.random() * 30),
      achievementsCount: Math.floor(Math.random() * 12),
      currentStreak: Math.floor(Math.random() * 14),
      longestStreak: Math.floor(Math.random() * 30),
      spotsVisited: Math.floor(Math.random() * 20),
      biggestCatchKg: Math.round(Math.random() * 8 * 10) / 10,
      totalWeightKg: Math.round(Math.random() * 50 * 10) / 10,
      rank: 0,
      isCurrentUser: false,
    }));
  }, []);

  // Load/generate mock entries
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setMockEntries(JSON.parse(stored));
        } else {
          const entries = generateMockEntries();
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
          setMockEntries(entries);
        }
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
        setMockEntries(generateMockEntries());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build full leaderboard with current user
  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    const currentUser: LeaderboardEntry = {
      userId: 'current',
      displayName: 'Du',
      totalScore: scoreBreakdown.total,
      catchesCount,
      achievementsCount: achievements.filter((a) => a.unlocked).length,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      spotsVisited: 0,
      biggestCatchKg: 0,
      totalWeightKg: 0,
      rank: 0,
      isCurrentUser: true,
    };

    const all = [...mockEntries, currentUser]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return all;
  }, [mockEntries, scoreBreakdown, catchesCount, achievements, streak]);

  const currentUserEntry = leaderboard.find((e) => e.isCurrentUser) || null;

  return {
    leaderboard,
    currentUserEntry,
    scoreBreakdown,
    loading,
  };
};
