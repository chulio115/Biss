#!/usr/bin/env node
/**
 * Direktes Seeding zu Supabase Remote DB
 * Nutzt service_role Key für volle Berechtigungen
 * 
 * Usage: node scripts/seed-remote.js
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://ufligmprfiqteshotxhf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY nicht gesetzt!');
  console.error('   Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-remote.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// md5-basierte UUID (identisch zu PostgreSQL md5()::uuid)
function md5Uuid(input) {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  // Format als UUID: 8-4-4-4-12
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;
}

// ═══ SPOT DATA ═══
const spots = [
  // ── BATCH 1: NIEDERSACHSEN — Seen ──
  {
    id: md5Uuid('nds-steinhuder-meer'), name: 'Steinhuder Meer', type: 'lake',
    latitude: 52.4538, longitude: 9.3325, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Brassen', 'Karpfen', 'Schleie'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.fischereigenossenschaft-steinhuder-meer.de/',
    permit_info: 'Tageskarten bei Bootsvermietungen + Tourist-Info. Bootsangeln empfohlen!',
    permit_contact: 'Fischereigenossenschaft Steinhuder Meer',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45, Aal: 50 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Schleppfischen', 'Ansitz'], specialRules: 'Niedersachsens größter Binnensee. Bootsangeln sehr empfohlen. Hecht/Zander-Hotspot.' },
    max_depth: 2.9, surface_area: 29.1, pegel_station: null,
  },
  {
    id: md5Uuid('nds-maschsee'), name: 'Maschsee', type: 'lake',
    latitude: 52.3510, longitude: 9.7440, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal'],
    permit_price: 15.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.anglerverband-niedersachsen.de/',
    permit_info: 'AVN-Tagesschein oder Jahresschein. Cityangeln in Hannover.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Spinnfischen', 'Ansitz'], specialRules: 'Innerstädtisch: Regeln beachten. Nachtangeln verboten. Guter Zanderbestand.' },
    max_depth: 2.4, surface_area: 0.78,
  },
  {
    id: md5Uuid('nds-dümmer-see'), name: 'Dümmer See', type: 'lake',
    latitude: 52.5200, longitude: 8.3650, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Brassen', 'Karpfen'],
    permit_price: 8.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.duemmer.de/',
    permit_info: 'Tageskarten bei der Tourist-Info Lembruch. Bootsangeln möglich.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Zweitgrößter See NDS. Flacher See = Wind beachten. Guter Hechtbestand.' },
    max_depth: 1.5, surface_area: 13.5,
  },
  {
    id: md5Uuid('nds-salzgittersee'), name: 'Salzgittersee', type: 'lake',
    latitude: 52.0890, longitude: 10.3380, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal', 'Wels'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten beim AV Salzgitter. Top-Karpfen und Wels!',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Guter Welsbestand. Nachtangeln für Karpfen/Wels erlaubt.' },
    max_depth: 5.0, surface_area: 0.75,
  },
  {
    id: md5Uuid('nds-tankumsee'), name: 'Tankumsee', type: 'lake',
    latitude: 52.4280, longitude: 10.5480, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Brassen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten am Kiosk/Freizeitgelände. Beliebter Badesee.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'manual',
    regulations: { minSizes: { Hecht: 50 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Ansitz', 'Spinnfischen'], specialRules: 'Badezeit Mai-Sep: nur morgens/abends angeln. Karpfen-Hotspot.' },
    max_depth: 8.0, surface_area: 0.55,
  },
  // ── BATCH 1: NIEDERSACHSEN — Flüsse ──
  {
    id: md5Uuid('nds-elbe-stade'), name: 'Elbe bei Stade', type: 'river',
    latitude: 53.5960, longitude: 9.4760, region: 'Niedersachsen',
    fish_species: ['Zander', 'Aal', 'Hecht', 'Barsch', 'Brassen', 'Rapfen', 'Wels'],
    permit_price: 15.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.anglerverband-niedersachsen.de/',
    permit_info: 'AVN-Mitgliedschaft oder Gastschein. Tidebereich beachten!',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Zander: 45, Hecht: 50, Aal: 50 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Grundangeln', 'Ansitz'], specialRules: 'Tidebereich: Gezeiten beachten. Beste Zeit bei ablaufendem Wasser.' },
    pegel_station: 'STADERSAND', river_segment: 'Stade-Jork',
  },
  {
    id: md5Uuid('nds-aller-celle'), name: 'Aller bei Celle', type: 'river',
    latitude: 52.6240, longitude: 10.0810, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Döbel', 'Barbe'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Gastschein beim Anglerverein Celle. Auch online verfügbar.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Guter Zanderfluss. Beste Stellen bei Celle-Burg.' },
    pegel_station: 'CELLE', river_segment: 'Celle-Winsen',
  },
  {
    id: md5Uuid('nds-oste-bremervoerde'), name: 'Oste bei Bremervörde', type: 'river',
    latitude: 53.4890, longitude: 9.1410, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Aal', 'Zander', 'Brassen', 'Meerforelle'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Gastschein SAV Oste-Hamme. Top-Hechtgewässer!',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Meerforelle: 60 }, dailyLimit: 2, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz'], specialRules: 'Meerforelle: Saison Apr-Okt. Einer der besten Hechtflüsse in NDS.' },
    pegel_station: 'BREMERVÖRDE UW',
  },
  {
    id: md5Uuid('nds-seeve-jesteburg'), name: 'Seeve bei Jesteburg', type: 'river',
    latitude: 53.3120, longitude: 9.9680, region: 'Niedersachsen',
    fish_species: ['Forelle', 'Barsch', 'Döbel', 'Aal'],
    permit_price: 0.00, requires_permit: true, permit_type: 'club_only',
    permit_info: 'Vereinsgewässer SAV Seevetal. Mitgliedschaft erforderlich.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'manual',
    regulations: { minSizes: { Forelle: 30 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Fliegenfischen', 'Spinnfischen'], specialRules: 'Kleiner Forellenbach. Schonend behandeln, C&R erwünscht.' },
  },
  // ── BATCH 1: HAMBURG ──
  {
    id: md5Uuid('hh-aussenalster'), name: 'Außenalster', type: 'lake',
    latitude: 53.5720, longitude: 9.9980, region: 'Hamburg',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.hamburger-sportangler.de/',
    permit_info: 'Hamburger Sportangler-Bund Tageskarte. Auch Alsterkanäle abgedeckt.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Spinnfischen', 'Ansitz'], specialRules: 'Bootsangeln nur mit HSB-Karte. Ruderer/SUP haben Vorfahrt.' },
    max_depth: 4.5, surface_area: 1.6,
  },
  {
    id: md5Uuid('hh-dove-elbe'), name: 'Dove-Elbe', type: 'river',
    latitude: 53.4680, longitude: 10.1560, region: 'Hamburg',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.hamburger-sportangler.de/',
    permit_info: 'HSB-Tageskarte. Ruhiges Gewässer, top für Raubfisch.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Regattastrecke: bei Events gesperrt. Sehr guter Zanderbestand.' },
  },
  {
    id: md5Uuid('hh-oejendorfer-see'), name: 'Öjendorfer See', type: 'lake',
    latitude: 53.5470, longitude: 10.1150, region: 'Hamburg',
    fish_species: ['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Brassen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'HSB-Tageskarte. Beliebter See im Osten Hamburgs.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Ansitz', 'Spinnfischen'], specialRules: 'Nur Uferangeln. Parkplatz am Südende.' },
  },
  {
    id: md5Uuid('hh-boberger-see'), name: 'Boberger See', type: 'lake',
    latitude: 53.4930, longitude: 10.1380, region: 'Hamburg',
    fish_species: ['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Aal'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'HSB-Tageskarte. Naturschutzgebiet, nur bestimmte Uferbereiche.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Ansitz'], specialRules: 'Naturschutzgebiet Boberger Niederung. Markierte Angelplätze nutzen.' },
  },
  // ── BATCH 1: SCHLESWIG-HOLSTEIN ──
  {
    id: md5Uuid('sh-grosser-ploener-see'), name: 'Großer Plöner See', type: 'lake',
    latitude: 54.1480, longitude: 10.4220, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Maräne', 'Karpfen', 'Brassen'],
    permit_price: 15.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.fischereigenossenschaft-ploener-seen.de/',
    permit_info: 'Tageskarten bei Bootsvermietungen. Bootsangeln empfohlen. Größter See in SH.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45, Maräne: 30 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Schleppfischen', 'Ansitz'], specialRules: 'Bestes Zandergewässer in SH. Boots-Schleppangeln sehr erfolgreich.' },
    max_depth: 58.0, surface_area: 28.4,
  },
  {
    id: md5Uuid('sh-ratzeburger-see'), name: 'Ratzeburger See', type: 'lake',
    latitude: 53.7080, longitude: 10.7750, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Brassen'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten in Ratzeburg. Bootsangeln möglich.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Schleppfischen', 'Ansitz'], specialRules: 'Grenzgebiet zu MV. Klares Wasser = gute Sichtangelei.' },
    max_depth: 24.0, surface_area: 14.3,
  },
  {
    id: md5Uuid('sh-nok-rendsburg'), name: 'Nord-Ostsee-Kanal bei Rendsburg', type: 'canal',
    latitude: 54.3040, longitude: 9.6660, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Brassen', 'Dorsch'],
    permit_price: 0.00, requires_permit: true, permit_type: 'free',
    permit_url: 'https://www.lsfv-sh.de/',
    permit_info: 'Frei mit Fischereischein SH! Kein Zusatzschein nötig. Bundeswasserstraße.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45, Dorsch: 38 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Bundeswasserstraße: Schiffsverkehr beachten! Wellengang bei Passage. Dorsch im Winter möglich.' },
    pegel_station: 'NOK RENDSBURG', river_segment: 'Rendsburg-Kiel',
  },
  {
    id: md5Uuid('sh-eider-friedrichstadt'), name: 'Eider bei Friedrichstadt', type: 'river',
    latitude: 54.3710, longitude: 9.0860, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander', 'Meerforelle'],
    permit_price: 8.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'LSFV-SH Gastschein oder lokaler Angelverein.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Meerforelle: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz'], specialRules: 'Tidebereich unterhalb Nordfeld. Meerforelle Saison beachten.' },
    pegel_station: 'FRIEDRICHSTADT STRASSENBRÜCKE',
  },
  {
    id: md5Uuid('sh-trave-luebeck'), name: 'Trave bei Lübeck', type: 'river',
    latitude: 53.8690, longitude: 10.6870, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander', 'Meerforelle'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.lsfv-sh.de/',
    permit_info: 'LSFV-SH Gastschein. Brackwasserbereich in Lübeck.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45, Meerforelle: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Brackwasser = Dorsch und Meerforelle möglich. Tidebereich.' },
  },
  // ── BATCH 1: OSTSEE ──
  {
    id: md5Uuid('sh-fehmarn-wallnau'), name: 'Fehmarn (Wallnau)', type: 'coast',
    latitude: 54.4440, longitude: 11.0120, region: 'Schleswig-Holstein',
    fish_species: ['Meerforelle', 'Dorsch', 'Hornhecht', 'Plattfisch', 'Hering'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.lsfv-sh.de/',
    permit_info: 'SH Fischereiabgabe (Online 10€/Jahr). Top-Meerforellen-Insel!',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Meerforelle: 40, Dorsch: 38 }, dailyLimit: 5, nightFishing: true, allowedMethods: ['Spinnfischen', 'Fliegenfischen', 'Brandungsangeln'], specialRules: 'Top-Meerforellen-Revier! Watfischen im Winter. Wind und Wassertrübung beachten.' },
  },
  {
    id: md5Uuid('sh-kieler-foerde'), name: 'Kieler Förde', type: 'coast',
    latitude: 54.3670, longitude: 10.1620, region: 'Schleswig-Holstein',
    fish_species: ['Dorsch', 'Meerforelle', 'Hering', 'Plattfisch', 'Hornhecht', 'Makrele'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.lsfv-sh.de/',
    permit_info: 'SH Fischereiabgabe. Angelkutter ab Laboe/Heikendorf.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Dorsch: 38, Meerforelle: 40 }, dailyLimit: 5, nightFishing: true, allowedMethods: ['Pilken', 'Brandungsangeln', 'Spinnfischen'], specialRules: 'Dorschquote beachten (5/Tag). Heringssaison März-April. Kutterfahrten sehr beliebt.' },
  },
  // ── BATCH 1: Weitere NDS Gewässer ──
  {
    id: md5Uuid('nds-weser-nienburg'), name: 'Weser bei Nienburg', type: 'river',
    latitude: 52.6380, longitude: 9.2050, region: 'Niedersachsen',
    fish_species: ['Zander', 'Hecht', 'Barsch', 'Aal', 'Döbel', 'Brassen', 'Rapfen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'AVN-Gastschein. Top-Zanderfluss, besonders im Herbst.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Zander: 45, Hecht: 50 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Grundangeln', 'Ansitz'], specialRules: 'Buhnenköpfe sind Hotspots. Rapfen im Sommer an der Oberfläche.' },
    pegel_station: 'NIENBURG', river_segment: 'Nienburg-Verden',
  },
  {
    id: md5Uuid('nds-leine-hannover'), name: 'Leine bei Hannover', type: 'river',
    latitude: 52.3680, longitude: 9.7300, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Döbel', 'Aal', 'Forelle', 'Barbe'],
    permit_price: 8.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Stadtfischereischein Hannover oder AVN-Gastschein.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Barbe: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Fliegenfischen'], specialRules: 'Innenstadtbereich: C&R für Hecht empfohlen. Barben im Ihme-Zufluss.' },
    pegel_station: 'HERRENHAUSEN',
  },
  {
    id: md5Uuid('nds-mlk-braunschweig'), name: 'Mittellandkanal bei Braunschweig', type: 'canal',
    latitude: 52.2800, longitude: 10.5300, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal', 'Brassen'],
    permit_price: 0.00, requires_permit: true, permit_type: 'free',
    permit_info: 'Frei mit Fischereischein! Bundeswasserstraße, kein Zusatzschein nötig.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Bundeswasserstraße: kostenlos! Guter Zanderbestand. Spundwände sind Hotspots.' },
    river_segment: 'Braunschweig-Wolfsburg',
  },
  {
    id: md5Uuid('nds-ilmenau-lueneburg'), name: 'Ilmenau bei Lüneburg', type: 'river',
    latitude: 53.2470, longitude: 10.4080, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Aal', 'Döbel', 'Forelle', 'Äsche'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Gastschein beim AV Lüneburg oder online bei angelkarten.online',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Äsche: 35 }, dailyLimit: 2, nightFishing: true, allowedMethods: ['Spinnfischen', 'Fliegenfischen', 'Ansitz'], specialRules: 'Einer der besten Äschenflüsse in NDS. Schonend behandeln!' },
    pegel_station: 'LÜNE',
  },
  // ── BATCH 1: Sonder-Spots ──
  {
    id: md5Uuid('nds-forellensee-sproetze'), name: 'Forellensee Sprötze', type: 'pond',
    latitude: 53.3950, longitude: 9.8350, region: 'Niedersachsen',
    fish_species: ['Regenbogenforelle', 'Forelle', 'Saibling', 'Stör'],
    permit_price: 25.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.forellensee-sproetze.de/',
    permit_info: 'Tageskarten vor Ort. Put & Take Betrieb. Regelmäßiger Besatz.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { dailyLimit: 5, nightFishing: false, allowedMethods: ['Spinnfischen', 'Ansitz', 'Fliegenfischen'], specialRules: 'Put & Take: Regelmäßiger Besatz. 5er Tageslimit. Familienfreundlich.' },
    max_depth: 4.0,
  },
  {
    id: md5Uuid('nds-angelpark-thuelsfelde'), name: 'Angelpark Thülsfeld', type: 'pond',
    latitude: 52.8560, longitude: 8.0320, region: 'Niedersachsen',
    fish_species: ['Karpfen', 'Stör', 'Regenbogenforelle', 'Wels', 'Schleie'],
    permit_price: 30.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.angelpark-thuelsfeld.de/',
    permit_info: 'Tageskarten vor Ort. 3 Teiche mit unterschiedlichem Besatz.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { dailyLimit: 3, nightFishing: false, allowedMethods: ['Ansitz', 'Grundangeln'], specialRules: 'Karpfenteich, Forellenteich, Störteich. Ideal für Einsteiger und Familien.' },
  },
];

async function seed() {
  console.log(`🌱 Seeding ${spots.length} Spots zu Supabase...`);
  
  let success = 0;
  let errors = 0;
  
  for (const spot of spots) {
    const { error } = await supabase
      .from('water_bodies')
      .upsert(spot, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ ${spot.name}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ ${spot.name}`);
      success++;
    }
  }
  
  console.log(`\n📊 Ergebnis: ${success} erfolgreich, ${errors} Fehler`);
  
  // Verify
  const { count } = await supabase
    .from('water_bodies')
    .select('*', { count: 'exact', head: true })
    .eq('data_source', 'curated');
  
  console.log(`📈 Kuratierte Spots in DB: ${count}`);
}

seed().catch(console.error);
