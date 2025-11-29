# 🎣 BISS - Dein digitaler Angelbegleiter

Angel-App für den deutschen Markt mit KI-gestütztem Fangindex.

## Tech Stack
- **Frontend:** React Native + Expo (EAS)
- **Backend:** Supabase (Auth, DB, Storage)
- **KI:** xAI/Grok API (OCR, Fangindex)
- **APIs:** OpenWeather, PEGELONLINE
- **Payments:** Stripe (Test Mode)

## MVP Features (Woche 1-6)
- [x] Projekt Setup
- [x] User Authentication
- [x] xAI Integration (OCR + Fangindex)
- [ ] Fischereischein-Upload + Verifizierung
- [ ] Digitales Wallet für Scheine
- [ ] Gewässersuche (50 Spots)
- [ ] Ein-Tap-Kauf (Stripe)
- [ ] QR-Vorlage (Offline)
- [ ] Auto-Erinnerungen

## Setup

### 1. Dependencies installieren
```bash
cd biss-app
npm install
```

### 2. API Keys einrichten
Kopiere `.env.example` zu `.env` und fülle die Keys aus:

```bash
cp .env.example .env
```

**Benötigte API Keys:**
- **Supabase:** https://supabase.com (Free Tier)
  - Erstelle ein neues Projekt
  - Kopiere URL und anon key
- **xAI/Grok:** https://x.ai (API Zugang erforderlich)
- **OpenWeather:** https://openweathermap.org/api (Free Tier)
- **Stripe:** https://stripe.com (Test Mode)

### 3. Supabase Setup
Führe das SQL-Schema in deinem Supabase Dashboard aus:
```sql
-- Siehe supabase/schema.sql
```

### 4. App starten
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (für schnelles Testen)
npm run web
```

## Projektstruktur
```
biss-app/
├── App.tsx              # Main Entry
├── src/
│   ├── screens/         # UI Screens
│   ├── components/      # Reusable Components
│   ├── services/        # API Services (Supabase, xAI, Weather)
│   ├── hooks/           # Custom Hooks (useAuth)
│   ├── types/           # TypeScript Types
│   └── utils/           # Helper Functions
├── supabase/
│   └── schema.sql       # Database Schema
└── .env                 # Environment Variables (nicht committen!)
```

## Woche 1 Checklist
- [x] Expo Projekt initialisiert
- [x] Supabase Auth Integration
- [x] xAI Service für OCR + Fangindex
- [x] OpenWeather Integration
- [x] PEGELONLINE Integration
- [x] Login/Register Screens
- [x] Home Screen mit Fangindex
- [ ] API Keys einrichten und testen

## Next Steps (Woche 2)
1. Fischereischein-Upload mit Image Picker
2. xAI OCR für Schein-Verifizierung
3. Supabase Storage für Bilder
4. Gewässer-Datenbank (50 Spots)

## Bug Prevention Tips
- Immer `.env` in `.gitignore` (bereits konfiguriert)
- API Keys niemals hardcoden
- Error Handling in allen API Calls
- TypeScript strict mode aktiviert

## Lizenz
Privat - Alle Rechte vorbehalten
