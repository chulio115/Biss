# 🚀 BISS - Setup Guide

> Schritt-für-Schritt Anleitung für neue Entwickler

---

## Voraussetzungen

### Software
- [ ] **Node.js** 18+ ([Download](https://nodejs.org/))
- [ ] **npm** 9+ (kommt mit Node)
- [ ] **Xcode** 15+ (Mac App Store)
- [ ] **iOS Simulator** (via Xcode)
- [ ] **Git** ([Download](https://git-scm.com/))
- [ ] **VS Code** (empfohlen) ([Download](https://code.visualstudio.com/))

### Accounts
- [ ] **GitHub** Account
- [ ] **Supabase** Account (Free) - [supabase.com](https://supabase.com)
- [ ] **Mapbox** Account (Free) - [mapbox.com](https://www.mapbox.com/)
- [ ] **OpenWeather** Account (Free) - [openweathermap.org](https://openweathermap.org/) (Fallback)
- [ ] **DWD** (Deutscher Wetterdienst) - Kein Account nötig (Bright Sky API, kostenlos)

### Optional
- [ ] **Stripe** Account (Test Mode)
- [ ] **Google Cloud** Account (für Places API)
- [ ] **Apple Developer** Account ($99/Jahr für App Store)

---

## 1. Repository klonen

```bash
git clone https://github.com/chulio115/Biss.git biss-app
cd biss-app
```

---

## 2. Dependencies installieren

```bash
npm install
```

Falls Fehler auftreten:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 3. Environment Variables

### .env erstellen
```bash
cp .env.example .env
```

### Keys eintragen

Öffne `.env` und fülle aus:

```env
# ═══════════════════════════════════════
# PFLICHT - Ohne geht nichts
# ═══════════════════════════════════════

# Supabase (https://app.supabase.com → Settings → API)
EXPO_PUBLIC_SUPABASE_URL=https://DEIN_PROJEKT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...dein-anon-key

# Mapbox (https://account.mapbox.com/access-tokens/)
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ...dein-public-token

# OpenWeather (https://home.openweathermap.org/api_keys) - Fallback
EXPO_PUBLIC_OPENWEATHER_API_KEY=dein-api-key

# DWD Bright Sky - Primary Weather (kein Key nötig)
# Wird automatisch genutzt, keine Konfiguration erforderlich

# ═══════════════════════════════════════
# OPTIONAL - Für erweiterte Features
# ═══════════════════════════════════════

# Custom Mapbox Styles (nach Upload zu Mapbox Studio)
EXPO_PUBLIC_MAPBOX_STYLE_STANDARD=mapbox://styles/username/xxx
EXPO_PUBLIC_MAPBOX_STYLE_NIGHT=mapbox://styles/username/xxx

# Google Places (für Fotos)
EXPO_PUBLIC_GOOGLE_PLACES_KEY=AIza...

# Stripe (Test Mode)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# xAI (Legacy, nicht mehr für Fangindex genutzt)
# XAI_API_KEY=xai-...
```

---

## 4. Supabase Setup

### 4.1 Projekt erstellen
1. Gehe zu [app.supabase.com](https://app.supabase.com)
2. "New Project" klicken
3. Name: `biss-app`
4. Region: `Frankfurt (eu-central-1)`
5. Passwort generieren & speichern!

### 4.2 Schema ausführen
1. Im Dashboard: **SQL Editor** → **New Query**
2. Inhalt von `supabase/migrations/spot_data_v2.sql` einfügen
3. **Run** klicken
4. Optional: `supabase/seed_top_spots.sql` + `supabase/seed_top_spots_batch2.sql` für kuratierte Spots

### 4.3 Keys kopieren
1. **Settings** → **API**
2. Kopiere:
   - `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon/public` Key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 5. Mapbox Setup

### 5.1 Token erstellen
1. Gehe zu [account.mapbox.com](https://account.mapbox.com/)
2. **Access Tokens** → **Create a token**
3. Name: `biss-app-public`
4. Scopes: Default (public)
5. Kopiere Token → `EXPO_PUBLIC_MAPBOX_TOKEN`

### 5.2 Download Token (für iOS Build)
1. Erstelle zweiten Token: `biss-app-download`
2. Scope: `DOWNLOADS:READ`
3. In `app.json` ist es bereits konfiguriert

### 5.3 Custom Styles hochladen (optional)
1. [studio.mapbox.com](https://studio.mapbox.com/) → **New Style**
2. **Upload** → JSON aus `/assets/mapstyles/` wählen
3. Style URL kopieren → in `.env` eintragen
4. **Wichtig:** Nur STANDARD und NIGHT werden genutzt

---

## 6. iOS Build

### 6.1 Prebuild
```bash
npx expo prebuild --platform ios --clean
```

Bei Fehlern:
```bash
rm -rf ios
npx expo prebuild --platform ios --clean
```

### 6.2 Xcode Build
```bash
xcodebuild -workspace ios/BISS.xcworkspace \
  -scheme BISS \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
  build
```

### 6.3 Simulator starten
```bash
# Simulator booten
xcrun simctl boot "iPhone 16 Pro"

# Simulator öffnen
open -a Simulator

# Warten bis gebootet
sleep 5

# App starten
xcrun simctl launch booted com.biss.angelapp
```

---

## 7. Development Server

```bash
npx expo start --dev-client
```

Die App sollte sich automatisch mit Metro verbinden.

---

## 8. Troubleshooting

### "Command not found: npx"
```bash
# Node neu installieren
brew install node
```

### "No simulator found"
```bash
# Verfügbare Simulatoren anzeigen
xcrun simctl list devices

# Anderen Simulator verwenden
xcrun simctl boot "iPhone 15"
```

### "Build failed: Signing"
1. Xcode öffnen
2. BISS.xcworkspace öffnen
3. **Signing & Capabilities**
4. Team auf "Personal Team" setzen

### "Mapbox token invalid"
1. Token in `.env` prüfen
2. Startet mit `pk.`?
3. Token in Mapbox Dashboard aktiv?

### "Metro bundler nicht erreichbar"
```bash
# Terminal 1: Metro stoppen (Ctrl+C)
# Terminal 2:
npx expo start --dev-client --clear
```

### "Module not found"
```bash
rm -rf node_modules
npm install
npx expo prebuild --platform ios --clean
```

---

## 9. VS Code Extensions (empfohlen)

- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **TypeScript Importer**
- **GitLens**
- **Error Lens**

---

## 10. Nächste Schritte

Nach erfolgreichem Setup:

1. [ ] App im Simulator testen
2. [ ] Eigenen Branch erstellen: `git checkout -b feature/mein-feature`
3. [ ] Erstes Feature entwickeln
4. [ ] Pull Request erstellen

Dokumentation lesen:
- `/docs/COMMANDS.md` - Alle Befehle
- `/docs/ROADMAP.md` - Was steht an?
- `/docs/IDEAS.md` - Feature-Ideen

---

## Hilfe & Support

Bei Problemen:
1. Diese Doku nochmal lesen
2. Google/StackOverflow
3. GitHub Issues erstellen

---

*Letzte Aktualisierung: 10.03.2026*
