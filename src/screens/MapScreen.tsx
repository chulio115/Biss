/**
 * BISS MapScreen - 2026 Clean Design (Native Mapbox)
 * 
 * Design System:
 * - Colors: #FFFFFF, #F5F5F5, #E0E0E0, #0066FF, #00A3FF
 * - Heatmap: #4ADE80 → #FACC15 → #EF4444
 * - Typography: System font, 400/600
 * - 80% Map, max 3-4 touch points
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../services/supabase';
import { calculateFangIndex } from '../services/xai';
import { getWeather } from '../services/weather';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Initialize Mapbox
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

// Types
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

type MapMode = 'angel' | 'heatmap' | 'night';

// Design Tokens - 2026 Clean
const colors = {
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#111827',
  primary: '#0066FF',
  accent: '#00A3FF',
  green: '#4ADE80',
  yellow: '#FACC15',
  red: '#EF4444',
  dark: {
    bg: '#0A1A2F',
    surface: '#132337',
    water: '#00A3FF',
  },
};

// Mapbox Style URLs
const mapStyles = {
  angel: 'mapbox://styles/mapbox/light-v11',
  heatmap: 'mapbox://styles/mapbox/light-v11',
  night: 'mapbox://styles/mapbox/dark-v11',
};

// Score color helper
const getScoreColor = (score: number): string => {
  if (score >= 70) return colors.green;
  if (score >= 50) return colors.yellow;
  return colors.red;
};

// Fish filter options
const FISH_FILTERS = [
  { id: 'forelle', name: 'Forelle', confidence: 'high' },
  { id: 'karpfen', name: 'Karpfen', confidence: 'high' },
  { id: 'hecht', name: 'Hecht', confidence: 'medium' },
  { id: 'zander', name: 'Zander', confidence: 'medium' },
  { id: 'barsch', name: 'Barsch', confidence: 'high' },
  { id: 'aal', name: 'Aal', confidence: 'low' },
];

export const MapScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const [waterBodies, setWaterBodies] = useState<MapWaterBody[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<MapWaterBody | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([9.9717, 53.3347]);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>('angel');
  const [selectedFish, setSelectedFish] = useState<string[]>([]);
  const [top3, setTop3] = useState<MapWaterBody[]>([]);

  // Bottom sheet snap points
  const snapPoints = [90, 260, 500];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation([location.coords.longitude, location.coords.latitude]);
        } catch (e) {
          console.log('Location error, using default');
        }
      }

      // Fetch water bodies
      const { data, error } = await supabase.from('water_bodies').select('*');
      if (error) throw error;

      // Get weather for scoring
      const weather = await getWeather(userLocation[1], userLocation[0]);

      // Calculate scores
      const scored = await Promise.all(
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

      setWaterBodies(scored);
      
      // Calculate top 3
      const sorted = [...scored].sort((a, b) => b.fangIndex - a.fangIndex);
      setTop3(sorted.slice(0, 3));
      
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = useCallback((spot: MapWaterBody) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSpot(spot);
    cameraRef.current?.setCamera({
      centerCoordinate: [spot.longitude, spot.latitude],
      zoomLevel: 14,
      animationDuration: 500,
    });
  }, []);

  const handleModeChange = (mode: MapMode) => {
    Haptics.selectionAsync();
    setMapMode(mode);
  };

  const getDistance = (lon: number, lat: number): string => {
    const R = 6371;
    const dLat = ((lat - userLocation[1]) * Math.PI) / 180;
    const dLon = ((lon - userLocation[0]) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + 
              Math.cos((userLocation[1] * Math.PI) / 180) * 
              Math.cos((lat * Math.PI) / 180) * 
              Math.sin(dLon / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  };

  if (loading) {
    return (
      <View style={[styles.loading, isDark && styles.loadingDark]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, isDark && styles.textLight]}>Lade Karte...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Full-screen Native Mapbox Map */}
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={mapStyles[mapMode]}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={12}
          centerCoordinate={userLocation}
          animationMode="flyTo"
          animationDuration={1000}
        />
        
        {/* User Location */}
        <MapboxGL.UserLocation visible animated />

        {/* Water Body Markers */}
        {waterBodies.map((wb) => (
          <MapboxGL.MarkerView
            key={wb.id}
            coordinate={[wb.longitude, wb.latitude]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <TouchableOpacity
              onPress={() => handleMarkerPress(wb)}
              style={styles.markerContainer}
              activeOpacity={0.8}
            >
              <View style={[styles.marker, { backgroundColor: getScoreColor(wb.fangIndex) }]}>
                <Text style={styles.markerText}>{wb.fangIndex}</Text>
              </View>
              <View style={[styles.markerArrow, { borderTopColor: getScoreColor(wb.fangIndex) }]} />
            </TouchableOpacity>
          </MapboxGL.MarkerView>
        ))}
      </MapboxGL.MapView>

      {/* Top Bar */}
      <View style={[styles.topBar, isDark && styles.topBarDark]}>
        <TouchableOpacity style={[styles.iconBtn, isDark && styles.iconBtnDark]} onPress={onBack}>
          <Text style={[styles.iconText, isDark && styles.textLight]}>←</Text>
        </TouchableOpacity>

        <View style={styles.modeSwitcher}>
          {(['angel', 'heatmap', 'night'] as MapMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeBtn, mapMode === mode && styles.modeBtnActive]}
              onPress={() => handleModeChange(mode)}
            >
              <Text style={styles.modeBtnText}>
                {mode === 'angel' ? '🎣' : mode === 'heatmap' ? '🔥' : '🌙'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Top 3 Floating Cards */}
      <View style={styles.top3Container}>
        {top3.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={[styles.top3Card, isDark && styles.top3CardDark]}
            onPress={() => handleMarkerPress(spot)}
            activeOpacity={0.9}
          >
            <View style={styles.top3Content}>
              <Text style={[styles.top3Name, isDark && styles.textLight]} numberOfLines={1}>
                {spot.name}
              </Text>
              <Text style={styles.top3Distance}>{getDistance(spot.longitude, spot.latitude)}</Text>
            </View>
            <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(spot.fangIndex) }]}>
              <Text style={styles.scoreText}>{spot.fangIndex}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={[styles.sheetBg, isDark && styles.sheetBgDark]}
        handleIndicatorStyle={[styles.sheetHandle, isDark && styles.sheetHandleDark]}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, isDark && styles.textLight]}>
            {selectedSpot ? selectedSpot.name : 'Erkunden'}
          </Text>
          {selectedSpot && (
            <TouchableOpacity onPress={() => setSelectedSpot(null)}>
              <Text style={styles.sheetClose}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {selectedSpot ? (
            // Spot Detail View
            <View>
              <View style={styles.spotHeader}>
                <View style={[styles.spotScoreCircle, { backgroundColor: getScoreColor(selectedSpot.fangIndex) }]}>
                  <Text style={styles.spotScoreText}>{selectedSpot.fangIndex}</Text>
                </View>
                <View style={styles.spotInfo}>
                  <Text style={styles.spotType}>{selectedSpot.type.toUpperCase()}</Text>
                  <Text style={[styles.spotDistance, isDark && styles.textLight]}>
                    {getDistance(selectedSpot.longitude, selectedSpot.latitude)} entfernt
                  </Text>
                </View>
              </View>

              {selectedSpot.fish_species?.length > 0 && (
                <View style={styles.fishSection}>
                  <Text style={[styles.sectionLabel, isDark && styles.textLight]}>Fischarten</Text>
                  <View style={styles.fishGrid}>
                    {selectedSpot.fish_species.map((fish, i) => (
                      <View key={i} style={[styles.fishTag, isDark && styles.fishTagDark]}>
                        <Text style={[styles.fishTagText, isDark && styles.textLight]}>{fish}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedSpot.permit_price && (
                <View style={styles.priceSection}>
                  <Text style={[styles.sectionLabel, isDark && styles.textLight]}>Tageskarte</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceValue}>€{selectedSpot.permit_price}</Text>
                    <TouchableOpacity style={styles.buyBtn}>
                      <Text style={styles.buyBtnText}>Kaufen</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            // Fish Filter View
            <View>
              <Text style={[styles.filterLabel, isDark && styles.textLight]}>Fisch-Filter</Text>
              <View style={styles.filterGrid}>
                {FISH_FILTERS.map((fish) => (
                  <TouchableOpacity
                    key={fish.id}
                    style={[
                      styles.filterChip,
                      isDark && styles.filterChipDark,
                      selectedFish.includes(fish.id) && styles.filterChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedFish((prev) =>
                        prev.includes(fish.id)
                          ? prev.filter((f) => f !== fish.id)
                          : [...prev, fish.id]
                      );
                    }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedFish.includes(fish.id) && styles.filterChipTextActive,
                    ]}>
                      {fish.name}
                    </Text>
                    <View style={[
                      styles.confidenceBadge,
                      fish.confidence === 'high' && styles.confidenceHigh,
                      fish.confidence === 'medium' && styles.confidenceMedium,
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white },
  loadingDark: { backgroundColor: colors.dark.bg },
  loadingText: { marginTop: 12, color: colors.gray600, fontSize: 14 },
  textLight: { color: colors.white },
  map: { flex: 1 },

  // Markers
  markerContainer: { alignItems: 'center' },
  marker: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: { color: colors.white, fontSize: 13, fontWeight: '600' },
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

  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  topBarDark: { backgroundColor: 'rgba(10,26,47,0.95)' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gray100, justifyContent: 'center', alignItems: 'center' },
  iconBtnDark: { backgroundColor: colors.dark.surface },
  iconText: { fontSize: 20, color: colors.gray600 },

  // Mode Switcher
  modeSwitcher: { flexDirection: 'row', gap: 8 },
  modeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, justifyContent: 'center', alignItems: 'center' },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 18 },

  // Top 3 Cards
  top3Container: { position: 'absolute', right: 16, top: Platform.OS === 'ios' ? 116 : 96, gap: 8 },
  top3Card: { 
    width: 150, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 16, 
    padding: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  top3CardDark: { backgroundColor: 'rgba(19,35,55,0.95)' },
  top3Content: { flex: 1, marginRight: 8 },
  top3Name: { fontSize: 12, fontWeight: '600', color: colors.gray900 },
  top3Distance: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  scoreCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  scoreText: { color: colors.white, fontSize: 11, fontWeight: '700' },

  // Bottom Sheet
  sheetBg: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetBgDark: { backgroundColor: colors.dark.surface },
  sheetHandle: { backgroundColor: colors.gray200, width: 40 },
  sheetHandleDark: { backgroundColor: colors.gray600 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: colors.gray900 },
  sheetClose: { fontSize: 18, color: colors.gray400, padding: 4 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Spot Detail
  spotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  spotScoreCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  spotScoreText: { color: colors.white, fontSize: 22, fontWeight: '700' },
  spotInfo: { flex: 1 },
  spotType: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 4 },
  spotDistance: { fontSize: 14, color: colors.gray600 },

  // Fish Section
  fishSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 12 },
  fishGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fishTag: { backgroundColor: colors.gray100, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  fishTagDark: { backgroundColor: colors.dark.bg },
  fishTagText: { fontSize: 13, color: colors.gray600 },

  // Price Section
  priceSection: { marginBottom: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceValue: { fontSize: 28, fontWeight: '700', color: colors.gray900 },
  buyBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buyBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },

  // Filters
  filterLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 12, marginTop: 8 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray100, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, gap: 6 },
  filterChipDark: { backgroundColor: colors.dark.bg },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { fontSize: 14, color: colors.gray600 },
  filterChipTextActive: { color: colors.white },
  confidenceBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray400 },
  confidenceHigh: { backgroundColor: colors.green },
  confidenceMedium: { backgroundColor: colors.yellow },
});

export default MapScreen;
