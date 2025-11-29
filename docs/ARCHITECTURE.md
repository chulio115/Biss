# 🏗️ BISS - Architektur & Tech Stack

> Technische Übersicht für Entwickler

---

## 📊 System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                      BISS App (iOS)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Native + Expo                     │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐         │   │
│  │  │ MapScreen │ │ScheinScreen│ │ProfileScreen│        │   │
│  │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘         │   │
│  │        │             │             │                │   │
│  │  ┌─────┴─────────────┴─────────────┴─────┐         │   │
│  │  │           Services Layer              │         │   │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐    │         │   │
│  │  │  │Supabase│ │  xAI   │ │Weather │    │         │   │
│  │  │  └────┬───┘ └────┬───┘ └────┬───┘    │         │   │
│  │  └───────┼──────────┼──────────┼────────┘         │   │
│  └──────────┼──────────┼──────────┼──────────────────┘   │
└─────────────┼──────────┼──────────┼──────────────────────┘
              │          │          │
              ▼          ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │Supabase │ │  xAI    │ │OpenWeather│
        │  (DB)   │ │ (Grok)  │ │  (API)   │
        └─────────┘ └─────────┘ └─────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technologie | Version | Zweck |
|-------------|---------|-------|
| React Native | 0.76+ | Cross-Platform Framework |
| Expo | 52+ | Build & Development |
| TypeScript | 5.3+ | Type Safety |
| React Navigation | 7+ | Navigation & Tabs |
| Mapbox GL | 10+ | Native Maps |

### Backend & Services

| Dienst | Tier | Zweck |
|--------|------|-------|
| Supabase | Free | Auth, DB, Storage |
| xAI/Grok | Pay | Fangindex KI |
| OpenWeather | Free | Wetter-Daten |
| PEGELONLINE | Free | Pegel-Daten |
| Mapbox | Free | Karten & Tiles |

### UI Libraries

| Library | Zweck |
|---------|-------|
| @gorhom/bottom-sheet | Bottom Sheet |
| lucide-react-native | Icons |
| expo-linear-gradient | Gradients |
| expo-blur | Blur Effects |
| react-native-svg | SVG Support |

---

## 📁 Ordnerstruktur

```
biss-app/
├── App.tsx                    # Entry Point + Navigation Setup
│
├── src/
│   ├── screens/               # Screen Components
│   │   ├── MapScreen.tsx      # Hauptkarte (900+ LOC)
│   │   ├── SearchScreen.tsx   # Such-Modal
│   │   ├── ScheinScreen.tsx   # Fischereischein
│   │   ├── BuyScreen.tsx      # Tageskarten
│   │   └── ProfileScreen.tsx  # Profil
│   │
│   ├── components/            # Reusable Components
│   │   ├── map/               # Map-spezifische Components
│   │   │   ├── ActivityRing.tsx
│   │   │   ├── PulseMarker.tsx
│   │   │   ├── FishChip.tsx
│   │   │   └── PulsingBuyButton.tsx
│   │   └── SpotBottomSheet.tsx
│   │
│   ├── navigation/            # Navigation Config
│   │   ├── TabNavigator.tsx   # Bottom Tabs
│   │   └── index.ts           # Exports
│   │
│   ├── services/              # API Clients
│   │   ├── supabase.ts        # Auth + DB
│   │   ├── xai.ts             # Fangindex KI
│   │   ├── weather.ts         # OpenWeather
│   │   ├── pegel.ts           # PEGELONLINE
│   │   └── googlePlaces.ts    # Places API
│   │
│   ├── hooks/                 # Custom Hooks
│   │   └── useAuth.ts         # Auth State
│   │
│   ├── types/                 # TypeScript Types
│   │   └── index.ts
│   │
│   └── utils/                 # Helper Functions
│       └── geo.ts             # Geo-Berechnungen
│
├── assets/
│   └── mapstyles/             # Mapbox JSON Styles
│       ├── biss-standard.json
│       ├── biss-angel-fokus.json
│       ├── biss-angel-night.json
│       └── biss-teich-fokus.json
│
├── docs/                      # Dokumentation
│   ├── SETUP.md
│   ├── COMMANDS.md
│   ├── ROADMAP.md
│   ├── IDEAS.md
│   └── ARCHITECTURE.md
│
├── supabase/
│   └── schema.sql             # DB Schema
│
├── ios/                       # Native iOS (generated)
├── .env                       # Secrets (gitignored)
├── .env.example               # Template
├── app.json                   # Expo Config
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript Config
```

---

## 🗄️ Datenbank Schema

### Tables

```sql
-- User Profiles
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  fishing_license_verified BOOLEAN,
  created_at TIMESTAMP
)

-- Water Bodies (Gewässer)
water_bodies (
  id UUID PRIMARY KEY,
  name TEXT,
  type TEXT,                    -- 'teich', 'see', 'fluss'
  latitude DECIMAL,
  longitude DECIMAL,
  region TEXT,
  fish_species TEXT[],
  permit_price DECIMAL,
  permit_url TEXT,
  contact_phone TEXT,
  is_assumed BOOLEAN,           -- Nicht verifiziert
  created_at TIMESTAMP
)

-- User Favorites
favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  water_body_id UUID REFERENCES water_bodies,
  created_at TIMESTAMP
)

-- Fishing Licenses
fishing_licenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  image_url TEXT,
  license_number TEXT,
  valid_from DATE,
  valid_until DATE,
  verified BOOLEAN,
  created_at TIMESTAMP
)
```

---

## 🔄 Datenfluss

### Fangindex Berechnung

```
User öffnet App
      │
      ▼
┌─────────────────┐
│ Get User Location│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Fetch Weather   │────▶│  OpenWeather    │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Fetch Water     │────▶│    Supabase     │
│ Bodies          │     └─────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calculate Score │◀── Lokal, kein API-Call!
│ per Water Body  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display on Map  │
└─────────────────┘
```

### Beißzeit-Radar

```
┌─────────────────┐
│ User Location   │
│ (lat, lng)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ calculateSunTimes│◀── Astronomische Formel
│ (sunrise/sunset)│     (lokal berechnet)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ isGoldenHour()  │
│ (±1h um Sonne)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display Badge   │
│ "BEISSZEIT!"    │
└─────────────────┘
```

---

## 🔐 Security

### API Keys

| Key | Speicherort | Scope |
|-----|-------------|-------|
| Supabase Anon | `.env` | Public (RLS!) |
| Mapbox Public | `.env` | Public |
| OpenWeather | `.env` | Public |
| xAI | `.env` | Server-side only |

### Row Level Security (RLS)

```sql
-- Profiles: User sieht nur eigenes Profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Favorites: User sieht nur eigene Favoriten
CREATE POLICY "Users can manage own favorites"
ON favorites FOR ALL
USING (auth.uid() = user_id);

-- Water Bodies: Alle können lesen
CREATE POLICY "Anyone can read water bodies"
ON water_bodies FOR SELECT
TO authenticated, anon
USING (true);
```

---

## 📱 App States

### Navigation State

```typescript
type RootStackParamList = {
  Main: undefined;           // Tab Navigator
  SpotDetail: { id: string };
  Search: undefined;
};

type MainTabParamList = {
  Map: undefined;
  Schein: undefined;
  Buy: undefined;
  Profile: undefined;
};
```

### Map State

```typescript
interface MapState {
  waterBodies: MapWaterBody[];
  selectedSpot: MapWaterBody | null;
  userLocation: [number, number];
  mapStyle: 'standard' | 'angelFokus' | 'angelNight';
  isNightMode: boolean;
  goldenHourInfo: { isGolden: boolean; nextGolden: string };
}
```

---

## 🎨 Design System

### Colors

```typescript
const colors = {
  // Primary
  primary: '#0066FF',
  accent: '#00A3FF',
  
  // Fangindex
  green: '#4ADE80',   // 70+
  yellow: '#FACC15',  // 50-69
  red: '#EF4444',     // <50
  
  // Neutral
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray600: '#4B5563',
  gray900: '#111827',
  
  // Dark Mode
  dark: {
    bg: '#0A1A2F',
    surface: '#132337',
    water: '#00A3FF',
  },
};
```

### Typography

```typescript
const typography = {
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 22, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};
```

---

## 📦 Key Dependencies

```json
{
  "dependencies": {
    // Core
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.x",
    
    // Navigation
    "@react-navigation/native": "^7.x",
    "@react-navigation/bottom-tabs": "^7.x",
    
    // Maps
    "@rnmapbox/maps": "^10.x",
    
    // UI
    "@gorhom/bottom-sheet": "^5.x",
    "lucide-react-native": "^0.x",
    "expo-linear-gradient": "~14.x",
    
    // Services
    "@supabase/supabase-js": "^2.x",
    
    // Utils
    "expo-location": "~18.x",
    "expo-haptics": "~14.x"
  }
}
```

---

*Letzte Aktualisierung: 29.11.2024*
