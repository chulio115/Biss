# 🛠️ BISS - Commands & Development

> Alle wichtigen Befehle für die Entwicklung

---

## 📦 Installation

```bash
# Repository klonen
git clone https://github.com/chulio115/Easy-living-frontend.git
cd biss-app

# Dependencies installieren
npm install

# Environment Variables kopieren
cp .env.example .env
# → Dann .env mit echten Keys befüllen
```

---

## 🚀 Development

### Standard Start (mit Dev Client)
```bash
npx expo start --dev-client
```

### Mit Cache löschen
```bash
npx expo start --dev-client --clear
```

### Nur iOS
```bash
npx expo start --dev-client --ios
```

---

## 📱 iOS Build (Native Mapbox)

### 1. Prebuild (nach Package-Änderungen)
```bash
npx expo prebuild --platform ios --clean
```

### 2. Xcode Build
```bash
xcodebuild -workspace ios/BISS.xcworkspace \
  -scheme BISS \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
  build
```

### 3. Simulator starten
```bash
# Simulator booten
xcrun simctl boot "iPhone 16 Pro"

# Simulator App öffnen
open -a Simulator

# App installieren & starten
xcrun simctl install booted ~/Library/Developer/Xcode/DerivedData/BISS-*/Build/Products/Debug-iphonesimulator/BISS.app
xcrun simctl launch booted com.biss.angelapp
```

### Alles in einem (nach erfolgreichem Build)
```bash
xcrun simctl boot "iPhone 16 Pro" 2>/dev/null || true && \
open -a Simulator && \
sleep 2 && \
xcrun simctl launch booted com.biss.angelapp
```

---

## 🔍 Type Checking & Linting

```bash
# TypeScript Check
npx tsc --noEmit

# Mit Watch Mode
npx tsc --noEmit --watch

# Nur Fehler (keine Warnings)
npx tsc --noEmit 2>&1 | grep error
```

---

## 📦 Git Workflow

### Feature entwickeln
```bash
git checkout -b feature/FEATURE_NAME
# ... entwickeln ...
git add .
git commit -m "feat: Beschreibung"
git push origin feature/FEATURE_NAME
```

### Quick Commit
```bash
git add . && git commit -m "feat: ..."
```

### Commit-Prefixes
| Prefix | Verwendung |
|--------|------------|
| `feat:` | Neues Feature |
| `fix:` | Bugfix |
| `docs:` | Dokumentation |
| `style:` | Formatierung |
| `refactor:` | Code-Umbau |
| `test:` | Tests |
| `chore:` | Sonstiges |

---

## 🗄️ Supabase

### Schema ausführen
```bash
# Im Supabase Dashboard → SQL Editor
# → Inhalt von supabase/schema.sql einfügen
```

### Lokale Supabase (optional)
```bash
npx supabase init
npx supabase start
npx supabase db reset
```

---

## 🐛 Debugging

### Metro Bundler Logs
```bash
npx expo start --dev-client 2>&1 | tee metro.log
```

### Xcode Build Logs
```bash
xcodebuild ... 2>&1 | tee build.log
```

### Simulator Logs
```bash
xcrun simctl spawn booted log stream --predicate 'subsystem == "com.biss.angelapp"'
```

---

## 🧹 Cleanup

### Node Modules neu installieren
```bash
rm -rf node_modules
npm install
```

### iOS komplett neu bauen
```bash
rm -rf ios
npx expo prebuild --platform ios --clean
```

### Metro Cache löschen
```bash
npx expo start --clear
```

### Alle Caches löschen
```bash
rm -rf node_modules ios .expo
npm install
npx expo prebuild --platform ios --clean
```

---

## 🔐 Environment Variables

### Benötigte Keys in `.env`:
```env
# Pflicht
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_TOKEN=
EXPO_PUBLIC_OPENWEATHER_API_KEY=

# Mapbox Styles (nach Upload)
EXPO_PUBLIC_MAPBOX_STYLE_STANDARD=
EXPO_PUBLIC_MAPBOX_STYLE_FOKUS=
EXPO_PUBLIC_MAPBOX_STYLE_NIGHT=

# Optional
EXPO_PUBLIC_GOOGLE_PLACES_KEY=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 📊 Nützliche Checks

### Installierte Packages prüfen
```bash
npm list --depth=0
```

### Outdated Packages
```bash
npm outdated
```

### Bundle Size analysieren
```bash
npx expo export --platform ios
```
