/**
 * useNotificationPreferences Hook
 * AsyncStorage-basierte Notification-Einstellungen.
 * Verwaltet welche Alerts aktiv sind und wann sie kommen sollen.
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  scheduleAlertsForFavorites,
  cancelAllNotifications,
  getScheduledNotifications,
} from '../services/notificationService';

const PREFS_KEY = 'biss_notification_prefs';

export interface NotificationPreferences {
  enabled: boolean;
  goldenHour: boolean;
  solunarMajor: boolean;
  solunarMinor: boolean;
  dailySummary: boolean;
  summaryHour: number; // 0-23
  permissionStatus: string;
  scheduledCount: number;
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: false,
  goldenHour: true,
  solunarMajor: true,
  solunarMinor: false,
  dailySummary: true,
  summaryHour: 6,
  permissionStatus: 'undetermined',
  scheduledCount: 0,
};

export const useNotificationPreferences = () => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  // Load preferences
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(PREFS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        }
        const status = await getNotificationPermissionStatus();
        setPrefs(prev => ({ ...prev, permissionStatus: status }));
      } catch (e) {
        console.warn('Load notification prefs error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Save preferences
  const savePrefs = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Save notification prefs error:', e);
    }
  }, [prefs]);

  // Toggle master switch
  const toggleEnabled = useCallback(async () => {
    if (!prefs.enabled) {
      // Einschalten: Permission anfragen
      const granted = await requestNotificationPermission();
      if (!granted) {
        return false;
      }
      await savePrefs({ enabled: true, permissionStatus: 'granted' });
      return true;
    } else {
      // Ausschalten: Alle Notifications canceln
      await cancelAllNotifications();
      await savePrefs({ enabled: false, scheduledCount: 0 });
      return true;
    }
  }, [prefs.enabled, savePrefs]);

  // Toggle individual alert types
  const toggleGoldenHour = useCallback(() => savePrefs({ goldenHour: !prefs.goldenHour }), [prefs.goldenHour, savePrefs]);
  const toggleSolunarMajor = useCallback(() => savePrefs({ solunarMajor: !prefs.solunarMajor }), [prefs.solunarMajor, savePrefs]);
  const toggleSolunarMinor = useCallback(() => savePrefs({ solunarMinor: !prefs.solunarMinor }), [prefs.solunarMinor, savePrefs]);
  const toggleDailySummary = useCallback(() => savePrefs({ dailySummary: !prefs.dailySummary }), [prefs.dailySummary, savePrefs]);
  const setSummaryHour = useCallback((hour: number) => savePrefs({ summaryHour: hour }), [savePrefs]);

  // Refresh alerts (re-schedule based on current prefs + favorites)
  const refreshAlerts = useCallback(async (
    favoriteSpots: { name: string; lat: number; lng: number }[]
  ) => {
    if (!prefs.enabled) return 0;

    const count = await scheduleAlertsForFavorites(favoriteSpots, {
      goldenHour: prefs.goldenHour,
      solunarMajor: prefs.solunarMajor,
      solunarMinor: prefs.solunarMinor,
      dailySummary: prefs.dailySummary,
      summaryHour: prefs.summaryHour,
    });

    await savePrefs({ scheduledCount: count });
    return count;
  }, [prefs, savePrefs]);

  // Get scheduled count
  const checkScheduled = useCallback(async () => {
    try {
      const scheduled = await getScheduledNotifications();
      await savePrefs({ scheduledCount: scheduled.length });
      return scheduled.length;
    } catch {
      return 0;
    }
  }, [savePrefs]);

  return {
    prefs,
    loading,
    toggleEnabled,
    toggleGoldenHour,
    toggleSolunarMajor,
    toggleSolunarMinor,
    toggleDailySummary,
    setSummaryHour,
    refreshAlerts,
    checkScheduled,
  };
};
