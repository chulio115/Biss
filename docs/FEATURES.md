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

## 🌊 Spot-Daten 2.0 — "Jeder Spot erzählt eine Geschichte"

> Unser USP. Nicht 10.000 leere Pins, sondern 500+ Spots die besser sind als alles was die Konkurrenz hat.

### Status: � IN PROGRESS (10.03.26)

### Aktuelle Schwachstellen (ehrlich)

| Problem | Detail |
|---------|--------|
| **Nur Seen/Teiche** | OSM-Query holt nur `water=lake/pond/reservoir`. Keine Flüsse (Elbe, Aller, Weser...) |
| **Nur Niedersachsen** | BBox `51.29–54.01, 6.65–11.56`. Hamburg + SH fehlen |
| **Fischarten geraten** | `estimateFishSpecies()` schätzt nach Gewässertyp — keine echten Daten |
| **Permit-Daten = null** | `permit_required: true, permit_price: null` für alle Spots |
| **Koordinaten teils daneben** | 15 manuelle Korrekturen, Rest = OSM-Gewässermitte |

### Neue Datenquellen

| Quelle | Typ | Kosten | Was wir bekommen |
|--------|-----|--------|-----------------|
| **OSM Overpass** (erweitert) | API | €0 | Flüsse, Kanäle, Bäche zusätzlich zu Seen/Teichen |
| **DWD Open Data** | API | €0 | Präzises DE-Wetter, 2000+ Stationen, kein API-Key |
| **PEGELONLINE Vorhersagen** | API | €0 | Wasserstandsvorhersagen (NEU seit März 2026) |
| **NLWKN Niedersachsen** | API | €0 | Granulare NDS-Pegel (Binnen + Tide) |
| **hejfish.com** | Web | €0 | Tageskarten-Preise, Kauforte |
| **Landesfischereiverbände** | Web | €0 | Gewässersteckbriefe, echte Fischarten |
| **Community** | UGC | €0 | Spot-Corrections, Fotos, Fischarten-Bestätigung |

### Spot-Ziele

| Region | Aktuell | Ziel M2 | Ziel M4 |
|--------|---------|---------|---------|
| Niedersachsen (Seen/Teiche) | 241 | 400+ | 500+ |
| Niedersachsen (Flüsse) | 0 | 100+ | 200+ |
| Hamburg | 0 | 80+ | 120+ |
| Schleswig-Holstein | 0 | 150+ | 300+ |
| **Gesamt** | **241** | **730+** | **1.120+** |

### Dateien (neu/geändert)

| Datei | Änderung |
|-------|----------|
| `src/services/dataAcquisition.ts` | OSM-Query um Flüsse erweitert, BBox für HH/SH |
| `src/services/weatherDWD.ts` | NEU: DWD Open Data Integration |
| `src/services/pegelonline.ts` | NEU: Vorhersagen-API |
| `src/types/map.ts` | Erweitert: permit_url, permit_contact, regulations, pegelTrend |

---

## 🎨 Dark Mode

### Status: ✅ 100% (10.03.26)

### Architektur

```
ThemeContext (src/contexts/ThemeContext.tsx)
├── ThemeProvider (wraps App)
├── useTheme() hook → { theme, isDark, setTheme }
├── Persistenz: AsyncStorage (@biss_theme)
└── Modi: 'light' | 'dark' | 'system'
```

### Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/contexts/ThemeContext.tsx` | Zentrales Theme Management mit AsyncStorage Persistenz |
| `src/components/profile/AppearanceSettingsModal.tsx` | Darstellungs-Einstellungen (Hell/Dunkel/System) |

### Aktualisierte Komponenten

Alle UI-Komponenten verwenden `useTheme()` statt `useColorScheme()`:
- `App.tsx`, `TabNavigator.tsx`, `ProfileScreen.tsx`
- `MapTopBar.tsx`, `MapFilterSheet.tsx`, `MapBottomSheet.tsx`
- `CommunityScreen.tsx`, `CatchBookScreen.tsx`
- `AppearanceSettingsModal.tsx`

---

## �🗺️ Karte & Fangindex

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
| Wetter | 30% | OpenWeather → DWD (Migration geplant) |
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

### Status: ✅ 85% (10.03.26)

- **Foto-Upload:** Kamera + Galerie
- **Wallet-Card:** Bild + Gültigkeitsbadge + Metadaten
- **Dateien:** `useFishingLicense.ts`, `ScheinScreen.tsx`
- **Änderung 10.03.26:** ScheinScreen akzeptiert optionale `onClose` Prop, wird jetzt als Modal aus dem Profil-Menü geöffnet (statt eigener Tab)

---

## 🐟 Community Feed + Privacy-First Sharing (Opas Rat #2)

> "Teilen ohne Brennen" — Angler teilen Fänge, ohne Spots zu verraten.

### Status: ✅ 90% (10.03.26)

### Architektur

```
┌─────────────────────────────────────────────────┐
│  Fang eintragen (CatchBookScreen)               │
│  ↓ Toggle: "Mit Community teilen"               │
│  ↓ Wer sieht das? [Community] [Öffentlich]      │
│  ↓ Standort? [~Bereich ±2km] [Verborgen] [Exakt]│
│  ↓ shareCatch() → catch_shares Tabelle           │
└─────────────────────────────────────────────────┘
            │ Supabase: catch_shares
┌─────────────────────────────────────────────────┐
│  Community Feed (CommunityScreen)               │
│  ├── Stats: Geteilte Fänge, Trending, Region    │
│  ├── Filter-Button (oben rechts)                │
│  ├── Active Filter Chips (inline)              │
│  ├── Privacy-Info Banner                        │
│  ├── Catch Cards mit Privacy-Badges             │
│  └── Petri Heil! Reactions (4 Typen)            │
└─────────────────────────────────────────────────┘
```

### Privacy-Kontrollen

| Option | Beschreibung |
|--------|-------------|
| **Visibility: Community** | Nur BISS-Nutzer sehen den Fang |
| **Visibility: Öffentlich** | Alle sehen den Fang |
| **Location: ~Bereich** | Spot wird um ±2km versetzt (Fuzzy) |
| **Location: Verborgen** | Kein Spot, kein Name, keine Koordinaten |
| **Location: Exakt** | Genauer Spot (nur wenn gewollt) |

### Dateien

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `supabase/community_schema.sql` | Schema | catch_shares + community_likes + RLS + Trigger |
| `src/types/index.ts` | Types | CatchVisibility, LocationSharing, CatchShare, CommunityLike, SharedCatchCard |
| `src/hooks/useCommunityFeed.ts` | Hook | Feed laden, Like/Unlike, shareCatch(), AsyncStorage-Fallback |
| `src/screens/CommunityScreen.tsx` | Screen | Feed UI, CatchCards, Reactions, Stats Header, Privacy Banner |

### Community-Filter (10.03.26)

| Filter | Beschreibung | Status |
|--------|-------------|--------|
| **Fischarten** | Chip-Grid aller Fischarten, toggle Auswahl | ✅ Client-side |
| **Umkreis** | 5/10/25/50/100 km Radius-Chips, Haversine-Distanz | ✅ Client-side (expo-location) |
| **Verein** | Club-Liste mit Checkmark, Mock-Daten für MVP | ✅ UI ready, ⬜ Backend |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/screens/CatchBookScreen.tsx` | Privacy-Controls im AddCatchModal: Share-Toggle, Visibility, Location Sharing. **Bug Fix 10.03.26:** `shareCatch()` wird jetzt korrekt aufgerufen wenn `shareToFeed=true` |
| `src/navigation/TabNavigator.tsx` | BuyStack → CommunityStack (Users Icon). **10.03.26:** ScheinStack entfernt (4 Tabs) |
| `src/navigation/types.ts` | CommunityStackParamList ersetzt BuyStackParamList. **10.03.26:** ScheinStack aus RootTabParamList entfernt |

### Reactions

| Reaction | Emoji | Label |
|----------|-------|-------|
| petri_heil | 🐟 | Petri Heil! |
| trophy | 🏆 | Rekord! |
| fire | 🔥 | Feuer! |
| wow | 😮 | Wow! |

### Was noch fehlt (→ 100%)

- ⬜ Freunde / Follower System
- ⬜ Kommentar-Funktion
- ⬜ Share-Button auf bestehenden CatchCards
- ⬜ Benachrichtigungen bei Reactions
- ⬜ Vereins-Backend (Clubs-Tabelle, Mitgliedschaften, Filter mit echten Daten)

---

## 🔔 Personalisierte Push-Benachrichtigungen (Opas Rat: "Emotionaler Hook")

> Nie wieder die beste Beißzeit verpassen — lokale Alerts, kein Server nötig.

### Status: ✅ 80% (09.03.26)

### Architektur

```
┌─────────────────────────────────────────────────┐
│  Profil → Benachrichtigungen                    │
│  ├── Master-Toggle: Beißzeit-Alerts an/aus      │
│  ├── Golden Hour (🌅 Sonnenauf-/untergang)      │
│  ├── Solunar Major (� Mond-Transit ~2h)        │
│  ├── Solunar Minor (⭐ Mondauf-/untergang ~1h)   │
│  ├── Tages-Zusammenfassung (⏰ Uhrzeit wählbar)  │
│  └── Refresh: Alerts jetzt aktualisieren        │
└─────────────────────────────────────────────────┘
        │ expo-notifications (lokal)
        │ Solunar + Sun Times aus fangindex.ts/fishing.ts
        ↓
  15 Min. vor Period → Push-Notification
```

### Alert-Typen

| Typ | Emoji | Beschreibung | Timing |
|-----|-------|-------------|--------|
| **Golden Hour** | 🌅 | Sonnenauf-/untergang | 15 Min. vorher |
| **Solunar Major** | 🔥 | Mond-Transit, höchste Aktivität | 15 Min. vorher |
| **Solunar Minor** | ⭐ | Mondauf-/untergang, erhöhte Aktivität | 15 Min. vorher |
| **Tages-Zusammenfassung** | 🐟 | Alle Beißzeiten für heute | Täglich (wählbar 05–08 Uhr) |

### Dateien

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `src/services/notificationService.ts` | Service | Permission, Schedule, Cancel, Batch-Alerts |
| `src/hooks/useNotificationPreferences.ts` | Hook | AsyncStorage-Prefs, Toggle-Funktionen, refreshAlerts |
| `src/components/profile/NotificationSettingsModal.tsx` | Modal | Fullscreen UI mit Toggle-Rows, Hour-Picker |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/screens/ProfileScreen.tsx` | NotificationSettingsModal + Menüpunkt "Benachrichtigungen" verbunden, "Tageskarten kaufen" hinzugefügt |

### Was noch fehlt (→ 100%)

- ⬜ Favoriten-Spots als Koordinaten übergeben (benötigt Spot-Daten in Favoriten)
- ⬜ Push-Token für Remote Notifications (Server-Side, Post-Launch)
- ⬜ Notification-History Ansicht

---

## � Navigation

4 Tabs: **Karte** (Mitte) → **Fänge** → **Community** → **Profil**

Profil-Menü: Fischereischein → Tageskarten kaufen → Benachrichtigungen → Favoriten → Hilfe → Datenschutz

> Änderung 10.03.26: Schein-Tab entfernt, unter Profil als Modal verschoben. Freier Tab-Slot für spätere Features.

---

## 🏢 Vereinsangeln (Community-Integration)

> Vereine als Filter/Sektion innerhalb des Community-Feeds — kein eigener Tab.

### Status: 🟡 30% (10.03.26)

### Aktueller Stand

- ✅ **Filter-UI im Community-Screen:** Vereins-Filter als Sektion im Filter-Modal
- ✅ **Mock-Clubs:** 5 Beispielvereine (ASV Elbe Hamburg, Angelverein Lüneburg, SAV Harburg, etc.)
- ✅ **Club-Row UI:** Name, Region, Mitgliederzahl, Checkmark für aktiven Filter
- ⬜ **Supabase Datenmodell:** Clubs-Tabelle, Mitgliedschaften, Vereinsgewässer
- ⬜ **Beitreten/Erstellen:** Club-Verwaltung
- ⬜ **Vereinsgewässer auf der Karte:** Spezielle Marker für Club-Gewässer
- ⬜ **Mitgliedsnummer im Wallet:** Zusammen mit Fischereischein

---

*Zuletzt aktualisiert: 10.03.2026*
