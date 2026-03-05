# 🏗️ BISS - Architektur & Tech Stack

> Technische Übersicht für Entwickler

---

## 📊 System-Architektur

```
┌──────────────────────────────────────────────────────────────────┐
│                        BISS App (iOS)                             │
│                                                                   │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────┐    │
│  │ MapScreen  │ │CatchBook   │ │ScheinScr.│ │ProfileScreen│    │
│  └──────┬─────┘ └──────┬─────┘ └────┬─────┘ └──────┬──────┘    │
│         │              │            │              │             │
│  ┌──────┴──────────────┴────────────┴──────────────┴──────┐     │
│  │                    Hooks Layer                          │     │
│  │  useMapData · useNetworkStatus · useOfflineMaps         │     │
│  │  useFavorites · useRatings · useAchievements            │     │
│  └──────┬──────────────┬────────────┬──────────────┬──────┘     │
│         │              │            │              │             │
│  ┌──────┴──────────────┴────────────┴──────────────┴──────┐     │
│  │                   Services Layer                        │     │
│  │  Supabase · Weather · Pegel · offlineStorage            │     │
│  └──────┬──────────────┬────────────┬──────────────┬──────┘     │
│         │              │            │              │             │
│  ┌──────┴──────────────┴────────────┴──────────────┴──────┐     │
│  │                  Offline Layer                          │     │
│  │  AsyncStorage Cache · Offline Queue · Mapbox Packs      │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐   ┌───────────┐   ┌───────────┐
        │Supabase │   │OpenWeather│   │PEGELONLINE│
        │ (DB+Auth)│   │  (API)    │   │  (API)    │
        └─────────┘   └───────────┘   └───────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technologie | Version | Zweck |
|-------------|---------|-------|
| React Native | 0.81+ | Cross-Platform Framework |
| Expo | 54+ | Build & Development (Dev Client) |
| TypeScript | 5.9+ | Type Safety (`strict: true`) |
| React Navigation | 7+ | Navigation & Tabs (5 Tabs) |
| Mapbox GL | 10+ | Native Maps + Offline Packs |

### Backend & Services

| Dienst | Tier | Zweck |
|--------|------|-------|
| Supabase | Free | Auth, DB (water_bodies, catches, ratings, favorites) |
| OpenWeather | Free | Wetter-Daten für Fangindex |
| PEGELONLINE | Free | Pegel-Daten für Fangindex |
| Mapbox | Free | Karten, Custom Styles, Offline Tiles |

### UI Libraries

| Library | Zweck |
|---------|-------|
| @gorhom/bottom-sheet | Bottom Sheet (Spot-Details) |
| lucide-react-native | Icons |
| expo-blur | Glassmorphism Effects |
| expo-linear-gradient | Gradients |
| react-native-svg | SVG Support (ScoreRing) |
| @react-native-community/netinfo | Netzwerk-Erkennung (Offline-Modus) |

---

## 📁 Ordnerstruktur

```
biss-app/
├── App.tsx                         # Entry Point + Navigation Setup
│
├── src/
│   ├── screens/                    # Screen Components
│   │   ├── MapScreen.tsx           # Hauptkarte (~350 LOC, Orchestrator)
│   │   ├── CatchBookScreen.tsx     # Fang-Tagebuch + Offline-Queue
│   │   ├── ScheinScreen.tsx        # Fischereischein Wallet
│   │   ├── BuyScreen.tsx           # Tageskarten
│   │   ├── ProfileScreen.tsx       # Profil + Achievements + Leaderboard
│   │   ├── HomeScreen.tsx          # Home
│   │   └── SearchScreen.tsx        # Such-Modal
│   │
│   ├── components/
│   │   ├── map/                    # Map-Components
│   │   │   ├── MapTopBar.tsx       # Location, Suche, Beißzeit, Night-Toggle
│   │   │   ├── MapBottomSheet.tsx  # Spot-Details + Explore-View
│   │   │   ├── MapFilterSheet.tsx  # FAB + 5-Filter Bottom Sheet
│   │   │   ├── MapZoomControls.tsx # Zoom +/-
│   │   │   ├── BiteTimeModal.tsx   # Beißzeit-Modal
│   │   │   └── RatingModal.tsx     # Bewertungs-Modal
│   │   ├── ui/                     # Shared UI Components
│   │   │   ├── OfflineBanner.tsx   # Offline-/Cache-Indikator
│   │   │   ├── ScoreRing.tsx       # Fangindex-Ring
│   │   │   ├── StarRating.tsx      # Sterne-Bewertung
│   │   │   └── FangindexBar.tsx    # Score-Bar
│   │   └── profile/                # Profil-Components
│   │       ├── LeaderboardModal.tsx
│   │       └── AchievementModal.tsx
│   │
│   ├── hooks/                      # Custom Hooks
│   │   ├── useMapData.ts           # Map-Daten + Offline-Cache-Fallback
│   │   ├── useNetworkStatus.ts     # Netzwerk-Erkennung + Reconnect
│   │   ├── useOfflineMaps.ts       # Mapbox Offline-Packs
│   │   ├── useAuth.ts              # Auth State
│   │   ├── useFavorites.ts         # Favoriten (AsyncStorage)
│   │   ├── useRatings.ts           # Bewertungen (AsyncStorage)
│   │   ├── useAchievements.ts      # 18 Achievements + Streak
│   │   ├── useLeaderboard.ts       # Scoring + Mock-Rangliste
│   │   ├── useFishingLicense.ts    # Schein-Wallet (AsyncStorage)
│   │   ├── useCatchCount.ts        # Fang-Zähler
│   │   └── useNearbySpots.ts       # Nearby-Spots Query
│   │
│   ├── services/                   # API Clients
│   │   ├── supabase.ts             # Auth + DB Client
│   │   ├── weather.ts              # OpenWeather API
│   │   ├── pegel.ts                # PEGELONLINE API
│   │   ├── offlineStorage.ts       # AsyncStorage Cache + Offline Queue
│   │   ├── googlePlaces.ts         # Places API
│   │   └── xai.ts                  # Legacy (nicht mehr für Fangindex)
│   │
│   ├── utils/                      # Helper Functions
│   │   ├── fangindex.ts            # Lokale Fangindex-Berechnung (5 Faktoren)
│   │   └── fishing.ts              # SunTimes, GoldenHour, Seasons, Categories
│   │
│   ├── constants/                  # Konfiguration
│   │   ├── colors.ts               # COLORS Design Tokens + getScoreColor
│   │   ├── fishing.ts              # FISH_SEASONS, SPOT_CATEGORIES, Filters
│   │   └── achievements.ts         # 18 Achievement-Definitionen
│   │
│   ├── types/                      # TypeScript Types
│   │   ├── index.ts                # Catch, OCRResult, etc.
│   │   └── map.ts                  # MapWaterBody Interface
│   │
│   ├── config/                     # App-Konfiguration
│   │   └── map.config.ts           # Styles, Regions, Camera, Marker
│   │
│   └── navigation/                 # Navigation Config
│       ├── TabNavigator.tsx        # 5 Bottom Tabs
│       └── types.ts                # Navigation Types
│
├── docs/                           # Dokumentation
│   ├── FEATURES.md                 # Feature-Übersicht (aktuell)
│   ├── ROADMAP.md                  # Status & Milestones (aktuell)
│   ├── OPAS_RAT.md                 # Marktanalyse & Strategie
│   ├── ARCHITECTURE.md             # Diese Datei
│   ├── COMMANDS.md                 # Dev-Befehle
│   ├── SETUP.md                    # Setup-Guide
│   └── archive/                    # Historische Planungsdokumente
│
├── supabase/                       # DB Schemas
│   ├── catches_schema.sql
│   ├── ratings_schema.sql
│   ├── favorites_schema.sql
│   └── leaderboard_schema.sql
│
├── ios/                            # Native iOS (generated by expo prebuild)
├── .env                            # Secrets (gitignored)
├── app.json                        # Expo Config + Plugins
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript Config
```

---

## 🗄️ Datenbank Schema

### Supabase Tables

```sql
-- Water Bodies (Gewässer)
water_bodies (
  id UUID PRIMARY KEY,
  name TEXT,
  type TEXT,                    -- 'teich', 'see', 'fluss', 'kanal', 'bach'
  latitude DECIMAL,
  longitude DECIMAL,
  region TEXT,
  fish_species TEXT[],
  permit_price DECIMAL,
  permit_url TEXT,
  contact_phone TEXT,
  is_assumed BOOLEAN,
  created_at TIMESTAMP
)

-- Catches (Fänge)
catches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  fish_species TEXT NOT NULL,
  water_body_name TEXT NOT NULL,
  weight_kg DECIMAL,
  length_cm INTEGER,
  method TEXT,
  bait TEXT,
  notes TEXT,
  photo_url TEXT,
  caught_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Ratings (Bewertungen)
ratings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  water_body_id UUID REFERENCES water_bodies,
  stars INTEGER CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP
)

-- Favorites
favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  water_body_id UUID REFERENCES water_bodies,
  created_at TIMESTAMP
)
```

### RLS (Row Level Security)

- **water_bodies:** Jeder kann lesen
- **catches:** User sieht/erstellt nur eigene
- **ratings:** User sieht alle, erstellt/ändert nur eigene
- **favorites:** User sieht/erstellt nur eigene

---

## 🔄 Datenfluss

### Fangindex-Berechnung (lokal)

```
User öffnet App
      │
      ▼
┌─────────────────┐
│ Get User Location│ ◀── expo-location
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Weather │ │Supabase│  ← Online: API-Call + Cache
│  API   │ │  DB    │  ← Offline: AsyncStorage Fallback
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌─────────────────────┐
│ calculateFangIndex() │ ◀── src/utils/fangindex.ts
│ 5 Faktoren, lokal   │     (kein API-Call!)
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│ Display on Map  │ ◀── Score-Marker + Clustering
└─────────────────┘
```

### Fangindex-Faktoren

| Faktor | Gewicht | Quelle |
|--------|---------|--------|
| Wetter (Temp, Druck, Wolken) | 30% | OpenWeather API |
| Tageszeit (Golden Hours) | 25% | Lokal berechnet |
| Mondphase | 20% | Lokal berechnet |
| Solunar (Major/Minor) | 15% | Lokal berechnet |
| Wasserstand | 10% | PEGELONLINE API |

### Offline-Datenfluss

```
Online                          Offline
──────                          ───────
Supabase → cache → AsyncStorage → getCached → UI
Weather  → cache → AsyncStorage → getCached → Fangindex (lokal)
Catches  → cache → AsyncStorage → getCached → Fangbuch

Neue Fänge offline:
  User → addToOfflineQueue() → AsyncStorage
  ↓ (Reconnect)
  syncOfflineCatches() → Supabase → reload()
```

---

## � Offline-Architektur

| Schicht | Datei | Beschreibung |
|---------|-------|--------------|
| **Cache-Service** | `offlineStorage.ts` | AsyncStorage mit TTL (WaterBodies 24h, Weather 30min, Catches 1h) |
| **Netzwerk-Hook** | `useNetworkStatus.ts` | NetInfo + onReconnect-Callbacks |
| **Data-Hook** | `useMapData.ts` | Cache nach Fetch, Fallback bei Fehler |
| **Catch-Queue** | `CatchBookScreen.tsx` | Offline-Queue + Auto-Sync |
| **Map-Tiles** | `useOfflineMaps.ts` | Mapbox Offline-Packs (NDS/HH/SH, Zoom 7–14) |
| **UI** | `OfflineBanner.tsx` | Gelber Banner bei Offline/Cache |

---

## 🎨 Design System

### Colors (`src/constants/colors.ts`)

```typescript
export const COLORS = {
  primary: '#2563EB',     // Blau
  primaryLight: '#60A5FA',
  
  // Fangindex
  scoreHigh: '#4ADE80',   // 70+
  scoreMid: '#FACC15',    // 50-69
  scoreLow: '#EF4444',    // <50
  
  // Neutral
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#111827',
  
  // Dark Mode
  dark: { bg: '#0A1A2F', surface: '#132337', card: '#1A2D47' },
};
```

### Map Styles (`src/config/map.config.ts`)

| Style | Mapbox URL | Beschreibung |
|-------|-----------|--------------|
| **BISS Angel-Day** | `mapbox://styles/chulio115/cmikk7vsv003301qvgta39zfb` | Custom heller Angel-Style |
| **Night** | `mapbox://styles/mapbox/dark-v11` | Dunkler Modus (Fallback) |

Styles sind per ENV überschreibbar: `EXPO_PUBLIC_MAPBOX_STYLE_STANDARD`, `EXPO_PUBLIC_MAPBOX_STYLE_NIGHT`

---

## 📱 Navigation

```
5 Tabs:
ScheinStack → CatchBookStack → MapStack (Mitte) → BuyStack → ProfileStack
     🪪              📖            🗺️              🛒           👤
```

---

## 🔐 Security

| Key | Speicherort | Scope |
|-----|-------------|-------|
| Supabase Anon Key | `.env` | Public (geschützt durch RLS) |
| Mapbox Public Token | `.env` | Public |
| Mapbox Download Token | `app.json` (Plugin) | Build-time only |
| OpenWeather API Key | `.env` | Public |

---

## 📦 Key Dependencies

```json
{
  "expo": "~54.0.25",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@rnmapbox/maps": "^10.2.7",
  "@gorhom/bottom-sheet": "^5.2.7",
  "@supabase/supabase-js": "^2.86.0",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@react-native-community/netinfo": "11.4.1",
  "lucide-react-native": "^0.555.0",
  "expo-dev-client": "~6.0.18"
}
```

> **Hinweis:** NetInfo ist ein Native Module → nach Installation `npx expo prebuild --platform ios --clean` erforderlich.

---

*Letzte Aktualisierung: 05.03.2026*
