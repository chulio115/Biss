# 💡 BISS - Ideen & Feature Backlog

> Alle Ideen sammeln, später priorisieren

---

## 🔥 USP-Ideen (Differenzierung)

### Bereits implementiert ✅
- **Beißzeit-Radar** - Goldene Stunde für Angler
- **Schonzeit-System** - Keine Bußgelder mehr
- **3 Map Styles** - Einzigartige Kartenansicht
- **Fangindex** - KI-gestützte Vorhersage

### Noch umzusetzen 💭

#### "Stille Wasser" Anti-Crowd-Modus
```
Problem: Angler hassen überfüllte Gewässer
Lösung: Zeige weniger besuchte Spots
- Entfernung zu Parkplätzen (weiter = ruhiger)
- Wochentag-Empfehlungen (Di/Mi weniger los)
- "Geheimtipp"-Badge für <10 Besuche/Monat
```

#### "Anfahrts-Optimizer"
```
Problem: Fahrzeit + Parkplatz unklar
Lösung: Nicht nur Distanz, sondern:
- Echte Fahrzeit via Apple Maps API
- Parkplatz-Koordinaten
- "15 min, Parkplatz am Teich"
```

#### "Wetter-Overlay"
```
Problem: User wechseln zwischen 3 Apps
Lösung: Wetter direkt auf der Karte
- Regen-Radar als Layer
- Wind-Pfeile
- "In 2h Regen" Warning auf Markern
```

#### "Der Ehrliche Teich-Check"
```
Problem: Bewertungen sind oft fake
Lösung: Verifizierte Community-Reviews
- "War heute da, lief gut" ✅
- Zeitstempel + GPS-Verifizierung
- Keine anonymen Reviews
```

---

## 🎣 Feature-Ideen (Funktionalität)

### Karte & Navigation

| Idee | Beschreibung | Aufwand |
|------|--------------|---------|
| Cluster-Marker | Zusammenfassen bei Zoom-Out | Medium |
| Heatmap-Mode | Fangindex als Heatmap | Medium |
| Routenplanung | Mehrere Spots an einem Tag | High |
| Offline-Karten | Premium Feature | High |
| 3D-Terrain | Bergige Regionen | Low |

### Gewässer-Details

| Idee | Beschreibung | Aufwand |
|------|--------------|---------|
| Tiefenkarte | Bathymetrie-Daten | High |
| Foto-Galerie | User-uploaded | Medium |
| Fang-Historie | Was wurde hier gefangen? | Medium |
| Besatz-Info | Wann wurde besetzt? | Low |
| Regeln-Übersicht | Erlaubt/Verboten | Low |

### Fischereischein

| Idee | Beschreibung | Aufwand |
|------|--------------|---------|
| OCR-Scan | Automatische Erkennung | Medium |
| Gültigkeits-Check | Ablauf-Warnung | Low |
| QR-Vorzeige | Offline-fähig | Low |
| Schein-Sharing | Familie teilen | Medium |
| Multi-Schein | Mehrere Bundesländer | Low |

### Monetarisierung

| Idee | Beschreibung | Aufwand |
|------|--------------|---------|
| In-App Tageskarten | Direkter Kauf | High |
| Affiliate Links | Provision pro Lead | Low |
| Premium Abo | €3.99/Monat | Medium |
| Vereins-Dashboard | B2B Angebot | High |
| Sponsored Spots | Teiche bezahlen für Visibility | Low |

---

## 👥 Community-Ideen

### Social Features

| Idee | Beschreibung | Prio |
|------|--------------|------|
| Fangmeldungen | "Hecht, 85cm" mit Foto | Medium |
| Angler-Treffpunkt | Wer ist gerade wo? | Low |
| Challenges | "Fang 5 verschiedene Arten" | Low |
| Ranglisten | Top-Angler der Region | Low |
| Gruppen | Angel-Buddies finden | Medium |

### User-Generated Content

| Idee | Beschreibung | Prio |
|------|--------------|------|
| Teich melden | Neues Gewässer vorschlagen | High |
| Korrektur-System | Falsche Daten melden | High |
| Foto-Upload | Gewässer-Bilder | Medium |
| Tipps & Tricks | Pro-Tipps pro Spot | Low |
| Bewertungen | Sterne-System | Medium |

---

## 📱 UX-Ideen

### Onboarding

| Idee | Beschreibung |
|------|--------------|
| Standort-Tutorial | Warum GPS wichtig ist |
| Lieblingsfische | Initial-Filter setzen |
| Region wählen | Fokus eingrenzen |
| Benachrichtigungen | Opt-in für Alerts |

### Personalisierung

| Idee | Beschreibung |
|------|--------------|
| Favoriten-Sync | Über Geräte hinweg |
| Custom Alerts | Eigene Beißzeit-Regeln |
| Dunkelmodus | Manuell toggle |
| Sprache | Englisch für Touristen |

### Gamification

| Idee | Beschreibung |
|------|--------------|
| Badges | "Erster Fang", "100 Spots besucht" |
| Streak | Tage in Folge geangelt |
| Level | Erfahrungspunkte |
| Achievements | Meilensteine |

---

## 🔌 Integrationen

### APIs

| Dienst | Zweck | Kosten |
|--------|-------|--------|
| OpenWeather | Wetter | Free Tier |
| PEGELONLINE | Pegel | Kostenlos |
| Sunrise-Sunset | Zeiten | Kostenlos |
| Moon Phase | Mondphase | Kostenlos |
| Google Places | Fotos | $$ |

### Partner

| Partner | Integration | Vorteil |
|---------|-------------|---------|
| Forellenhöfe | Direktbuchung | Provision |
| Angelvereine | Mitglieder-Zugang | Daten |
| Angelshops | Affiliate | Einnahmen |
| Fischereischein.de | Kurse | Provision |

---

## 🚫 Bewusst NICHT umsetzen

| Idee | Grund |
|------|-------|
| AR-Fisch-Finder | Technisch komplex, kein echter Nutzen |
| Live-Fisch-Tracking | Unmöglich |
| Wettbewerb mit Fishbrain | Zu groß, anderer Fokus |
| Internationalisierung | Erstmal DE perfekt machen |
| Android zuerst | iOS Zielgruppe kaufkräftiger |
| Eigene Pegel-Sensoren | Hardware = Komplexität |

---

## 🧪 Experiment-Ideen

### A/B Tests

| Test | Hypothese |
|------|-----------|
| Fangindex prominent | Höhere Engagement |
| Beißzeit-Push | Mehr Daily Opens |
| Grüner Kaufbutton | Höhere Conversion |
| Ohne Preise | Mehr Klicks auf Details |

### Validierung

| Frage | Methode |
|-------|---------|
| Wollen User Tageskarten-Kauf? | Landing Page Test |
| Zahlen User für Premium? | Pretest mit 50 Usern |
| Welche Features wichtig? | Umfrage in FB-Gruppen |

---

## 📝 Notizen & Learnings

### Was Konkurrenz macht
- Fishbrain: Social-First, global, Premium $10/Monat
- Anglermap: Daten-fokussiert, keine App
- Hejfish: Österreich-Fokus, Buchung
- AngelApp.de: Veraltet, keine Innovation

### Was User wirklich wollen
- "Wo kann ich JETZT angeln?"
- "Keine Bußgelder wegen Schonzeit"
- "Wann beißt es am besten?"
- "Nicht ewig nach Tageskarten suchen"

### Was User NICHT wollen
- Noch eine Social-App
- Komplizierte Registrierung
- Werbung überall
- Bezahlen ohne Mehrwert

---

*Letzte Aktualisierung: 29.11.2024*
