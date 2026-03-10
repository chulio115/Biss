/**
 * BISS Notification Service
 * Lokale Push-Notifications für Beißzeit-Alerts, Golden Hour, Solunar Periods.
 * Kein Server nötig — alles lokal berechnet.
 */
// Mock for expo-notifications (uninstalled for iOS build)
const Notifications = {
  setNotificationHandler: (handler: any) => {},
  scheduleNotificationAsync: async (id: string, content: any) => 'mock-id',
  cancelNotificationAsync: async (id: string) => {},
  cancelAllScheduledNotificationsAsync: async () => {},
  getBadgeCountAsync: async () => 0,
  setBadgeCountAsync: async (count: number) => {},
  requestPermissionsAsync: async () => ({ granted: false, status: 'denied' }),
  getPermissionsAsync: async () => ({ granted: false, status: 'denied' }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  setNotificationChannelAsync: async (id: string, config: any) => {},
  cancelScheduledNotificationAsync: async (id: string) => {},
  getAllScheduledNotificationsAsync: async () => [],
  AndroidImportance: {
    DEFAULT: 0,
    HIGH: 1,
    MAX: 2,
    LOW: 3,
    MIN: 4,
    UNSPECIFIED: 5,
  },
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    HOURLY: 'hourly',
    TIME_INTERVAL: 'timeInterval',
    DATE: 'date',
    NOW: 'now',
  },
};
import { Platform } from 'react-native';
import { getSolunarData, SolunarPeriod } from '../utils/fangindex';
import { calculateSunTimes } from '../utils/fishing';

// ─── Notification Handler Config ───
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Types ───
export type AlertType = 'golden_hour' | 'solunar_major' | 'solunar_minor' | 'daily_summary';

export interface ScheduledAlert {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  triggerDate: Date;
  spotName?: string;
}

// ─── Permission ───
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // iOS-spezifisch: APNs Token
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationChannelAsync?.('bite-alerts', {
        name: 'Beißzeit-Alerts',
        importance: Notifications.AndroidImportance?.HIGH ?? 4,
        sound: 'default',
      });
    }

    // Android Channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('bite-alerts', {
        name: 'Beißzeit-Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return true;
  } catch (e) {
    console.warn('Notification permission error:', e);
    return false;
  }
};

export const getNotificationPermissionStatus = async (): Promise<string> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

// ─── Schedule Notifications ───

const LEAD_TIME_MINUTES = 15; // 15 Min vor der Period benachrichtigen

export const scheduleGoldenHourAlert = async (
  lat: number,
  lng: number,
  spotName?: string,
): Promise<string | null> => {
  try {
    const { sunrise, sunset } = calculateSunTimes(lat, lng);
    const now = new Date();
    const alerts: { time: Date; label: string }[] = [];

    // Morgen-Golden Hour: 15 Min vor Sonnenaufgang
    const morningAlert = new Date(sunrise.getTime() - LEAD_TIME_MINUTES * 60 * 1000);
    if (morningAlert > now) {
      alerts.push({ time: morningAlert, label: 'Morgen' });
    }

    // Abend-Golden Hour: 15 Min vor Sonnenuntergang
    const eveningAlert = new Date(sunset.getTime() - LEAD_TIME_MINUTES * 60 * 1000);
    if (eveningAlert > now) {
      alerts.push({ time: eveningAlert, label: 'Abend' });
    }

    // Schedule den nächsten Alert
    const next = alerts[0];
    if (!next) return null;

    const sunriseStr = `${String(sunrise.getHours()).padStart(2, '0')}:${String(sunrise.getMinutes()).padStart(2, '0')}`;
    const sunsetStr = `${String(sunset.getHours()).padStart(2, '0')}:${String(sunset.getMinutes()).padStart(2, '0')}`;

    const id = await Notifications.scheduleNotificationAsync('golden-hour', {
      content: {
        title: `🌅 Golden Hour in ${LEAD_TIME_MINUTES} Min!`,
        body: spotName
          ? `Beste Beißzeit an ${spotName}! ${next.label === 'Morgen' ? `Sonnenaufgang ${sunriseStr}` : `Sonnenuntergang ${sunsetStr}`}`
          : `${next.label === 'Morgen' ? `Sonnenaufgang um ${sunriseStr}` : `Sonnenuntergang um ${sunsetStr}`} — jetzt los ans Wasser! 🎣`,
        sound: 'default',
        data: { type: 'golden_hour', spotName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: next.time,
      },
    });

    return id;
  } catch (e) {
    console.warn('Schedule golden hour error:', e);
    return null;
  }
};

export const scheduleSolunarAlerts = async (
  lat: number,
  lng: number,
  spotName?: string,
  majorsOnly: boolean = false,
): Promise<string[]> => {
  const ids: string[] = [];
  try {
    const solunar = getSolunarData(lat, lng);
    const now = new Date();

    for (const period of solunar.periods) {
      if (majorsOnly && period.type === 'minor') continue;

      // Alert 15 Min vor Period-Start
      const alertTime = new Date(period.start.getTime() - LEAD_TIME_MINUTES * 60 * 1000);
      if (alertTime <= now) continue;

      const startStr = `${String(period.start.getHours()).padStart(2, '0')}:${String(period.start.getMinutes()).padStart(2, '0')}`;
      const endStr = `${String(period.end.getHours()).padStart(2, '0')}:${String(period.end.getMinutes()).padStart(2, '0')}`;
      const isMajor = period.type === 'major';

      const id = await Notifications.scheduleNotificationAsync(`solunar-${period.type}`, {
        content: {
          title: isMajor
            ? `🔥 MAJOR Beißzeit in ${LEAD_TIME_MINUTES} Min!`
            : `⭐ Minor Beißzeit in ${LEAD_TIME_MINUTES} Min!`,
          body: spotName
            ? `${period.label} an ${spotName} (${startStr}–${endStr}). ${isMajor ? 'Höchste Fischaktivität!' : 'Erhöhte Aktivität!'}`
            : `${period.label} von ${startStr}–${endStr}. ${isMajor ? 'Jetzt ist die beste Zeit! 🎣' : 'Gute Chance! 🐟'}`,
          sound: 'default',
          data: { type: isMajor ? 'solunar_major' : 'solunar_minor', spotName, period: period.label },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: alertTime,
        },
      });

      ids.push(id);
    }
  } catch (e) {
    console.warn('Schedule solunar error:', e);
  }
  return ids;
};

export const scheduleDailySummary = async (
  hour: number = 6,
  minute: number = 0,
): Promise<string | null> => {
  try {
    // Tägliche Zusammenfassung um gewählte Uhrzeit
    const id = await Notifications.scheduleNotificationAsync('daily-summary', {
      content: {
        title: '🐟 Dein Angel-Tagesplan',
        body: 'Schau dir die heutigen Beißzeiten und Golden Hours an!',
        sound: 'default',
        data: { type: 'daily_summary' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return id;
  } catch (e) {
    console.warn('Schedule daily summary error:', e);
    return null;
  }
};

// ─── Cancel ───

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const cancelNotification = async (id: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(id);
};

export const getScheduledNotifications = async () => {
  return Notifications.getAllScheduledNotificationsAsync();
};

// ─── Schedule All Alerts für Favorite Spots ───

export const scheduleAlertsForFavorites = async (
  favoriteSpots: { name: string; lat: number; lng: number }[],
  options: {
    goldenHour: boolean;
    solunarMajor: boolean;
    solunarMinor: boolean;
    dailySummary: boolean;
    summaryHour: number;
  },
): Promise<number> => {
  // Erst alle alten löschen
  await cancelAllNotifications();

  let scheduledCount = 0;

  // Daily Summary
  if (options.dailySummary) {
    const id = await scheduleDailySummary(options.summaryHour, 0);
    if (id) scheduledCount++;
  }

  // Für jeden Favoriten-Spot
  for (const spot of favoriteSpots) {
    if (options.goldenHour) {
      const id = await scheduleGoldenHourAlert(spot.lat, spot.lng, spot.name);
      if (id) scheduledCount++;
    }

    if (options.solunarMajor || options.solunarMinor) {
      const ids = await scheduleSolunarAlerts(
        spot.lat, spot.lng, spot.name, !options.solunarMinor
      );
      scheduledCount += ids.length;
    }
  }

  // Fallback: Wenn keine Favoriten, alerts für Default-Location (NDS)
  if (favoriteSpots.length === 0) {
    if (options.goldenHour) {
      const id = await scheduleGoldenHourAlert(53.33, 9.97);
      if (id) scheduledCount++;
    }
    if (options.solunarMajor || options.solunarMinor) {
      const ids = await scheduleSolunarAlerts(53.33, 9.97, undefined, !options.solunarMinor);
      scheduledCount += ids.length;
    }
  }

  return scheduledCount;
};
