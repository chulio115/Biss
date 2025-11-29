# 🎣 BISS - Die schönste Angelkarte Europas

> *„Das ist jetzt die mit Abstand schönste und spezifischste Angelkarte Europas – Punkt."*

Angel-App für den deutschen Markt mit KI-gestütztem Fangindex, Premium-Kartenstyles und einzigartigen Features wie Beißzeit-Radar und Schonzeit-Anzeige.

---

## 🎯 Vision & USPs

### Was macht BISS einzigartig?

| Feature | Fishbrain | Anglermap | Hejfish | **BISS** |
|---------|:---------:|:---------:|:-------:|:--------:|
| Beißzeit-Radar | ❌ | ❌ | ❌ | ✅ **Einzigartig** |
| Schonzeit-Anzeige | ❌ | ❌ | ❌ | ✅ **Einzigartig** |
| Custom Map Styles | ❌ | ❌ | ❌ | ✅ **3 Premium Styles** |
| Fangindex (KI) | ❌ | ❌ | ❌ | ✅ |
| Auto-Nachtmodus | ❌ | ❌ | ❌ | ✅ ab 18:30 |
| Lokaler Fokus DE | ⚠️ Global | ✅ | ⚠️ AT | ✅ NDS/HH/SH |

---

## 🛠️ Tech Stack

| Bereich | Technologie | Status |
|---------|-------------|--------|
| **Frontend** | React Native + Expo + TypeScript | ✅ |
| **Navigation** | React Navigation (Bottom Tabs) | ✅ |
| **Maps** | Mapbox GL Native (`@rnmapbox/maps`) | ✅ |
| **Backend** | Supabase (Auth, DB, Storage) | ✅ |
| **KI** | xAI/Grok API (Fangindex) | ✅ |
| **Wetter** | OpenWeather API | ✅ |
| **Pegel** | PEGELONLINE API | ✅ |
| **Payments** | Stripe (vorbereitet) | ⏳ |
| **Places** | Google Places API (optional) | ⏳ |

---

## ✅ Implementierte Features

### Phase 1: Foundation ✅
- [x] Expo Projekt mit TypeScript
- [x] Supabase Auth Integration
- [x] xAI Service für Fangindex-Berechnung
- [x] OpenWeather Integration
- [x] PEGELONLINE Integration
- [x] Login/Register Screens
- [x] Home Screen mit Fangindex

### Phase 2: Navigation & Screens ✅
- [x] Bottom Tab Navigation (5 Tabs)
- [x] MapScreen (Hauptkarte)
- [x] ScheinScreen (Placeholder)
- [x] BuyScreen (Placeholder)
- [x] ProfileScreen (Placeholder)
- [x] SearchScreen (Modal mit Suche)

### Phase 3: Ultimate Map ✅
- [x] Native Mapbox Integration
- [x] 3 Custom Map Styles (Standard, Angel-Fokus, Night)
- [x] Auto-Nachtmodus ab 18:30
- [x] Style-Switcher mit Icons
- [x] Geolocation mit Lüneburg-Fallback
- [x] Floating Search Button
- [x] Top 3 Cards Overlay
- [x] Bottom Sheet für Spot-Details
- [x] Marker mit Fangindex-Farben

### Phase 4: USP Features ✅
- [x] **Beißzeit-Radar** (Sunrise/Sunset, Golden Hour)
- [x] **Schonzeit-System** (7 Fischarten mit Saison-Status)
- [x] **Fish Season Badges** (🔥 Best, ✓ Open, 🚫 Closed)
- [x] **Schonzeit-Warning** im Bottom Sheet

### Phase 5: Premium Components ✅
- [x] ActivityRing (Apple Watch Style für Fangindex)
- [x] PulseMarker (Animierte Marker für Hot Spots 80+)
- [x] FishChip (Fish Icons mit Confidence Badge)
- [x] PulsingBuyButton (Animierter Kauf-Button)

### Mapbox Styles ✅
- [x] 4 JSON-Styles erstellt (`/assets/mapstyles/`)
- [x] biss-standard.json
- [x] biss-angel-fokus.json
- [x] biss-angel-night.json
- [x] biss-teich-fokus.json
- [ ] **TODO:** Styles in Mapbox Studio hochladen & URLs eintragen

---

## 🚧 Offene Features (Roadmap)

### Prio 1: MVP-Kern (Nächste 2 Wochen)
- [ ] Echte Gewässer-Daten (25-50 Teiche manuell)
- [ ] Tageskarten-Links/Kontakte pro Gewässer
- [ ] Custom Mapbox Styles aktivieren (URLs eintragen)
- [ ] Fischereischein-Upload mit OCR
- [ ] Supabase Storage für Bilder

### Prio 2: Monetarisierung
- [ ] Stripe Integration für Tageskarten
- [ ] Ein-Tap-Kauf Flow
- [ ] Partner-Akquise (3-5 Teichbetreiber)

### Prio 3: User Experience
- [ ] Offline-Cache für Karte
- [ ] Favoriten-System (Herz-Icon)
- [ ] Push-Benachrichtigungen (Schonzeit-Ende, Beißzeit)
- [ ] QR-Code für Kontroll-Vorzeige

### Prio 4: Daten-Erweiterung
- [ ] OSM-Import (kritisch prüfen)
- [ ] User-Submissions ("Teich melden")
- [ ] Community-Verifizierung
- [ ] Pegel-Integration (Live-Daten)

### Prio 5: Premium Features (Phase 2)
- [ ] Tiefenkarten (wo verfügbar)
- [ ] Wetter-Overlay auf Karte
- [ ] Fangfotos mit Score-Overlay
- [ ] Social Feed (Fangmeldungen)

---

## 📁 Projektstruktur

```
biss-app/
├── App.tsx                    # Main Entry + Navigation
├── src/
│   ├── screens/
│   │   ├── MapScreen.tsx      # 🗺️ Hauptkarte (900+ Zeilen)
│   │   ├── SearchScreen.tsx   # 🔍 Suche Modal
│   │   ├── ScheinScreen.tsx   # 📄 Fischereischein
│   │   ├── BuyScreen.tsx      # 🛒 Tageskarten kaufen
│   │   └── ProfileScreen.tsx  # 👤 Profil
│   │
│   ├── components/
│   │   └── map/
│   │       ├── ActivityRing.tsx    # Apple Watch Ring
│   │       ├── PulseMarker.tsx     # Animierter Marker
│   │       ├── FishChip.tsx        # Fish Badge
│   │       ├── PulsingBuyButton.tsx# Kauf-Button
│   │       └── index.ts
│   │
│   ├── navigation/
│   │   ├── TabNavigator.tsx   # Bottom Tabs
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── supabase.ts        # Auth + DB
│   │   ├── xai.ts             # Fangindex KI
│   │   ├── weather.ts         # OpenWeather
│   │   └── googlePlaces.ts    # Places API
│   │
│   └── hooks/
│       └── useAuth.ts
│
├── assets/
│   └── mapstyles/             # 🗺️ Mapbox JSON Styles
│       ├── biss-standard.json
│       ├── biss-angel-fokus.json
│       ├── biss-angel-night.json
│       ├── biss-teich-fokus.json
│       └── README.md
│
├── docs/
│   ├── FEATURE_MAP_SPEC.md
│   ├── FEATURE_TOP3_TEICHE.md
│   └── FEATURE_TOP3_SPEC_FINAL.md
│
├── supabase/
│   └── schema.sql
│
├── .env.example               # Template für API Keys
└── app.json                   # Expo Config
```

---

## 🚀 Setup & Development

### 1. Dependencies installieren
```bash
cd biss-app
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```

Benötigte Keys:
```env
# Pflicht
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxx
EXPO_PUBLIC_OPENWEATHER_API_KEY=xxx

# Optional
EXPO_PUBLIC_MAPBOX_STYLE_STANDARD=mapbox://styles/USER/xxx
EXPO_PUBLIC_MAPBOX_STYLE_FOKUS=mapbox://styles/USER/xxx
EXPO_PUBLIC_MAPBOX_STYLE_NIGHT=mapbox://styles/USER/xxx
EXPO_PUBLIC_GOOGLE_PLACES_KEY=xxx
```

### 3. iOS Build (Native Mapbox)
```bash
# Prebuild für native Module
npx expo prebuild --platform ios --clean

# Xcode Build
xcodebuild -workspace ios/BISS.xcworkspace -scheme BISS -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 16 Pro' build

# App starten
npx expo start --dev-client
```

### 4. Simulator starten
```bash
# iOS
xcrun simctl boot "iPhone 16 Pro"
open -a Simulator
```

---

## 🎨 Map Styles aktivieren

1. **Mapbox Studio öffnen:** https://studio.mapbox.com/
2. **"New style" → "Upload"**
3. **JSON hochladen** aus `/assets/mapstyles/`
4. **Style URL kopieren** (Format: `mapbox://styles/USERNAME/STYLE_ID`)
5. **In `.env` eintragen:**
```env
EXPO_PUBLIC_MAPBOX_STYLE_STANDARD=mapbox://styles/xxx/standard
EXPO_PUBLIC_MAPBOX_STYLE_FOKUS=mapbox://styles/xxx/fokus
EXPO_PUBLIC_MAPBOX_STYLE_NIGHT=mapbox://styles/xxx/night
```

---

## 📊 Metriken & Ziele

### Kurzfristig (2 Wochen)
- [ ] 25 echte Gewässer mit Kontaktdaten
- [ ] 5 Partner-Teichbetreiber
- [ ] 10 Beta-Tester aus der Region

### Mittelfristig (6 Wochen)
- [ ] 100 Gewässer in NDS/HH
- [ ] 50 aktive User
- [ ] Erste Tageskarten-Verkäufe

### Langfristig
- [ ] Marktführer in Niedersachsen
- [ ] Expansion nach SH, HH, Bremen
- [ ] 1.000+ aktive User

---

## 🐛 Bekannte Issues

1. **Geolocation Fallback:** Bei fehlender Permission → Lüneburg-Coords
2. **Mapbox Build:** Benötigt `expo-dev-client`, kein Expo Go
3. **SVG in React Native:** Braucht `react-native-svg`

---

## 📝 Wichtige Commands

```bash
# Development
npx expo start --dev-client

# iOS Rebuild
npx expo prebuild --platform ios --clean
xcodebuild -workspace ios/BISS.xcworkspace -scheme BISS ...

# Type Check
npx tsc --noEmit

# Git
git add . && git commit -m "feat: ..."
git push origin main
```

---

## 📚 Dokumentation

- `/docs/FEATURE_MAP_SPEC.md` - Map Implementation Details
- `/docs/FEATURE_TOP3_TEICHE.md` - Top 3 Feature Spec
- `/assets/mapstyles/README.md` - Mapbox Style Guide

---

## 👤 Kontakt & Repos

- **Frontend:** https://github.com/chulio115/Easy-living-frontend.git
- **Backend:** https://github.com/chulio115/Easy-living-backend.git
- **Server:** SSH root@64.226.99.73

---

## 📜 Lizenz

Privat - Alle Rechte vorbehalten © 2025
