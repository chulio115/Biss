// MapScreen - Premium Gewässer-Karte (iOS + Android)
// NO app switching - everything in-app!
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { calculateFangIndex } from '../services/xai';
import { getWeather } from '../services/weather';
import { MapFilters } from '../components/MapFilters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// Map view modes - all work on iOS!
type MapMode = 'satellite' | 'hybrid' | 'standard';

// Premium marker colors based on Fangindex
const getMarkerColors = (score: number) => {
  if (score >= 70) return { bg: '#22c55e', glow: '#4ade80', text: '#052e16' };
  if (score >= 50) return { bg: '#f59e0b', glow: '#fbbf24', text: '#451a03' };
  return { bg: '#ef4444', glow: '#f87171', text: '#450a0a' };
};

// Get type icon
const getTypeIcon = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'teich': return '🎣';
    case 'see': return '🏞️';
    case 'fluss': return '🌊';
    case 'kanal': return '⛵';
    default: return '🐟';
  }
};

export const MapScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const mapRef = useRef<MapView>(null);
  const [waterBodies, setWaterBodies] = useState<MapWaterBody[]>([]);
  const [filteredBodies, setFilteredBodies] = useState<MapWaterBody[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<MapWaterBody | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>('hybrid');
  const [selectedFish, setSelectedFish] = useState<string | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  
  // Animation for bottom sheet
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const initialRegion: Region = {
    latitude: 53.3347,
    longitude: 9.9717,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterWaterBodies();
  }, [waterBodies, selectedFish]);

  useEffect(() => {
    // Animate sheet
    Animated.spring(sheetAnim, {
      toValue: selectedSpot ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [selectedSpot]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { lat: 53.3347, lon: 9.9717 };
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = { lat: location.coords.latitude, lon: location.coords.longitude };
          setUserLocation(coords);
        } catch (e) {
          console.log('Location error:', e);
        }
      }

      // Load water bodies
      const { data, error } = await supabase.from('water_bodies').select('*');
      if (error) throw error;

      // Get weather for fangindex calculation
      const weather = await getWeather(coords.lat, coords.lon);

      // Calculate fangindex for each water body
      const withScores = await Promise.all(
        (data || []).map(async (wb) => {
          const result = await calculateFangIndex(wb.name, weather, null);
          return {
            ...wb,
            latitude: parseFloat(wb.latitude),
            longitude: parseFloat(wb.longitude),
            fangIndex: result.score,
          };
        })
      );

      setWaterBodies(withScores);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWaterBodies = () => {
    if (!selectedFish) {
      setFilteredBodies(waterBodies);
    } else {
      setFilteredBodies(
        waterBodies.filter((wb) =>
          wb.fish_species?.some((f) => f.toLowerCase().includes(selectedFish.toLowerCase()))
        )
      );
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.lat,
          longitude: userLocation.lon,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        500
      );
    }
  };

  const focusOnSpot = (spot: MapWaterBody) => {
    setSelectedSpot(spot);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: spot.latitude - 0.015, // Offset to show marker above sheet
          longitude: spot.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        400
      );
    }
  };

  const cycleMapMode = () => {
    const modes: MapMode[] = ['hybrid', 'satellite', 'standard'];
    const currentIndex = modes.indexOf(mapMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMapMode(modes[nextIndex]);
  };

  const getModeIcon = () => {
    switch (mapMode) {
      case 'satellite': return '🛰️';
      case 'hybrid': return '🗺️';
      default: return '📍';
    }
  };

  const getModeLabel = () => {
    switch (mapMode) {
      case 'satellite': return 'Satellit';
      case 'hybrid': return 'Hybrid';
      default: return 'Standard';
    }
  };

  // Get all unique fish species
  const allFish = [...new Set(waterBodies.flatMap((wb) => wb.fish_species || []))];

  // Calculate distance from user
  const getDistance = (lat: number, lon: number): string => {
    if (!userLocation) return '';
    const R = 6371;
    const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
    const dLon = ((lon - userLocation.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Lade Gewässer-Karte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapType={mapMode}
        mapPadding={{ top: 120, right: 0, bottom: selectedSpot ? 320 : 100, left: 0 }}
        onPress={() => setSelectedSpot(null)}
      >
        {/* Water body markers with glow effect */}
        {filteredBodies.map((wb) => {
          const colors = getMarkerColors(wb.fangIndex);
          return (
            <React.Fragment key={wb.id}>
              {/* Glow circle behind marker */}
              <Circle
                center={{ latitude: wb.latitude, longitude: wb.longitude }}
                radius={150}
                fillColor={`${colors.glow}30`}
                strokeColor={`${colors.glow}50`}
                strokeWidth={1}
              />
              <Marker
                coordinate={{
                  latitude: wb.latitude,
                  longitude: wb.longitude,
                }}
                onPress={() => focusOnSpot(wb)}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.markerWrapper}>
                  {/* Outer glow */}
                  <View style={[styles.markerGlow, { backgroundColor: colors.glow }]} />
                  {/* Main marker */}
                  <View style={[styles.marker, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.markerScore, { color: colors.text }]}>{wb.fangIndex}</Text>
                  </View>
                  {/* Arrow */}
                  <View style={[styles.markerArrow, { borderTopColor: colors.bg }]} />
                </View>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(10,22,40,0.95)', 'rgba(10,22,40,0.7)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Gewässer-Karte</Text>
          <Text style={styles.headerSubtitle}>{filteredBodies.length} Spots</Text>
        </View>
        <TouchableOpacity style={styles.modeBtn} onPress={cycleMapMode}>
          <Text style={styles.modeBtnIcon}>{getModeIcon()}</Text>
          <Text style={styles.modeBtnText}>{getModeLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Fish Filter */}
      <MapFilters
        selectedFish={selectedFish}
        onSelectFish={setSelectedFish}
        availableFish={allFish}
      />

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={centerOnUser}>
          <Text style={styles.actionBtnIcon}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>70+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>50+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>&lt;50</Text>
        </View>
      </View>

      {/* Premium Bottom Sheet - IN APP, NO EXTERNAL LINKS */}
      {selectedSpot && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#0f1729', '#0a1628']}
            style={styles.sheetGradient}
          >
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedSpot(null)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetContent}>
              {/* Header with Score */}
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderLeft}>
                  <View style={styles.typeChip}>
                    <Text style={styles.typeChipText}>
                      {getTypeIcon(selectedSpot.type)} {selectedSpot.type}
                    </Text>
                  </View>
                  <Text style={styles.spotName}>{selectedSpot.name}</Text>
                  <Text style={styles.spotRegion}>📍 {selectedSpot.region}</Text>
                  {userLocation && (
                    <Text style={styles.spotDistance}>
                      🚗 {getDistance(selectedSpot.latitude, selectedSpot.longitude)} entfernt
                    </Text>
                  )}
                </View>
                <View style={[styles.scoreCircle, { backgroundColor: getMarkerColors(selectedSpot.fangIndex).bg }]}>
                  <Text style={[styles.scoreValue, { color: getMarkerColors(selectedSpot.fangIndex).text }]}>
                    {selectedSpot.fangIndex}
                  </Text>
                  <Text style={[styles.scoreLabel, { color: getMarkerColors(selectedSpot.fangIndex).text }]}>
                    {selectedSpot.fangIndex >= 70 ? 'TOP' : selectedSpot.fangIndex >= 50 ? 'GUT' : 'MÄSSIG'}
                  </Text>
                </View>
              </View>

              {/* Assumed Badge */}
              {selectedSpot.is_assumed && (
                <View style={styles.assumedBadge}>
                  <Text style={styles.assumedText}>
                    💡 Vorgeschlagener Spot – noch nicht verifiziert
                  </Text>
                </View>
              )}

              {/* Fish Species */}
              {selectedSpot.fish_species && selectedSpot.fish_species.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Fischarten</Text>
                  <View style={styles.fishGrid}>
                    {selectedSpot.fish_species.map((fish, i) => (
                      <View key={i} style={styles.fishChip}>
                        <Text style={styles.fishChipText}>🐟 {fish}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Price */}
              {selectedSpot.permit_price && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tageskarte</Text>
                  <View style={styles.priceCard}>
                    <Text style={styles.priceValue}>€{selectedSpot.permit_price}</Text>
                    <Text style={styles.priceLabel}>pro Tag</Text>
                  </View>
                </View>
              )}

              {/* Coordinates (useful info, no external link needed) */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Koordinaten</Text>
                <View style={styles.coordsCard}>
                  <Text style={styles.coordsText}>
                    {selectedSpot.latitude.toFixed(5)}° N, {selectedSpot.longitude.toFixed(5)}° E
                  </Text>
                </View>
              </View>

              {/* Actions - ALL IN-APP */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={() => {
                    if (mapRef.current) {
                      mapRef.current.animateToRegion(
                        {
                          latitude: selectedSpot.latitude,
                          longitude: selectedSpot.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        },
                        500
                      );
                    }
                  }}
                >
                  <Text style={styles.primaryActionText}>🔍 Zoom In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryAction}>
                  <Text style={styles.secondaryActionIcon}>❤️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryAction}>
                  <Text style={styles.secondaryActionIcon}>📤</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1628',
  },
  loadingText: {
    color: '#64748b',
    marginTop: 16,
    fontSize: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 24,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#4ade80',
    fontSize: 13,
    marginTop: 2,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modeBtnIcon: {
    fontSize: 16,
  },
  modeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 12,
  },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15,23,41,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionBtnIcon: {
    fontSize: 22,
  },
  legend: {
    position: 'absolute',
    left: 16,
    bottom: 120,
    backgroundColor: 'rgba(15,23,41,0.9)',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  // Marker styles
  markerWrapper: {
    alignItems: 'center',
  },
  markerGlow: {
    position: 'absolute',
    top: -4,
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.4,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  // Bottom Sheet styles
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.55,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetGradient: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHandle: {
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  sheetContent: {
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  typeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeChipText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  spotName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  spotRegion: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 2,
  },
  spotDistance: {
    color: '#64748b',
    fontSize: 13,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.8,
  },
  assumedBadge: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  assumedText: {
    color: '#fbbf24',
    fontSize: 13,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fishChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  fishChipText: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  priceCard: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceValue: {
    color: '#4ade80',
    fontSize: 28,
    fontWeight: '700',
  },
  priceLabel: {
    color: '#4ade80',
    fontSize: 14,
  },
  coordsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  coordsText: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#4ade80',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#052e16',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionIcon: {
    fontSize: 22,
  },
});

export default MapScreen;
