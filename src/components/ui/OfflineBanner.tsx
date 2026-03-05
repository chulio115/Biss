/**
 * OfflineBanner - Visueller Indikator für Offline-Modus
 * Zeigt dezent an, wenn die App gecachte Daten nutzt.
 * Verschwindet automatisch wenn wieder online.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface OfflineBannerProps {
  isOffline: boolean;
  cacheAge?: string | null;
  isOfflineData?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, cacheAge, isOfflineData }) => {
  // Show banner if device is offline OR if we're using cached data
  if (!isOffline && !isOfflineData) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isOffline ? (
          <>
            <WifiOff size={14} color={COLORS.white} strokeWidth={2.5} />
            <Text style={styles.text}>Offline-Modus</Text>
          </>
        ) : (
          <>
            <RefreshCw size={14} color={COLORS.white} strokeWidth={2.5} />
            <Text style={styles.text}>Gecachte Daten</Text>
          </>
        )}
        {cacheAge && <Text style={styles.age}>({cacheAge})</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.92)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  age: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
});
