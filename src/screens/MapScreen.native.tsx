// BISS Premium Map - Mapbox GL JS via WebView
// Die geilste Angelkarte Deutschlands! 🎣
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import { calculateFangIndex } from '../services/xai';
import { getWeather } from '../services/weather';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mapbox Access Token - Free Tier (50k loads/month)
// Token aus .env laden oder Demo-Token verwenden
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiYmlzcy1hcHAiLCJhIjoiY200MjN4cXRsMDB4MTJrcXRxOGV4NXRhYiJ9.demo';

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
  imageUrl?: string;
}

// Theme based on time of day
type MapTheme = 'day' | 'dusk' | 'night' | 'heatmap';

const getThemeForTime = (): MapTheme => {
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 6) return 'night';
  if (hour >= 18) return 'dusk';
  return 'day';
};

// Fish filter options
const FISH_FILTERS = [
  { id: 'all', name: 'Alle', icon: '🐟' },
  { id: 'forelle', name: 'Forelle', icon: '🎣' },
  { id: 'karpfen', name: 'Karpfen', icon: '🐠' },
  { id: 'hecht', name: 'Hecht', icon: '🦈' },
  { id: 'zander', name: 'Zander', icon: '🐡' },
  { id: 'barsch', name: 'Barsch', icon: '🐟' },
  { id: 'aal', name: 'Aal', icon: '🐍' },
  { id: 'wels', name: 'Wels', icon: '🐋' },
];

// Get marker color based on Fangindex
const getScoreColor = (score: number) => {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'PERFEKT';
  if (score >= 70) return 'TOP';
  if (score >= 50) return 'GUT';
  return 'MÄSSIG';
};

// Generate Mapbox HTML with all styles
const generateMapHTML = (
  theme: MapTheme,
  waterBodies: MapWaterBody[],
  userLat: number,
  userLon: number,
  selectedFish: string | null
) => {
  // Filter water bodies based on fish selection
  const filtered = selectedFish && selectedFish !== 'all'
    ? waterBodies.filter(wb => 
        wb.fish_species?.some(f => f.toLowerCase().includes(selectedFish.toLowerCase()))
      )
    : waterBodies;

  const dimmedIds = selectedFish && selectedFish !== 'all'
    ? waterBodies.filter(wb => 
        !wb.fish_species?.some(f => f.toLowerCase().includes(selectedFish.toLowerCase()))
      ).map(wb => wb.id)
    : [];

  // GeoJSON for markers
  const markersGeoJSON = {
    type: 'FeatureCollection',
    features: filtered.map(wb => ({
      type: 'Feature',
      properties: {
        id: wb.id,
        name: wb.name,
        type: wb.type,
        fangIndex: wb.fangIndex,
        color: getScoreColor(wb.fangIndex),
        dimmed: dimmedIds.includes(wb.id),
      },
      geometry: {
        type: 'Point',
        coordinates: [wb.longitude, wb.latitude],
      },
    })),
  };

  // Theme styles
  const themes = {
    day: {
      bg: '#f8fafc',
      water: '#00A3AD',
      waterGlow: 'rgba(0, 163, 173, 0.3)',
      land: '#e2e8f0',
      roads: '#cbd5e1',
      labels: '#334155',
    },
    dusk: {
      bg: '#1e293b',
      water: '#0891b2',
      waterGlow: 'rgba(8, 145, 178, 0.4)',
      land: '#0f172a',
      roads: '#334155',
      labels: '#94a3b8',
    },
    night: {
      bg: '#020617',
      water: '#00d4ff',
      waterGlow: 'rgba(0, 212, 255, 0.5)',
      land: '#0a0a0f',
      roads: '#1e293b',
      labels: '#64748b',
    },
    heatmap: {
      bg: '#0f172a',
      water: '#0ea5e9',
      waterGlow: 'rgba(14, 165, 233, 0.3)',
      land: '#1e293b',
      roads: '#334155',
      labels: '#94a3b8',
    },
  };

  const t = themes[theme];

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
    body { overflow: hidden; }
    #map { width: 100vw; height: 100vh; }
    
    /* Custom marker styles */
    .marker {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      cursor: pointer;
      transition: transform 0.2s;
      position: relative;
    }
    .marker:hover { transform: scale(1.1); }
    .marker.dimmed { opacity: 0.25; }
    
    /* Glow effect for high scores */
    .marker.glow::before {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: inherit;
      opacity: 0.4;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.15); opacity: 0.2; }
    }
    
    /* Arrow below marker */
    .marker::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid currentColor;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_TOKEN}';
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: {
        version: 8,
        name: 'BISS Angel-${theme}',
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '${t.bg}' }
          },
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            paint: { 
              'raster-opacity': ${theme === 'night' ? 0.15 : theme === 'dusk' ? 0.25 : 0.4},
              'raster-saturation': -0.5,
              'raster-contrast': ${theme === 'night' ? 0.3 : 0}
            }
          }
        ]
      },
      center: [${userLon}, ${userLat}],
      zoom: 11,
      attributionControl: false
    });

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      // Add water bodies source
      map.addSource('water-bodies', {
        type: 'geojson',
        data: ${JSON.stringify(markersGeoJSON)},
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'water-bodies',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#4ade80',
          'circle-radius': ['step', ['get', 'point_count'], 25, 10, 35, 30, 45],
          'circle-stroke-width': 3,
          'circle-stroke-color': 'rgba(255,255,255,0.3)'
        }
      });

      // Cluster count
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'water-bodies',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: { 'text-color': '#052e16' }
      });

      // Individual markers - custom HTML
      map.on('data', (e) => {
        if (e.sourceId !== 'water-bodies' || !e.isSourceLoaded) return;
        updateMarkers();
      });

      map.on('move', updateMarkers);
      map.on('moveend', updateMarkers);

      // Click on cluster to zoom
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('water-bodies').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
        });
      });

      map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
    });

    // Marker management
    const markers = {};

    function updateMarkers() {
      const features = map.querySourceFeatures('water-bodies', { filter: ['!', ['has', 'point_count']] });
      
      // Remove old markers
      Object.keys(markers).forEach(id => {
        if (!features.find(f => f.properties.id === id)) {
          markers[id].remove();
          delete markers[id];
        }
      });

      // Add/update markers
      features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        const props = feature.properties;
        const id = props.id;

        if (markers[id]) return;

        const el = document.createElement('div');
        el.className = 'marker' + (props.fangIndex >= 80 ? ' glow' : '') + (props.dimmed ? ' dimmed' : '');
        el.style.backgroundColor = props.color;
        el.style.color = props.color;
        el.innerHTML = props.fangIndex;
        
        el.addEventListener('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClick',
            id: props.id,
            name: props.name
          }));
        });

        markers[id] = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map);
      });
    }

    // User location marker
    const userMarker = document.createElement('div');
    userMarker.innerHTML = '<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 12px #3b82f6;"></div>';
    new mapboxgl.Marker(userMarker).setLngLat([${userLon}, ${userLat}]).addTo(map);

    // Listen for messages from React Native
    window.addEventListener('message', (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'flyTo') {
          map.flyTo({ center: [msg.lon, msg.lat], zoom: 15, duration: 1000 });
        }
        if (msg.type === 'setTheme') {
          // Theme switching would reload - for now just adjust opacity
          const opacity = msg.theme === 'night' ? 0.15 : msg.theme === 'dusk' ? 0.25 : 0.4;
          map.setPaintProperty('osm-tiles', 'raster-opacity', opacity);
        }
      } catch(err) {}
    });

    // Notify React Native that map is ready
    map.on('load', () => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
    });
  </script>
</body>
</html>
`;
};

export const MapScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const webViewRef = useRef<WebView>(null);
  const [waterBodies, setWaterBodies] = useState<MapWaterBody[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<MapWaterBody | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 53.3347, lon: 9.9717 });
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [theme, setTheme] = useState<MapTheme>(getThemeForTime());
  const [selectedFish, setSelectedFish] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    // Auto-switch theme every minute
    const interval = setInterval(() => {
      setTheme(getThemeForTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.spring(sheetAnim, {
      toValue: selectedSpot ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [selectedSpot]);

  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { lat: 53.3347, lon: 9.9717 };
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = { lat: location.coords.latitude, lon: location.coords.longitude };
        } catch (e) {
          console.log('Location error:', e);
        }
      }
      setUserLocation(coords);

      // Load weather
      const weatherData = await getWeather(coords.lat, coords.lon);
      setWeather(weatherData);

      // Load water bodies
      const { data, error } = await supabase.from('water_bodies').select('*');
      if (error) throw error;

      // Calculate fangindex for each
      const withScores = await Promise.all(
        (data || []).map(async (wb) => {
          const result = await calculateFangIndex(wb.name, weatherData, null);
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

  const handleWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'mapReady') {
        setMapReady(true);
      }
      if (msg.type === 'markerClick') {
        const spot = waterBodies.find(wb => wb.id === msg.id);
        if (spot) setSelectedSpot(spot);
      }
    } catch (e) {}
  };

  const flyToSpot = (spot: MapWaterBody) => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'flyTo',
      lat: spot.latitude,
      lon: spot.longitude,
    }));
    setSelectedSpot(spot);
  };

  const getDistance = (lat: number, lon: number): string => {
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

  const getDriveTime = (km: number): string => {
    const mins = Math.round(km * 1.5); // Rough estimate
    return mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}min`;
  };

  // Generate xAI-style reasoning for Fangindex
  const getFangindexReason = (score: number): string => {
    if (!weather) return 'Lade Wetter-Daten...';
    const reasons = [];
    if (weather.temp >= 15 && weather.temp <= 22) reasons.push(`${Math.round(weather.temp)}°C optimal`);
    else if (weather.temp < 10) reasons.push(`${Math.round(weather.temp)}°C - kühler`);
    if (weather.clouds > 50) reasons.push('bewölkt ✓');
    if (weather.pressure < 1010) reasons.push('Tiefdruck ✓');
    if (weather.wind < 15) reasons.push('windstill ✓');
    return reasons.length ? `Heute ${score >= 70 ? 'top' : 'ok'}: ${reasons.join(', ')}` : 'Durchschnittliche Bedingungen';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A3AD" />
        <Text style={styles.loadingText}>Lade BISS Karte...</Text>
        <Text style={styles.loadingSubtext}>Die geilste Angelkarte Deutschlands</Text>
      </View>
    );
  }

  const mapHTML = generateMapHTML(theme, waterBodies, userLocation.lat, userLocation.lon, selectedFish);

  return (
    <View style={styles.container}>
      {/* Mapbox WebView */}
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: mapHTML }}
        onMessage={handleWebViewMessage}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color="#00A3AD" />
          </View>
        )}
      />

      {/* Top Gradient */}
      <LinearGradient
        colors={['rgba(10,22,40,0.95)', 'rgba(10,22,40,0.6)', 'transparent']}
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
          <Text style={styles.headerTitle}>BISS Karte</Text>
          <View style={styles.themeBadge}>
            <Text style={styles.themeBadgeText}>
              {theme === 'night' ? '🌙' : theme === 'dusk' ? '🌅' : '☀️'} {theme.toUpperCase()}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.themeBtn, theme === 'heatmap' && styles.themeBtnActive]} 
          onPress={() => setTheme(t => t === 'heatmap' ? getThemeForTime() : 'heatmap')}
        >
          <Text style={styles.themeBtnText}>🔥</Text>
        </TouchableOpacity>
      </View>

      {/* Fish Filter Toggle */}
      <TouchableOpacity 
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={styles.filterToggleIcon}>🐟</Text>
        <Text style={styles.filterToggleText}>
          {selectedFish && selectedFish !== 'all' 
            ? FISH_FILTERS.find(f => f.id === selectedFish)?.name 
            : 'Filter'}
        </Text>
      </TouchableOpacity>

      {/* Fish Filter Panel */}
      <Animated.View 
        style={[
          styles.filterPanel,
          {
            opacity: filterAnim,
            transform: [{ translateY: filterAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
        pointerEvents={showFilters ? 'auto' : 'none'}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FISH_FILTERS.map((fish) => (
            <TouchableOpacity
              key={fish.id}
              style={[
                styles.fishBtn,
                selectedFish === fish.id && styles.fishBtnActive,
              ]}
              onPress={() => {
                setSelectedFish(fish.id === 'all' ? null : fish.id);
                setShowFilters(false);
              }}
            >
              <Text style={styles.fishBtnIcon}>{fish.icon}</Text>
              <Text style={[styles.fishBtnText, selectedFish === fish.id && styles.fishBtnTextActive]}>
                {fish.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>70+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>50-69</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>&lt;50</Text>
        </View>
      </View>

      {/* Premium Bottom Sheet */}
      {selectedSpot && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{
                translateY: sheetAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SCREEN_HEIGHT, 0],
                }),
              }],
            },
          ]}
        >
          <LinearGradient colors={['#0f1729', '#0a1628']} style={styles.sheetGradient}>
            {/* Handle */}
            <View style={styles.sheetHandle} />
            
            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedSpot(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              {/* Hero Image Placeholder */}
              <View style={styles.heroImage}>
                <LinearGradient
                  colors={['transparent', 'rgba(15,23,41,0.9)']}
                  style={styles.heroGradient}
                />
                <Text style={styles.heroEmoji}>
                  {selectedSpot.type === 'teich' ? '🎣' : selectedSpot.type === 'see' ? '🏞️' : '🌊'}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.sheetContent}>
                {/* Header with Score */}
                <View style={styles.spotHeader}>
                  <View style={styles.spotHeaderLeft}>
                    <View style={styles.typeChip}>
                      <Text style={styles.typeChipText}>{selectedSpot.type.toUpperCase()}</Text>
                      {selectedSpot.is_assumed && <Text style={styles.assumedChip}>VORSCHLAG</Text>}
                    </View>
                    <Text style={styles.spotName}>{selectedSpot.name}</Text>
                    <View style={styles.distanceRow}>
                      <Text style={styles.distanceText}>
                        📍 {getDistance(selectedSpot.latitude, selectedSpot.longitude)}
                      </Text>
                      <Text style={styles.driveText}>
                        🚗 ~{getDriveTime(parseFloat(getDistance(selectedSpot.latitude, selectedSpot.longitude)))}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(selectedSpot.fangIndex) }]}>
                    <Text style={styles.scoreValue}>{selectedSpot.fangIndex}</Text>
                    <Text style={styles.scoreLabel}>{getScoreLabel(selectedSpot.fangIndex)}</Text>
                  </View>
                </View>

                {/* Fangindex Bar */}
                <View style={styles.fangindexBar}>
                  <View style={styles.fangindexTrack}>
                    <View 
                      style={[
                        styles.fangindexFill, 
                        { width: `${selectedSpot.fangIndex}%`, backgroundColor: getScoreColor(selectedSpot.fangIndex) }
                      ]} 
                    />
                  </View>
                  <Text style={styles.fangindexReason}>
                    💡 {getFangindexReason(selectedSpot.fangIndex)}
                  </Text>
                </View>

                {/* Fish Species */}
                {selectedSpot.fish_species?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FISCHARTEN</Text>
                    <View style={styles.fishGrid}>
                      {selectedSpot.fish_species.map((fish, i) => (
                        <View key={i} style={styles.fishChip}>
                          <Text style={styles.fishChipText}>🐟 {fish}</Text>
                          <View style={styles.confidenceBadge}>
                            <Text style={styles.confidenceText}>
                              {selectedSpot.is_assumed ? 'Vermutet' : 'Bestätigt'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Price */}
                {selectedSpot.permit_price && (
                  <TouchableOpacity style={styles.priceCard}>
                    <View>
                      <Text style={styles.priceLabel}>Tageskarte</Text>
                      <Text style={styles.priceValue}>€{selectedSpot.permit_price}</Text>
                    </View>
                    <View style={styles.buyBtn}>
                      <Text style={styles.buyBtnText}>Jetzt kaufen</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.primaryAction}
                    onPress={() => flyToSpot(selectedSpot)}
                  >
                    <Text style={styles.primaryActionText}>🔍 Zoom zum Spot</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Text style={styles.secondaryActionIcon}>❤️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Text style={styles.secondaryActionIcon}>📤</Text>
                  </TouchableOpacity>
                </View>

                {/* Coordinates */}
                <View style={styles.coordsBox}>
                  <Text style={styles.coordsLabel}>Koordinaten</Text>
                  <Text style={styles.coordsText}>
                    {selectedSpot.latitude.toFixed(5)}° N, {selectedSpot.longitude.toFixed(5)}° E
                  </Text>
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1628' },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16 },
  loadingSubtext: { color: '#64748b', fontSize: 14, marginTop: 4 },
  map: { flex: 1 },
  mapLoading: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1628' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  
  // Header
  header: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 36, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,163,173,0.2)', justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: '#00A3AD', fontSize: 24, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  themeBadge: { backgroundColor: 'rgba(0,163,173,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  themeBadgeText: { color: '#00A3AD', fontSize: 11, fontWeight: '600' },
  themeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  themeBtnActive: { backgroundColor: 'rgba(239,68,68,0.3)' },
  themeBtnText: { fontSize: 20 },

  // Filter
  filterToggle: { position: 'absolute', top: Platform.OS === 'ios' ? 120 : 100, left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,163,173,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterToggleIcon: { fontSize: 18, marginRight: 6 },
  filterToggleText: { color: '#00A3AD', fontSize: 14, fontWeight: '600' },
  filterPanel: { position: 'absolute', top: Platform.OS === 'ios' ? 165 : 145, left: 0, right: 0, paddingHorizontal: 16 },
  fishBtn: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginRight: 10 },
  fishBtnActive: { backgroundColor: '#00A3AD' },
  fishBtnIcon: { fontSize: 24, marginBottom: 4 },
  fishBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  fishBtnTextActive: { color: '#fff' },

  // Legend
  legend: { position: 'absolute', left: 16, bottom: 100, backgroundColor: 'rgba(15,23,41,0.9)', borderRadius: 12, padding: 10, gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 14, height: 14, borderRadius: 7 },
  legendText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },

  // Bottom Sheet
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: SCREEN_HEIGHT * 0.75, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  sheetGradient: { flex: 1 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  closeBtn: { position: 'absolute', top: 16, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  closeBtnText: { color: '#94a3b8', fontSize: 18 },
  sheetScroll: { flex: 1 },
  
  // Hero
  heroImage: { height: 180, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroEmoji: { fontSize: 64 },

  // Content
  sheetContent: { padding: 20 },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  spotHeaderLeft: { flex: 1, marginRight: 16 },
  typeChip: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeChipText: { color: '#00A3AD', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(0,163,173,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  assumedChip: { color: '#fbbf24', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(251,191,36,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  spotName: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  distanceRow: { flexDirection: 'row', gap: 16 },
  distanceText: { color: '#94a3b8', fontSize: 14 },
  driveText: { color: '#64748b', fontSize: 14 },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  scoreValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700' },

  // Fangindex Bar
  fangindexBar: { marginBottom: 20 },
  fangindexTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  fangindexFill: { height: '100%', borderRadius: 4 },
  fangindexReason: { color: '#94a3b8', fontSize: 13, marginTop: 8 },

  // Section
  section: { marginBottom: 20 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  fishGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fishChip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  fishChipText: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  confidenceBadge: { marginTop: 4 },
  confidenceText: { color: '#64748b', fontSize: 10 },

  // Price
  priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,163,173,0.15)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,163,173,0.3)' },
  priceLabel: { color: '#00A3AD', fontSize: 12, fontWeight: '600' },
  priceValue: { color: '#fff', fontSize: 28, fontWeight: '800' },
  buyBtn: { backgroundColor: '#00A3AD', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  buyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Actions
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  primaryAction: { flex: 1, backgroundColor: '#00A3AD', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryActionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryAction: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  secondaryActionIcon: { fontSize: 22 },

  // Coords
  coordsBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 40 },
  coordsLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  coordsText: { color: '#94a3b8', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});

export default MapScreen;
