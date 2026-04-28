# Catch Up to Fishbrain - Feature Gap Analysis

> **Zweck:** Dieses Dokument dokumentiert die Feature-Gaps zwischen BISS und Fishbrain basierend auf einer detaillierten Analyse der Fishbrain-App (28.04.2026). Es dient als Roadmap für die geplanten Verbesserungen.

---

## Executive Summary

BISS hat eine starke Basis mit Offline-Modus, Privacy-First-Design und Gamification, aber es fehlen einige Kern-Features von Fishbrain, die für User Engagement und UX wichtig sind.

### 🏆 BISS Stärken (vs Fishbrain)
- ✅ **Offline-Modus** ist stärker (Offline-Queue, Offline-Fangindex)
- ✅ **Privacy-First** ist besser implementiert (3-Level Privacy, Fuzzy Locations)
- ✅ **Lokaler Fangindex** ist schneller und unabhängig von historischen Daten
- ✅ **Dark Mode** ist vollständig implementiert
- ✅ **Gamification** (Achievements, Leaderboard) ist besser

### ⚠️ Top 5 Priority Gaps
1. **Catch Pins auf der Karte** - Keine Visualisierung von Community-Fängen
2. **POI-Layer System** - Keine Infrastruktur-Markierungen (Bootsrampen, Shops)
3. **Segmentierte Tabs** - MapBottomSheet ist unstrukturiert
4. **KI-Fischerkennung** - Manuelle Spezies-Auswahl statt KI
5. **Layer Toggle UI** - Kein dediziertes Layer-Management

---

## 1. Feature-Gap-Matrix (BISS vs Fishbrain)

### 🗺️ Karten-Layer System

| Feature | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| Gewässer-Polygone | ✅ Free | ✅ | - | - | ✅ |
| Catch Pins (ungefähr) | ✅ Free | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Catch Pins (exakt) | ✅ Pro | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Depth Maps / Tiefenkarten | ✅ Pro | ❌ | ⚠️ | MED | 🔴 TODO |
| Spot Predictions (KI) | ✅ Pro | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Parks & Gov Land | ✅ Pro | ❌ | ⚠️ | LOW | 🔴 TODO |
| Waypoints | ✅ Pro | ❌ | ⚠️ | MED | 🔴 TODO |
| POI-Layer (Boat Ramps, Shops) | ✅ | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Marker Clustering | ✅ | ✅ | - | - | ✅ |
| Layer Toggle UI | ✅ | ⚠️ | ⚠️ | **HIGH** | 🔴 TODO |

### 📋 Gewässer-Detailseite

| Feature | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| Header (Name, Typ, Entfernung) | ✅ | ✅ | - | - | ✅ |
| Segmentierte Tabs (Fische/Catches/Info/Forecast) | ✅ | ⚠️ | ⚠️ | **HIGH** | 🔴 TODO |
| Fische-Tab (Arten, Anzahl, Top-Köder) | ✅ | ⚠️ | ⚠️ | MED | 🔴 TODO |
| Catches-Tab (Fotogalerie, Filter) | ✅ | ⚠️ | ⚠️ | MED | 🔴 TODO |
| Info-Tab (Rampen, Regeln, Reviews) | ✅ | ⚠️ | ⚠️ | MED | 🔴 TODO |
| Forecast-Tab (BiteTime, Wetter, Mond) | ✅ | ✅ | - | - | ✅ |

### 🔍 Filter-System

| Feature | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| Map Options (Layer Toggle) | ✅ | ⚠️ | ⚠️ | **HIGH** | 🔴 TODO |
| My Area Filter (Umkreis, Wassertyp) | ✅ | ❌ | ⚠️ | MED | 🔴 TODO |
| Catch Feed Filter (Spezies, Köder) | ✅ | ⚠️ | ⚠️ | MED | 🔴 TODO |
| MapFilterSheet (Kategorien, Fische, Score) | ❌ | ✅ | ✅ | - | ✅ |

### 📝 Logbook System

| Feature | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| Foto hochladen | ✅ | ✅ | - | - | ✅ |
| KI-Fischerkennung | ✅ | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Gewässer wählen (autofill) | ✅ | ✅ | - | - | ✅ |
| Köder/Gear wählen | ✅ | ❌ | ⚠️ | MED | 🔴 TODO |
| Privacy-Level (3-stufig) | ✅ | ✅ | - | - | ✅ |
| Auto-Wetter-Fetch | ✅ | ❌ | ⚠️ | MED | 🔴 TODO |
| Offline-Queue | ❌ | ✅ | ✅ | - | ✅ |

### 🌤️ BiteTime/Forecast

| Feature | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| KI-Forecast (historische Daten) | ✅ | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Lokaler Algorithmus (DWD + Solunar) | ❌ | ✅ | ✅ | - | ✅ |
| 7-Tage-Vorschau | ✅ Pro | ✅ | - | - | ✅ |
| Spezies-spezifisch | ✅ | ⚠️ | ⚠️ | MED | 🔴 TODO |
| Stündliche Kurve | ✅ | ✅ | - | - | ✅ |

### 👥 Soziales System

| Feature | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| Community Feed | ✅ | ✅ | - | - | ✅ |
| Likes | ✅ | ✅ | - | - | ✅ |
| Kommentare | ✅ | ❌ | ⚠️ | MED | 🔴 TODO |
| Private Nachrichten | ✅ | ❌ | ⚠️ | LOW | 🔴 TODO |
| Gruppen | ✅ | ❌ | ⚠️ | LOW | 🔴 TODO |
| Follower-System | ✅ | ❌ | ⚠️ | LOW | 🔴 TODO |

### 📱 Offline-Modus

| Feature | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| Basis-Karten-Cache | ✅ | ✅ | - | - | ✅ |
| POI-Cache | ✅ | ❌ | ⚠️ | LOW | 🔴 TODO |
| Offline-Catch-Queue | ❌ | ✅ | ✅ | - | ✅ |
| Offline-Fangindex | ❌ | ✅ | ✅ | - | ✅ |

### 🎨 UX-Patterns

| Pattern | Fishbrain | BISS | Gap | Priority | Status |
|---|---|---|---|---|---|
| Tap-to-Reveal (Bottom Sheet) | ✅ | ✅ | - | - | ✅ |
| Layer Toggle (Floating Button) | ✅ | ⚠️ | ⚠️ | **HIGH** | 🔴 TODO |
| Cluster → Pin (Catch Pins) | ✅ | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Color-coded Recency (Grün/Orange) | ✅ | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Intensity Gradient (Spot Prediction) | ✅ | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| 3-Level Privacy | ✅ | ✅ | - | - | ✅ |
| Auto-Wetter-Fetch | ✅ | ❌ | ⚠️ | MED | 🔴 TODO |
| KI-Fischerkennung | ✅ | ❌ | ⚠️ | **HIGH** | 🔴 TODO |
| Segmented Tab Bar (Gewässer-Detail) | ✅ | ⚠️ | ⚠️ | **HIGH** | 🔴 TODO |

---

## 2. Top 5 Priorisierte Verbesserungen

### 🥇 #1: Catch Pins auf der Karte mit Clustering & Farbcodierung

**Priority:** HIGH  
**Impact:** User Engagement, Social Proof  
**Effort:** MEDIUM

**Beschreibung:**
- Visualisierung von Community-Fängen als Pins auf der Karte
- Clustering bei niedrigem Zoom, Einzelpins bei hohem Zoom
- Farbcodierung: Grün = neu (< 7 Tage), Orange = älter
- Nur Fänge mit `locationSharing: 'exact'` anzeigen

**Architektur:**
```typescript
// src/types/map.ts
export interface CatchPin {
  id: string;
  userId: string;
  species: string;
  latitude: number;
  longitude: number;
  caughtAt: string;
  weight?: number;
  length?: number;
  photoUrl?: string;
  locationSharing: LocationSharing;
}

// src/hooks/useCatchPins.ts
export const useCatchPins = (bounds: [number, number, number, number]) => {
  const [pins, setPins] = useState<CatchPin[]>([]);
  
  const loadCatchPins = useCallback(async () => {
    const { data } = await supabase
      .from('catches')
      .select('*')
      .in('locationSharing', ['exact'])
      .gte('latitude', bounds[0])
      .lte('latitude', bounds[2])
      .gte('longitude', bounds[1])
      .lte('longitude', bounds[3]);
    
    setPins(data || []);
  }, [bounds]);
  
  return { pins, loading, loadCatchPins };
};
```

**MapScreen Integration:**
- ShapeSource für Catch Pins erstellen
- SymbolLayer mit Cluster-Unterstützung
- Farbcodierung basierend auf Recency

**Datenquelle:** Supabase `catches` Tabelle (bereits vorhanden)

---

### 🥈 #2: POI-Layer System (Boat Ramps, Angelgeschäfte)

**Priority:** HIGH  
**Impact:** UX, Infrastruktur-Informationen  
**Effort:** MEDIUM

**Beschreibung:**
- POIs als separate Layer auf der Karte anzeigen
- Typen: Boat Ramps, Tackle Shops, Marinas, Bait Shops, License Vendors
- OpenStreetMap Overpass API als kostenlose Datenquelle
- Layer Toggle im Map Options Panel

**Architektur:**
```typescript
// src/types/map.ts
export interface POI {
  id: string;
  type: 'boat_ramp' | 'tackle_shop' | 'marina' | 'bait_shop' | 'license_vendor';
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  website?: string;
}

// src/services/poiService.ts
export const loadPOIs = async (bounds: [number, number, number, number]) => {
  const query = `
    [out:json][timeout:25];
    (
      node["leisure"="slipway"](${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]});
      node["shop"="fishing"](${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]});
      node["harbour"="marina"](${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]});
    );
    out body;
  `;
  
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  
  const data = await response.json();
  return data.elements.map(el => ({
    id: el.id.toString(),
    type: detectPOIType(el.tags),
    name: el.tags.name || 'Unbekannt',
    latitude: el.lat,
    longitude: el.lon,
  }));
};
```

**MapScreen Integration:**
- ShapeSource für POIs erstellen
- SymbolLayer mit Icons pro Typ
- Layer Toggle Button

**Datenquelle:** OpenStreetMap Overpass API (kostenlos)

---

### 🥉 #3: Segmentierte Tab Bar im MapBottomSheet

**Priority:** HIGH  
**Impact:** UX, Strukturierung  
**Effort:** LOW

**Beschreibung:**
- MapBottomSheet mit segmentierter Tab Bar
- Tabs: Fische, Catches, Info, Forecast
- Bessere Navigation und Strukturierung

**Architektur:**
```typescript
// src/components/map/MapBottomSheet.tsx
import { SegmentedControl } from '@react-native-segmented-control/segmented-control';

export const MapBottomSheet = ({ spot, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Fische', 'Catches', 'Info', 'Forecast'];
  
  return (
    <BottomSheet>
      <View style={styles.header}>
        <ScoreRing score={spot.fangIndex} />
        <Text style={styles.name}>{spot.name}</Text>
      </View>
      
      <SegmentedControl
        values={tabs}
        selectedIndex={activeTab}
        onChange={(event) => setActiveTab(event.nativeEvent.selectedSegmentIndex)}
      />
      
      <BottomSheetScrollView>
        {activeTab === 0 && <FishSpeciesTab spot={spot} />}
        {activeTab === 1 && <CatchesTab spot={spot} />}
        {activeTab === 2 && <InfoTab spot={spot} />}
        {activeTab === 3 && <ForecastTab spot={spot} />}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
```

**Neue Tab-Komponenten:**
- `FishSpeciesTab` - Fischarten, Anzahl, Top-Köder
- `CatchesTab` - Catch-Fotogalerie, Filter
- `InfoTab` - Rampen, Regeln, Reviews
- `ForecastTab` - ForecastCard (bereits vorhanden)

---

### 🏅 #4: KI-Fischerkennung beim Catch-Loggen

**Priority:** HIGH  
**Impact:** UX, Schnelleres Loggen  
**Effort:** MEDIUM

**Beschreibung:**
- Automatische Spezies-Erkennung beim Foto-Upload
- OpenAI Vision API oder TensorFlow Lite
- Konfidenz-Score und Alternativen
- Manuelle Override-Option

**Architektur:**
```typescript
// src/services/fishRecognition.ts
export const identifyFish = async (imageUri: string): Promise<{
  species: string;
  confidence: number;
}> => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Identifiziere diesen Fisch. Format: "Barsch, 0.95"' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
        ],
      }],
    }),
  });
  
  const data = await response.json();
  const result = data.choices[0].message.content;
  const [species, confidence] = result.split(', ');
  
  return { species, confidence: parseFloat(confidence) };
};
```

**CatchBookScreen Integration:**
- Nach Foto-Upload automatisch KI-Erkennung starten
- Suggestion Box mit erkannter Spezies
- Bestätigen oder manuell ändern

**Datenquelle:** OpenAI Vision API (kostenpflichtig) oder TensorFlow Lite (kostenlos)

---

### 🎖️ #5: Layer Toggle UI (Floating Button)

**Priority:** HIGH  
**Impact:** UX, User-Kontrolle  
**Effort:** LOW

**Beschreibung:**
- Dedizierter Floating Button für Layer-Management
- Slide-up Panel mit Layer-Optionen
- An/Aus-Switches pro Layer
- Pro-Badge für Premium-Features

**Architektur:**
```typescript
// src/components/map/MapLayerToggle.tsx
export interface MapLayers {
  waterBodies: boolean;
  catchPins: boolean;
  pois: boolean;
  forecast: boolean;
  depthMaps: boolean;
}

export const MapLayerToggle = ({ layers, onToggle }) => {
  const [visible, setVisible] = useState(false);
  
  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <Layers size={24} color={COLORS.primary} />
      </TouchableOpacity>
      
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.panel}>
            <LayerItem label="Gewässer" enabled={layers.waterBodies} onToggle={() => onToggle({ ...layers, waterBodies: !layers.waterBodies })} />
            <LayerItem label="Community Fänge" enabled={layers.catchPins} onToggle={() => onToggle({ ...layers, catchPins: !layers.catchPins })} />
            <LayerItem label="POIs" enabled={layers.pois} onToggle={() => onToggle({ ...layers, pois: !layers.pois })} />
            <LayerItem label="Fangindex" enabled={layers.forecast} onToggle={() => onToggle({ ...layers, forecast: !layers.forecast })} />
            <LayerItem label="Tiefenkarten" enabled={layers.depthMaps} onToggle={() => onToggle({ ...layers, depthMaps: !layers.depthMaps })} pro />
          </View>
        </View>
      </Modal>
    </>
  );
};
```

**MapScreen Integration:**
- FAB in unterer rechter Ecke
- State für `MapLayers`
- Conditional Rendering pro Layer

---

## 3. Weitere Verbesserungen (Medium Priority)

### #6: My Area Filter
- Umkreis-basierte Filterung (1km - 100km)
- Filter nach Wassertyp (Süß/Salz/Brack)
- Filter nach Spezies
- Nur für Pro-User (wie Fishbrain)

### #7: Catch Feed Filter (Köder/Gear)
- Filter nach Köder-Typ
- Filter nach Lure-Kategorie
- Filter nach Zeitraum
- Integration mit CommunityScreen

### #8: Auto-Wetter-Fetch beim Loggen
- Automatisches Speichern von Wetterdaten beim Catch
- Snapshot: Temperatur, Wind, Luftdruck, Niederschlag
- Integration mit DWD API

### #9: Kommentare im Community Feed
- Kommentarfunktion für Shared Catches
- @-Mentions
- Reply-Ketten

### #10: Depth Maps / Tiefenkarten
- C-Map oder Garmin Navionics Integration
- Isobathen (Tiefenlinien)
- Farbcodierte Tiefengradienten
- Nur für Pro-User

---

## 4. Implementierungs-Reihenfolge

### Phase 1 (Quick Wins - 1-2 Wochen)
1. **#3: Segmentierte Tab Bar** - Low Effort, High Impact
2. **#5: Layer Toggle UI** - Low Effort, High Impact

### Phase 2 (Core Features - 2-4 Wochen)
3. **#1: Catch Pins auf Karte** - Medium Effort, High Impact
4. **#2: POI-Layer System** - Medium Effort, High Impact

### Phase 3 (Advanced Features - 4-6 Wochen)
5. **#4: KI-Fischerkennung** - Medium Effort, High Impact
6. **#6: My Area Filter** - Medium Effort, Medium Impact

### Phase 4 (Premium Features - 6-8 Wochen)
7. **#10: Depth Maps** - High Effort, Medium Impact
8. **#8: Auto-Wetter-Fetch** - Low Effort, Medium Impact

---

## 5. Kosten und Abhängigkeiten

### Kostenpflichtige Services
- **OpenAI Vision API:** ~$0.01-0.02 per image (KI-Fischerkennung)
- **C-Map / Navionics:** Lizenzkosten für Depth Maps (Tiefenkarten)
- **Google Cloud Vision:** Alternative zu OpenAI

### Kostenlose Services
- **OpenStreetMap Overpass API:** POI-Daten (unbegrenzt)
- **DWD Bright Sky API:** Wetterdaten (kostenlos)
- **Supabase:** Datenbank (Free Tier ausreichend)

### Dependencies
- `@react-native-segmented-control/segmented-control` - Für Tab Bar
- `expo-file-system` - Für Bildverarbeitung (KI)
- OpenAI API Key (für Vision)

---

## 6. Success Metrics

### Engagement
- **Catch Pins:** Anzahl der Tap-Events auf Pins, Zeit auf Karte
- **POI-Layer:** Nutzung von POI-Informationen, Tap-Events
- **Segmentierte Tabs:** Tab-Wechsel-Frequenz, Zeit im Bottom Sheet

### UX
- **KI-Fischerkennung:** Zeitersparnis beim Loggen, Akzeptanz-Rate
- **Layer Toggle:** Layer-Wechsel-Frequenz, User-Kontrolle

### Retention
- **My Area Filter:** Wiederkkehrende Nutzer, Filter-Nutzung
- **Catch Feed Filter:** Feed-Engagement, Filter-Adoption

---

## 7. Risiken und Herausforderungen

### Technische Risiken
- **Catch Pins Performance:** Clustering muss performant sein bei vielen Pins
- **POI-Datenqualität:** OpenStreetMap Daten können unvollständig sein
- **KI-Fischerkennung:** Konfidenz kann variieren, Fehlklassifikationen möglich

### UX Risiken
- **Information Overload:** Zu viele Layer können verwirren
- **Tab-Struktur:** Muss intuitiv sein, nicht klobig

### Business Risiken
- **Kosten:** OpenAI API kann teuer werden bei hohem Volumen
- **Lizenzkosten:** Depth Maps erfordern kommerzielle Lizenzen

---

## 8. Next Steps

1. **Sprint Planning:** Top 2 Features (Tab Bar, Layer Toggle) in nächsten Sprint
2. **Technical Design:** Detaillierte Architektur für Catch Pins und POI-Layer
3. **Prototype:** Quick Prototype für Tab Bar und Layer Toggle
4. **User Testing:** Feedback zu neuen UX-Patterns
5. **Metrics Setup:** Tracking für Success Metrics implementieren

---

*Erstellt am 28.04.2026 basierend auf Fishbrain-Feature-Analyse*
*Letztes Update: 28.04.2026*
