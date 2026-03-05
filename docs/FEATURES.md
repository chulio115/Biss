# 🎣 BISS - Feature-Übersicht

> Alle implementierten Features, ihre Architektur und der aktuelle Stand.

---

## 📡 Offline-Modus (Opas Rat #4)

> "Sobald ein Angler einmal mit BISS am Wasser war und alles funktioniert hat, obwohl er keinen Empfang hatte, ist er gewonnen."

### Status: ✅ 90% (05.03.26)

### Architektur

```
┌─────────────────────────────────────────────────────┐
│                    Online                            │
│  Supabase ─→ cacheWaterBodies() ─→ AsyncStorage    │
│  OpenWeather ─→ cacheWeather() ─→ AsyncStorage     │
│  Catches ─→ cacheCatches() ─→ AsyncStorage         │
└─────────────────────────────────────────────────────┘
                        │
                   Netzwerk fällt aus
                        │
┌─────────────────────────────────────────────────────┐
│                    Offline                           │
│  getCachedWaterBodies() ─→ Karte + Spots laden     │
│  getCachedWeather() ─→ Fangindex berechnen (lokal) │
│  getCachedCatches() ─→ Fangbuch anzeigen           │
│  addToOfflineQueue() ─→ Neue Fänge lokal speichern │
│  Mapbox Offline Pack ─→ Karte rendern ohne Netz    │
└─────────────────────────────────────────────────────┘
                        │
                   Netzwerk kommt zurück
                        │
┌─────────────────────────────────────────────────────┐
│                    Sync                              │
│  syncOfflineCatches() ─→ Queue → Supabase          │
│  reload() ─→ Frische Daten laden + Cache updaten   │
│  OfflineBanner verschwindet                         │
└─────────────────────────────────────────────────────┘
```

### Dateien

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `src/services/offlineStorage.ts` | Service | Zentraler Cache für Water Bodies, Weather, Catches + Offline-Queue |
| `src/hooks/useNetworkStatus.ts` | Hook | NetInfo-basierte Netzwerkerkennung, Reconnect-Callbacks |
| `src/hooks/useOfflineMaps.ts` | Hook | Mapbox Offline-Packs für Norddeutschland (Zoom 7-14) |
| `src/components/ui/OfflineBanner.tsx` | UI | Gelber Banner "Offline-Modus" / "Gecachte Daten" |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/hooks/useMapData.ts` | Cache nach Fetch, Fallback bei Netzwerkfehler, `isOfflineData` + `cacheAge` im Return |
| `src/screens/MapScreen.tsx` | OfflineBanner, useNetworkStatus, Auto-Reload bei Reconnect |
| `src/screens/CatchBookScreen.tsx` | Offline-Queue, Sync-Banner, Cache-Fallback, Auto-Sync |

### Was offline funktioniert

- ✅ **Karte anzeigen** (Mapbox Offline Pack)
- ✅ **Spots + Fangindex** (gecachte Water Bodies + lokale Berechnung)
- ✅ **Fangbuch lesen** (gecachte Catches)
- ✅ **Fänge eintragen** (Offline-Queue mit Auto-Sync)
- ✅ **Favoriten** (waren schon AsyncStorage-basiert)
- ✅ **Bewertungen** (waren schon AsyncStorage-basiert)
- ✅ **Achievements + Streak** (waren schon AsyncStorage-basiert)
- ✅ **Fischereischein** (war schon AsyncStorage-basiert)

### Was noch fehlt (→ 100%)

- ⬜ Offline Map Pack Download-UI im Settings/Profile
- ⬜ Offline-Indikator auf einzelnen Catch-Cards ("wird synchronisiert")

### Cache-Konfiguration

| Datentyp | TTL | Begründung |
|----------|-----|------------|
| Water Bodies | 24h | Spots ändern sich selten |
| Weather | 30min | Wetter ist volatiler |
| Catches | 1h | Eigene Fänge |

### Dependency

- `@react-native-community/netinfo` — Zuverlässige Netzwerkerkennung (iOS + Android)

---

## 🎁 Free-Tier-Kommunikation (Opas Rat #1)

> "Kein Feature-Kastrieren. Du verdienst mit Partner-Tageskarten und Mystery Spots."

### Status: ✅ 100% (04.03.26)

### Datei: `src/screens/ProfileScreen.tsx`

Grünes Banner im ProfileScreen nach Stats, vor Streak:
- **Titel:** "Immer kostenlos bei BISS"
- **Features:** Fangindex, Beißzeiten, Karten, Fangbuch, Schonzeiten
- **Design:** Grün (#ECFDF5), 🎁 Emoji, Dark-Mode-Support

---

## 🐟 Datenfrische-Anzeige (Opas Rat #3 + Schicht 3)

> "Die Nutzung der App ist das Daten-Update."

### Status: ✅ 100% (04.03.26)

### Dateien

| Datei | Änderung |
|-------|----------|
| `src/types/map.ts` | `lastCaughtAt` + `catchCount` in MapWaterBody |
| `src/hooks/useMapData.ts` | Catch-Query nach Deduplizierung |
| `src/components/map/MapBottomSheet.tsx` | Datenfrische-Sektion + `formatTimeAgo` |

### Was angezeigt wird

- "Zuletzt gefangen: vor 3 Tagen" (relative Zeitangabe)
- "Deine Fänge hier: 5" (Fangzähler)
- Empty State: "Noch keine Fänge an diesem Spot"

---

## 🗺️ Karte & Fangindex

### Status: ✅ 85%

### Kernkomponenten

| Datei | Beschreibung |
|-------|--------------|
| `src/screens/MapScreen.tsx` | Orchestrator mit Mapbox ShapeSource Clustering |
| `src/hooks/useMapData.ts` | Daten-Loading (Location, Supabase, Weather, Scoring) |
| `src/utils/fangindex.ts` | Lokale Fangindex-Berechnung (5 Faktoren, gewichtet) |
| `src/components/map/MapTopBar.tsx` | Location, Suche, Beißzeit, Night-Mode |
| `src/components/map/MapBottomSheet.tsx` | Spot-Details + Explore-View |
| `src/components/map/MapFilterSheet.tsx` | 5 Filter: Kategorie, Fisch, Score, Favoriten, Rating |
| `src/components/map/MapZoomControls.tsx` | Zoom +/- |

### Fangindex-Faktoren

| Faktor | Gewicht | Quelle |
|--------|---------|--------|
| Wetter | 30% | OpenWeather API |
| Tageszeit | 25% | Lokal (Golden Hours) |
| Mondphase | 20% | Lokal (Berechnung) |
| Solunar | 15% | Lokal (Major/Minor Periods) |
| Wasserstand | 10% | PEGELONLINE API |

---

## 📖 Fang-Tagebuch

### Status: ✅ 95%

- **DB:** `supabase/catches_schema.sql` (catches table mit RLS)
- **Screen:** `src/screens/CatchBookScreen.tsx` (Liste, Add Modal, Foto, Stats)
- **Offline:** Queue + Auto-Sync bei Reconnect
- **Navigation:** 5. Tab "Fänge" mit BookOpen Icon

---

## 🏆 Gamification

### Status: ✅ 85%

- **18 Achievements** in 4 Kategorien (Fischen, Erkunden, Social, Streak)
- **3 Tiers:** Bronze, Silber, Gold
- **Streak-System:** Tägliche Nutzung tracken
- **Leaderboard:** Mock-Daten für MVP, Scoring-Algorithmus
- **Badge-Grid** im ProfileScreen + Achievement Modal

### Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/constants/achievements.ts` | 18 Achievement-Definitionen |
| `src/hooks/useAchievements.ts` | AsyncStorage-basiert, Progress + Unlock |
| `src/hooks/useLeaderboard.ts` | Scoring-Algorithmus + Mock-Leaderboard |
| `src/components/profile/LeaderboardModal.tsx` | Fullscreen Rangliste |
| `src/components/profile/AchievementModal.tsx` | Alle Achievements |

---

## ⭐ Favoriten & Bewertungen

### Status: ✅ 100%

- **Favoriten:** AsyncStorage-basiert, Heart-Icon, Filter-Support
- **Bewertungen:** 1-5 Sterne + Kommentar, AsyncStorage-basiert
- **Dateien:** `useFavorites.ts`, `useRatings.ts`, `StarRating.tsx`, `RatingModal.tsx`

---

## 🪪 Fischereischein Wallet

### Status: ✅ 80%

- **Foto-Upload:** Kamera + Galerie
- **Wallet-Card:** Bild + Gültigkeitsbadge + Metadaten
- **Dateien:** `useFishingLicense.ts`, `ScheinScreen.tsx`

---

## 📱 Navigation

5 Tabs: **Schein** → **Fänge** → **Karte** (Mitte) → **Kaufen** → **Profil**

---

*Zuletzt aktualisiert: 05.03.2026*
