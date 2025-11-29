/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BISS MAP CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Zentrale Konfiguration für alle Map-bezogenen Einstellungen.
 * Hier werden Styles, Kamera-Defaults und Region-Bounds definiert.
 */

// ─────────────────────────────────────────────────────────────────────────────
// MAPBOX STYLE URLS
// ─────────────────────────────────────────────────────────────────────────────

export const MAPBOX_STYLES = {
  // Day Mode - BISS Standard Style (heller Angelkarten-Style)
  standard: process.env.EXPO_PUBLIC_MAPBOX_STYLE_STANDARD 
    || 'mapbox://styles/mapbox/outdoors-v12', // Fallback: Outdoors (zeigt Gewässer gut)
  
  // Night Mode - BISS Angel-Night Style (dunkler Style mit leuchtenden Gewässern)
  night: process.env.EXPO_PUBLIC_MAPBOX_STYLE_NIGHT 
    || 'mapbox://styles/mapbox/dark-v11', // Fallback: Dark
    
} as const;

export type MapStyleKey = keyof typeof MAPBOX_STYLES;

// ─────────────────────────────────────────────────────────────────────────────
// REGION: NDS / HH / SH (Norddeutschland)
// ─────────────────────────────────────────────────────────────────────────────

export const REGIONS = {
  // Zentrum der Zielregion: Bendestorf (21227) - Forellenhof Testgebiet
  center: {
    longitude: 9.9732,
    latitude: 53.3355,
  },
  
  // Bounding Box für NDS/HH/SH
  // [minLng, minLat, maxLng, maxLat]
  bounds: {
    southwest: [7.0, 51.3],  // Südwest-Ecke (ca. Osnabrück)
    northeast: [11.8, 54.9], // Nordost-Ecke (ca. Flensburg)
  },
  
  // Alternative Start-Regionen
  cities: {
    bendestorf: { longitude: 9.9732, latitude: 53.3355, zoom: 13 }, // 🎯 Default!
    lueneburg: { longitude: 10.4141, latitude: 53.2509, zoom: 11 },
    hamburg: { longitude: 10.0, latitude: 53.55, zoom: 10 },
    bremen: { longitude: 8.8017, latitude: 53.0793, zoom: 11 },
    hannover: { longitude: 9.7320, latitude: 52.3759, zoom: 11 },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export const CAMERA_CONFIG = {
  // Initial Settings beim App-Start
  initial: {
    center: REGIONS.center,
    zoom: 10,          // Zeigt ~50km Umkreis
    pitch: 0,          // Keine 3D-Neigung
    heading: 0,        // Nord ist oben
  },
  
  // Zoom-Limits
  zoom: {
    min: 7,            // Ganz Norddeutschland sichtbar
    max: 18,           // Einzelne Teiche erkennbar
    default: 10,       // Standard-Zoom
    detail: 14,        // Zoom für Spot-Details
    userLocation: 13,  // Zoom beim "Mein Standort" Button
  },
  
  // Animation-Einstellungen
  animation: {
    duration: 800,     // ms für Kamera-Bewegungen
    easing: 'easeInOutCubic' as const,
  },
  
  // Interaktivität
  gestures: {
    rotateEnabled: false,      // Kein Drehen der Karte (verwirrt User)
    pitchEnabled: false,       // Keine 3D-Neigung
    scrollEnabled: true,       // Pan/Drag erlaubt
    zoomEnabled: true,         // Pinch-to-Zoom erlaubt
    doubleTapToZoomInEnabled: true,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// MARKER & CLUSTER SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export const MARKER_CONFIG = {
  // Ab wie vielen Markern wird geclustert?
  clusterThreshold: 50,
  
  // Cluster-Radius in Pixeln
  clusterRadius: 50,
  
  // Marker-Größen
  sizes: {
    small: 32,
    medium: 44,
    large: 56,
  },
  
  // Fangindex-Farben
  colors: {
    high: '#4ADE80',    // 70+
    medium: '#FACC15',  // 50-69
    low: '#EF4444',     // <50
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// THEME DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bestimmt ob Night-Mode aktiv sein soll
 * Logik: Nach 18:30 Uhr ODER manuell aktiviert
 */
export const shouldUseNightMode = (manualOverride?: boolean): boolean => {
  if (manualOverride !== undefined) return manualOverride;
  
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Nach 18:30 oder vor 6:00
  return (hour > 18 || (hour === 18 && minute >= 30)) || hour < 6;
};

/**
 * Gibt den aktuellen Style-Key zurück
 */
export const getCurrentStyleKey = (isNightMode: boolean): MapStyleKey => {
  return isNightMode ? 'night' : 'standard';
};

/**
 * Gibt die Style-URL zurück
 */
export const getStyleURL = (isNightMode: boolean): string => {
  const key = getCurrentStyleKey(isNightMode);
  return MAPBOX_STYLES[key];
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default {
  MAPBOX_STYLES,
  REGIONS,
  CAMERA_CONFIG,
  MARKER_CONFIG,
  shouldUseNightMode,
  getCurrentStyleKey,
  getStyleURL,
};
