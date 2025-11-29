# 🔧 Mapbox Token Fix - 401 Error

## Problem:
Token hat nicht die richtigen Scopes für Custom Styles

## Lösung:

### Option 1: Token Scopes bearbeiten (EMPFOHLEN)

1. Gehe zu: https://account.mapbox.com/access-tokens/
2. Finde Token: `pk.eyJ1IjoiY2h1bGlvMTE1IiwiYSI6ImNtaWtsZ2NkYzA1czgybXM3bHRtMXZza28ifQ...`
3. Klick **"Edit"** oder **"..."** → **"Edit token"**
4. Aktiviere diese Scopes:
   - ✅ `styles:read` (Custom Styles laden)
   - ✅ `styles:tiles` (Tiles von Custom Styles)
   - ✅ `fonts:read` (Schriftarten)
   - ✅ `sprites:read` (Icons)
5. **Save**

### Option 2: Neuen Token erstellen

1. Gehe zu: https://account.mapbox.com/access-tokens/
2. Klick **"Create a token"**
3. Name: `BISS-App-Full-Access`
4. **Public scopes** aktivieren:
   ```
   ✅ styles:read
   ✅ styles:tiles
   ✅ fonts:read
   ✅ sprites:read
   ✅ datasets:read (optional)
   ```
5. **Create token**
6. Kopiere den Token
7. In `.env` ersetzen:
   ```env
   EXPO_PUBLIC_MAPBOX_TOKEN=NEUER_TOKEN_HIER
   ```

## Test:

Nach dem Fix sollte dieser Befehl **200 OK** zurückgeben:

```bash
curl -I "https://api.mapbox.com/styles/v1/chulio115/cmikk6owm00ia01s9cs0vdcok?access_token=DEIN_TOKEN"
```

## Warum passiert das?

Mapbox Tokens haben verschiedene **Scopes** (Berechtigungen):
- **Default Token:** Nur `styles:tiles` für Mapbox-Styles
- **Custom Styles:** Brauchen `styles:read` + `styles:tiles`

Dein Token wurde wahrscheinlich nur mit Default-Scopes erstellt.
