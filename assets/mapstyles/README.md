# BISS Custom Mapbox Styles

## 4 Premium Map Styles für die beste Angelkarte Europas

### 1. `biss-standard.json` - Standard Explorer
- **Verwendung:** Allgemeine Navigation, Onboarding
- **Features:** Farbige Straßen, volle Labels, sanfte Wasserfarbe
- **Wasser:** #00A3AD (Petrol)
- **Land:** Leicht grau (#F8FAFC)

### 2. `biss-angel-fokus.json` - Angel-Fokus (USP!)
- **Verwendung:** Haupt-Angelansicht, nach Onboarding
- **Features:** Land maximal reduziert, Wasser dominiert
- **Wasser:** #00A3AD mit Outline
- **Straßen:** 20% Opacity, nur bei hohem Zoom
- **Labels:** Nur Gewässer und Städte

### 3. `biss-angel-night.json` - Angel-Night 🌙
- **Verwendung:** Ab 18:30 Uhr automatisch
- **Features:** Dunkler Hintergrund, leuchtende Gewässer
- **Wasser:** #00E5FF (Neon-Cyan) mit 3-Layer Glow-Effekt
- **Hintergrund:** #0F1A24 (Fast Schwarz)
- **Straßen:** Dünne helle Linien

### 4. `biss-teich-fokus.json` - Teich-Fokus
- **Verwendung:** Detailansicht einzelner Gewässer
- **Features:** Nur Wasser sichtbar, alles andere ausgeblendet
- **Wasser:** #4DD0E1 mit großem Halo
- **Land:** Komplett weiß
- **Straßen:** Fast unsichtbar

---

## Upload zu Mapbox Studio

### Schritt 1: Studio öffnen
https://studio.mapbox.com/

### Schritt 2: Neuen Style erstellen
1. Klick auf "New style"
2. Wähle "Upload" oder "Empty"
3. Lade die JSON-Datei hoch

### Schritt 3: Style URL kopieren
Nach dem Speichern erhältst du eine URL wie:
```
mapbox://styles/DEIN_USERNAME/STYLE_ID
```

### Schritt 4: In der App verwenden
```typescript
// In MapScreen.tsx
const MAPBOX_STYLES = {
  standard: 'mapbox://styles/DEIN_USERNAME/standard_id',
  angelFokus: 'mapbox://styles/DEIN_USERNAME/angel_fokus_id',
  angelNight: 'mapbox://styles/DEIN_USERNAME/angel_night_id',
  teichFokus: 'mapbox://styles/DEIN_USERNAME/teich_fokus_id',
};
```

---

## Alternative: Lokale Styles (ohne Upload)

Du kannst die Styles auch direkt im React Native Code laden:

```typescript
import angelFokusStyle from '../assets/mapstyles/biss-angel-fokus.json';

<MapboxGL.MapView
  styleURL={JSON.stringify(angelFokusStyle)}
  // ... 
/>
```

**Hinweis:** Bei lokalen Styles müssen die Source-URLs erreichbar sein.

---

## Eigene BISS-Gewässer hinzufügen

Um eigene GeoJSON-Daten (z.B. aus Supabase) zu den Styles hinzuzufügen:

1. Lade dein GeoJSON zu Mapbox Studio als "Tileset"
2. Füge eine neue Source hinzu:
```json
"biss-custom-water": {
  "type": "vector",
  "url": "mapbox://DEIN_USERNAME.TILESET_ID"
}
```

3. Füge Layer für deine Daten hinzu (vor den Standard-Wasser-Layern):
```json
{
  "id": "biss-teiche",
  "type": "fill",
  "source": "biss-custom-water",
  "source-layer": "LAYER_NAME",
  "paint": {
    "fill-color": "#00A3AD",
    "fill-opacity": 1
  }
}
```

---

## Farb-Referenz

| Element | Standard | Angel-Fokus | Night | Teich-Fokus |
|---------|----------|-------------|-------|-------------|
| Wasser | #00A3AD | #00A3AD | #00B8D4 | #4DD0E1 |
| Wasser-Glow | - | - | #00E5FF | #81D4FA |
| Hintergrund | #F8FAFC | #FAFAFA | #0F1A24 | #FFFFFF |
| Land | #E5E7EB | #F5F5F5 | #1E2D3D | #FAFAFA |
| Straßen | #FFFFFF | #E0E0E0 | #374A5C | #E0E0E0 |
| Text | #212121 | #757575 | #B0BEC5 | #006064 |

---

**„Das ist jetzt die mit Abstand schönste Angelkarte Europas – Punkt."**
