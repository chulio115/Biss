# Feature: "Top 3 Angelteiche in der Nähe"

## Überschrift
**Dashboard-Widget: Personalisierte Gewässer-Empfehlungen mit Fokus auf Geheimtipps**

---

## Beschreibung

Ein prominentes Dashboard-Element zeigt dem User sofort nach App-Start die **3 besten Angelspots** in seiner Nähe (10-20km Radius). Der Clou: Statt generischer Großgewässer (Elbe, Alster) priorisiert der Algorithmus **kleine, private Teiche und Forellenanlagen** – die echten Geheimtipps, die Angler wirklich suchen.

**User Story:**
> "Als Angler möchte ich sofort sehen, welcher kleine Teich in meiner Nähe heute die besten Fangchancen bietet, ohne selbst recherchieren zu müssen."

**Anzeige pro Gewässer-Card:**
- Name + Typ-Badge (z.B. "Forellenteich", "Karpfenteich")
- Aktueller Fangindex (0-100) mit Farbindikator
- Distanz in km
- Tap → Detail-Screen mit Kauf-Option (Tageskarte via Stripe)

---

## Requirements

### Functional
- [ ] Standort-Abfrage via `expo-location` (Permission-Handling)
- [ ] Gewässer-Suche im 10-20km Radius
- [ ] Custom Scoring-Algorithmus: `Distanz (40%) + Fangindex (40%) + Typ-Bonus (20%)`
- [ ] Typ-Bonus: +20 Punkte für "teich", "forellensee", "angelteich"
- [ ] Horizontal-Carousel mit 3 Cards auf Dashboard
- [ ] Tap-to-Detail Navigation
- [ ] Offline-Fallback: Letzte bekannte Position nutzen

### Non-Functional
- [ ] Ladezeit < 2 Sekunden
- [ ] Graceful Degradation bei Location-Denial
- [ ] Caching der Ergebnisse (5 Min TTL)

---

## Tech-Implementation

### 1. Datenquellen (Priorisiert)

| Quelle | Typ | Daten | Aufwand |
|--------|-----|-------|---------|
| **Supabase `water_bodies`** | Statisch | Kuratierte Teiche mit Preisen | ✅ Bereits vorhanden |
| **Overpass/OSM API** | Dynamisch | `natural=water` + `sport=fishing` | Medium |
| **Geoportal Niedersachsen** | Statisch | Offizielle Gewässer-Shapes | Medium |
| **forellenseen.de Scraping** | Statisch | Forellenteiche mit Details | Low (rechtlich prüfen) |

### 2. Scoring-Algorithmus

```typescript
const calculateSpotScore = (
  distance: number,      // km
  fangIndex: number,     // 0-100
  waterType: string      // 'see', 'fluss', 'teich', 'kanal'
): number => {
  // Distanz-Score: Näher = besser (max 100 bei 0km, 0 bei 20km)
  const distanceScore = Math.max(0, 100 - (distance * 5));
  
  // Typ-Bonus für kleine Gewässer
  const typeBonus = ['teich', 'forellensee', 'angelteich'].includes(waterType.toLowerCase()) 
    ? 20 : 0;
  
  // Gewichteter Score
  return (distanceScore * 0.4) + (fangIndex * 0.4) + typeBonus;
};
```

### 3. Location Flow

```
App Start → Check Permission → 
  ├─ Granted → Get Current Position → Query Nearby → Show Top 3
  └─ Denied → Use Last Known / Default (Bendestorf) → Show Top 3 + Banner
```

### 4. UI Component

```typescript
// Horizontal ScrollView mit Cards
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {top3Spots.map(spot => (
    <SpotCard 
      key={spot.id}
      name={spot.name}
      type={spot.type}
      fangIndex={spot.score}
      distance={spot.distance}
      onPress={() => navigation.navigate('SpotDetail', { id: spot.id })}
    />
  ))}
</ScrollView>
```

---

## USP-Impact

### Differenzierung vom Wettbewerb

| App | Gewässer-Empfehlung | BISS Vorteil |
|-----|---------------------|--------------|
| Fishbrain | Community-basiert, global | **Lokaler Fokus auf DE-Teiche** |
| Angelkarten-Apps | Nur Verkaufsgewässer | **Alle Gewässer + Fangindex** |
| Google Maps | Keine Angel-Relevanz | **Kuratiert + Scoring** |

### Metriken-Impact (Prognose)
- **Retention +15%**: Täglicher Grund die App zu öffnen
- **Conversion +25%**: Direkter Pfad zum Kartenkauf
- **Virality**: "Schau mal, dieser Teich hat Score 87!"

---

## Ehrliche Einschätzung

### ✅ Stärken

1. **Echter Mehrwert**: Angler suchen genau das – lokale Geheimtipps statt Mainstream-Gewässer. Die Priorisierung kleiner Teiche ist ein kluger Differentiator.

2. **Technisch machbar**: Mit Supabase + PostGIS sind Geo-Queries trivial. Expo-location ist battle-tested. Kein Overengineering nötig.

3. **Monetarisierung eingebaut**: Der direkte Pfad "Empfehlung → Tageskarte kaufen" ist Gold wert. Kurze User Journey = höhere Conversion.

4. **Lokaler Fokus = Burggraben**: Große Apps wie Fishbrain können das nicht – sie sind zu global. BISS kann der "Local Hero" für Niedersachsen/Hamburg werden.

### ⚠️ Schwächen & Risiken

1. **Datenqualität**: OSM hat Lücken bei kleinen Privatteichen. Viele Forellenanlagen sind nicht kartiert. **Lösung**: Manuelles Seeding für Kernregion (50 Teiche um Bendestorf) + User-Submissions später.

2. **Rechtlich bei Scraping**: forellenseen.de Daten nutzen könnte problematisch sein. **Lösung**: Partnerschaften statt Scraping, oder nur öffentliche Daten.

3. **Cold Start Problem**: Ohne gute Daten in der Region ist das Feature wertlos. **Lösung**: Soft-Launch nur in Regionen mit >20 kuratierten Gewässern.

### 💡 Verbesserungsvorschläge

1. **"Noch nie besucht" Bonus**: +10 Punkte für Gewässer die der User noch nicht besucht hat → fördert Exploration.

2. **Saison-Faktor**: Forellenteiche im Winter höher ranken, Karpfenteiche im Sommer.

3. **Community-Layer (Phase 2)**: "3 Angler waren heute hier" als Social Proof.

4. **Simpler Start**: Vergiss OSM/Overpass erstmal. Starte mit 50 handkuratierten Teichen in der Supabase. Das reicht für MVP und ist 10x schneller.

---

## Empfehlung

**Go for it – aber lean.** 

Für MVP: Nur Supabase-Daten, keine externen APIs. 50 kuratierte Teiche in Niedersachsen/Hamburg-Süd. Das Feature ist in 1-2 Tagen baubar und liefert sofort Mehrwert.

Die OSM-Integration kann Phase 2 sein, wenn das Konzept validiert ist.
