# 🗺️ BISS - Roadmap & Milestones

> Wo wir stehen und wo wir hin wollen

---

## 📊 Status Overview

```
████████████████████████████████████ 95% MVP Complete
```

| Phase | Status | Beschreibung |
|-------|--------|--------------|
| Foundation | ✅ 100% | Auth, Services, APIs |
| Navigation | ✅ 100% | 5 Tabs, Screens |
| Map Core | ✅ 100% | Mapbox, Styles, Markers |
| USP Features | ✅ 100% | Beißzeit, Schonzeit, KI-Fangindex |
| Smart Intelligence | ✅ 100% | Kontextbewusste Empfehlungen |
| Daten | ✅ 100% | 200+ echte OSM-Gewässer + Google Places |
| Categories | ✅ 100% | 4 Spot-Kategorien + Filter |
| UI/UX Rework | ✅ 100% | Above and Beyond Design |
| Bottom Sheet | ✅ 100% | Details + Auto-Open |
| Location Fixes | 🟡 80% | Bekannte Spots korrigiert, Auto-Enrichment läuft |
| Fischereischein | 🔴 0% | UI vorbereitet |
| Monetarisierung | 🔴 0% | Stripe vorbereitet |
| Polish | ✅ 80% | Above and Beyond! |

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

### Mapbox Styles Aktivierung ✅
- [x] 4 JSON Styles erstellt
- [x] In Mapbox Studio hochladen
- [x] URLs in .env eintragen
- [x] Testen auf Device

---

## 📋 Backlog (Priorisiert)

### Prio 1: MVP-Kern 🔴 KRITISCH
> Ohne das kein Launch möglich

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| Fischereischein-Upload | 4h | OCR + Wallet UI |
| 3-5 Partner-Teiche | 2 Tage | Echte Daten statt Mock |
| Stripe Live | 4h | Payment Flow aktivieren |
| Supabase Seeding | 1h | Daten in Prod-DB |
| Location Fixes | 2h | Bekannte Spots korrigieren (Nice-to-have) |

### Prio 2: Fischereischein 🟡 WICHTIG
> Core Feature für Zielgruppe

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| Image Picker | 2h | Expo Image Picker |
| Supabase Storage | 2h | Bilder hochladen |
| OCR Integration | 4h | xAI für Schein-Erkennung |
| Schein-Wallet UI | 4h | Anzeige + Gültigkeit |

### Prio 3: Monetarisierung 🟡 WICHTIG
> Wie verdienen wir Geld?

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| Stripe Checkout | 4h | Payment Flow |
| Partner-Onboarding | - | 3-5 Teichbetreiber kontaktieren |
| Affiliate Links | 2h | Weiterleitung zu Buchung |
| Provision Tracking | 4h | Wer hat gekauft? |

### Prio 4: User Experience 🟢 NICE-TO-HAVE
> Macht die App besser

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| Offline-Cache | 4h | Letzte Karte speichern |
| Favoriten | 2h | Gewässer merken |
| Push Notifications | 4h | Beißzeit-Alerts |
| QR-Vorzeige | 2h | Offline-Code generieren |

### Prio 5: Daten-Erweiterung 🟢 SPÄTER
> Mehr Inhalt

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| User-Submissions | 1 Tag | "Teich melden" |
| Community-Verify | 2 Tage | Voting-System |
| OSM Import | 1 Tag | Kritisch prüfen! |
| Pegel Live | 4h | API Integration |

### Prio 6: Premium Features 🔵 PHASE 2
> Nach erfolgreichem Launch

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| **Mystery Spots 🔮** | 1 Woche | Google Popular Times, Low-Traffic Prediction |
| Tiefenkarten | 1 Woche | Wo Daten verfügbar |
| Wetter-Overlay | 4h | Regen-Radar Layer |
| Fangfotos | 1 Woche | Upload + Score |
| Social Feed | 2 Wochen | Community Features |

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

- [x] 200+ echte Gewässer (haben viel mehr!)
- [x] Mapbox Styles aktiv (haben 4!)
- [ ] Fischereischein-Upload
- [ ] 3-5 Partner-Teiche kontaktieren
- [ ] Feedback-Formular
- [ ] TestFlight Build
- **Deadline:** +2 Wochen

### M3: Partner Launch 📅
> Ziel: Erste Monetarisierung

- [ ] 3-5 Partner-Teiche
- [ ] Stripe Live
- [ ] 100 Gewässer
- **Deadline:** +6 Wochen

### M4: Public Launch 📅
> Ziel: App Store Release

- [ ] App Store Listing
- [ ] Marketing-Website
- [ ] Press Kit
- [ ] 500+ Gewässer
- **Deadline:** +10 Wochen

---

## 📈 Erfolgs-Metriken

### Kurzfristig (2 Wochen)
| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Gewässer in DB | 25 | 0 |
| Partner-Gespräche | 5 | 0 |
| Beta-Tester | 10 | 0 |

### Mittelfristig (6 Wochen)
| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Gewässer | 100 | 0 |
| Aktive User | 50 | 0 |
| Tageskarten verkauft | 10 | 0 |

### Langfristig (6 Monate)
| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Gewässer | 500+ | 0 |
| MAU | 1.000 | 0 |
| Umsatz/Monat | €500 | €0 |

---

## ⚠️ Risiken & Blocker

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Keine Partner | Mittel | Hoch | Früh ansprechen |
| OSM Datenqualität | Hoch | Mittel | Manuell starten |
| Mapbox Kosten | Niedrig | Mittel | Free Tier reicht |
| App Store Rejection | Niedrig | Hoch | Guidelines beachten |

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
| 29.11.25 | MVP bei 95% belassen | Location Fixes nice-to-have, nicht kritisch |
| 29.11.25 | Fischereischein als Prio 1 | Core Feature für Zielgruppe |
| 29.11.25 | 200+ OSM Gewässer reichen für Beta | Qualität durch Google Places gesteigert |
