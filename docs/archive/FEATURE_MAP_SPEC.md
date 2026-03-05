# MVP Spec: Gewässer-Karte für BISS
## Critical Review & Implementation Plan

---

## 🔥 Hard Challenge

### 1. Edge-Cases

| Edge-Case | Problem | Fix |
|-----------|---------|-----|
| **Keine Gewässer im Radius** | Leere Karte = schlechte UX | Auto-Zoom auf nächstes Gewässer + "X Teiche in Y km" Hinweis |
| **Offline-Modus** | Mapbox braucht Internet | Offline-Tiles nur für Premium (später). MVP: Graceful "Offline"-Banner, cached letzte Position |
| **DSGVO bei AR** | Kamera-Permission, Bilder speichern? | ❌ **AR raus für MVP.** Overkill, rechtlich komplex, kein Core-Value |
| **GPS-Ungenauigkeit** | User steht "im Teich" | 10m Toleranz, Snap-to-nearest-water |
| **Bathymetry-Daten** | Existieren kaum für kleine Teiche | ❌ **Raus für MVP.** Nur für große Seen verfügbar |

### 2. Skalierbarkeit & Kosten

| Concern | Analyse | Verdict |
|---------|---------|---------|
| **Mapbox Free Tier** | 25k MAU, 50k Tile-Requests/Monat | ✅ **Reicht für MVP.** Bei 1k DAU = ~30k Requests/Monat |
| **Mapbox Kosten danach** | $5/1000 MAU | ⚠️ Bei 10k Users = $50/Monat. Akzeptabel. |
| **xAI-Calls für Overlay** | Jeder Marker = API-Call? | ❌ **NEIN.** Fangindex lokal berechnen (haben wir schon!). Kein xAI auf Karte. |
| **Alternative: OpenStreetMap** | Kostenlos, aber weniger Features | ✅ **Backup-Option.** `react-native-maps` mit OSM tiles |

**Empfehlung:** Starte mit `react-native-maps` (Google Maps/Apple Maps) – **kostenlos**, dann Mapbox für Custom Styles später.

### 3. User-Value vs. Feature-Overload

| Feature | User-Value | Aufwand | Verdict |
|---------|------------|---------|---------|
| **Basis-Karte mit Gewässern** | 🔥🔥🔥 CORE | Low | ✅ MVP |
| **Fangindex-Overlay (Farbe)** | 🔥🔥🔥 USP | Medium | ✅ MVP |
| **Tap → Detail-Sheet** | 🔥🔥🔥 UX | Low | ✅ MVP |
| **Filter: Fischarten** | 🔥🔥 Nützlich | Medium | ✅ MVP (simpel) |
| **Custom Modes (White/Blue)** | 🔥 Nice-to-have | High | ⏸️ Phase 2 |
| **Heatmap-Mode** | 🔥 Gimmick | High | ⏸️ Phase 2 |
| **Night-Mode** | 🔥 Gimmick | Medium | ⏸️ Phase 2 |
| **AR-Preview** | ❄️ Overengineered | Very High | ❌ Raus |
| **Bathymetry-Layer** | ❄️ Keine Daten | Very High | ❌ Raus |
| **Real-Time Pegel** | 🔥🔥 Wertvoll | Medium | ⏸️ Phase 2 |
| **Waypoints/Favoriten** | 🔥🔥 Retention | Low | ✅ MVP |

### 4. Tech-Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Performance mit vielen Markern** | 🟡 | Clustering ab >50 Marker. Nur sichtbare laden. |
| **Maps SDK Größe** | 🟡 | +5-10MB App Size. Akzeptabel. |
| **iOS/Android Unterschiede** | 🟢 | `react-native-maps` abstrahiert das |
| **Mapbox Custom Styles** | 🔴 | Komplex, braucht Mapbox Studio. **→ Phase 2** |

### 5. Meine Empfehlung: Simplify!

**Vergiss für MVP:**
- ❌ Custom Map Modes (White/Blue/Heatmap)
- ❌ AR-Preview
- ❌ Bathymetry
- ❌ Mapbox (erstmal)

**Fokus MVP:**
- ✅ Standard-Karte (Apple/Google Maps)
- ✅ Gewässer-Marker mit Fangindex-Farbe (grün/gelb/rot)
- ✅ Tap → Bottom Sheet mit Details
- ✅ Einfacher Fish-Filter (Dropdown)
- ✅ "Meine Position" Button
- ✅ Favoriten-Herz

---

## 📋 MVP Feature Scope

### Core (Woche 1)
1. **Karten-Screen** mit `react-native-maps`
2. **Gewässer-Marker** aus Supabase (farbcodiert nach Fangindex)
3. **Tap → Bottom Sheet** mit Name, Score, Fische, Preis, "Route"-Button
4. **User Location** mit Permission-Flow
5. **Navigation** vom Dashboard zur Karte

### Enhanced (Woche 2)
6. **Fish-Filter** (Forelle, Karpfen, Hecht, etc.)
7. **Favoriten** (Herz-Icon, in Supabase speichern)
8. **Cluster-Marker** wenn zu viele Spots
9. **"Zu diesem Teich"-Integration** (Apple/Google Maps öffnen)

---

## ⏱️ Implementation Timeline

| Tag | Deliverable |
|-----|-------------|
| 1 | `react-native-maps` Setup + Basic Map |
| 2 | Gewässer aus Supabase laden + Marker |
| 3 | Fangindex-Farben + Tap-Handler |
| 4 | Bottom Sheet Component |
| 5 | Navigation + Location Permission |
| 6 | Fish-Filter implementieren |
| 7 | Favoriten + Polish |

---

## ✅ Go/No-Go

### 🟢 GO – mit reduziertem Scope

**Begründung:**
1. **Karte ist Kern-Feature** einer Angel-App – ohne Karte kein echtes Produkt
2. **Technisch simpel** mit `react-native-maps` (kein Mapbox nötig für MVP)
3. **Kosten: $0** mit Standard-Maps
4. **Differenziert durch Fangindex-Overlay** – das hat keine andere App

**Klare Absage an:**
- Custom Map Styles (Phase 2, wenn Mapbox-Budget da)
- AR (nie, außer klarer Use-Case)
- Bathymetry (Daten existieren nicht)

---

## 🚀 Starter Code

```typescript
// src/screens/MapScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import { SpotBottomSheet } from '../components/SpotBottomSheet';

interface WaterBody {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  fish_species: string[];
  permit_price: number;
  fangIndex?: number;
}

const getMarkerColor = (score: number): string => {
  if (score >= 70) return '#4ade80';
  if (score >= 40) return '#fbbf24';
  return '#ef4444';
};

export const MapScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<WaterBody | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  // Initial region (Bendestorf)
  const initialRegion = {
    latitude: 53.3347,
    longitude: 9.9717,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  useEffect(() => {
    loadWaterBodies();
    requestLocation();
  }, []);

  const loadWaterBodies = async () => {
    const { data, error } = await supabase
      .from('water_bodies')
      .select('*');
    
    if (data) {
      // Add mock fangIndex (in real app, calculate based on weather)
      const withScores = data.map(wb => ({
        ...wb,
        fangIndex: Math.floor(Math.random() * 40) + 40, // 40-80 for demo
      }));
      setWaterBodies(withScores);
    }
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {waterBodies.map((wb) => (
          <Marker
            key={wb.id}
            coordinate={{
              latitude: parseFloat(wb.latitude),
              longitude: parseFloat(wb.longitude),
            }}
            pinColor={getMarkerColor(wb.fangIndex || 50)}
            onPress={() => setSelectedSpot(wb)}
          />
        ))}
      </MapView>

      {/* My Location Button */}
      <TouchableOpacity style={styles.locationBtn} onPress={centerOnUser}>
        <Text style={styles.locationBtnText}>📍</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      {selectedSpot && (
        <SpotBottomSheet
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationBtn: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    backgroundColor: '#1e293b',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationBtnText: {
    fontSize: 24,
  },
});
```

---

## Fazit

**Die Karte ist ein Must-Have, aber keep it simple.** 

Standard Apple/Google Maps + farbige Marker + Bottom Sheet = 80% des Werts mit 20% des Aufwands. Custom Mapbox Styles und AR sind Phase-2-Features für wenn du Traction hast.

**Nächster Schritt:** Soll ich das Feature jetzt bauen?
