-- ═══════════════════════════════════════════════════════════════════════════════
-- BISS Top-Spots Seed Data — Kuratierte Angelgewässer Norddeutschland
-- ═══════════════════════════════════════════════════════════════════════════════
-- Echte Permit-Daten, verifizierte Fischarten, Regulations
-- Quellen: Landesfischereiverband NDS, LSFV-SH, AVN, hejfish.com, angelkarten.online
-- 
-- WICHTIG: Erst spot_data_v2.sql Migration ausführen!
-- IDs: md5()::uuid für deterministische, idempotente UUIDs
-- Spalten: requires_permit (nicht permit_required), data_source (v2 Migration)
-- Run in Supabase SQL Editor

-- ═══ NIEDERSACHSEN — Seen & Teiche ═══

-- Steinhuder Meer (größter See NDS)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, permit_contact, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-steinhuder-meer')::uuid, 'Steinhuder Meer', 'lake',
  52.4563, 9.3310, 'Niedersachsen',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Schleie', 'Brassen', 'Rotauge'],
  15.00, true, 'day_permit',
  'https://www.fischerei-steinhuder-meer.de/',
  'Tageskarten bei Angelgeschäften rund ums Meer. Nachtangeln separat.',
  'Fischereigenossenschaft Steinhuder Meer',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45, "Karpfen": 35}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Max. 2 Ruten. Karpfen C&R empfohlen."}'::jsonb,
  2.9, 29.1
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price,
  permit_type = EXCLUDED.permit_type,
  permit_url = EXCLUDED.permit_url,
  permit_info = EXCLUDED.permit_info,
  regulations = EXCLUDED.regulations,
  fish_species = EXCLUDED.fish_species,
  fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Dümmer See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, permit_contact, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-duemmer-see')::uuid, 'Dümmer See', 'lake',
  52.5150, 8.3650, 'Niedersachsen',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Brassen', 'Rotauge', 'Karpfen'],
  12.00, true, 'day_permit',
  'https://www.anglerverband-niedersachsen.de/',
  'Tageskarten bei Bootsvermietungen und Campingplätzen am Dümmer.',
  'Anglerverband Niedersachsen e.V.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": false, "allowedMethods": ["Spinnfischen", "Ansitz"], "specialRules": "Naturschutzgebiet: Teile gesperrt. Bootsangeln erlaubt."}'::jsonb,
  1.5, 13.5
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Zwischenahner Meer
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, permit_contact, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-zwischenahner-meer')::uuid, 'Zwischenahner Meer', 'lake',
  53.2380, 8.0060, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Aal', 'Zander', 'Karpfen', 'Brassen'],
  12.00, true, 'day_permit',
  'https://www.av-zwischenahn.de/',
  'Tageskarten beim Angelverein Bad Zwischenahn.',
  'AV Bad Zwischenahn',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Schleppfischen"], "specialRules": "Bootsangeln mit Elektro- oder Ruderboot."}'::jsonb,
  5.5, 5.5
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Maschsee Hannover
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, permit_contact, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-maschsee-hannover')::uuid, 'Maschsee', 'lake',
  52.3510, 9.7380, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Karpfen', 'Aal', 'Brassen'],
  10.00, true, 'day_permit',
  NULL,
  'Tageskarten bei Angel-Ussat Hannover. Nur Uferangeln.',
  'Fischereiverein Hannover e.V.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Ansitz", "Spinnfischen"], "specialRules": "Kein Bootsangeln. Nur mit Stadtfischereischein."}'::jsonb,
  2.4, 0.78
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Forellenhof Bendestorf (nahe am User!)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('nds-forellenhof-bendestorf')::uuid, 'Forellenhof Bendestorf', 'pond',
  53.3395, 9.9785, 'Niedersachsen',
  ARRAY['Forelle', 'Saibling', 'Karpfen'],
  25.00, true, 'day_permit',
  NULL,
  'Direkt vor Ort. Keine Fischereischeinpflicht für Forellen-Teich.',
  false, 'curated', true, 'manual',
  '{"dailyLimit": 5, "nightFishing": false, "allowedMethods": ["Ansitz", "Posenangeln"], "specialRules": "Gefangene Forellen müssen mitgenommen werden. Kein C&R."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Angelteich Jesteburg
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('nds-angelteich-jesteburg')::uuid, 'Angelteich Jesteburg', 'pond',
  53.3035, 9.9618, 'Niedersachsen',
  ARRAY['Forelle', 'Karpfen', 'Schleie'],
  20.00, true, 'day_permit',
  'Tageskarten an der Hütte. Forellenpuff, familienfreundlich.',
  false, 'curated', true, 'manual',
  '{"dailyLimit": 4, "nightFishing": false, "allowedMethods": ["Ansitz", "Posenangeln"], "specialRules": "Kinder unter 14 in Begleitung."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ NIEDERSACHSEN — Flüsse ═══

-- Elbe (Stade-Abschnitt)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station, river_segment)
VALUES (
  md5('nds-elbe-stade')::uuid, 'Elbe bei Stade', 'river',
  53.5960, 9.4760, 'Niedersachsen',
  ARRAY['Zander', 'Aal', 'Hecht', 'Barsch', 'Brassen', 'Rapfen', 'Wels'],
  15.00, true, 'day_permit',
  'https://www.anglerverband-niedersachsen.de/',
  'AVN-Mitgliedschaft oder Gastschein. Tidebereich beachten!',
  false, 'curated', true, 'official',
  '{"minSizes": {"Zander": 45, "Hecht": 50, "Aal": 50}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Grundangeln", "Ansitz"], "specialRules": "Tidebereich: Gezeiten beachten. Beste Zeit bei ablaufendem Wasser."}'::jsonb,
  'STADERSAND', 'Stade-Jork'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Aller (Celle-Abschnitt)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station, river_segment)
VALUES (
  md5('nds-aller-celle')::uuid, 'Aller bei Celle', 'river',
  52.6240, 10.0810, 'Niedersachsen',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Döbel', 'Barbe'],
  10.00, true, 'day_permit',
  'Gastschein beim Anglerverein Celle. Auch online verfügbar.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Guter Zanderfluss. Beste Stellen bei Celle-Burg."}'::jsonb,
  'CELLE', 'Celle-Winsen'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Oste (Bremervörde)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-oste-bremervoerde')::uuid, 'Oste bei Bremervörde', 'river',
  53.4890, 9.1410, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Aal', 'Zander', 'Brassen', 'Meerforelle'],
  12.00, true, 'day_permit',
  'Gastschein SAV Oste-Hamme. Top-Hechtgewässer!',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Meerforelle": 60}, "dailyLimit": 2, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz"], "specialRules": "Meerforelle: Saison Apr-Okt. Einer der besten Hechtflüsse in NDS."}'::jsonb,
  'BREMERVÖRDE UW'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Seeve (lokal bei Bendestorf)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('nds-seeve-jesteburg')::uuid, 'Seeve bei Jesteburg', 'river',
  53.3120, 9.9680, 'Niedersachsen',
  ARRAY['Forelle', 'Barsch', 'Döbel', 'Aal'],
  0.00, true, 'club_only',
  'Vereinsgewässer SAV Seevetal. Mitgliedschaft erforderlich.',
  false, 'curated', true, 'manual',
  '{"minSizes": {"Forelle": 30}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Fliegenfischen", "Spinnfischen"], "specialRules": "Kleiner Forellenbach. Schonend behandeln, C&R erwünscht."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ HAMBURG ═══

-- Alster (Außenalster)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('hh-aussenalster')::uuid, 'Außenalster', 'lake',
  53.5720, 9.9980, 'Hamburg',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen'],
  10.00, true, 'day_permit',
  'https://www.hamburger-sportangler.de/',
  'Hamburger Sportangler-Bund Tageskarte. Auch Alsterkanäle abgedeckt.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Spinnfischen", "Ansitz"], "specialRules": "Bootsangeln nur mit HSB-Karte. Ruderer/SUP haben Vorfahrt."}'::jsonb,
  4.5, 1.6
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Dove-Elbe
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('hh-dove-elbe')::uuid, 'Dove-Elbe', 'river',
  53.4680, 10.1560, 'Hamburg',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
  10.00, true, 'day_permit',
  'https://www.hamburger-sportangler.de/',
  'HSB-Tageskarte. Ruhiges Gewässer, top für Raubfisch.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Regattastrecke: bei Events gesperrt. Sehr guter Zanderbestand."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Öjendorfer See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('hh-oejendorfer-see')::uuid, 'Öjendorfer See', 'lake',
  53.5470, 10.1150, 'Hamburg',
  ARRAY['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Brassen'],
  10.00, true, 'day_permit',
  'HSB-Tageskarte. Beliebter See im Osten Hamburgs.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Ansitz", "Spinnfischen"], "specialRules": "Nur Uferangeln. Parkplatz am Südende."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Boberger See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('hh-boberger-see')::uuid, 'Boberger See', 'lake',
  53.4930, 10.1380, 'Hamburg',
  ARRAY['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Aal'],
  10.00, true, 'day_permit',
  'HSB-Tageskarte. Naturschutzgebiet, nur bestimmte Uferbereiche.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Ansitz"], "specialRules": "Naturschutzgebiet Boberger Niederung. Markierte Angelplätze nutzen."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ SCHLESWIG-HOLSTEIN ═══

-- Großer Plöner See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('sh-grosser-ploener-see')::uuid, 'Großer Plöner See', 'lake',
  54.1480, 10.4220, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Maräne', 'Karpfen', 'Brassen'],
  15.00, true, 'day_permit',
  'https://www.fischereigenossenschaft-ploener-seen.de/',
  'Tageskarten bei Bootsvermietungen. Bootsangeln empfohlen. Größter See in SH.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45, "Maräne": 30}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Schleppfischen", "Ansitz"], "specialRules": "Bestes Zandergewässer in SH. Boots-Schleppangeln sehr erfolgreich."}'::jsonb,
  58.0, 28.4
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Ratzeburger See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('sh-ratzeburger-see')::uuid, 'Ratzeburger See', 'lake',
  53.7080, 10.7750, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Brassen'],
  12.00, true, 'day_permit',
  'Tageskarten in Ratzeburg. Bootsangeln möglich.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Schleppfischen", "Ansitz"], "specialRules": "Grenzgebiet zu MV. Klares Wasser = gute Sichtangelei."}'::jsonb,
  24.0, 14.3
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Nord-Ostsee-Kanal (Rendsburg)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station, river_segment)
VALUES (
  md5('sh-nok-rendsburg')::uuid, 'Nord-Ostsee-Kanal bei Rendsburg', 'canal',
  54.3040, 9.6660, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Brassen', 'Dorsch'],
  0.00, true, 'free',
  'https://www.lsfv-sh.de/',
  'Frei mit Fischereischein SH! Kein Zusatzschein nötig. Bundeswasserstraße.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45, "Dorsch": 38}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Bundeswasserstraße: Schiffsverkehr beachten! Wellengang bei Passage. Dorsch im Winter möglich."}'::jsonb,
  'NOK RENDSBURG', 'Rendsburg-Kiel'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Eider (Rendsburg-Friedrichstadt)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('sh-eider-friedrichstadt')::uuid, 'Eider bei Friedrichstadt', 'river',
  54.3710, 9.0860, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander', 'Meerforelle'],
  8.00, true, 'day_permit',
  'LSFV-SH Gastschein oder lokaler Angelverein.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Meerforelle": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz"], "specialRules": "Tidebereich unterhalb Nordfeld. Meerforelle Saison beachten."}'::jsonb,
  'FRIEDRICHSTADT STRASSENBRÜCKE'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Trave (Lübeck)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('sh-trave-luebeck')::uuid, 'Trave bei Lübeck', 'river',
  53.8690, 10.6870, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander', 'Meerforelle'],
  10.00, true, 'day_permit',
  'https://www.lsfv-sh.de/',
  'LSFV-SH Gastschein. Stadtgebiet Lübeck teilweise frei.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Kanal-Abschnitte oft besser als Hauptfluss. Meerforelle im Oberlauf."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Westensee
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('sh-westensee')::uuid, 'Westensee', 'lake',
  54.2600, 9.8730, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Maräne', 'Brassen'],
  12.00, true, 'day_permit',
  'Tageskarten bei der Fischereigenossenschaft Westensee.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Schleppfischen", "Ansitz"], "specialRules": "Beliebter Hechtsse nahe Kiel."}'::jsonb,
  25.0, 7.2
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ NIEDERSACHSEN — Weitere wichtige Gewässer ═══

-- Weser (Nienburg-Abschnitt)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station, river_segment)
VALUES (
  md5('nds-weser-nienburg')::uuid, 'Weser bei Nienburg', 'river',
  52.6380, 9.2050, 'Niedersachsen',
  ARRAY['Zander', 'Hecht', 'Barsch', 'Aal', 'Döbel', 'Brassen', 'Rapfen'],
  10.00, true, 'day_permit',
  'AVN-Gastschein. Top-Zanderfluss, besonders im Herbst.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Zander": 45, "Hecht": 50}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Grundangeln", "Ansitz"], "specialRules": "Buhnenköpfe sind Hotspots. Rapfen im Sommer an der Oberfläche."}'::jsonb,
  'NIENBURG', 'Nienburg-Verden'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Leine (Hannover)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-leine-hannover')::uuid, 'Leine bei Hannover', 'river',
  52.3680, 9.7300, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Döbel', 'Aal', 'Forelle', 'Barbe'],
  8.00, true, 'day_permit',
  'Stadtfischereischein Hannover oder AVN-Gastschein.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Barbe": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Fliegenfischen"], "specialRules": "Innenstadtbereich: C&R für Hecht empfohlen. Barben im Ihme-Zufluss."}'::jsonb,
  'HERRENHAUSEN'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Mittellandkanal (Braunschweig)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, river_segment)
VALUES (
  md5('nds-mlk-braunschweig')::uuid, 'Mittellandkanal bei Braunschweig', 'canal',
  52.2800, 10.5300, 'Niedersachsen',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal', 'Brassen'],
  0.00, true, 'free',
  'Frei mit Fischereischein! Bundeswasserstraße, kein Zusatzschein nötig.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Bundeswasserstraße: kostenlos! Guter Zanderbestand. Spundwände sind Hotspots."}'::jsonb,
  'Braunschweig-Wolfsburg'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Ilmenau (Lüneburg)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-ilmenau-lueneburg')::uuid, 'Ilmenau bei Lüneburg', 'river',
  53.2470, 10.4080, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Aal', 'Döbel', 'Forelle', 'Äsche'],
  10.00, true, 'day_permit',
  'Gastschein beim AV Lüneburg oder online bei angelkarten.online',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Äsche": 35}, "dailyLimit": 2, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Fliegenfischen", "Ansitz"], "specialRules": "Einer der besten Äschenflüsse in NDS. Schonend behandeln!"}'::jsonb,
  'LÜNE'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- ═══ Summary ═══
SELECT 
  region,
  type,
  COUNT(*) as spot_count,
  COUNT(CASE WHEN fish_species_confirmed THEN 1 END) as confirmed_species,
  COUNT(CASE WHEN permit_type IS NOT NULL THEN 1 END) as with_permit_info,
  COUNT(CASE WHEN pegel_station IS NOT NULL THEN 1 END) as with_pegel
FROM water_bodies 
WHERE data_source = 'curated'
GROUP BY region, type
ORDER BY region, type;
