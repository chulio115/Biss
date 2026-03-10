#!/usr/bin/env node
/**
 * Seed Batch 2: 30+ weitere kuratierte Spots
 * Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-batch2.js
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://ufligmprfiqteshotxhf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY nicht gesetzt!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function md5Uuid(input) {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;
}

const spots = [
  // ═══ NIEDERSACHSEN — Weitere Seen ═══
  {
    id: md5Uuid('nds-zwischenahner-meer'), name: 'Zwischenahner Meer', type: 'lake',
    latitude: 53.1840, longitude: 8.0000, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Schleie', 'Brassen'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.angelsport-zwischenahn.de/',
    permit_info: 'Tageskarten bei Angelgeschäften in Bad Zwischenahn. Bootsangeln möglich.',
    permit_contact: 'Angelsportverein Bad Zwischenahn e.V.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45, Karpfen: 35 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln', 'Bootsangeln'], specialRules: 'Bootsangeln erlaubt. Guter Aalbestand.' },
    max_depth: 5.5, surface_area: 5.5,
  },
  {
    id: md5Uuid('nds-bederkesaer-see'), name: 'Bederkesaer See', type: 'lake',
    latitude: 53.6230, longitude: 8.8320, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Schleie'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten im Angelgeschäft Bad Bederkesa oder Tourist-Info.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Schöner Moorsee im Elbe-Weser-Dreieck. Guter Hechtbestand.' },
    max_depth: 6.0, surface_area: 1.2,
  },
  {
    id: md5Uuid('nds-seeburger-see'), name: 'Seeburger See', type: 'lake',
    latitude: 51.5680, longitude: 10.1720, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Aal', 'Brassen'],
    permit_price: 8.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten am See erhältlich. Naturschutzgebiet teilweise.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Karpfen: 35 }, dailyLimit: 3, nightFishing: false, allowedMethods: ['Ansitz', 'Spinnfischen'], specialRules: 'Größter natürlicher See in Südniedersachsen. Naturschutzgebiet beachten.' },
    max_depth: 2.5, surface_area: 0.84,
  },
  {
    id: md5Uuid('nds-thuelsfelde-stausee'), name: 'Thülsfelder Talsperre', type: 'lake',
    latitude: 52.8450, longitude: 8.0550, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal', 'Brassen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten beim ASV Cloppenburg. Bootsangeln eingeschränkt.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Größte Talsperre im Oldenburger Münsterland. Guter Zanderbestand.' },
    max_depth: 10.0, surface_area: 1.8,
  },
  {
    id: md5Uuid('nds-alfsee'), name: 'Alfsee', type: 'lake',
    latitude: 52.4350, longitude: 7.9680, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal', 'Wels'],
    permit_price: 15.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten am Campingplatz Alfsee oder online.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45, Wels: 70 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Hochwasserrückhaltebecken. Guter Welsbestand. Campingplatz direkt am See.' },
    max_depth: 8.0, surface_area: 2.2,
  },
  // ═══ NIEDERSACHSEN — Weitere Flüsse ═══
  {
    id: md5Uuid('nds-weser-hameln'), name: 'Weser bei Hameln', type: 'river',
    latitude: 52.1040, longitude: 9.3570, region: 'Niedersachsen',
    fish_species: ['Zander', 'Hecht', 'Barsch', 'Aal', 'Döbel', 'Rapfen', 'Brassen', 'Wels'],
    permit_price: 15.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Gastscheine beim Anglerverein Hameln oder online über den AVN.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45, Rapfen: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Top-Zanderfluss! Buhnen und Steinpackungen sind Hotspots. Wehre beachten.' },
    pegel_station: 'HAMELN WEHRBERGEN',
  },
  {
    id: md5Uuid('nds-leine-hannover'), name: 'Leine in Hannover', type: 'river',
    latitude: 52.3760, longitude: 9.7370, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Döbel', 'Aal', 'Forelle', 'Barbe', 'Rapfen'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Stadtfischereischein Hannover. Auch online bestellbar.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Barbe: 35, Rapfen: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Fliegenfischen', 'Ansitz'], specialRules: 'Stadtfischerei in Hannover. Barben an Wehren. Nachts Zander möglich.' },
    pegel_station: 'HERRENHAUSEN',
  },
  {
    id: md5Uuid('nds-ems-lingen'), name: 'Ems bei Lingen', type: 'river',
    latitude: 52.5220, longitude: 7.3180, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Angelkarten beim ASV Lingen oder online.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Ruhiger Fluss, guter Bestand. Altarme sind Hotspots für Hecht.' },
    pegel_station: 'LINGEN-DARME',
  },
  {
    id: md5Uuid('nds-hunte-oldenburg'), name: 'Hunte bei Oldenburg', type: 'river',
    latitude: 53.1370, longitude: 8.2080, region: 'Niedersachsen',
    fish_species: ['Hecht', 'Barsch', 'Aal', 'Döbel', 'Brassen', 'Zander'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Gastschein beim ASV Oldenburg oder online.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Guter Mischbestand. Mündungsbereich hat Tideeinfluss.' },
    pegel_station: 'OLDENBURG-DRIELAKE',
  },
  {
    id: md5Uuid('nds-elbe-seitenkanal'), name: 'Elbe-Seitenkanal', type: 'canal',
    latitude: 53.1500, longitude: 10.4200, region: 'Niedersachsen',
    fish_species: ['Zander', 'Hecht', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
    permit_price: 0.00, requires_permit: true, permit_type: 'free',
    permit_info: 'Bundeswasserstraße: kostenlos mit Fischereischein! 115 km Kanalstrecke.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Kostenlos! Top-Zanderkanal. Schleusen sind Hotspots. Berufsschifffahrt beachten.' },
  },
  // ═══ NIEDERSACHSEN — Forellengewässer ═══
  {
    id: md5Uuid('nds-seeve-jesteburg'), name: 'Seeve bei Jesteburg', type: 'river',
    latitude: 53.3100, longitude: 9.9600, region: 'Niedersachsen',
    fish_species: ['Forelle', 'Barsch', 'Döbel', 'Aal', 'Meerforelle'],
    permit_price: 15.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Limitierte Tageskarten beim Seeve-Fischerei-Verein. Frühzeitig reservieren!',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Forelle: 25, Meerforelle: 40 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Fliegenfischen', 'Spinnfischen'], specialRules: 'Top-Forellenbach in der Nordheide! Schonender Umgang Pflicht. C&R für Meerforelle.' },
    pegel_station: 'BUXTEHUDE',
  },
  {
    id: md5Uuid('nds-luhe-winsen'), name: 'Luhe bei Winsen', type: 'river',
    latitude: 53.3530, longitude: 10.2050, region: 'Niedersachsen',
    fish_species: ['Forelle', 'Barsch', 'Hecht', 'Aal', 'Döbel'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten beim Anglerverein Winsen/Luhe.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'manual',
    regulations: { minSizes: { Forelle: 25, Hecht: 50 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Fliegenfischen', 'Spinnfischen', 'Ansitz'], specialRules: 'Heidefließgewässer. Forellen- und Hechtbestand. Schonende Watfischerei.' },
  },
  {
    id: md5Uuid('nds-boehme-soltau'), name: 'Böhme bei Soltau', type: 'river',
    latitude: 52.9850, longitude: 9.8400, region: 'Niedersachsen',
    fish_species: ['Forelle', 'Äsche', 'Döbel', 'Barsch', 'Hecht'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten beim ASV Soltau oder online.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Forelle: 25, Äsche: 30 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Fliegenfischen', 'Spinnfischen'], specialRules: 'Heide-Juwel! Top-Äschenbestand. Fliegenfischen bevorzugt. C&R für Äschen empfohlen.' },
  },
  // ═══ HAMBURG — Weitere Spots ═══
  {
    id: md5Uuid('hh-elbe-hafen'), name: 'Elbe Hamburg (Hafen)', type: 'river',
    latitude: 53.5350, longitude: 9.9700, region: 'Hamburg',
    fish_species: ['Zander', 'Barsch', 'Hecht', 'Aal', 'Brassen', 'Rapfen'],
    permit_price: 0.00, requires_permit: true, permit_type: 'free',
    permit_info: 'Kostenlos mit HH Fischereischein! Elbe ist Bundeswasserstraße.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Kostenlos! Tidebereich: Gezeitenabhängig fischen. Hafenbecken gesperrt. Steinpackungen sind Hotspots.' },
    pegel_station: 'HAMBURG ST. PAULI',
  },
  {
    id: md5Uuid('hh-wandse'), name: 'Wandse', type: 'river',
    latitude: 53.5760, longitude: 10.0850, region: 'Hamburg',
    fish_species: ['Forelle', 'Barsch', 'Döbel', 'Aal'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'HSB-Tageskarte.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'manual',
    regulations: { minSizes: { Forelle: 25 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Fliegenfischen', 'Spinnfischen'], specialRules: 'Kleiner Stadtbach. Naturnahe Forellengewässer mitten in Hamburg.' },
  },
  {
    id: md5Uuid('hh-bille'), name: 'Bille', type: 'river',
    latitude: 53.5270, longitude: 10.1310, region: 'Hamburg',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'HSB-Tageskarte. Stadtgewässer HH-Bergedorf.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 50, Zander: 45 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Spinnfischen', 'Ansitz'], specialRules: 'Stadtfluss durch Bergedorf. Guter Hechtbestand in den Altarmen.' },
  },
  {
    id: md5Uuid('hh-eichbaumsee'), name: 'Eichbaumsee', type: 'lake',
    latitude: 53.4750, longitude: 10.1650, region: 'Hamburg',
    fish_species: ['Karpfen', 'Hecht', 'Barsch', 'Schleie', 'Aal'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'HSB-Tageskarte. Beliebter Baggersee im Osten Hamburgs.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'manual',
    regulations: { minSizes: { Hecht: 50, Karpfen: 35 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Ansitz', 'Spinnfischen'], specialRules: 'Baggersee. Guter Karpfenbestand. Im Sommer Badebereich meiden.' },
  },
  // ═══ SCHLESWIG-HOLSTEIN — Weitere Seen ═══
  {
    id: md5Uuid('sh-selenter-see'), name: 'Selenter See', type: 'lake',
    latitude: 54.2780, longitude: 10.5510, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Maräne'],
    permit_price: 14.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten beim Angelgeschäft in Selent oder online.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 45, Zander: 40, Maräne: 25 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Schleppfischen', 'Ansitz'], specialRules: 'Drittgrößter See in SH. Bootsangeln erlaubt. Tiefe Rinnen für Zander.' },
    max_depth: 36.0, surface_area: 22.4,
  },
  {
    id: md5Uuid('sh-einfelder-see'), name: 'Einfelder See', type: 'lake',
    latitude: 54.1060, longitude: 9.9750, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Aal', 'Karpfen', 'Schleie', 'Brassen'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten beim Anglerverein Einfeld. Auch Bootsangeln.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 45, Karpfen: 35 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Beliebter Naherholungssee bei Neumünster. Badebereich meiden.' },
    max_depth: 8.0, surface_area: 1.3,
  },
  {
    id: md5Uuid('sh-westensee'), name: 'Westensee', type: 'lake',
    latitude: 54.2500, longitude: 9.8800, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Maräne'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten beim Fischereiverein Westensee. Bootsangeln sehr empfehlenswert.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 45, Zander: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Bootsangeln', 'Schleppfischen'], specialRules: 'Einer der besten Raubfischseen in SH! Trolling-Hotspot. Maränenbestand.' },
    max_depth: 25.0, surface_area: 7.3,
  },
  // ═══ SCHLESWIG-HOLSTEIN — Flüsse & Kanäle ═══
  {
    id: md5Uuid('sh-trave-luebeck'), name: 'Trave bei Lübeck', type: 'river',
    latitude: 53.8660, longitude: 10.6860, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Brassen', 'Meerforelle'],
    permit_price: 12.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Gastscheine beim LSFV-SH oder Angelgeschäften in Lübeck.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 45, Zander: 40, Meerforelle: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Tidebereich ab Lübeck. Meerforellen im Herbst. Zanderangeln an Brücken.' },
    pegel_station: 'LÜBECK-BAUHOF',
  },
  {
    id: md5Uuid('sh-eider-rendsburg'), name: 'Eider bei Rendsburg', type: 'river',
    latitude: 54.3060, longitude: 9.6640, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Zander', 'Aal', 'Brassen', 'Meerforelle'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten über den Kreissportfischerverband Rendsburg.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 45, Zander: 40, Meerforelle: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Einer der wichtigsten Meerforellenflüsse in SH. Laichschonstrecken beachten!' },
    pegel_station: 'LEXFÄHRE OBERWASSER',
  },
  {
    id: md5Uuid('sh-stoer-kellinghusen'), name: 'Stör bei Kellinghusen', type: 'river',
    latitude: 53.9490, longitude: 9.7140, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander', 'Meerforelle'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Gastscheine beim SAV Kellinghusen oder LSFV-SH.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 45, Zander: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Tidefluss. Guter Hechtbestand. Schleusen sind Hotspots für Zander.' },
    pegel_station: 'BREITENBERG',
  },
  {
    id: md5Uuid('sh-schwentine-kiel'), name: 'Schwentine bei Kiel', type: 'river',
    latitude: 54.2700, longitude: 10.1800, region: 'Schleswig-Holstein',
    fish_species: ['Forelle', 'Meerforelle', 'Barsch', 'Hecht', 'Döbel'],
    permit_price: 10.00, requires_permit: true, permit_type: 'day_permit',
    permit_info: 'Tageskarten über den Kreissportfischerverband Kiel.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Forelle: 25, Meerforelle: 40, Hecht: 45 }, dailyLimit: 2, nightFishing: false, allowedMethods: ['Fliegenfischen', 'Spinnfischen'], specialRules: 'Verbindet Holsteinische Seenplatte mit der Kieler Förde. Top-Meerforellenstrecke!' },
  },
  {
    id: md5Uuid('sh-elbe-luebeck-kanal-buechen'), name: 'Elbe-Lübeck-Kanal (Büchen)', type: 'canal',
    latitude: 53.4780, longitude: 10.6160, region: 'Schleswig-Holstein',
    fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
    permit_price: 0.00, requires_permit: true, permit_type: 'free',
    permit_info: 'Bundeswasserstraße: frei mit Fischereischein! 62 km Kanalstrecke.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { minSizes: { Hecht: 45, Zander: 40 }, dailyLimit: 3, nightFishing: true, allowedMethods: ['Spinnfischen', 'Ansitz', 'Grundangeln'], specialRules: 'Kostenlos! Guter Zanderbestand. Schleusen sind Hotspots. Berufsschifffahrt beachten.' },
  },
  // ═══ BESONDERE SPOTS ═══
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
    id: md5Uuid('sh-forellensee-damsdorf'), name: 'Forellensee Damsdorf', type: 'pond',
    latitude: 54.1350, longitude: 10.2450, region: 'Schleswig-Holstein',
    fish_species: ['Regenbogenforelle', 'Forelle', 'Saibling', 'Stör', 'Lachsforelle'],
    permit_price: 22.00, requires_permit: true, permit_type: 'day_permit',
    permit_url: 'https://www.forellensee-damsdorf.de/',
    permit_info: 'Tageskarten vor Ort. Einer der beliebtesten Put&Take Seen in SH.',
    is_assumed: false, data_source: 'curated', fish_species_confirmed: true, fish_species_source: 'official',
    regulations: { dailyLimit: 5, nightFishing: false, allowedMethods: ['Spinnfischen', 'Ansitz', 'Fliegenfischen'], specialRules: 'Put & Take. Regelmäßig besetzt. Auch Nachtangel-Events.' },
    max_depth: 5.0,
  },
];

async function seed() {
  console.log(`🌱 Seeding Batch 2: ${spots.length} Spots zu Supabase...`);
  
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
  
  const { count } = await supabase
    .from('water_bodies')
    .select('*', { count: 'exact', head: true })
    .eq('data_source', 'curated');
  
  console.log(`📈 Kuratierte Spots in DB: ${count}`);
}

seed().catch(console.error);
