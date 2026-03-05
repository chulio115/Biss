/**
 * useNetworkStatus Hook
 * Erkennt Netzwerkstatus und triggert Sync bei Reconnect.
 * Nutzt @react-native-community/netinfo für zuverlässige Erkennung.
 * 
 * FALLBACK: Wenn NetInfo Native Module nicht verfügbar ist (kein iOS Rebuild),
 * wird "online" angenommen und Netzwerk-Monitoring übersprungen.
 * → Fix: `npx expo prebuild --platform ios --clean && npx expo run:ios`
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// Graceful import: NetInfo ist ein Native Module und crasht ohne iOS Rebuild
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  console.warn('⚠️ NetInfo native module not available — assuming online. Run: npx expo prebuild --platform ios --clean');
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });
  const [wasOffline, setWasOffline] = useState(false);
  const onReconnectCallbacks = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Skip if NetInfo native module isn't linked
    if (!NetInfo) return;

    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;

      setStatus((prev) => {
        // Detect reconnect: was offline, now online
        if (!prev.isConnected && isConnected) {
          console.log('🌐 Back online — triggering sync');
          setWasOffline(true);
          // Fire all registered reconnect callbacks
          onReconnectCallbacks.current.forEach((cb) => {
            try { cb(); } catch (e) { console.error('Reconnect callback error:', e); }
          });
        }

        if (isConnected && !prev.isConnected) {
          // Clear wasOffline after a short delay so UI can react
          setTimeout(() => setWasOffline(false), 3000);
        }

        return {
          isConnected,
          isInternetReachable,
          type: state.type,
        };
      });
    });

    return () => unsubscribe();
  }, []);

  // Register a callback to be called when device reconnects
  const onReconnect = useCallback((callback: () => void) => {
    onReconnectCallbacks.current.push(callback);
    // Return cleanup function
    return () => {
      onReconnectCallbacks.current = onReconnectCallbacks.current.filter((cb) => cb !== callback);
    };
  }, []);

  return {
    ...status,
    isOffline: !status.isConnected,
    wasOffline,
    onReconnect,
  };
};
