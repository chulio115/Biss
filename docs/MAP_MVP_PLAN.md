# 🗺️ BISS Map - MVP Upgrade Plan

> **Mission:** Karte von Proof-of-Concept zu produktionsreifem Kern-Feature in 1-2 Sessions

---

## ✅ SCHRITT 1: Styles & Theme (FERTIG)

### Was wurde gemacht:
- ✅ Custom Mapbox Styles eingebunden (Day + Night)
- ✅ Zentrale Config (`src/config/map.config.ts`)
- ✅ Auto-Night-Mode ab 18:30
- ✅ Manueller Day/Night Toggle
- ✅ Saubere Architektur für Theme-Handling

### Technisch vorhanden:
```typescript
// Styles aus .env
EXPO_PUBLIC_MAPBOX_STYLE_STANDARD (Day)
EXPO_PUBLIC_MAPBOX_STYLE_NIGHT (Night)

// Config mit:
- Camera defaults (zoom 7-18)
- Region bounds (NDS/HH/SH)
- Animation settings
- Theme detection logic
```

---

## ✅ SCHRITT 2: Interaktivität (FERTIG)

### Was wurde gemacht:
- ✅ Min/Max Zoom Limits (7-18)
- ✅ Sinnvolle Start-Region (Lüneburg, Zoom 10)
- ✅ Zoom-Controls (+/- Buttons)
- ✅ Smooth Animations (800ms)
- ✅ Haptic Feedback
- ✅ Keine Rotation/Pitch (UX-Fokus)

### Technisch vorhanden:
```typescript
CAMERA_CONFIG = {
  zoom: { min: 7, max: 18, default: 10 },
  animation: { duration: 800ms },
  gestures: {
    rotateEnabled: false,  // Kein Drehen
    pitchEnabled: false,   // Keine 3D-Neigung
  }
}
```

---

## 🚧 SCHRITT 3: UX Quick-Wins (NÄCHSTE SESSION)

### Priorität 1 - Sofort umsetzbar:

#### 3.1 Marker-Clustering (30 min)
**Problem:** Bei vielen Markern wird's unübersichtlich
**Lösung:** Mapbox Cluster-Layer ab 50 Markern

```typescript
// In MapScreen.tsx
<MapboxGL.ShapeSource
  id="water-bodies"
  cluster
  clusterRadius={50}
  clusterMaxZoomLevel={14}
>
  {/* Cluster Circle Layer */}
  {/* Individual Marker Layer */}
</MapboxGL.ShapeSource>
```

**Ergebnis:** Saubere Darstellung auch bei 100+ Gewässern

---

#### 3.2 Marker Tap Interaction (20 min)
**Problem:** Marker-Tap fühlt sich nicht "snappy" an
**Lösung:** 
- Zoom auf Marker beim Tap (Zoom 14)
- Marker-Highlight mit Scale-Animation
- Bottom Sheet smooth öffnen

```typescript
const handleMarkerPress = (spot) => {
  // 1. Haptic
  Haptics.impactAsync();
  
  // 2. Zoom & Center
  cameraRef.current?.setCamera({
    centerCoordinate: [spot.lng, spot.lat],
    zoomLevel: CAMERA_CONFIG.zoom.detail, // 14
    animationDuration: 600,
  });
  
  // 3. Bottom Sheet
  bottomSheetRef.current?.snapToIndex(1);
};
```

---

#### 3.3 Water Body Outline (15 min)
**Problem:** Gewässer nicht deutlich erkennbar
**Lösung:** Leichte Outline für Gewässer-Polygone

```typescript
// In Mapbox Style JSON oder als Layer
{
  "id": "water-outline",
  "type": "line",
  "source": "composite",
  "source-layer": "water",
  "paint": {
    "line-color": "#00A3FF",
    "line-width": 2,
    "line-opacity": 0.6
  }
}
```

---

#### 3.4 Performance: Viewport-based Loading (45 min)
**Problem:** Alle Marker werden immer geladen
**Lösung:** Nur Marker im sichtbaren Bereich laden

```typescript
const [visibleBounds, setVisibleBounds] = useState(null);

// On Map Move
const handleRegionChange = async () => {
  const bounds = await mapRef.current?.getVisibleBounds();
  setVisibleBounds(bounds);
};

// Filter markers
const visibleMarkers = waterBodies.filter(wb => 
  isInBounds(wb, visibleBounds)
);
```

---

#### 3.5 Loading States (10 min)
**Problem:** User sieht nicht was passiert
**Lösung:** Skeleton Loader für Karte

```typescript
{loading && (
  <View style={styles.mapSkeleton}>
    <ActivityIndicator size="large" />
    <Text>Lade Gewässer...</Text>
  </View>
)}
```

---

### Priorität 2 - Nice-to-Have:

#### 3.6 User Location Accuracy Circle
- Zeige GPS-Genauigkeit als Kreis
- Hilft User zu verstehen wie präzise die Position ist

#### 3.7 Compass (nur wenn rotiert)
- Zeige Kompass nur wenn Karte gedreht wurde
- Tap = zurück zu Nord

#### 3.8 Scale Bar
- Zeige Maßstab (100m, 1km, etc.)
- Nur bei Zoom < 12

---

## 📋 SCHRITT 4: Aktionsplan (Nächste 1-2 Sessions)

### Session 1 (90 min):

| Task | Zeit | Ziel |
|------|------|------|
| 1. Marker Clustering | 30 min | Saubere Darstellung bei vielen Markern |
| 2. Marker Tap Interaction | 20 min | Snappy, smooth Marker-Taps |
| 3. Water Outline | 15 min | Gewässer besser erkennbar |
| 4. Loading States | 10 min | User-Feedback beim Laden |
| 5. Test auf Device | 15 min | Echtes Feeling testen |

**Ergebnis:** Karte fühlt sich wie ein echtes Produkt an

---

### Session 2 (60 min):

| Task | Zeit | Ziel |
|------|------|------|
| 1. Viewport-based Loading | 45 min | Performance bei vielen Markern |
| 2. Polish & Bugfixes | 15 min | Edge Cases fixen |

**Ergebnis:** Karte ist production-ready

---

## 🎯 Definition of Done

Nach Abarbeitung der Liste muss die Karte:

### Funktional:
- ✅ Day/Night Styles funktionieren
- ✅ Zoom-Controls sind intuitiv
- ✅ Marker-Taps sind smooth
- ✅ Clustering funktioniert ab 50 Markern
- ✅ Loading States sind sichtbar
- ✅ Performance ist gut (60 FPS)

### UX:
- ✅ Fühlt sich "snappy" an
- ✅ Keine Lags beim Zoomen
- ✅ Gewässer sind deutlich erkennbar
- ✅ User versteht sofort was er sieht

### Code:
- ✅ Saubere Trennung (Config, Components)
- ✅ TypeScript ohne Errors
- ✅ Kommentiert wo nötig
- ✅ Performance-optimiert

---

## 🚀 Quick Start für nächste Session

```bash
# 1. Metro starten
npx expo start --dev-client

# 2. iOS Simulator
xcrun simctl boot "iPhone 16 Pro"
open -a Simulator

# 3. Code öffnen
code src/screens/MapScreen.tsx
code src/config/map.config.ts

# 4. Erste Aufgabe: Marker Clustering
# → Siehe Schritt 3.1
```

---

## 📝 Notizen & Learnings

### Was gut funktioniert:
- Zentrale Config macht Änderungen einfach
- Day/Night Toggle ist intuitiv
- Zoom-Controls sind nützlich

### Was noch verbessert werden muss:
- Marker-Clustering fehlt noch
- Performance bei vielen Markern
- Gewässer-Outlines für bessere Sichtbarkeit

### Offene Fragen:
- Sollen wir Gewässer-Polygone anzeigen? (braucht GeoJSON)
- Clustering-Radius: 50px oder mehr?
- Soll User-Location immer centered sein?

---

*Letzte Aktualisierung: 29.11.2024 - Nach Schritt 2*
