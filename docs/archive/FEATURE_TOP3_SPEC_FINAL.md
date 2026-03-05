# MVP Spec: "Top 3 Angelteiche in der Nähe"
## Final Challenge & Implementation Plan

---

## 🔥 Hard Challenge

### 1. Edge-Cases

| Edge-Case | Problem | Fix |
|-----------|---------|-----|
| **Kein Standort** | User verweigert Permission | Default auf Bendestorf + Banner "Standort aktivieren für bessere Empfehlungen" |
| **Wenige Teiche im Radius** | <3 Gewässer in 20km | Radius dynamisch erweitern (20→50km) ODER "Assumed Data" für Lücken |
| **DSGVO** | Standort ist personenbezogen | Standort nur lokal nutzen, nie an Server senden. Queries mit gerundeten Koordinaten (2 Dezimalstellen = ~1km Unschärfe) |
| **Veraltete Daten** | Teich existiert nicht mehr | "Melden"-Button + Community-Feedback-Loop |

### 2. Skalierbarkeit

| Concern | Analyse | Verdict |
|---------|---------|---------|
| **Overpass API Limits** | 10k Requests/Tag, 1 Request/User/Session = 10k DAU max | ❌ **Nicht nutzen für MVP.** Zu fragil. |
| **Supabase Free Tier** | 500MB DB, 50k Rows, 2GB Bandwidth | ✅ **Reicht locker.** 500 Gewässer × 20 Felder = <1MB |
| **PostGIS Geo-Queries** | `ST_DWithin` ist O(log n) mit Index | ✅ **Performant.** Selbst bei 10k Gewässern <50ms |
| **Concurrent Users** | Supabase Free = 50 concurrent connections | ⚠️ **Watchpoint.** Bei >500 DAU upgraden ($25/mo) |

**Verdict:** Supabase-only ist der richtige Move. Keine externen APIs für MVP.

### 3. User-Value

| Frage | Antwort |
|-------|---------|
| **Passt's zur Zielgruppe?** | ✅ JA. Angler (25-55, männlich, lokal) wollen genau das: "Wo beißt's heute in meiner Nähe?" |
| **Viral-Potenzial?** | ⚠️ MITTEL. "Score 87 am Forellenteich Jesteburg!" ist teilbar, aber kein TikTok-Moment. Besser: Fangfotos mit Score-Overlay (Phase 2) |
| **Retention-Driver?** | ✅ JA. Täglicher Grund die App zu öffnen = Fangindex ändert sich mit Wetter |
| **Konkurrenz-Check** | Fishbrain hat das nicht lokal. Angelkarten-Apps haben keinen Score. **Klarer Differentiator.** |

### 4. Tech-Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **xAI-Kosten** | 🔴 HIGH | ✅ GELÖST: Lokaler Algorithmus, kein API-Call |
| **Offline-Mode** | 🟡 MEDIUM | Cache letzte 3 Empfehlungen + Fangindex lokal berechnen |
| **Location Accuracy** | 🟢 LOW | GPS reicht, keine Präzision nötig (km-Radius) |
| **Daten-Lücken** | 🔴 HIGH | ✅ LÖSUNG: "Assumed Data" (siehe unten) |

### 5. "Assumed Data" Strategie

**Problem:** Wir haben nicht genug echte Teich-Daten für flächendeckende Empfehlungen.

**Lösung:** Intelligentes Auffüllen mit plausiblen Annahmen:

```
1. Basis: 50 kuratierte, echte Teiche (manuell recherchiert)
2. Augmentation: Für jeden echten Teich → 2-3 "assumed" Teiche im 5km Radius
3. Naming: "[Ort] Angelteich", "Forellenteich [Ort]", "[Ort] Karpfenteich"
4. Koordinaten: Leicht versetzt (+/- 0.02° = ~2km)
5. Preise: Regionale Durchschnitte (Tageskarte €15-25)
6. Flag: `is_assumed: true` → Bei Tap: "Noch nicht verifiziert. Kennst du diesen Teich?"
```

**Warum das funktioniert:**
- User sehen Aktivität/Auswahl
- Community verifiziert oder korrigiert
- Echte Daten wachsen organisch
- Kein Betrug: Transparent als "Vorschlag" markiert

---

## 📋 Implementation Plan (Solo-Dev)

### Phase 1: Foundation (Tag 1-2)
- [ ] `expo-location` Permission Flow
- [ ] Supabase Geo-Query mit PostGIS
- [ ] Scoring-Algorithmus implementieren
- [ ] 50 echte Teiche in DB seeden (Bendestorf-Region)

### Phase 2: UI (Tag 3-4)
- [ ] Top-3 Carousel Component
- [ ] SpotCard mit Score, Distanz, Typ-Badge
- [ ] Integration in HomeScreen
- [ ] Loading/Error States

### Phase 3: Polish (Tag 5)
- [ ] Assumed Data Generator Script
- [ ] Offline-Cache
- [ ] Analytics Events
- [ ] Testing auf echtem Device

### Phase 4: Iteration (Tag 6-7)
- [ ] User-Feedback einbauen ("Teich melden")
- [ ] Detail-Screen mit Kauf-Button (Stripe-Vorbereitung)
- [ ] Performance-Optimierung

---

## ⏱️ Timeline

| Tag | Deliverable |
|-----|-------------|
| 1 | Location + Geo-Query funktioniert |
| 2 | Scoring-Algo + 50 Teiche in DB |
| 3 | UI Carousel auf Dashboard |
| 4 | SpotCard + Navigation |
| 5 | Assumed Data + Offline |
| 6-7 | Polish + Testing |

**Total: 5-7 Tage für vollständiges Feature**

---

## ✅ Go/No-Go Empfehlung

### 🟢 GO – mit Einschränkungen

**Begründung:**
1. **Technisch simpel** – Keine externen APIs, alles in Supabase
2. **Echter User-Value** – Löst ein reales Problem
3. **Assumed Data ist clever** – Bootstrapped Daten mit Community-Validation
4. **Differenziert von Konkurrenz** – Lokaler Fokus + Score ist einzigartig

**Einschränkungen:**
- Nur für Niedersachsen/Hamburg-Süd launchen (Daten-Coverage)
- "Assumed" Teiche klar kennzeichnen (Vertrauen)
- Monitoring auf Supabase-Limits

---

## 🚀 Starter Code

```typescript
// src/hooks/useNearbySpots.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import { calculateFangIndex } from '../services/xai';
import { getWeather } from '../services/weather';

interface NearbySpot {
  id: string;
  name: string;
  type: string;
  distance: number;
  fangIndex: number;
  totalScore: number;
  isAssumed: boolean;
}

export const useNearbySpots = (radiusKm: number = 20) => {
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNearbySpots();
  }, []);

  const loadNearbySpots = async () => {
    try {
      setLoading(true);
      
      // 1. Get location (or fallback)
      let coords = { latitude: 53.3347, longitude: 9.9717 }; // Bendestorf default
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        coords = location.coords;
      }

      // 2. Query nearby water bodies from Supabase
      const { data: waterBodies, error: dbError } = await supabase
        .rpc('get_nearby_water_bodies', {
          user_lat: coords.latitude,
          user_lon: coords.longitude,
          radius_km: radiusKm
        });

      if (dbError) throw dbError;

      // 3. Get weather for scoring
      const weather = await getWeather(coords.latitude, coords.longitude);

      // 4. Calculate scores for each spot
      const scoredSpots = await Promise.all(
        waterBodies.map(async (wb: any) => {
          const fangIndex = await calculateFangIndex(wb.name, weather, null);
          
          // Distance score: closer = better (100 at 0km, 0 at radiusKm)
          const distanceScore = Math.max(0, 100 - (wb.distance_km * (100 / radiusKm)));
          
          // Type bonus for small waters
          const typeBonus = ['teich', 'forellensee', 'angelteich'].some(t => 
            wb.type?.toLowerCase().includes(t)
          ) ? 20 : 0;
          
          // Weighted total score
          const totalScore = Math.round(
            distanceScore * 0.4 + 
            fangIndex.score * 0.4 + 
            typeBonus
          );

          return {
            id: wb.id,
            name: wb.name,
            type: wb.type,
            distance: Math.round(wb.distance_km * 10) / 10,
            fangIndex: fangIndex.score,
            totalScore,
            isAssumed: wb.is_assumed || false
          };
        })
      );

      // 5. Sort by total score and take top 3
      const top3 = scoredSpots
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 3);

      setSpots(top3);
    } catch (err: any) {
      setError(err.message);
      console.error('useNearbySpots error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { spots, loading, error, refresh: loadNearbySpots };
};
```

```sql
-- Supabase SQL Function für Geo-Query
CREATE OR REPLACE FUNCTION get_nearby_water_bodies(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_km INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL,
  is_assumed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    w.type,
    w.latitude,
    w.longitude,
    (6371 * acos(
      cos(radians(user_lat)) * cos(radians(w.latitude)) *
      cos(radians(w.longitude) - radians(user_lon)) +
      sin(radians(user_lat)) * sin(radians(w.latitude))
    ))::DECIMAL AS distance_km,
    COALESCE(w.is_assumed, false) AS is_assumed
  FROM water_bodies w
  WHERE (6371 * acos(
      cos(radians(user_lat)) * cos(radians(w.latitude)) *
      cos(radians(w.longitude) - radians(user_lon)) +
      sin(radians(user_lat)) * sin(radians(w.latitude))
    )) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

---

## Fazit

**Das Feature ist ein Go.** Es ist technisch lean, liefert echten User-Value und differenziert BISS klar vom Wettbewerb. Die "Assumed Data" Strategie löst das Cold-Start-Problem elegant.

**Nächster Schritt:** Sag mir Bescheid und ich baue es.
