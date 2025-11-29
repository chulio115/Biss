// MapScreen Web Fallback - react-native-maps doesn't work on web
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Export interface for consistency with native version
export interface MapWaterBody {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  region: string;
  fish_species: string[];
  permit_price: number | null;
  is_assumed: boolean;
  fangIndex: number;
  google_place_id?: string;
}

export const MapScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Karte nicht verfügbar</Text>
        <Text style={styles.subtitle}>
          Die interaktive Karte ist nur in der mobilen App verfügbar.
        </Text>
        <Text style={styles.hint}>
          Scanne den QR Code mit deinem iPhone oder Android-Gerät um die volle Karten-Erfahrung zu genießen.
        </Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Zurück zum Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  hint: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  backBtn: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#052e16',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapScreen;
