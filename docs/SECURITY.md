# 🔐 BISS - Security Guidelines

> **KRITISCH:** Niemals API-Keys in Git committen!

---

## ⚠️ EXPOSED TOKEN - Sofort-Maßnahmen

### Wenn GitHub eine Warnung sendet:

1. **Token sofort revoken:**
   - Mapbox: https://account.mapbox.com/access-tokens/
   - Supabase: https://app.supabase.com/project/_/settings/api
   - OpenWeather: https://home.openweathermap.org/api_keys

2. **Neuen Token generieren**

3. **In `.env` eintragen** (NICHT committen!)

4. **Git History bereinigen:**
```bash
# Backup erstellen
git branch backup-before-cleanup

# History bereinigen (VORSICHT!)
bash .git-cleanup.sh

# Force push (nur wenn nötig)
git push --force origin main
```

---

## ✅ Sichere Practices

### 1. Niemals in Code hardcoden

❌ **FALSCH:**
```typescript
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2h1bGlvMTE1...';
MapboxGL.setAccessToken(MAPBOX_TOKEN);
```

✅ **RICHTIG:**
```typescript
if (!process.env.EXPO_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Token missing in .env');
}
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);
```

---

### 2. .env ist in .gitignore

✅ Bereits konfiguriert:
```
# .gitignore
.env
.env.local
.env.*.local
```

---

### 3. .env.example als Template

✅ Verwende Platzhalter:
```env
# .env.example
EXPO_PUBLIC_MAPBOX_TOKEN=pk.your-token-here
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

---

### 4. GitHub Secrets für CI/CD

Für GitHub Actions:
1. Gehe zu: `Settings` → `Secrets and variables` → `Actions`
2. Füge hinzu:
   - `EXPO_PUBLIC_MAPBOX_TOKEN`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - etc.

---

## 🔍 Token-Scan vor Commit

### Pre-commit Hook installieren:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Scan for potential secrets
if git diff --cached | grep -E "pk\.eyJ|sk\.eyJ|eyJhbGciOi"; then
  echo "🚨 WARNUNG: Möglicher API-Token gefunden!"
  echo "Bitte entfernen und in .env verschieben"
  exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

---

## 📋 Checklist vor jedem Commit

- [ ] Keine Tokens in Code
- [ ] `.env` ist in `.gitignore`
- [ ] Nur `.env.example` committen
- [ ] `git diff` checken vor `git add`
- [ ] Keine Secrets in Commit-Messages

---

## 🆘 Was tun wenn Token leaked?

### Mapbox:
1. **Revoke:** https://account.mapbox.com/access-tokens/
2. **Neuen Token:** Erstellen mit Scopes: `styles:read`, `fonts:read`, `sprites:read`
3. **URL Restrictions:** Optional für Production

### Supabase:
1. **Revoke:** Nicht möglich für anon key
2. **RLS aktivieren:** Row Level Security für alle Tabellen
3. **Service Role Key:** NIEMALS im Frontend!

### Stripe:
1. **Revoke:** Dashboard → Developers → API Keys
2. **Test vs Live:** Immer Test-Keys im Dev

---

## 🔒 Production Security

### Mapbox Token Restrictions:

```
Allowed URLs:
- https://biss-app.com/*
- exp://192.168.*  (Dev only)

Scopes:
- styles:read
- fonts:read
- sprites:read
```

### Supabase RLS:

```sql
-- Beispiel: User sieht nur eigene Daten
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

---

## 📚 Weitere Ressourcen

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Mapbox Token Best Practices](https://docs.mapbox.com/help/troubleshooting/how-to-use-mapbox-securely/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

---

*Letzte Aktualisierung: 29.11.2024*
