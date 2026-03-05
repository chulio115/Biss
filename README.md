# 🎣 BISS - Die schönste Angelkarte Europas

> *„Das ist jetzt die mit Abstand schönste und spezifischste Angelkarte Europas – Punkt."*

Angel-App für den deutschen Markt mit KI-gestütztem Fangindex, Premium-Kartenstyles und einzigartigen Features wie Beißzeit-Radar und Schonzeit-Anzeige.

---

## 🚀 Quick Start

```bash
# Clone & Install
git clone https://github.com/chulio115/Easy-living-frontend.git biss-app
cd biss-app && npm install

# Setup
cp .env.example .env  # Keys eintragen!

# iOS Build & Run
npx expo prebuild --platform ios --clean
npx expo start --dev-client
```

👉 **Ausführliche Anleitung:** [docs/SETUP.md](docs/SETUP.md)

---

## 📊 Projekt-Status

```
████████████████████████████░░ 85% MVP Complete
```

| Bereich | Status | Details |
|---------|--------|--------|
| Foundation | ✅ 100% | Auth, Services, APIs |
| Navigation | ✅ 100% | 5 Tabs, Screens |
| Map Core | ✅ 85% | Mapbox, Clustering, Score-Marker, Zoom-basiert |
| USP Features | ✅ 75% | Beißzeit-Modal, Schonzeit, Solunar, Favoriten |
| Daten | ✅ 80% | 200+ OSM-Gewässer + Google Places |
| UI/UX | ✅ 90% | Design System, ScoreRing, Fangindex-Breakdown, Logo |
| Fang-Tagebuch | ✅ 95% | DB + Screen + Foto-Upload + **Offline-Queue** |
| Gamification | ✅ 85% | 18 Achievements, Streaks, Leaderboard |
| **Offline-Modus** | ✅ 90% | Cache-Service, Offline-Fänge+Sync, Mapbox Packs |
| Fischereischein | ✅ 80% | Wallet UI, Image Picker, Metadaten |
| Social Features | 🔴 0% | Spot-Sharing, Freunde, Gruppen |
| Monetarisierung | 🔴 0% | Stripe vorbereitet |

👉 **Vollständige Roadmap:** [docs/ROADMAP.md](docs/ROADMAP.md)  |  **Feature-Übersicht:** [docs/FEATURES.md](docs/FEATURES.md)

---

## 🎉 MVP ACHIEVEMENT - Was wir haben:

### ✅ **Technische Basis (100% fertig):**
- 🗺️ **Mapbox Karte** mit 4 Styles + Auto-Nachtmodus
- 🎣 **200+ Gewässer** aus OSM + Google Places
- 🏷️ **4 Spot-Kategorien** + Filter-UI
- 🧠 **Basis-KI** für Fangindex
- 🌅 **Beißzeit-Radar** (technisch)
- 🐟 **Schonzeit-System** (7 Fische)
- 📱 **Bottom Sheet** + Auto-Open

### 🟡 **Noch für MVP (kritisch):**
- 🎣 **Echte Angel-Features**: Fang-Tagebuch, Spot-Bewertungen
- 🏆 **Gamification**: Achievements, Streaks, Leaderboards  
- 👥 **Social Features**: Spot-Sharing, Freunde, Gruppen
- 📸 **Fischereischein-Upload** mit OCR
- 💰 **3-5 Partner-Teiche** kontaktieren
- 💳 **Stripe Payment** Flow

### 🟢 **Above and Beyond (später):**
- 📍 Perfekte GPS-Koordinaten
- 🔮 Mystery Spots (Google Popular Times)
- 📊 Live-Pegel Daten
- 🎯 AR-Angeln Features
- 📈 Community-Voting für Spots
- 🎪 Tiefenkarten & Catch-Maps

**Ergebnis: Wir haben eine TECHNISCHE BASIS mit echten Daten, aber noch keine echte Angel-App!**

*(Die wahren Innovationen kommen noch - wir brauchen deine Master-Ideas!)* 🚀

---

## 🎯 Was macht BISS einzigartig?

| Feature | Konkurrenz | BISS |
|---------|:----------:|:----:|
| **Beißzeit-Radar** | ❌ | ✅ Einzigartig |
| **Schonzeit-Anzeige** | ❌ | ✅ Einzigartig |
| **3 Premium Map Styles** | ❌ | ✅ Angel-Fokus |
| **KI-Fangindex** | ❌ | ✅ |
| **Auto-Nachtmodus** | ❌ | ✅ ab 18:30 |

---

## 🛠️ Tech Stack

| Bereich | Technologie |
|---------|-------------|
| **App** | React Native + Expo + TypeScript |
| **Maps** | Mapbox GL Native |
| **Backend** | Supabase (Auth, DB) |
| **KI** | Lokal (Fangindex-Algorithmus) |
| **APIs** | OpenWeather, PEGELONLINE |

👉 **Architektur-Details:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

##  Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [**SETUP.md**](docs/SETUP.md) | Installation & Einrichtung |
| [**COMMANDS.md**](docs/COMMANDS.md) | Alle Befehle |
| [**ROADMAP.md**](docs/ROADMAP.md) | Status & Milestones |
| [**FEATURES.md**](docs/FEATURES.md) | Alle implementierten Features + Architektur |
| [**OPAS_RAT.md**](docs/OPAS_RAT.md) | Marktanalyse & strategische Leitlinien ("Opas Rat") |
| [**IDEAS.md**](docs/IDEAS.md) | Feature-Ideen |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Tech-Übersicht |

### Archiv (historische Planungsdokumente)

Ältere Specs und Planungsdokumente sind in [`docs/archive/`](docs/archive/) verfügbar.

---

## 📁 Projektstruktur

```
biss-app/
├── src/
│   ├── screens/          # MapScreen, CatchBookScreen, ProfileScreen, ...
│   ├── components/       # map/, ui/, profile/
│   ├── hooks/            # useMapData, useNetworkStatus, useOfflineMaps, ...
│   ├── services/         # supabase, weather, offlineStorage
│   ├── utils/            # fangindex, fishing
│   ├── constants/        # colors, fishing, achievements
│   ├── types/            # map.ts, index.ts
│   └── navigation/       # TabNavigator
├── docs/                 # 📚 Dokumentation
└── supabase/             # DB Schema
```

---

## � Links

| Resource | Link |
|----------|------|
| Frontend Repo | [github.com/chulio115/Easy-living-frontend](https://github.com/chulio115/Easy-living-frontend) |
| Backend Repo | [github.com/chulio115/Easy-living-backend](https://github.com/chulio115/Easy-living-backend) |
| Server | `SSH root@64.226.99.73` |
| Supabase | [app.supabase.com](https://app.supabase.com) |
| Mapbox Studio | [studio.mapbox.com](https://studio.mapbox.com) |

---

## 📜 Lizenz

Privat - Alle Rechte vorbehalten © 2025
