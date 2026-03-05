/**
 * useAchievements Hook
 * Tracks user progress and unlocks achievements.
 * Uses AsyncStorage for offline-first persistence.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, AchievementDef, AchievementTrackingKey } from '../constants/achievements';

const STORAGE_KEY_PROGRESS = '@biss_achievement_progress';
const STORAGE_KEY_UNLOCKED = '@biss_achievements_unlocked';
const STORAGE_KEY_STREAK = '@biss_streak';

export interface AchievementProgress {
  [key: string]: number; // trackingKey -> current value
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
  longestStreak: number;
}

export interface AchievementWithStatus extends AchievementDef {
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-1
  currentValue: number;
}

export type Achievement = AchievementWithStatus;

export const useAchievements = () => {
  const [progress, setProgress] = useState<AchievementProgress>({});
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, lastActiveDate: '', longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      try {
        const [storedProgress, storedUnlocked, storedStreak] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_PROGRESS),
          AsyncStorage.getItem(STORAGE_KEY_UNLOCKED),
          AsyncStorage.getItem(STORAGE_KEY_STREAK),
        ]);

        if (storedProgress) setProgress(JSON.parse(storedProgress));
        if (storedUnlocked) setUnlocked(JSON.parse(storedUnlocked));
        if (storedStreak) setStreak(JSON.parse(storedStreak));
      } catch (e) {
        console.error('Failed to load achievements:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Track daily streak on mount
  useEffect(() => {
    if (loading) return;
    const today = new Date().toISOString().split('T')[0];
    if (streak.lastActiveDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = streak.lastActiveDate === yesterday;

    const newStreak: StreakData = {
      currentStreak: isConsecutive ? streak.currentStreak + 1 : 1,
      lastActiveDate: today,
      longestStreak: Math.max(
        streak.longestStreak,
        isConsecutive ? streak.currentStreak + 1 : 1
      ),
    };

    setStreak(newStreak);
    AsyncStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(newStreak));

    // Update streak tracking key
    incrementProgress('app_days_streak', newStreak.currentStreak, true);
  }, [loading]);

  const persistProgress = useCallback(async (data: AchievementProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, []);

  const persistUnlocked = useCallback(async (data: UnlockedAchievement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save unlocked:', e);
    }
  }, []);

  const checkAndUnlock = useCallback((key: AchievementTrackingKey, value: number, currentUnlocked: UnlockedAchievement[]) => {
    const newUnlocks: UnlockedAchievement[] = [];

    ACHIEVEMENTS
      .filter((a) => a.trackingKey === key && value >= a.requirement)
      .forEach((a) => {
        if (!currentUnlocked.find((u) => u.id === a.id)) {
          newUnlocks.push({ id: a.id, unlockedAt: new Date().toISOString() });
        }
      });

    return newUnlocks;
  }, []);

  const incrementProgress = useCallback((key: AchievementTrackingKey, value?: number, absolute?: boolean) => {
    setProgress((prev) => {
      const newValue = absolute ? (value ?? 1) : (prev[key] ?? 0) + (value ?? 1);
      const updated = { ...prev, [key]: newValue };
      persistProgress(updated);

      // Check for new unlocks
      const newUnlocks = checkAndUnlock(key, newValue, unlocked);
      if (newUnlocks.length > 0) {
        const allUnlocked = [...unlocked, ...newUnlocks];
        setUnlocked(allUnlocked);
        persistUnlocked(allUnlocked);
        setNewlyUnlocked((prev) => [...prev, ...newUnlocks.map((u) => u.id)]);
      }

      return updated;
    });
  }, [unlocked, persistProgress, persistUnlocked, checkAndUnlock]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  // Build achievements with status
  const achievementsWithStatus: AchievementWithStatus[] = useMemo(() => {
    return ACHIEVEMENTS.map((a) => {
      const unlockedEntry = unlocked.find((u) => u.id === a.id);
      const currentValue = progress[a.trackingKey] ?? 0;
      return {
        ...a,
        unlocked: !!unlockedEntry,
        unlockedAt: unlockedEntry?.unlockedAt,
        progress: Math.min(currentValue / a.requirement, 1),
        currentValue,
      };
    });
  }, [progress, unlocked]);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;

  return {
    achievements: achievementsWithStatus,
    streak,
    loading,
    unlockedCount,
    totalCount,
    newlyUnlocked,
    incrementProgress,
    clearNewlyUnlocked,
  };
};
