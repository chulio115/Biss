/**
 * BISS MapScreen - 2026 Clean Design (Expo Go Compatible)
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
  Animated,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { supabase } from '../services/supabase';
import { calculateFangIndex } from '../services/xai';
import { getWeather } from '../services/weather';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';

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
  },
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

// Generate Mapbox GL JS HTML
const generateMapHTML = (
  mode: MapMode,
  waterBodies: MapWaterBody[],
  userLat: number,
  userLon: number,
  isDark: boolean
) => {
  const styleUrl = mode === 'night' || isDark
    ? 'mapbox://styles/mapbox/dark-v11'
    : mode === 'heatmap'
    ? 'mapbox://styles/mapbox/light-v11'
    : 'mapbox://styles/mapbox/light-v11';

  const markersGeoJSON = {
    type: 'FeatureCollection',
    features: waterBodies.map(wb => ({
      type: 'Feature',
      properties: {
        id: wb.id,
        name: wb.name,
        fangIndex: wb.fangIndex,
        color: getScoreColor(wb.fangIndex),
      },
      geometry: {
        type: 'Point',
        coordinates: [wb.longitude, wb.latitude],
      },
    })),
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"></script>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: ${isDark ? '#0A1A2F' : '#F5F5F5'}; }
    #map { width: 100vw; height: 100vh; }
    
    .marker {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .marker:active { transform: scale(0.95); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_TOKEN}';
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: '${styleUrl}',
      center: [${userLon}, ${userLat}],
      zoom: 12,
      attributionControl: false
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    // User location
    const userEl = document.createElement('div');
    userEl.innerHTML = '<div style="width:14px;height:14px;background:#0066FF;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(0,102,255,0.5);"></div>';
    new mapboxgl.Marker(userEl).setLngLat([${userLon}, ${userLat}]).addTo(map);

    map.on('load', () => {
      // Add markers
      const data = ${JSON.stringify(markersGeoJSON)};
      
      data.features.forEach(feature => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = feature.properties.color;
        el.textContent = feature.properties.fangIndex;
        
        el.addEventListener('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClick',
            id: feature.properties.id
          }));
        });

        new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
      });

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
    });

    window.addEventListener('message', (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'flyTo') {
          map.flyTo({ center: [msg.lon, msg.lat], zoom: 14, duration: 800 });
        }
      } catch(err) {}
    });
  </script>
</body>
</html>
`;
};

export const MapScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const webViewRef = useRef<WebView>(null);
  const sheetAnim = useRef(new Animated.Value(90)).current;
  
  const [waterBodies, setWaterBodies] = useState<MapWaterBody[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<MapWaterBody | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 53.3347, lon: 9.9717 });
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>('angel');
  const [selectedFish, setSelectedFish] = useState<string[]>([]);
  const [top3, setTop3] = useState<MapWaterBody[]>([]);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    Animated.spring(sheetAnim, {
      toValue: sheetExpanded ? 260 : 90,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
  }, [sheetExpanded]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: location.coords.latitude, lon: location.coords.longitude });
      }

      const { data, error } = await supabase.from('water_bodies').select('*');
      if (error) throw error;

      const weather = await getWeather(userLocation.lat, userLocation.lon);

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
      setTop3([...scored].sort((a, b) => b.fangIndex - a.fangIndex).slice(0, 3));
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'markerClick') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const spot = waterBodies.find(wb => wb.id === msg.id);
        if (spot) setSelectedSpot(spot);
      }
    } catch (e) {}
  };

  const flyToSpot = (spot: MapWaterBody) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'flyTo',
      lat: spot.latitude,
      lon: spot.longitude,
    }));
  };

  const handleModeChange = (mode: MapMode) => {
    Haptics.selectionAsync();
    setMapMode(mode);
  };

  const getDistance = (lat: number, lon: number): string => {
    const R = 6371;
    const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
    const dLon = ((lon - userLocation.lon) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + 
              Math.cos((userLocation.lat * Math.PI) / 180) * 
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

  const mapHTML = generateMapHTML(mapMode, waterBodies, userLocation.lat, userLocation.lon, isDark);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Map */}
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: mapHTML }}
        onMessage={handleWebViewMessage}
        scrollEnabled={false}
        bounces={false}
      />

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

      {/* Top 3 Cards */}
      <View style={styles.top3Container}>
        {top3.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={[styles.top3Card, isDark && styles.top3CardDark]}
            onPress={() => flyToSpot(spot)}
          >
            <View style={styles.top3Content}>
              <Text style={[styles.top3Name, isDark && styles.textLight]} numberOfLines={1}>
                {spot.name}
              </Text>
              <Text style={styles.top3Distance}>{getDistance(spot.latitude, spot.longitude)}</Text>
            </View>
            <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(spot.fangIndex) }]}>
              <Text style={styles.scoreText}>{spot.fangIndex}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, isDark && styles.bottomSheetDark, { height: sheetAnim }]}>
        <TouchableOpacity style={styles.sheetHandle} onPress={() => setSheetExpanded(!sheetExpanded)}>
          <View style={[styles.handleBar, isDark && styles.handleBarDark]} />
        </TouchableOpacity>
        
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, isDark && styles.textLight]}>Erkunden</Text>
          <Text style={styles.sheetArrow}>{sheetExpanded ? '↓' : '↑'}</Text>
        </View>

        {sheetExpanded && (
          <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
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
          </ScrollView>
        )}
      </Animated.View>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, isDark && styles.modalDark]}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedSpot(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={[styles.modalTitle, isDark && styles.textLight]}>{selectedSpot.name}</Text>
            <Text style={styles.modalType}>{selectedSpot.type.toUpperCase()}</Text>
            
            <View style={styles.modalScore}>
              <View style={[styles.modalScoreCircle, { backgroundColor: getScoreColor(selectedSpot.fangIndex) }]}>
                <Text style={styles.modalScoreText}>{selectedSpot.fangIndex}</Text>
              </View>
              <Text style={styles.modalDistance}>{getDistance(selectedSpot.latitude, selectedSpot.longitude)}</Text>
            </View>

            {selectedSpot.fish_species?.length > 0 && (
              <View style={styles.modalFish}>
                {selectedSpot.fish_species.slice(0, 4).map((fish, i) => (
                  <View key={i} style={[styles.fishTag, isDark && styles.fishTagDark]}>
                    <Text style={[styles.fishTagText, isDark && styles.textLight]}>{fish}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.modalBtn} onPress={() => { flyToSpot(selectedSpot); setSelectedSpot(null); }}>
              <Text style={styles.modalBtnText}>Zum Spot</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  containerDark: { backgroundColor: colors.dark.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white },
  loadingDark: { backgroundColor: colors.dark.bg },
  loadingText: { marginTop: 12, color: colors.gray600, fontSize: 14 },
  textLight: { color: colors.white },
  map: { flex: 1 },

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
  top3Card: { width: 150, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  top3CardDark: { backgroundColor: 'rgba(19,35,55,0.95)' },
  top3Content: { flex: 1, marginRight: 8 },
  top3Name: { fontSize: 12, fontWeight: '600', color: colors.gray900 },
  top3Distance: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  scoreCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  scoreText: { color: colors.white, fontSize: 11, fontWeight: '700' },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheetDark: { backgroundColor: colors.dark.surface },
  sheetHandle: { alignItems: 'center', paddingVertical: 12 },
  handleBar: { width: 40, height: 4, backgroundColor: colors.gray200, borderRadius: 2 },
  handleBarDark: { backgroundColor: colors.gray600 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.gray900 },
  sheetArrow: { fontSize: 14, color: colors.gray400 },
  sheetContent: { paddingHorizontal: 20, paddingTop: 16 },

  // Filters
  filterLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 12 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray100, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, gap: 6 },
  filterChipDark: { backgroundColor: colors.dark.bg },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { fontSize: 14, color: colors.gray600 },
  filterChipTextActive: { color: colors.white },
  confidenceBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray400 },
  confidenceHigh: { backgroundColor: colors.green },
  confidenceMedium: { backgroundColor: colors.yellow },

  // Modal
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { backgroundColor: colors.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 340 },
  modalDark: { backgroundColor: colors.dark.surface },
  modalClose: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gray100, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 16, color: colors.gray600 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.gray900, marginBottom: 4 },
  modalType: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 16 },
  modalScore: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalScoreCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  modalScoreText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  modalDistance: { fontSize: 14, color: colors.gray400 },
  modalFish: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  fishTag: { backgroundColor: colors.gray100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  fishTagDark: { backgroundColor: colors.dark.bg },
  fishTagText: { fontSize: 13, color: colors.gray600 },
  modalBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});

export default MapScreen;
