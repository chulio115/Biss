# 🗺️ BISS - Roadmap & Milestones

> Wo wir stehen und wo wir hin wollen

---

## 📊 Status Overview

```
████████████████████░░░░░░░░ 65% MVP Complete
```

| Phase | Status | Beschreibung |
|-------|--------|--------------|
| Foundation | ✅ 100% | Auth, Services, APIs |
| Navigation | ✅ 100% | 5 Tabs, Screens |
| Map Core | ✅ 100% | Mapbox, Styles, Markers |
| USP Features | ✅ 100% | Beißzeit, Schonzeit |
| Daten | 🟡 10% | Noch Mock-Daten |
| Monetarisierung | 🔴 0% | Stripe vorbereitet |
| Polish | 🟡 30% | Animations fertig |

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

### Mapbox Styles Aktivierung
- [x] 4 JSON Styles erstellt
- [ ] In Mapbox Studio hochladen
- [ ] URLs in .env eintragen
- [ ] Testen auf Device

---

## 📋 Backlog (Priorisiert)

### Prio 1: MVP-Kern 🔴 KRITISCH
> Ohne das kein Launch möglich

| Task | Aufwand | Beschreibung |
|------|---------|--------------|
| Echte Gewässer-Daten | 2-3 Tage | 25-50 Teiche manuell recherchieren |
| Tageskarten-Kontakte | 1 Tag | Links/Telefon pro Gewässer |
| Mapbox Styles live | 1h | URLs eintragen |
| Supabase Seeding | 2h | Daten in DB laden |

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
| Tiefenkarten | 1 Woche | Wo Daten verfügbar |
| Wetter-Overlay | 4h | Regen-Radar Layer |
| Fangfotos | 1 Woche | Upload + Score |
| Social Feed | 2 Wochen | Community Features |

---

## 🎯 Milestones

### M1: Internal Alpha ⏳
> Ziel: App läuft mit echten Daten

- [ ] 25 echte Gewässer in DB
- [ ] Custom Mapbox Styles aktiv
- [ ] Auf eigenem Gerät testen
- **Deadline:** +1 Woche

### M2: Closed Beta 📅
> Ziel: 10 Tester aus der Region

- [ ] 50 Gewässer
- [ ] Fischereischein-Upload
- [ ] Feedback-Formular
- [ ] TestFlight Build
- **Deadline:** +3 Wochen

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
