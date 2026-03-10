/**
 * BISS Map Screen - Refactored
 * Clean orchestrator: delegates data to useMapData, UI to sub-components.
 * Includes Mapbox marker clustering for performance.
 */
import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SearchScreen } from './SearchScreen';
import { MapTopBar, MapZoomControls, MapBottomSheet, BiteTimeModal, RatingModal, MapFilterSheet, FilterFAB, DEFAULT_FILTERS } from '../components/map';
import type { MapFilters } from '../components/map';
import { CAMERA_CONFIG, getStyleURL, shouldUseNightMode, MARKER_CONFIG } from '../config/map.config';
import { useMapData } from '../hooks/useMapData';
import { useSmartFishing } from '../hooks/useSmartFishing';
import { useFavorites } from '../hooks/useFavorites';
import { useRatings } from '../hooks/useRatings';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useForecast } from '../hooks/useForecast';
import { OfflineBanner } from '../components/ui/OfflineBanner';
import { COLORS, getScoreColor } from '../constants/colors';
import { SPOT_CATEGORIES } from '../constants/fishing';
import { MapWaterBody } from '../types/map';

// Initialize Mapbox
if (!process.env.EXPO_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('EXPO_PUBLIC_MAPBOX_TOKEN is missing in .env');
}
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

// ─── GeoJSON Helpers ───

const buildGeoJSON = (waterBodies: MapWaterBody[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: waterBodies.map((wb) => ({
    type: 'Feature' as const,
    id: wb.id,
    geometry: {
      type: 'Point' as const,
      coordinates: [wb.longitude, wb.latitude],
    },
    properties: {
      id: wb.id,
      name: wb.name,
      fangIndex: wb.fangIndex,
      category: wb.category,
      color: getScoreColor(wb.fangIndex),
      isHot: wb.fangIndex >= 75 ? 1 : 0,
      isTop: wb.fangIndex >= 85 ? 1 : 0,
      glowColor: wb.fangIndex >= 75 ? getScoreColor(wb.fangIndex) + '40' : 'transparent',
      categoryColor: SPOT_CATEGORIES[wb.category]?.color || '#F59E0B',
      categoryIcon: SPOT_CATEGORIES[wb.category]?.icon || '🎯',
    },
  })),
});

// ─── Component ───

export const MapScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const bottomSheetRef = useRef<BottomSheet>(null) as React.RefObject<BottomSheet>;

  // Data hook
  const {
    waterBodies,
    top3,
    userLocation,
    loading,
    sunTimes,
    goldenHourInfo,
    reload,
    isOfflineData,
    cacheAge,
  } = useMapData();

  // Network status (Opas Rat #4: Offline-Modus)
  const { isOffline, onReconnect } = useNetworkStatus();

  // 48h Fangindex-Prognose (Spot-Daten 2.0)
  const { forecast, loading: forecastLoading, loadForecast } = useForecast();

  // Auto-reload when coming back online
  React.useEffect(() => {
    const cleanup = onReconnect(() => {
      console.log('🌐 Reconnected — reloading map data');
      reload();
    });
    return cleanup;
  }, [onReconnect, reload]);

  // Smart Fishing hook
  const {
    headline: smartHeadline,
    subheadline: smartSubheadline,
    isGoldenHour: smartIsGoldenHour,
    currentCondition,
    loading: smartLoading,
  } = useSmartFishing(waterBodies, userLocation);

  // Favorites
  const { isFavorite, toggleFavorite, favoriteIds } = useFavorites();

  // Ratings
  const { submitRating, getSummaryForSpot, getRatingForSpot } = useRatings();

  // Local state
  const [selectedSpot, setSelectedSpot] = useState<MapWaterBody | null>(null);
  const [isNightMode, setIsNightMode] = useState(shouldUseNightMode());
  const [showSearch, setShowSearch] = useState(false);
  const [showFangindexInfo, setShowFangindexInfo] = useState(false);
  const [showBiteTimeInfo, setShowBiteTimeInfo] = useState(false);
  const [ratingSpotId, setRatingSpotId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapFilters, setMapFilters] = useState<MapFilters>(DEFAULT_FILTERS);

  const activeFilterCount = [
    mapFilters.categories.length > 0,
    mapFilters.fish.length > 0,
    mapFilters.minScore > 0,
    mapFilters.onlyFavorites,
    mapFilters.minRating > 0,
  ].filter(Boolean).length;

  // Filtered water bodies
  const filteredWaterBodies = useMemo(() => {
    let filtered = waterBodies;
    if (mapFilters.categories.length > 0) {
      filtered = filtered.filter((wb) => mapFilters.categories.includes(wb.category));
    }
    if (mapFilters.fish.length > 0) {
      filtered = filtered.filter((wb) =>
        wb.fish_species?.some((f) => mapFilters.fish.includes(f.toLowerCase()))
      );
    }
    if (mapFilters.minScore > 0) {
      filtered = filtered.filter((wb) => wb.fangIndex >= mapFilters.minScore);
    }
    if (mapFilters.onlyFavorites) {
      filtered = filtered.filter((wb) => isFavorite(wb.id));
    }
    if (mapFilters.minRating > 0) {
      filtered = filtered.filter((wb) => {
        const summary = getSummaryForSpot(wb.id);
        return summary.ratingCount > 0 && summary.avgRating >= mapFilters.minRating;
      });
    }
    return filtered;
  }, [waterBodies, mapFilters, isFavorite, getSummaryForSpot]);

  // GeoJSON for clustering
  const geoJSON = useMemo(() => {
    console.log('🗺️ Building GeoJSON with', filteredWaterBodies.length, 'water bodies');
    if (filteredWaterBodies.length > 0) {
      console.log('🗺️ Sample:', filteredWaterBodies[0].name, filteredWaterBodies[0].latitude, filteredWaterBodies[0].longitude, filteredWaterBodies[0].category);
    }
    return buildGeoJSON(filteredWaterBodies);
  }, [filteredWaterBodies]);

  // Handlers
  const handleMarkerPress = useCallback(
    (spot: MapWaterBody) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedSpot(spot);
      cameraRef.current?.setCamera({
        centerCoordinate: [spot.longitude, spot.latitude],
        zoomLevel: CAMERA_CONFIG.zoom.detail,
        animationDuration: CAMERA_CONFIG.animation.duration,
      });
      bottomSheetRef.current?.snapToIndex(1);
    },
    []
  );

  const handleClusterPress = useCallback(
    async (feature: any) => {
      const clusterId = feature.properties?.cluster_id;
      if (!clusterId) return;

      try {
        const zoom = await (mapRef.current as any)?.getClusterExpansionZoom(
          'waterBodiesSource',
          clusterId
        );
        cameraRef.current?.setCamera({
          centerCoordinate: feature.geometry.coordinates,
          zoomLevel: zoom || CAMERA_CONFIG.zoom.detail,
          animationDuration: CAMERA_CONFIG.animation.duration,
        });
      } catch {
        cameraRef.current?.setCamera({
          centerCoordinate: feature.geometry.coordinates,
          zoomLevel: CAMERA_CONFIG.zoom.detail,
          animationDuration: CAMERA_CONFIG.animation.duration,
        });
      }
    },
    []
  );

  const handleShapePress = useCallback(
    (e: any) => {
      const feature = e.features?.[0];
      if (!feature) return;

      // Cluster tap
      if (feature.properties?.cluster) {
        handleClusterPress(feature);
        return;
      }

      // Individual marker tap
      const spotId = feature.properties?.id;
      const spot = waterBodies.find((wb) => wb.id === spotId);
      if (spot) {
        handleMarkerPress(spot);
      }
    },
    [waterBodies, handleMarkerPress, handleClusterPress]
  );

  const handleMyLocation = useCallback(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: CAMERA_CONFIG.zoom.userLocation,
      animationDuration: CAMERA_CONFIG.animation.duration,
    });
  }, [userLocation]);

  const handleZoomIn = useCallback(async () => {
    const currentZoom = (await mapRef.current?.getZoom()) || CAMERA_CONFIG.initial.zoom;
    cameraRef.current?.setCamera({
      zoomLevel: Math.min(currentZoom + 2, CAMERA_CONFIG.zoom.max),
      animationDuration: 300,
    });
  }, []);

  const handleZoomOut = useCallback(async () => {
    const currentZoom = (await mapRef.current?.getZoom()) || CAMERA_CONFIG.initial.zoom;
    cameraRef.current?.setCamera({
      zoomLevel: Math.max(currentZoom - 2, CAMERA_CONFIG.zoom.min),
      animationDuration: 300,
    });
  }, []);

  const handleToggleFish = useCallback((fishId: string) => {
    setMapFilters((prev) => ({
      ...prev,
      fish: prev.fish.includes(fishId)
        ? prev.fish.filter((f) => f !== fishId)
        : [...prev.fish, fishId],
    }));
  }, []);

  // Loading
  if (loading) {
    return (
      <View style={[styles.loading, isDark && styles.loadingDark]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Gewässer werden geladen...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Map */}
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={getStyleURL(isNightMode)}
        rotateEnabled={CAMERA_CONFIG.gestures.rotateEnabled}
        pitchEnabled={CAMERA_CONFIG.gestures.pitchEnabled}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [
              CAMERA_CONFIG.initial.center.longitude,
              CAMERA_CONFIG.initial.center.latitude,
            ],
            zoomLevel: CAMERA_CONFIG.initial.zoom,
          }}
        />

        {/* User Location */}
        <MapboxGL.UserLocation visible animated />

        {/* Clustered Markers */}
        <MapboxGL.ShapeSource
          id="waterBodiesSource"
          shape={geoJSON}
          cluster
          clusterRadius={MARKER_CONFIG.clusterRadius}
          clusterMaxZoomLevel={14}
          onPress={handleShapePress}
        >
          {/* Cluster circles - shadow */}
          <MapboxGL.CircleLayer
            id="clusterShadow"
            filter={['has', 'point_count']}
            style={{
              circleColor: 'rgba(0,0,0,0.15)',
              circleRadius: [
                'step',
                ['get', 'point_count'],
                26, 10, 30, 25, 34, 50, 38,
              ],
              circleTranslate: [0, 2],
              circleBlur: 0.4,
            }}
          />
          {/* Cluster circles */}
          <MapboxGL.CircleLayer
            id="clusterCircles"
            filter={['has', 'point_count']}
            style={{
              circleColor: COLORS.primary,
              circleRadius: [
                'step',
                ['get', 'point_count'],
                24,   // default
                10, 28, // 10+
                25, 32, // 25+
                50, 36, // 50+
              ],
              circleOpacity: 0.92,
              circleStrokeWidth: 3,
              circleStrokeColor: COLORS.white,
            }}
          />

          {/* Cluster count text */}
          <MapboxGL.SymbolLayer
            id="clusterCount"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 15,
              textColor: COLORS.white,
              textFont: ['DIN Pro Bold', 'Arial Unicode MS Bold'],
              textAllowOverlap: true,
            }}
          />

          {/* 🔥 Hot Spot Outer Glow — pulsing halo for fangIndex >= 75 */}
          <MapboxGL.CircleLayer
            id="hotSpotGlow"
            filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'isHot'], 1]]}
            style={{
              circleColor: ['get', 'color'],
              circleRadius: [
                'interpolate', ['linear'], ['zoom'],
                7, 22,
                10, 28,
                13, 36,
                16, 42,
              ],
              circleOpacity: 0.15,
              circleBlur: 0.6,
            }}
          />

          {/* 🔥 Hot Spot Inner Ring — secondary glow ring */}
          <MapboxGL.CircleLayer
            id="hotSpotRing"
            filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'isHot'], 1]]}
            style={{
              circleColor: 'transparent',
              circleRadius: [
                'interpolate', ['linear'], ['zoom'],
                7, 17,
                10, 22,
                13, 29,
                16, 34,
              ],
              circleStrokeWidth: 1.5,
              circleStrokeColor: ['get', 'color'],
              circleStrokeOpacity: 0.35,
            }}
          />

          {/* Individual markers - Score-color circle with shadow */}
          <MapboxGL.CircleLayer
            id="unclusteredMarkersShadow"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleColor: 'rgba(0,0,0,0.18)',
              circleRadius: [
                'interpolate', ['linear'], ['zoom'],
                7, 14,
                10, 18,
                13, 24,
                16, 28,
              ],
              circleTranslate: [0, 2],
              circleBlur: 0.4,
            }}
          />
          <MapboxGL.CircleLayer
            id="unclusteredMarkers"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleColor: ['get', 'color'],
              circleRadius: [
                'interpolate', ['linear'], ['zoom'],
                7, 12,
                10, 16,
                13, 22,
                16, 26,
              ],
              circleStrokeWidth: [
                'interpolate', ['linear'], ['zoom'],
                7, 2.5,
                13, 4,
              ],
              circleStrokeColor: 'rgba(255,255,255,0.95)',
              circleOpacity: 1,
            }}
          />

          {/* 🔥 Flame icon for top spots (fangIndex >= 85) */}
          <MapboxGL.SymbolLayer
            id="hotSpotFlame"
            filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'isTop'], 1]]}
            style={{
              textField: '🔥',
              textSize: [
                'interpolate', ['linear'], ['zoom'],
                7, 10,
                10, 14,
                13, 18,
              ],
              textOffset: [0.8, -0.8],
              textAllowOverlap: true,
              textIgnorePlacement: true,
            }}
          />

          {/* Marker score labels - always visible */}
          <MapboxGL.SymbolLayer
            id="markerLabels"
            filter={['!', ['has', 'point_count']]}
            style={{
              textField: ['to-string', ['get', 'fangIndex']],
              textSize: [
                'interpolate', ['linear'], ['zoom'],
                7, 10,
                10, 13,
                13, 16,
              ],
              textColor: COLORS.white,
              textFont: ['DIN Pro Bold', 'Arial Unicode MS Bold'],
              textAllowOverlap: true,
              textIgnorePlacement: true,
              textHaloColor: 'rgba(0,0,0,0.35)',
              textHaloWidth: 1.2,
            }}
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>

      {/* Offline Banner (Opas Rat #4) */}
      <OfflineBanner isOffline={isOffline} cacheAge={cacheAge} isOfflineData={isOfflineData} />

      {/* Top Bar */}
      <MapTopBar
        goldenHourInfo={goldenHourInfo}
        isNightMode={isNightMode}
        onToggleNight={() => setIsNightMode((prev) => !prev)}
        onMyLocation={handleMyLocation}
        onSearch={() => setShowSearch(true)}
        onBiteTimePress={() => setShowBiteTimeInfo(true)}
      />

      {/* Filter FAB */}
      <FilterFAB activeCount={activeFilterCount} onPress={() => setShowFilters(true)} />

      {/* Filter Sheet */}
      <MapFilterSheet
        visible={showFilters}
        filters={mapFilters}
        onApply={setMapFilters}
        onClose={() => setShowFilters(false)}
        totalCount={waterBodies.length}
        filteredCount={filteredWaterBodies.length}
      />

      {/* Zoom Controls */}
      <MapZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      {/* Search Modal */}
      <Modal visible={showSearch} animationType="slide" presentationStyle="fullScreen">
        <SearchScreen
          onClose={() => setShowSearch(false)}
          waterBodies={waterBodies}
          onSelectSpot={(spotId: string) => {
            setShowSearch(false);
            const spot = waterBodies.find((w) => w.id === spotId);
            if (spot) handleMarkerPress(spot);
          }}
        />
      </Modal>

      {/* Fangindex Info Modal */}
      <Modal
        visible={showFangindexInfo}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFangindexInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.modalLogo}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Der BISS Fangindex</Text>
              <TouchableOpacity
                onPress={() => setShowFangindexInfo(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Unser Algorithmus berechnet die Fangwahrscheinlichkeit basierend auf
              wissenschaftlich belegten Faktoren.
            </Text>

            <View style={styles.factors}>
              {[
                { icon: '🌤️', title: 'Wetter (30%)', desc: 'Luftdruck, Temperatur, Wind & Bewölkung' },
                { icon: '🕐', title: 'Tageszeit (25%)', desc: 'Beißzeiten: Morgen- & Abenddämmerung' },
                { icon: '🌙', title: 'Mondphase (20%)', desc: 'Neu- und Vollmond steigern Aktivität' },
                { icon: '🎯', title: 'Solunar (15%)', desc: 'Major & Minor Perioden nach Mondtransit' },
                { icon: '💧', title: 'Wasserstand (10%)', desc: 'Steigende Pegel oft vorteilhaft' },
              ].map((f, i) => (
                <View key={i} style={styles.factorRow}>
                  <Text style={styles.factorIcon}>{f.icon}</Text>
                  <View style={styles.factorContent}>
                    <Text style={styles.factorTitle}>{f.title}</Text>
                    <Text style={styles.factorDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.legend}>
              {[
                { color: COLORS.green, label: '70+ Sehr gut' },
                { color: COLORS.yellow, label: '50-69 Gut' },
                { color: COLORS.red, label: '<50 Mäßig' },
              ].map((item, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowFangindexInfo(false)}
            >
              <Text style={styles.modalButtonText}>Verstanden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bite Time Modal */}
      <BiteTimeModal
        visible={showBiteTimeInfo}
        onClose={() => setShowBiteTimeInfo(false)}
        userLocation={userLocation}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={!!ratingSpotId}
        spotName={waterBodies.find((w) => w.id === ratingSpotId)?.name ?? ''}
        existingRating={ratingSpotId ? getRatingForSpot(ratingSpotId) : undefined}
        onClose={() => setRatingSpotId(null)}
        onSubmit={(stars, comment) => {
          if (ratingSpotId) submitRating(ratingSpotId, stars, comment);
        }}
      />

      {/* Bottom Sheet */}
      <MapBottomSheet
        bottomSheetRef={bottomSheetRef}
        selectedSpot={selectedSpot}
        top3={top3}
        userLocation={userLocation}
        goldenHourInfo={goldenHourInfo}
        selectedFish={mapFilters.fish}
        onSelectSpot={setSelectedSpot}
        onMarkerPress={handleMarkerPress}
        onShowFangindexInfo={() => setShowFangindexInfo(true)}
        onToggleFish={handleToggleFish}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        favoriteIds={favoriteIds}
        allSpots={waterBodies}
        getRatingSummary={getSummaryForSpot}
        onRateSpot={(spotId) => setRatingSpotId(spotId)}
        forecast={forecast}
        forecastLoading={forecastLoading}
        onLoadForecast={() => loadForecast(userLocation[1], userLocation[0])}
      />
    </GestureHandlerRootView>
  );
};

// ─── Styles ───

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  map: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingDark: { backgroundColor: COLORS.dark.bg },
  loadingLogo: { width: 120, height: 120, borderRadius: 24, marginBottom: 4 },
  loadingText: { marginTop: 12, color: COLORS.gray600, fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLogo: { width: 44, height: 44, borderRadius: 12, marginRight: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: { fontSize: 16, color: '#6B7280' },
  modalDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  factors: { gap: 12, marginBottom: 20 },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  factorIcon: { fontSize: 20, marginRight: 12 },
  factorContent: { flex: 1 },
  factorTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  factorDesc: { fontSize: 12, color: '#6B7280' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

});

export default MapScreen;
