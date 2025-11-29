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
████████████████████░░░░░░░░ 65% MVP Complete
```

| Bereich | Status | Details |
|---------|--------|---------|
| Foundation | ✅ 100% | Auth, APIs, Services |
| Navigation | ✅ 100% | 5 Tabs, Screens |
| Map Core | ✅ 100% | Mapbox, 3 Styles |
| USP Features | ✅ 100% | Beißzeit, Schonzeit |
| Daten | 🟡 10% | Noch Mock-Daten |
| Monetarisierung | 🔴 0% | Stripe vorbereitet |

👉 **Vollständige Roadmap:** [docs/ROADMAP.md](docs/ROADMAP.md)

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
| **KI** | xAI/Grok |
| **APIs** | OpenWeather, PEGELONLINE |

👉 **Architektur-Details:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📚 Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [**SETUP.md**](docs/SETUP.md) | Installation & Einrichtung |
| [**COMMANDS.md**](docs/COMMANDS.md) | Alle Befehle |
| [**ROADMAP.md**](docs/ROADMAP.md) | Status & Milestones |
| [**IDEAS.md**](docs/IDEAS.md) | Feature-Ideen |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Tech-Übersicht |

### Feature-Specs
| Dokument | Beschreibung |
|----------|--------------|
| [FEATURE_MAP_SPEC.md](docs/FEATURE_MAP_SPEC.md) | Map Implementation |
| [FEATURE_TOP3_TEICHE.md](docs/FEATURE_TOP3_TEICHE.md) | Top 3 Feature |
| [mapstyles/README.md](assets/mapstyles/README.md) | Mapbox Styles |

---

## 📁 Projektstruktur

```
biss-app/
├── src/
│   ├── screens/          # MapScreen, SearchScreen, ...
│   ├── components/map/   # ActivityRing, PulseMarker, ...
│   ├── services/         # supabase, xai, weather
│   └── navigation/       # TabNavigator
├── assets/mapstyles/     # 4 Custom Mapbox Styles
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
