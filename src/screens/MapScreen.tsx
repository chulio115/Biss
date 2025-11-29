// MapScreen - Gewässer-Karte mit Custom Styles
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import { calculateFangIndex } from '../services/xai';
import { getWeather } from '../services/weather';
import { SpotBottomSheet } from '../components/SpotBottomSheet';
import { MapFilters } from '../components/MapFilters';

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
}

type MapMode = 'default' | 'night' | 'water';

// Custom map styles
const mapStyles = {
  default: [],
  night: [
    { elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0a1628' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4ade80' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  ],
  water: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0077b6' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#caf0f8' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d4f6f' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1d3d2d' }, { visibility: 'on' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
  ],
};

const getMarkerColor = (score: number): string => {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
};

export const MapScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const mapRef = useRef<MapView>(null);
  const [waterBodies, setWaterBodies] = useState<MapWaterBody[]>([]);
  const [filteredBodies, setFilteredBodies] = useState<MapWaterBody[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<MapWaterBody | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>('water');
  const [selectedFish, setSelectedFish] = useState<string | null>(null);

  const initialRegion: Region = {
    latitude: 53.3347,
    longitude: 9.9717,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterWaterBodies();
  }, [waterBodies, selectedFish]);

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

  const cycleMapMode = () => {
    const modes: MapMode[] = ['default', 'water', 'night'];
    const currentIndex = modes.indexOf(mapMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMapMode(modes[nextIndex]);
  };

  const getModeIcon = () => {
    switch (mapMode) {
      case 'night': return '🌙';
      case 'water': return '💧';
      default: return '🗺️';
    }
  };

  const getModeLabel = () => {
    switch (mapMode) {
      case 'night': return 'Nacht';
      case 'water': return 'Gewässer';
      default: return 'Standard';
    }
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
        customMapStyle={mapStyles[mapMode]}
        mapPadding={{ top: 100, right: 0, bottom: 100, left: 0 }}
      >
        {filteredBodies.map((wb) => (
          <Marker
            key={wb.id}
            coordinate={{
              latitude: wb.latitude,
              longitude: wb.longitude,
            }}
            onPress={() => setSelectedSpot(wb)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: getMarkerColor(wb.fangIndex) }]}>
                <Text style={styles.markerScore}>{wb.fangIndex}</Text>
              </View>
              <View style={[styles.markerArrow, { borderTopColor: getMarkerColor(wb.fangIndex) }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>🎣 Gewässer-Karte</Text>
          <Text style={styles.headerSubtext}>{filteredBodies.length} Spots</Text>
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
        availableFish={['Forelle', 'Karpfen', 'Hecht', 'Zander', 'Barsch', 'Aal']}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={centerOnUser}>
          <Text style={styles.actionBtnText}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={loadData}>
          <Text style={styles.actionBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>70+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
          <Text style={styles.legendText}>50-69</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>&lt;50</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      {selectedSpot && (
        <SpotBottomSheet spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
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
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtext: {
    color: '#64748b',
    fontSize: 12,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  modeBtnIcon: {
    fontSize: 16,
  },
  modeBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    gap: 8,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionBtnText: {
    fontSize: 22,
  },
  legend: {
    position: 'absolute',
    left: 16,
    bottom: 140,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
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
    fontSize: 11,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  markerScore: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
