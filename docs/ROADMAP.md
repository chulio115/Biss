# 🗺️ BISS - Roadmap & Milestones

> Wo wir stehen und wo wir hin wollen

---

## 📊 Status Overview

```
██████████████████████████████ 92% MVP Complete
```

| Phase | Status | Beschreibung |
|-------|--------|--------------|
| Foundation | ✅ 100% | Auth, Services, APIs |
| Navigation | ✅ 100% | 4 Tabs (Karte, Fänge, Community, Profil) — Schein unter Profil |
| Map Core | ✅ 85% | Mapbox, Clustering, Score-Marker, Zoom-basiert |
| USP Features | ✅ 75% | Beißzeit-Modal, Schonzeit, Solunar, Favoriten |
| Smart Intelligence | ✅ 40% | Kontext-Detection, Insight Generation |
| Daten | ✅ 80% | 241+ OSM-Gewässer + Flüsse/Kanäle, 20 kuratierte Top-Spots, echte Fischarten, Permit-Daten |
| **Spot-Daten 2.0** | ✅ 90% | 15/16 Features implementiert. Flüsse, DWD, PEGELONLINE, Forecast, Regulations, Seed-Daten |
| Categories | ✅ 100% | 4 Spot-Kategorien + Filter |
| UI/UX Rework | ✅ 90% | Design System, ScoreRing, FangindexBreakdown, Logo, Map UI redesign (solid colors) |
| **Dark Mode** | ✅ 100% | App-weiter Dark Mode mit ThemeContext, AppearanceSettingsModal, Persistenz |
| Bottom Sheet | ✅ 100% | Details + Breakdown + Auto-Open |
| Location Fixes | 🟡 80% | Bekannte Spots korrigiert |
| **Fang-Tagebuch** | ✅ 95% | DB + Screen + Add Modal + Foto-Upload (Kamera + Galerie) |
| **Angel-App Features** | 🟡 75% | Fang-Tagebuch, Favoriten, Bewertungen, Schein, Leaderboard, Community Feed |
| **Gamification** | ✅ 85% | Achievements, Streaks, Badge-Grid, Achievement Modal, Leaderboard |
| **Social Features** | 🟡 85% | Community Feed + Filter (Fischarten, Umkreis, Verein), Petri Heil Reactions, Privacy-Controls; Freunde/Gruppen offen |
| **Free-Tier-Kommunikation** | ✅ 100% | Banner im ProfileScreen (Opas Rat #1) |
| **Privacy-First Sharing** | ✅ 80% | Fuzzy Locations (±2km), Spot verbergen, Community-Only Visibility (Opas Rat #2) |
| **Offline-Modus** | ✅ 90% | Cache-Service, Offline-Fänge+Sync, Offline-Fangindex, Mapbox Packs (Opas Rat #4) |
| **Personalisierte Push** | ✅ 80% | Lokale Beißzeit-Alerts, Golden Hour, Solunar Major/Minor, Tages-Zusammenfassung (Opas Rat: Emotionaler Hook) |
| **Vereinsangeln** | 🟡 30% | Filter-UI + Mock-Clubs im Community-Feed (Opas Rat #5); Backend + Gewässer offen |
| **EU Fangmeldung** | 🔴 0% | RecFishing 1-Klick-Integration (Opas Rat #6, rechtlich ab Sommer 2026) |
| Fischereischein | ✅ 80% | Wallet UI, Image Picker, Metadaten, Gültigkeit (OCR optional) |
| Monetarisierung | 🔴 0% | Stripe vorbereitet |
| Polish | ✅ 95% | Premium UI, Animationen, Design Tokens, Solides Farb-Design |

---

## 🎯 Strategische Leitlinien (aus [Opas Rat](OPAS_RAT.md))

> Marktanalyse der Konkurrenz (Fishbrain, Alle Angeln, Anglr) — 6 Pain Points + 5 Killer-Moves

### Die 5 Killer-Moves

| # | Move | Was wir haben | Was noch fehlt | Prio |
|---|------|---------------|----------------|------|
| 1 | 🆓 **Faire Paywall** | Fangindex, Beißzeit, Spots – alles gratis | Klar kommunizieren was IMMER free bleibt. Monetarisierung über Partner-Tageskarten + Mystery Spots, NICHT über Feature-Kastrieren | 🟢 Strategie |
| 2 | 🔒 **Privacy-First Spots** | Mystery Spots Konzept | "Teilen ohne Brennen": ungenaue Location-Option, Fang ohne Spot teilbar, Community-Only sichtbar | 🔴 Vor Launch |
| 3 | 📡 **Offline-First** | AsyncStorage Basis | Mapbox Offline-Karten-Cache, Offline-Fänge speichern, Offline-Fangindex-Berechnung | 🔴 Vor Launch |
| 4 | 🇩🇪 **German-Native** | Schonzeiten, Schein-Wallet | Vereinsangeln-Integration, EU RecFishing (Sommer 2026) | 🟡 M3/M4 |
| 5 | 💌 **Emotionaler Hook** | Beißzeit-Modal | Personalisierte Push: "Morgen 6:23 – Golden Hour + Solunar an deinem Lieblingssee" | 🔴 Vor Launch |

### Wettbewerbsvorteil: Warum BISS gewinnt

- **Fishbrain** (15M+ User): 66% negative Erfahrungen, aggressive Paywall, Spot-Burn-Problem
- **Alle Angeln** (DE #1): Technisch Stand 2017, Umkreissuche speichert nicht, kein Offline
- **Anglr**: Reiner GPS-Logger, keine Emotion
- **BISS**: Treuer Angelkumpel – nicht das beste Tool, sondern die **beste Erfahrung**

---

## ✅ Abgeschlossen

### Phase 1: Foundation ✅
- [x] Expo + TypeScript Setup
- [x] Supabase Auth Integration
- [x] xAI/Grok Fangindex Service
- [x] OpenWeather API
- [x] PEGELONLINE API
- [x] Login/Register UI

### Phase 2: Navigation ✅
- [x] Bottom Tab Navigator (5 Tabs)
- [x] MapScreen als Hauptansicht
- [x] SearchScreen Modal
- [x] ScheinScreen Placeholder
- [x] BuyScreen Placeholder
- [x] ProfileScreen Placeholder

### Phase 3: Ultimate Map ✅
- [x] Native Mapbox GL Integration
- [x] 3 Custom Map Styles
- [x] Auto-Nachtmodus (18:30)
- [x] Style-Switcher UI
- [x] Geolocation + Fallback
- [x] Top 3 Cards Overlay
- [x] Bottom Sheet Details
- [x] Fangindex-Marker

### Phase 4: USP Features ✅
- [x] Beißzeit-Radar (Golden Hour)
- [x] Schonzeit-System (7 Fische)
- [x] Season Badges (🔥✓🚫)
- [x] Schonzeit Warning

### Phase 5: Premium Components ✅
- [x] ActivityRing (Apple Watch Style)
- [x] PulseMarker (80+ Animation)
- [x] FishChip (Icons + Badge)
- [x] PulsingBuyButton

---

## 🚧 In Progress

### Smart Fishing Intelligence (ABOVE AND BEYOND!) ✅
- [x] smartFishing.ts Service erstellt
- [x] Context Detection (Tageszeit, Wetter, Mond, Saison)
- [x] Insight Generation (Tipps, Warnungen, Chancen)
- [x] Smart Recommendations (Kategorisiert, nicht nur sortiert)
- [x] useSmartFishing Hook mit Auto-Refresh
- [x] SmartInsightCard & SmartRecommendationCard Components
- [x] Integration in MapScreen
- [x] Testing mit echten Daten

### Echte Gewässer-Daten (OSM Integration) ✅
- [x] OpenStreetMap Overpass API Integration
- [x] 200+ echte Gewässer in Niedersachsen
- [x] Automatische Fischarten-Zuweisung
- [x] Data Acquisition Service (dataAcquisition.ts)
- [x] Supabase Import Script
- [x] Google Places Enrichment vorbereitet

### Spot Categories System ✅
- [x] 4 Kategorien: Fangindex, Offiziell, Versteckt, Mystery
- [x] Auto-Kategorisierung nach Keywords
- [x] Filter Pills UI mit Count Badge
- [x] Kategorie-spezifische Marker (Farbe + Icon)
- [x] Category Badge im Bottom Sheet

### UI/UX Above and Beyond Rework ✅
- [x] Fallback Location: Bendestorf (21227)
- [x] Category Pills Long-Press Info-Tooltip
- [x] Top 3 Cards in Bottom Sheet (kein Overlap mehr!)
- [x] Horizontale Scroll-Row für Top 3
- [x] Rang-Badge mit Kategorie-Farbe
- [x] Offizielle Locations: Grünes Banner + Google Rating
- [x] Fangindex Spots: Orange Insight-Banner
- [x] Hidden Gems: Lila Banner

 #### Map UI/UX Upgrade (März 2026) ✅
 - [x] **Fix 1: Marker-Sichtbarkeit** (`src/screens/MapScreen.tsx`)
   - Zoom-basierte Marker-Größe (`interpolate`, Radius 12 @ Zoom 7 → 26 @ Zoom 16)
   - Marker-Farbe nach Score (`['get', 'color']`), nicht nach Category
   - Score-Labels immer sichtbar (`textIgnorePlacement: true` + zoom-skalierte Textgröße)
   - Cluster-Shadows für mehr Tiefe
 - [x] **Fix 2: BottomSheet Hero + Score UI** (`src/components/map/MapBottomSheet.tsx`, `src/constants/fishing.ts`)
   - `official` Icon: `✓` → `🏕️`
   - Hero zeigt nur Foto, wenn vorhanden (kein Emoji-Gradient mehr)
   - Score-UI mit separatem `scoreRingLabel`
 - [x] **Fix 3: Bendestorf Spots daneben + gedoppelt** (`src/utils/fishing.ts`, `src/hooks/useMapData.ts`)
   - Manuelle Koordinaten-Korrektur (Bendestorf)
     - Forellenteich: `53.3395 / 9.9785`
     - Angelsee: `53.3390 / 9.9800`
   - Deduplizierung: Spots innerhalb ~200m werden zusammengefasst
     - Ergebnis: **291 → 241 Spots**
 - [x] **Fix 4: Beißzeit klickbar + Premium Badge** (`src/components/map/MapTopBar.tsx`, `src/screens/MapScreen.tsx`)
   - Badge von `View` → `TouchableOpacity` (`onBiteTimePress`)
   - Premium Styling (Shadow/Border) + Haptics
   - Icon dynamisch: `🔥` (aktiv) / `🎣` (inaktiv)
 - [x] **Fix 5: Filter-Optionen sichtbar** (`src/screens/MapScreen.tsx`)
   - Floating Category-Filter-Chips unter der TopBar (4 Kategorien)
   - Active-State mit Category-Farbe + Count-Badge
   - Default: alle Kategorien sichtbar (leerer Filter = alle)
 - [x] **Fix 6: Premium Polish** (`src/components/map/MapBottomSheet.tsx`, `src/screens/MapScreen.tsx`)
   - `OfficialBanner` Premium (Gradient + Icon-Wrap + Star Icon)
   - Preis-Sektion als Card + „Kaufen" Button mit Shadow
   - Fangindex-Info-Modal Gewichtung: **30/25/20/15/10 inkl. Solunar**
   - BottomSheet Header Premium (Kategorie-Subtitle + runder Close-Button)

 #### Design System Upgrade (März 2026) ✅
 - [x] **COLORS zentralisiert** – Alle lokalen COLORS in 7 Dateien eliminiert
   - `TabNavigator.tsx`, `SearchScreen.tsx`, `ActivityRing.tsx`, `FishChip.tsx`
   - `PulseMarker.tsx`, `PulsingBuyButton.tsx`, `SmartInsightCard.tsx` (→ INSIGHT_COLORS)
   - `constants/colors.ts` erweitert: tab.*, overlay.* Tokens
 - [x] **ScoreRing mit react-native-reanimated** (`src/components/ui/ScoreRing.tsx`)
   - SVG-basiert mit animiertem Progress-Arc (800ms easeOut)
   - Gradient Stroke (rot→amber→grün nach Score)
   - Pulse-Glow für Scores ≥80 (loop, scale 1.06x)
   - Im MapBottomSheet integriert (ersetzt alten View-Ring)
 - [x] **FangindexBreakdown mit echten Daten** (`src/components/ui/FangindexBar.tsx`)
   - 5 Faktoren: Wetter 30%, Tageszeit 25%, Mondphase 20%, Solunar 15%, Wasserstand 10%
   - Stagger-Animationen (300ms + 100ms pro Bar, reanimated)
   - `MapWaterBody.fangIndexFactors` hinzugefügt, in `useMapData` gespeichert
   - Breakdown für ALLE Spot-Kategorien sichtbar
 - [x] **TopBar Premium** – BlurView statt solid bg, kaputtes Icon gefixt
 - [x] **Filter-Chips subtiler** – Semi-transparent, kleiner, kein Shadow
 - [x] **BottomSheet Shadow** – Tiefeneffekt nach oben

 #### Beißzeit-Modal & Favoriten (März 2026) ✅
 - [x] **Beißzeit-Modal** (`src/components/map/BiteTimeModal.tsx`)
   - Solunar-Score Hero mit farbcodierter Bewertung
   - 4 Solunar-Perioden (2x Major, 2x Minor) als Cards mit JETZT-Tag
   - Tageszeiten-Grid: Sonnenaufgang, Sonnenuntergang, Golden Hour
   - Mondphase mit Emoji + Bewertungsbalken
   - Solunar-Theorie Erklärung für Anfänger
   - Slide-up Modal mit Dark Mode Support
 - [x] **BISS Logo eingebaut**
   - TopBar Beißzeit-Badge (28x28 abgerundet)
   - Loading Screen (120x120 mit Spinner)
   - Fangindex Info-Modal Header (44x44)
 - [x] **Favoriten-System** (`src/hooks/useFavorites.ts`)
   - AsyncStorage-basiert (offline-first, kein Auth nötig)
   - Herz-Icon im BottomSheet Header (toggle mit Haptics)
   - Favoriten-Sektion im ExploreView (horizontale Scroll-Cards)
   - Supabase Schema vorbereitet (`supabase/favorites_schema.sql`)

 #### Spot-Bewertungen (März 2026) ✅
 - [x] **Supabase Schema** (`supabase/ratings_schema.sql`)
   - `ratings` Tabelle mit stars (1-5), comment, user_id, water_body_id
   - RLS: Lesen öffentlich, Schreiben nur eigene
 - [x] **useRatings Hook** (`src/hooks/useRatings.ts`)
   - AsyncStorage-basiert (offline-first)
   - submitRating, getRatingForSpot, getSummaryForSpot
 - [x] **StarRating Komponente** (`src/components/ui/StarRating.tsx`)
   - Read-only und interaktiver Modus
   - Lucide Star Icons mit Fill-Animation
 - [x] **RatingModal** (`src/components/map/RatingModal.tsx`)
   - 1-5 Sterne mit Label (Schlecht → Ausgezeichnet)
   - Optionaler Kommentar (300 Zeichen)
   - Bestehende Bewertung editierbar
 - [x] **Integration im BottomSheet**
   - Community-Bewertung Sektion mit Durchschnitt + Count
   - "Diesen Spot bewerten" CTA oder "Ändern" Button
   - Kommentar-Anzeige in Zitat-Stil

 #### Fischereischein Wallet (März 2026) ✅
 - [x] **useFishingLicense Hook** (`src/hooks/useFishingLicense.ts`)
   - AsyncStorage-basiert (offline-first)
   - saveLicense, updateLicense, removeLicense, isValid
 - [x] **ScheinScreen komplett neu** (`src/screens/ScheinScreen.tsx`)
   - Empty State mit Kamera + Galerie Upload-Buttons
   - "So funktioniert's" 3-Schritte-Anleitung
   - Wallet Card mit Schein-Foto + Gültigkeits-Badge (Grün/Rot/Grau)
   - Metadata-Anzeige: Inhaber, Scheinnummer, Behörde, Gültig bis
   - "Details hinzufügen" CTA wenn noch keine Metadaten
   - Edit-Overlay (Slide-up) für Metadaten-Bearbeitung
   - Actions: Bearbeiten, Neues Foto, Entfernen (mit Confirm-Dialog)
   - Info-Card: "Sicher gespeichert – nur lokal"
   - Dark Mode durchgehend

 #### Gamification Basis (März 2026) ✅
 - [x] **Achievement-Definitionen** (`src/constants/achievements.ts`)
   - 18 Achievements in 4 Kategorien (Angeln, Entdecken, Community, Streaks)
   - 3 Tiers: Bronze, Silber, Gold
   - Tracking Keys für automatische Fortschrittserkennung
 - [x] **useAchievements Hook** (`src/hooks/useAchievements.ts`)
   - AsyncStorage-basiert, Progress + Unlocked + Streak
   - Automatische Streak-Berechnung (täglich)
   - incrementProgress mit Auto-Unlock
   - Sync mit Favoriten, Ratings, Fischereischein
 - [x] **ProfileScreen Integration**
   - Live Stats: Badges, Streak, Favoriten (statt Mock-Daten)
   - Streak-Banner (ab 2 Tagen) mit Rekord
   - Badge-Grid nur für freigeschaltete Achievements
   - "Alle anzeigen" Button öffnet Achievement Modal
 - [x] **AchievementModal** (`src/components/profile/AchievementModal.tsx`)
   - Fullscreen Modal mit scrollbarer Liste
   - Freigeschaltete Achievements mit Datum
   - Gesperrte Achievements mit Progress Bar
   - Dark Mode Support, Safe Area Insets

 #### Map UI Solid Colors (März 2026) ✅
 - [x] **Glassmorphism → Solide Farben** (alle Map-Komponenten)
   - TopBar: `#FFFFFF` (light) / `#0A1A2F` (dark) mit Shadows
   - Zoom Controls: Gleicher solider Stil
   - Filter FAB: Links unten, solide Farben
   - Tab Bar: BlurView entfernt, solide Backgrounds
   - Icons: Dark Blue (light) / White (dark) für Konsistenz
 - [x] **Dark Mode Lesbarkeit** – Alle UI-Elemente gut sichtbar
 - [x] **Einheitliches Design-System** – 2 Farben statt Glas-Mix

 #### Leaderboard (März 2026) ✅
 - [x] **Supabase Schema** (`supabase/leaderboard_schema.sql`)
   - `leaderboard_scores` Tabelle mit Score, Catches, Achievements, Streak
   - RLS: Lesen öffentlich, Schreiben nur eigene
 - [x] **useCatchCount Hook** (`src/hooks/useCatchCount.ts`)
   - Lightweight Count-Query für ProfileScreen
 - [x] **useLeaderboard Hook** (`src/hooks/useLeaderboard.ts`)
   - Scoring-Algorithmus: Achievements (50+Tier), Fänge (20), Streak (10/Tag), Ratings (5), Favoriten (3)
   - Mock-Leaderboard mit 15 Anglern für MVP
   - Score-Breakdown Berechnung
 - [x] **LeaderboardModal** (`src/components/profile/LeaderboardModal.tsx`)
   - Fullscreen Modal mit FlatList
   - Top 3 mit Gold/Silber/Bronze Emojis
   - Eigene Position hervorgehoben (blauer Rahmen)
   - Score-Breakdown Card oben
   - Dark Mode Support
 - [x] **ProfileScreen Integration**
   - Leaderboard-Button mit Platz + Punktestand
   - Öffnet LeaderboardModal
 - [x] ~~**Fang-Tagebuch Foto-Upload**~~ – Bereits implementiert (ImagePicker + Kamera)

 #### Next Steps (aktuell geplant) 🟡
 - [ ] **Social Features** – Spot-Sharing, Freunde
 - [ ] **Online-Leaderboard** – Supabase Sync für echtes Ranking
 - [ ] **Push Notifications** – Beißzeit-Alerts

### Mapbox Styles Aktivierung ✅
- [x] 4 JSON Styles erstellt
- [x] In Mapbox Studio hochladen
- [x] URLs in .env eintragen
- [x] Testen auf Device

---

## 📋 Backlog (Neu priorisiert nach [Opas Rat](OPAS_RAT.md))

### Prio 1: Launch-Kritisch 🔴 VOR LAUNCH
> Ohne das verlieren wir gegen die Konkurrenz

| Task | Aufwand | Beschreibung | Opas Rat |
|------|---------|--------------|----------|
| ~~**Offline-Modus**~~ | ~~2-3 Tage~~ | ✅ offlineStorage.ts, useNetworkStatus, useOfflineMaps, OfflineBanner, Cache-Fallback in useMapData+CatchBook | Pain Point #4: "Conversion Feature" |
| ~~**Privacy-First Sharing**~~ | ~~2 Tage~~ | ✅ Fuzzy Locations (±2km), Spot verbergen, Community-Only Visibility, Privacy-Controls im AddCatchModal | Pain Point #2: "Kulturversprechen" |
| ~~**Personalisierte Push**~~ | ~~2-3 Tage~~ | ✅ Lokale Push: Golden Hour, Solunar Major/Minor, Tages-Zusammenfassung, NotificationSettingsModal | "App die Leute lieben" |
| ~~**Datenfrische-Anzeige**~~ | ~~4h~~ | ✅ "Zuletzt gefangen" + Fangzähler pro Spot im BottomSheet, formatTimeAgo | Pain Point #3 + Opas Rat Schicht 3 |
| ~~**Free-Tier-Kommunikation**~~ | ~~2h~~ | ✅ Banner im ProfileScreen: "Immer kostenlos bei BISS" mit Feature-Liste | Pain Point #1: "Wir vertrauen euch" |
| TestFlight Build | 4h | Erster Beta-Build für Tester |

### Prio 2: Differenzierung 🟡 FÜR LAUNCH
> Das macht uns einzigartig in Deutschland

| Task | Aufwand | Beschreibung | Opas Rat |
|------|---------|--------------|----------|
| **Vereinsangeln** | 1 Woche | Vereinsgewässer, Regeln anzeigen, Mitgliedsnr. im Wallet | Pain Point #5: "Niemand sonst" |
| Schonzeit-Erweiterung | 3 Tage | Mehr Fischarten, Mindestmaße pro Bundesland |
| ~~Social Features~~ | ~~1 Woche~~ | ✅ Community Feed, Petri Heil Reactions, CommunityScreen Tab; Freunde/Gruppen offen |

### Prio 2.5: Post-Launch Akquisition 🟡 SOMMER 2026
> Timing: Wenn deutsche Rechtsgrundlage kommt

| Task | Aufwand | Beschreibung | Opas Rat |
|------|---------|--------------|----------|
| **EU RecFishing** | 2 Wochen | 1-Klick-Pflichtmeldung aus Fangtagebuch (Wolfsbarsch, Aal, Dorsch, Lachs) | Pain Point #6: "Akquisitionskanal" – Integration VOR Sommer 2026 fertig, Launch wenn Gesetz rechtskräftig |

### Prio 3: Monetarisierung 🟡 WICHTIG
> Faire Monetarisierung – KEIN Feature-Kastrieren (Opas Rat #1)

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| 3-5 Partner-Teiche | 2 Tage | Echte Daten, Tageskarten-Provision |
| Stripe Checkout | 4h | Payment Flow |
| Affiliate Links | 2h | Weiterleitung zu Buchung |
| Mystery Spots Premium | 1 Woche | "Geheimtipp freischalten" €0.99 |

### Prio 1.5: Spot-Daten 2.0 🔴 JETZT (März 2026)
> "Jeder Spot erzählt eine Geschichte" — Unser USP. Nicht 10.000 leere Pins, sondern 500+ Spots die besser sind als alles was die Konkurrenz hat.

#### Phase 1: Daten-Fundament (1–2 Wochen)

| Task | Aufwand | Beschreibung | Status |
|------|---------|--------------|--------|
| ~~**Flüsse & Kanäle**~~ | ~~2-3 Tage~~ | ✅ OSM-Query erweitert: `waterway=river/canal`. NORDDEUTSCHLAND_BBOX, KNOWN_RIVERS (17), getFishForRiver() | ✅ |
| ~~**HH/SH Expansion**~~ | ~~1 Tag~~ | ✅ Bounding Box auf Hamburg + Schleswig-Holstein erweitert. detectRegionFast() | ✅ |
| ~~**Angelerlaubnis-Daten**~~ | ~~2-3 Tage~~ | ✅ 20 kuratierte Spots mit echten Preisen, Kauflinks, Regulations JSONB. Seed-SQL idempotent | ✅ |
| ~~**Echte Fischarten**~~ | ~~2 Tage~~ | ✅ 20 Top-Spots mit bestätigten Fischarten (fish_species_confirmed=true, source='official') | ✅ |
| **Koordinaten-Qualität** | 1 Tag | Ufer-Punkte statt Gewässermitte. Google Places Matching automatisieren. Community-Corrections. | ⬜ |

#### Phase 2: Intelligence Layer (1–2 Wochen)

| Task | Aufwand | Beschreibung | Status |
|------|---------|--------------|--------|
| ~~**DWD Open Data**~~ | ~~1 Tag~~ | ✅ weatherDWD.ts: Bright Sky API, kostenlos, kein API-Key. Primary mit OpenWeather Fallback | ✅ |
| ~~**PEGELONLINE Vorhersagen**~~ | ~~4h~~ | ✅ pegelonline.ts: 25+ Stationen NDS/HH/SH, Trend-Berechnung, Batched Enrichment in useMapData | ✅ |
| **NLWKN Niedersachsen** | 4h | Granulare Pegel-API für NDS (Binnen + Tide) | ⬜ |
| ~~**48h Fangindex-Prognose**~~ | ~~2 Tage~~ | ✅ fangindexForecast.ts: DWD + Solunar + Mondphasen → stündlicher Score. ForecastCard Premium UI | ✅ |

#### Phase 3: Above and Beyond (2–4 Wochen)

| Task | Aufwand | Beschreibung | Status |
|------|---------|--------------|--------|
| ~~**Spot-Detailseiten**~~ | ~~3 Tage~~ | ✅ Live-Bedingungen 4-Grid, Solunar-Alert, Regulations (Methoden/Tagesfang/Mindestmaße), erweiterte Permit-Sektion | ✅ |
| **Fang-Heatmap** | 2 Tage | Aggregierte, anonymisierte Fangdaten als Karten-Layer (Privacy-First, min. 5 Fänge/Zelle) | ⬜ |
| **Spot-Qualitäts-Score** | 1 Tag | Datenqualität sichtbar: Fischarten bestätigt? Koordinaten verifiziert? Erlaubnis bekannt? | ⬜ |
| **Community Spot-Corrections** | 1 Tag | User kann Pin verschieben, Fischarten bestätigen, Fotos uploaden → Spot-Scout Achievement | ⬜ |

#### Spot-Ziele

| Region | Aktuell | Ziel M2 | Ziel M4 |
|--------|---------|---------|---------|
| Niedersachsen (Seen/Teiche) | 241 + 6 kuratiert | 400+ | 500+ |
| Niedersachsen (Flüsse/Kanäle) | 8 kuratiert | 100+ | 200+ |
| Hamburg | 4 kuratiert | 80+ | 120+ |
| Schleswig-Holstein | 6 kuratiert | 150+ | 300+ |
| **Gesamt** | **241 + 24 kuratiert** | **730+** | **1.120+** |

### Prio 4: Daten & Community 🟢 NACH LAUNCH
> Wachstum durch Inhalt – basierend auf [Opas Rat: Daten-System](OPAS_RAT.md#-das-daten-system--wie-ihr-komplett-kostenlos-aktuell-bleibt)

| Task | Aufwand | Beschreibung | Opas Rat |
|------|---------|--------------|----------|
| **OSM Weekly Sync** | 4h | Cronjob für wöchentlichen Overpass-API-Sync | Schicht 2: "Wächst von selbst" |
| User-Submissions | 1 Tag | "Teich melden" Feature |
| Community-Verify | 2 Tage | Spot-Verifizierung + "Spot-Scout" Achievement | Schicht 3: "Gamification = Datenstrategie" |
| ~~**"Zuletzt gefangen" Auto-Update**~~ | ~~2h~~ | ✅ Catch-Freshness Query in useMapData, Spot-Zuordnung per water_body_name | Schicht 3: "Nutzung der App ist das Daten-Update" |
| Mehr Bundesländer | fortlaufend | Erweiterung auf ganz Deutschland |

### Prio 5: Premium Features 🔵 PHASE 2
> Nach erfolgreichem Launch

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| **Mystery Spots 🔮** | 1 Woche | Google Popular Times, Low-Traffic Prediction |
| Tiefenkarten | 1 Woche | Wo Daten verfügbar |
| Wetter-Overlay | 4h | Regen-Radar Layer |
| Social Feed | 2 Wochen | Community Features |
| AR Spot-Preview | ? | Augmented Reality am Wasser |

### ✅ Bereits erledigt

| Task | Status |
|------|--------|
| Fang-Tagebuch + Foto-Upload | ✅ 95% |
| Gamification + Leaderboard | ✅ 85% |
| Spot-Bewertungen + Ratings | ✅ 100% |
| Favoriten-System | ✅ 100% |
| Fischereischein Wallet | ✅ 80% |
| Filter-System (5 Filter) | ✅ 100% |
| Design System + Solid Colors | ✅ 95% |

### Mystery Spots - Konzept 🔮
> ABOVE AND BEYOND USP - Geheimtipps auf der Karte

**Idee:** Öffentliche Gewässer identifizieren, die wenig frequentiert sind:

1. **Google Popular Times** - Analysiere Besuchermuster
2. **Traffic-Prediction** - Machine Learning auf historische Daten
3. **Öffentliche Gewässer** - Ohne Tageskarte nutzbar
4. **Community-Verified** - User bestätigen "Hidden Gems"

**Marker:**
- Cyan/Türkis Farbe
- 🔮 Icon
- "Mystery" Badge
- Confidence Score basierend auf Datenqualität

**Monetarisierung:**
- Mystery Spots = Premium Feature
- "Geheimtipp freischalten" für €0.99

---

## 🎯 Milestones

### M1: Internal Alpha ✅
> Ziel: App läuft mit echten Daten

- [x] 200 echte Gewässer in DB (übertroffen!)
- [x] Custom Mapbox Styles aktiv
- [x] Auf eigenem Gerät testen
- **Erreicht:** Nov 2025

### M2: Closed Beta 📅
> Ziel: 10 Tester aus der Region

- [x] Technische Basis fertig
- [x] 200+ Gewässer verfügbar
- [x] Mapbox Styles aktiv
- [x] Fang-Tagebuch + Foto-Upload
- [x] Gamification + Leaderboard
- [x] Spot-Bewertungen + Favoriten
- [x] Fischereischein Wallet
- [x] Filter-System (5 Filter)
- [x] **Offline-Modus** (Opas Rat: Conversion Feature)
- [x] **Privacy-First Sharing** (Opas Rat: Kulturversprechen)
- [x] **Personalisierte Push** (Opas Rat: Emotionaler Hook)
- [x] **Datenfrische sichtbar** (Timestamps, "Zuletzt bestätigt")
- [x] **Community Filter** (Fischarten, Umkreis, Verein)
- [ ] Feedback-Formular
- [ ] TestFlight Build
- [ ] **EU RecFishing vorbereitet** (API-Integration fertig, UI ready, wartet auf Rechtsgrundlage)
- **Deadline:** +4 Wochen

### M3: Partner Launch 📅
> Ziel: Erste Monetarisierung

- [ ] 3-5 Partner-Teiche
- [ ] Stripe Live
- [ ] Free-Tier klar kommuniziert
- [ ] Vereinsangeln-Basis
- [ ] **EU RecFishing Live** (sobald Seefischereigesetz rechtskräftig, erwartet Sommer 2026)
- **Deadline:** +4 Wochen nach M2

### M4: Public Launch 📅
> Ziel: App Store Release – "Der treue Angelkumpel"

- [ ] App Store Listing
- [ ] Marketing-Website (5 Killer-Moves als USP)
- [ ] Press Kit
- [ ] **EU RecFishing als Akquisitionskanal** ("BISS macht EU-Meldung in 1 Klick")
- [ ] 500+ Gewässer
- **Deadline:** +6 Wochen nach M3 (ca. Sommer 2026)

---

## 📈 Erfolgs-Metriken

### Kurzfristig (4 Wochen – bis M2 Closed Beta)
| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Gewässer in DB | 200+ | ✅ 265+ (241 OSM + 24 kuratiert) |
| Offline-Modus fertig | 1 | ✅ 90% |
| Privacy-Sharing fertig | 1 | ✅ 80% |
| Push Notifications live | 1 | ✅ 80% (lokal) |
| Beta-Tester | 10 | 0 |
| TestFlight Build | 1 | 0 |

### Mittelfristig (8 Wochen – bis M3 Partner Launch)
| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Partner-Teiche | 3-5 | 0 |
| Aktive User | 50 | 0 |
| Tageskarten verkauft | 10 | 0 |
| Vereinsgewässer integriert | 5+ | 0 |

### Langfristig (6 Monate – nach M4 Public Launch)
| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Gewässer | 500+ | 241 |
| MAU | 1.000 | 0 |
| Umsatz/Monat | €500 | €0 |
| EU RecFishing-User | 5.000+ | 0 |

---

## ⚠️ Risiken & Blocker

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Keine Partner | Mittel | Hoch | Früh ansprechen |
| OSM Datenqualität | Hoch | Mittel | Manuell starten |
| Mapbox Kosten | Niedrig | Mittel | Free Tier reicht |
| App Store Rejection | Niedrig | Hoch | Guidelines beachten |
| **Spot-Burn durch User** | Hoch | Hoch | Privacy-First Sharing VOR Launch (Opas Rat #2) |
| **Kein Offline = Churn** | Hoch | Hoch | Offline-Cache VOR Launch (Opas Rat #4) |
| **RecFishing-API Änderung** | Mittel | Mittel | API-Abhängigkeit minimieren, Fallback |
| **Fishbrain senkt Preise** | Niedrig | Mittel | Emotion > Preis – "Angelkumpel" statt Tool |

---

## 📝 Entscheidungen Log

| Datum | Entscheidung | Grund |
|-------|-------------|-------|
| 29.11.24 | Mapbox statt Google Maps | Custom Styles möglich |
| 29.11.24 | Start mit 25 Gewässern | Qualität > Quantität |
| 29.11.24 | Kein OSM-Import für MVP | Datenqualität zu schlecht |
| 29.11.24 | Beißzeit-Radar als USP | Kein Wettbewerber hat das |
| 29.11.24 | Smart Fishing Intelligence | Above and Beyond - Predictive statt nur Display |
| 29.11.24 | Kontextbewusste Insights | Differenzierung zu Fishbrain & Co |
| 29.11.25 | MVP bei 40% belassen | Technische Basis fertig, aber keine echte Angel-App |
| 29.11.25 | Fang-Tagebuch als Prio 1 | Core Feature für echte Angler |
| 29.11.25 | Gamification vor Monetarisierung | Spaß kommt vor Geld |
| 29.11.25 | Social Features kritisch | Community macht Angel-Apps erfolgreich |
| 04.03.26 | Design System zentralisiert | COLORS als Single Source of Truth, lokale Duplikate eliminiert |
| 04.03.26 | ScoreRing → reanimated | UI-Thread Animationen statt JS-Thread für Premium Feel |
| 04.03.26 | FangindexBreakdown für alle Spots | Echte Faktor-Daten statt Hardcoded, überall sichtbar |
| 04.03.26 | Beißzeit-Modal als nächster Schritt | USP-Feature, Daten bereits vorhanden |
| 04.03.26 | Glassmorphism → Solide Farben | Cleaner Look, bessere Performance, konsistentes Design |
| 04.03.26 | Achievement Modal statt Inline-Liste | Weniger überladen, bessere UX für 18 Achievements |
| 04.03.26 | Leaderboard mit Mock-Daten für MVP | Offline-first, später Supabase Sync |
| 04.03.26 | Filter-System verifiziert | Alle 5 Filter funktionieren korrekt |
| 04.03.26 | **Opas Rat: Marktanalyse** | 6 Pain Points der Konkurrenz identifiziert, 5 Killer-Moves definiert |
| 04.03.26 | Offline-Modus → Prio 1 | War Nice-to-have, jetzt Launch-kritisch (Opas Rat #4) |
| 04.03.26 | Privacy-First Sharing → Prio 1 | Spot-Burn ist emotionales Kernproblem (Opas Rat #2) |
| 04.03.26 | Push als emotionaler Hook | Nicht "Beißzeit jetzt", sondern personalisiert + predictive (Opas Rat) |
| 04.03.26 | Faire Paywall als Strategie | Monetarisierung über Partner+Mystery, NICHT Feature-Kastrieren (Opas Rat #1) |
| 04.03.26 | EU RecFishing als Akquisitionskanal | 1-Klick-Meldung statt separate App, Launch Sommer 2026 wenn Gesetz rechtskräftig (Opas Rat #6) |
| 04.03.26 | Datenfrische-Anzeige implementiert | "Zuletzt gefangen" + Fangzähler im BottomSheet, Catch-Freshness in useMapData (Opas Rat Schicht 3) |
| 04.03.26 | Free-Tier-Kommunikation implementiert | Banner im ProfileScreen statt separater Settings-Screen (schneller, direkter sichtbar) |
| 05.03.26 | Offline-Modus implementiert | offlineStorage.ts (zentraler Cache), useNetworkStatus (NetInfo), useOfflineMaps (Mapbox Packs), OfflineBanner, Cache-Fallback in useMapData + CatchBookScreen, Offline-Catch-Queue mit Auto-Sync |
| 10.03.26 | **Bug Fix: Community Share** | `handleSave` in AddCatchModal rief `shareCatch()` nie auf — jetzt korrekt verbunden wenn `shareToFeed=true` |
| 10.03.26 | **Navigation: 5→4 Tabs** | ScheinStack entfernt, Schein als Modal unter Profil-Menü. ScheinScreen akzeptiert optionale `onClose` Prop |
| 10.03.26 | **Community Filter** | Fischarten (Chip-Grid), Umkreis (5-100km, Haversine), Verein (Mock-Clubs). Filter-Button oben rechts, Active Chips inline, CommunityFilterModal |
| 10.03.26 | **Vereinsangeln gestartet** | Als Filter/Sektion im Community-Feed integriert (nicht eigener Tab). 5 Mock-Clubs, UI fertig, Backend offen |
| 10.03.26 | **Dark Mode implementiert** | ThemeContext + AppearanceSettingsModal + Persistenz via AsyncStorage. Alle Screens + Navigation aktualisiert |
| 10.03.26 | **Spot-Daten 2.0 gestartet** | Analyse: 241 Spots nur Seen/Teiche, keine Flüsse, geschätzte Fischarten, keine Permit-Daten. Neue Prio 1.5 mit 3 Phasen |
| 10.03.26 | **Flüsse als Prio** | 60%+ der Angler angeln am Fluss — Elbe, Aller, Weser, Seeve etc. fehlen komplett. OSM-Query erweitern |
| 10.03.26 | **DWD statt OpenWeather** | Kostenlos, kein API-Key, 2000+ Messstationen vs ~200. Präziser für DE |
| 10.03.26 | **HH/SH Expansion** | Hamburg ist Heimatmarkt, SH hat 300+ Angelgewässer. Bounding Box erweitern |
| 10.03.26 | **48h Fangindex-Prognose** | Killer-Feature: DWD Forecast + Solunar + Mondphasen → stündlicher Score. Keine andere DE Angel-App hat das |
| 10.03.26 | **20 kuratierte Top-Spots** | Seed-SQL mit echten Permit-Preisen, Regulations, Fischarten für NDS/HH/SH. Sofortiger Mehrwert |
| 10.03.26 | **Live-Bedingungen im Detail** | 4-Grid (Wetter/Pegel/Mond/Tageszeit) + Solunar-Alert + Regulations (Mindestmaße, Methoden, Tagesfang) |
| 10.03.26 | **Angelerlaubnis = #1 Pain Point** | "Wo darf ich angeln?" beantwortet keine App gut. Tageskarten-Daten als Killer-Feature |
