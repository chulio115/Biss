// SpotBottomSheet - Detail view when tapping a marker
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { MapWaterBody } from '../screens/MapScreen';

interface SpotBottomSheetProps {
  spot: MapWaterBody;
  onClose: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
};

const getScoreLabel = (score: number): string => {
  if (score >= 70) return 'Sehr gut';
  if (score >= 50) return 'Gut';
  return 'Mäßig';
};

const getTypeLabel = (type: string): string => {
  const t = type?.toLowerCase() || '';
  if (t.includes('forelle')) return '🐟 Forellenteich';
  if (t.includes('teich')) return '🎣 Angelteich';
  if (t === 'see') return '🏞️ See';
  if (t === 'fluss') return '🌊 Fluss';
  if (t === 'kanal') return '⛵ Kanal';
  return '🐟 Gewässer';
};

export const SpotBottomSheet: React.FC<SpotBottomSheetProps> = ({ spot, onClose }) => {
  const openInMaps = () => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${spot.name}&ll=${spot.latitude},${spot.longitude}`,
      android: `${scheme}${spot.latitude},${spot.longitude}?q=${spot.latitude},${spot.longitude}(${spot.name})`,
    });
    if (url) Linking.openURL(url);
  };

  const openGoogleMaps = () => {
    // If we have a Google Place ID, use it for more accurate link
    if (spot.google_place_id) {
      const url = `https://www.google.com/maps/place/?q=place_id:${spot.google_place_id}`;
      Linking.openURL(url);
    } else {
      // Fallback to coordinates search
      const url = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}&query_place_id=${encodeURIComponent(spot.name)}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Handle bar */}
      <View style={styles.handleBar} />

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with score */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.typeLabel}>{getTypeLabel(spot.type)}</Text>
            <Text style={styles.spotName}>{spot.name}</Text>
            <Text style={styles.region}>📍 {spot.region}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(spot.fangIndex) }]}>
              {spot.fangIndex}
            </Text>
            <Text style={styles.scoreLabel}>{getScoreLabel(spot.fangIndex)}</Text>
          </View>
        </View>

        {/* Assumed badge */}
        {spot.is_assumed && (
          <View style={styles.assumedBanner}>
            <Text style={styles.assumedText}>
              💡 Dieser Spot ist ein Vorschlag und noch nicht verifiziert
            </Text>
          </View>
        )}

        {/* Fish species */}
        {spot.fish_species && spot.fish_species.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fischarten</Text>
            <View style={styles.fishTags}>
              {spot.fish_species.map((fish, i) => (
                <View key={i} style={styles.fishTag}>
                  <Text style={styles.fishTagText}>🐟 {fish}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Price */}
        {spot.permit_price && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tageskarte</Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceValue}>€{spot.permit_price}</Text>
              <Text style={styles.priceLabel}>pro Tag</Text>
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={openInMaps}>
            <Text style={styles.primaryBtnText}>🧭 Route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleBtn} onPress={openGoogleMaps}>
            <Text style={styles.googleBtnText}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>📤</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a1628',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  typeLabel: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 4,
  },
  spotName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  region: {
    color: '#94a3b8',
    fontSize: 14,
  },
  scoreBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  assumedBanner: {
    backgroundColor: '#7c3aed20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  assumedText: {
    color: '#a78bfa',
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fishTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fishTag: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fishTagText: {
    color: '#fff',
    fontSize: 14,
  },
  priceBox: {
    backgroundColor: '#065f4620',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceValue: {
    color: '#4ade80',
    fontSize: 28,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: '#4ade80',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#4ade80',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#0a1628',
    fontSize: 16,
    fontWeight: '600',
  },
  googleBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 22,
  },
});
