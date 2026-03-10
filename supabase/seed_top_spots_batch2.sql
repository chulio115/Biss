-- ═══════════════════════════════════════════════════════════════════════════════
-- BISS Top-Spots Batch 2 — 30+ weitere kuratierte Angelgewässer
-- ═══════════════════════════════════════════════════════════════════════════════
-- WICHTIG: Erst spot_data_v2.sql Migration + seed_top_spots.sql ausführen!
-- Format identisch zu Batch 1: md5()::uuid, requires_permit, data_source='curated'

-- ═══ NIEDERSACHSEN — Weitere Seen ═══

-- Zwischenahner Meer (drittgrößter Binnensee NDS)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, permit_contact, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-zwischenahner-meer')::uuid, 'Zwischenahner Meer', 'lake',
  53.1840, 8.0000, 'Niedersachsen',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Schleie', 'Brassen'],
  12.00, true, 'day_permit',
  'https://www.angelsport-zwischenahn.de/',
  'Tageskarten bei Angelgeschäften in Bad Zwischenahn. Bootsangeln möglich.',
  'Angelsportverein Bad Zwischenahn e.V.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45, "Karpfen": 35}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln", "Bootsangeln"], "specialRules": "Bootsangeln erlaubt. Guter Aalbestand."}'::jsonb,
  5.5, 5.5
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Bederkesaer See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-bederkesaer-see')::uuid, 'Bederkesaer See', 'lake',
  53.6270, 8.8310, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Aal', 'Brassen'],
  10.00, true, 'day_permit',
  'Tageskarten beim Angelsportverein Bederkesa. Bootsangeln möglich.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Karpfen": 35}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Bootsangeln"], "specialRules": "Schöner Natursee. Guter Hechtbestand im Herbst."}'::jsonb,
  6.0, 1.2
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Seeburger See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-seeburger-see')::uuid, 'Seeburger See', 'lake',
  51.5610, 10.1710, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Karpfen', 'Schleie', 'Aal', 'Brassen', 'Rotauge'],
  8.00, true, 'day_permit',
  'Tageskarten bei der Seeburger See Gaststätte. Naturschutzgebiet beachten!',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Ansitz", "Grundangeln"], "specialRules": "NSG: nur von ausgewiesenen Stellen. Kein Bootsangeln."}'::jsonb,
  3.0, 0.84
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Tankumsee (Braunschweig)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('nds-tankumsee')::uuid, 'Tankumsee', 'lake',
  52.3550, 10.5350, 'Niedersachsen',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Aal', 'Schleie'],
  10.00, true, 'day_permit',
  'Tageskarten am Campingplatz oder beim AV Gifhorn.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Badesee: Abschnitte für Angler. Nachtangeln nur mit Karte."}'::jsonb,
  12.0, 0.6
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ NIEDERSACHSEN — Weitere Flüsse ═══

-- Oste (Bremervörde)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-oste-bremervoerde')::uuid, 'Oste bei Bremervörde', 'river',
  53.4850, 9.1400, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Aal', 'Zander', 'Brassen', 'Meerforelle'],
  12.00, true, 'day_permit',
  'Angelkarten beim SAV Bremervörde oder Angelgeschäft in der Innenstadt.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45, "Meerforelle": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Tideeinfluss! Meerforellen im Herbst/Winter. Fliegenstrecken beachten."}'::jsonb,
  'BREMERVÖRDE'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Weser (Hameln)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-weser-hameln')::uuid, 'Weser bei Hameln', 'river',
  52.1040, 9.3570, 'Niedersachsen',
  ARRAY['Zander', 'Hecht', 'Barsch', 'Aal', 'Döbel', 'Rapfen', 'Brassen', 'Wels'],
  15.00, true, 'day_permit',
  'Gastscheine beim ASV Hameln oder bei hejfish.com.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45, "Rapfen": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Top-Zanderfluss! Buhnen und Steinpackungen sind Hotspots. Wehre beachten."}'::jsonb,
  'HAMELN'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Leine (Hannover)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-leine-hannover')::uuid, 'Leine in Hannover', 'river',
  52.3760, 9.7370, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Döbel', 'Aal', 'Forelle', 'Barbe', 'Rapfen'],
  12.00, true, 'day_permit',
  'Gastschein beim Fischereiverein Hannover e.V.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Barbe": 35, "Rapfen": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Fliegenfischen", "Ansitz"], "specialRules": "Stadtfischerei in Hannover. Barben an Wehren. Nachts Zander möglich."}'::jsonb,
  'HERRENHAUSEN'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Ems (Lingen)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-ems-lingen')::uuid, 'Ems bei Lingen', 'river',
  52.5220, 7.3180, 'Niedersachsen',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
  10.00, true, 'day_permit',
  'Angelkarten beim ASV Lingen oder online.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Ruhiger Fluss, guter Bestand. Altarme sind Hotspots für Hecht."}'::jsonb,
  'LINGEN'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Hunte (Oldenburg)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-hunte-oldenburg')::uuid, 'Hunte bei Oldenburg', 'river',
  53.1370, 8.2080, 'Niedersachsen',
  ARRAY['Hecht', 'Barsch', 'Aal', 'Döbel', 'Brassen', 'Zander'],
  10.00, true, 'day_permit',
  'Tageskarten beim Sportfischerverein Oldenburg.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Guter Mischbestand. Mündungsbereich hat Tideeinfluss."}'::jsonb,
  'OLDENBURG'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Elbe-Seitenkanal
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('nds-elbe-seitenkanal')::uuid, 'Elbe-Seitenkanal', 'canal',
  53.1500, 10.4200, 'Niedersachsen',
  ARRAY['Zander', 'Hecht', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
  0.00, true, 'free',
  'Bundeswasserstraße: Frei mit Fischereischein! Einer der besten Zanderkanäle in NDS.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Kostenlos! 115 km Top-Kanalstrecke. Spundwände = Zanderparadies."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ NIEDERSACHSEN — Forellengewässer ═══

-- Seeve (Jesteburg)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('nds-seeve-jesteburg')::uuid, 'Seeve bei Jesteburg', 'river',
  53.3100, 9.9600, 'Niedersachsen',
  ARRAY['Forelle', 'Barsch', 'Döbel', 'Aal', 'Meerforelle'],
  15.00, true, 'day_permit',
  'Limitierte Tageskarten beim Seeve-Fischerei-Verein. Frühzeitig reservieren!',
  false, 'curated', true, 'official',
  '{"minSizes": {"Forelle": 25, "Meerforelle": 40}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Fliegenfischen", "Spinnfischen"], "specialRules": "Top-Forellenbach in der Nordheide! Schonender Umgang Pflicht. C&R für Meerforelle."}'::jsonb,
  'JESTEBURG'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Luhe (Winsen)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('nds-luhe-winsen')::uuid, 'Luhe bei Winsen', 'river',
  53.3530, 10.2050, 'Niedersachsen',
  ARRAY['Forelle', 'Barsch', 'Hecht', 'Aal', 'Döbel'],
  12.00, true, 'day_permit',
  'Tageskarten beim Sportfischerverein Winsen.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Forelle": 25, "Hecht": 50}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Fliegenfischen", "Spinnfischen", "Ansitz"], "specialRules": "Kleiner Heidebach. Perfekt für Fliegenfischer. Forellen bis 45cm möglich."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ HAMBURG — Weitere Gewässer ═══

-- Dove Elbe
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('hh-dove-elbe')::uuid, 'Dove Elbe', 'river',
  53.4750, 10.1500, 'Hamburg',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Schleie', 'Brassen'],
  10.00, true, 'day_permit',
  'https://www.anglerforum-hamburg.de/',
  'Tageskarten beim AVH oder Angelgeschäften in Hamburg. Top-Revier im Osten HH.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln", "Bootsangeln"], "specialRules": "Eines der besten Hechtgewässer in Hamburg. Boot empfohlen. Seerosen-Kanten!"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Boberger See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('hh-boberger-see')::uuid, 'Boberger See', 'lake',
  53.5070, 10.1280, 'Hamburg',
  ARRAY['Karpfen', 'Schleie', 'Hecht', 'Barsch', 'Aal'],
  8.00, true, 'day_permit',
  'Tageskarten über den zuständigen Angelverein. Naherholung Bergedorf.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Karpfen": 35}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Ansitz", "Grundangeln"], "specialRules": "Kleiner Stadtsee. Nur Friedfisch- und Raubfischangeln. Naturschutz beachten."}'::jsonb,
  4.0, 0.1
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Elbe Hamburg (Hafen / Norderelbe)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('hh-elbe-hafen')::uuid, 'Elbe Hamburg (Hafen)', 'river',
  53.5350, 9.9700, 'Hamburg',
  ARRAY['Zander', 'Barsch', 'Aal', 'Hecht', 'Rapfen', 'Wels'],
  0.00, true, 'free',
  'Bundeswasserstraße: frei mit Fischereischein! Bester Stadtzander Deutschlands.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Kostenlos! Tidebereich: Gezeitenabhängig fischen. Hafenbecken gesperrt. Steinpackungen sind Hotspots."}'::jsonb,
  'HAMBURG ST. PAULI'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Wandse (HH-Wandsbek)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('hh-wandse')::uuid, 'Wandse (Wandsbek)', 'river',
  53.5820, 10.0870, 'Hamburg',
  ARRAY['Forelle', 'Barsch', 'Döbel', 'Aal'],
  8.00, true, 'day_permit',
  'Tageskarten beim Anglerverein Wandsbek.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Forelle": 25}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Fliegenfischen", "Spinnfischen"], "specialRules": "Stadtbach mit überraschend gutem Forellenbestand. Schonender Umgang!"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ SCHLESWIG-HOLSTEIN — Weitere Seen ═══

-- Ratzeburger See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, permit_contact, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('sh-ratzeburger-see')::uuid, 'Ratzeburger See', 'lake',
  53.7050, 10.7580, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Maräne', 'Schleie'],
  12.00, true, 'day_permit',
  'https://www.ratzeburg.de/',
  'Tageskarten in der Touristinfo Ratzeburg oder bei Angelgeschäften.',
  'Fischereiverein Ratzeburg e.V.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45, "Zander": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Schleppfischen", "Bootsangeln"], "specialRules": "Bootsangeln erlaubt. Maränenbestand! Trolling auf Hecht beliebt."}'::jsonb,
  24.0, 14.4
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Selenter See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('sh-selenter-see')::uuid, 'Selenter See', 'lake',
  54.2950, 10.5250, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Maräne', 'Schleie', 'Brassen'],
  15.00, true, 'day_permit',
  'Tageskarten über die Fischereigenossenschaft Selenter See.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45, "Zander": 40, "Karpfen": 35}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln", "Bootsangeln"], "specialRules": "Zweitgrößter See in SH. Guter Zanderbestand. Bootsverleih vorhanden."}'::jsonb,
  36.0, 22.4
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Einfelder See
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('sh-einfelder-see')::uuid, 'Einfelder See', 'lake',
  54.1310, 9.9870, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Aal', 'Schleie', 'Brassen', 'Rotauge'],
  8.00, true, 'day_permit',
  'Tageskarten beim Angelsportverein Neumünster.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz"], "specialRules": "Badesee bei Neumünster. Angeln abseits der Badestellen. Guter Hechtbestand."}'::jsonb,
  8.0, 1.3
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Westensee
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth, surface_area)
VALUES (
  md5('sh-westensee')::uuid, 'Westensee', 'lake',
  54.2500, 9.8800, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Karpfen', 'Maräne'],
  12.00, true, 'day_permit',
  'Tageskarten beim Fischereiverein Westensee. Bootsangeln sehr empfehlenswert.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45, "Zander": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Bootsangeln", "Schleppfischen"], "specialRules": "Einer der besten Raubfischseen in SH! Trolling-Hotspot. Maränenbestand."}'::jsonb,
  25.0, 7.3
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ SCHLESWIG-HOLSTEIN — Flüsse & Kanäle ═══

-- Trave (Lübeck)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('sh-trave-luebeck')::uuid, 'Trave bei Lübeck', 'river',
  53.8660, 10.6860, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Brassen', 'Meerforelle'],
  12.00, true, 'day_permit',
  'Gastscheine beim LSFV-SH oder Angelgeschäften in Lübeck.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45, "Zander": 40, "Meerforelle": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Tidebereich ab Lübeck. Meerforellen im Herbst. Zanderangeln an Brücken."}'::jsonb,
  'LÜBECK'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Eider (Rendsburg)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('sh-eider-rendsburg')::uuid, 'Eider bei Rendsburg', 'river',
  54.3060, 9.6640, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Zander', 'Aal', 'Brassen', 'Meerforelle'],
  10.00, true, 'day_permit',
  'Tageskarten über den Kreissportfischerverband Rendsburg.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45, "Zander": 40, "Meerforelle": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Einer der wichtigsten Meerforellenflüsse in SH. Laichschonstrecken beachten!"}'::jsonb,
  'RENDSBURG'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Stör (Kellinghusen)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, pegel_station)
VALUES (
  md5('sh-stoer-kellinghusen')::uuid, 'Stör bei Kellinghusen', 'river',
  53.9490, 9.7140, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Barsch', 'Brassen', 'Aal', 'Zander', 'Meerforelle'],
  10.00, true, 'day_permit',
  'Gastscheine beim SAV Kellinghusen oder LSFV-SH.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45, "Zander": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Tidefluss. Guter Hechtbestand. Schleusen sind Hotspots für Zander."}'::jsonb,
  'KELLINGHUSEN'
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed, pegel_station = EXCLUDED.pegel_station;

-- Schwentine (Kiel)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('sh-schwentine-kiel')::uuid, 'Schwentine bei Kiel', 'river',
  54.2700, 10.1800, 'Schleswig-Holstein',
  ARRAY['Forelle', 'Meerforelle', 'Barsch', 'Hecht', 'Döbel'],
  10.00, true, 'day_permit',
  'Tageskarten über den Kreissportfischerverband Kiel.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Forelle": 25, "Meerforelle": 40, "Hecht": 45}, "dailyLimit": 2, "nightFishing": false, "allowedMethods": ["Fliegenfischen", "Spinnfischen"], "specialRules": "Verbindet Holsteinische Seenplatte mit der Kieler Förde. Top-Meerforellenstrecke!"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Elbe-Lübeck-Kanal (Büchen)
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('sh-elbe-luebeck-kanal-buechen')::uuid, 'Elbe-Lübeck-Kanal (Büchen)', 'canal',
  53.4780, 10.6160, 'Schleswig-Holstein',
  ARRAY['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen', 'Brassen'],
  0.00, true, 'free',
  'Bundeswasserstraße: frei mit Fischereischein! 62 km Kanalstrecke.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Hecht": 45, "Zander": 40}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Kostenlos! Guter Zanderbestand. Schleusen sind Hotspots. Berufsschifffahrt beachten."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ BESONDERE SPOTS — Premium-Gewässer ═══

-- Forellensee Sprötze
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth)
VALUES (
  md5('nds-forellensee-sproetze')::uuid, 'Forellensee Sprötze', 'pond',
  53.3950, 9.8350, 'Niedersachsen',
  ARRAY['Regenbogenforelle', 'Forelle', 'Saibling', 'Stör'],
  25.00, true, 'day_permit',
  'https://www.forellensee-sproetze.de/',
  'Tageskarten vor Ort. Put & Take Betrieb. Regelmäßiger Besatz.',
  false, 'curated', true, 'official',
  '{"dailyLimit": 5, "nightFishing": false, "allowedMethods": ["Spinnfischen", "Ansitz", "Grundangeln"], "specialRules": "Put & Take. Keine Schonzeiten. Entnahmepflicht. Familienfreundlich. Leihangeln möglich."}'::jsonb,
  4.0
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Angelteich Rosengarten
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations, max_depth)
VALUES (
  md5('nds-angelteich-rosengarten')::uuid, 'Angelteich Rosengarten', 'pond',
  53.3650, 9.8750, 'Niedersachsen',
  ARRAY['Karpfen', 'Schleie', 'Hecht', 'Barsch', 'Forelle'],
  15.00, true, 'day_permit',
  'Tageskarten direkt am Teich. Gut für Anfänger.',
  false, 'curated', true, 'official',
  '{"dailyLimit": 3, "nightFishing": false, "allowedMethods": ["Ansitz", "Grundangeln", "Spinnfischen"], "specialRules": "Familienfreundlich. Kinder willkommen. Max. 2 Ruten."}'::jsonb,
  3.0
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Ostsee Küste Fehmarn
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_url, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('sh-ostsee-fehmarn')::uuid, 'Ostsee Küste Fehmarn', 'lake',
  54.4500, 11.1600, 'Schleswig-Holstein',
  ARRAY['Meerforelle', 'Dorsch', 'Plattfisch', 'Hornhecht', 'Hering'],
  0.00, true, 'free',
  'https://www.schleswig-holstein.de/DE/fachinhalte/F/fischerei/fischereischein.html',
  'Frei mit Fischereischein! Küstenangelstrecke 25+ km. Watangeln oder Brandungsangeln.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Meerforelle": 40, "Dorsch": 35}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen", "Brandungsangeln", "Watangeln", "Fliegenfischen"], "specialRules": "Küstenangelkarte nicht nötig (nur Fischereischein). Meerforellen Okt-Apr. Dorsch im Winter."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_url = EXCLUDED.permit_url, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- Ostsee Kieler Förde
INSERT INTO water_bodies (id, name, type, latitude, longitude, region, fish_species, permit_price, requires_permit, permit_type, permit_info, is_assumed, data_source, fish_species_confirmed, fish_species_source, regulations)
VALUES (
  md5('sh-ostsee-kieler-foerde')::uuid, 'Kieler Förde', 'lake',
  54.3500, 10.1500, 'Schleswig-Holstein',
  ARRAY['Meerforelle', 'Dorsch', 'Plattfisch', 'Hornhecht', 'Hering', 'Makrele'],
  0.00, true, 'free',
  'Frei mit Fischereischein! Brandungsangeln und Spinnfischen von der Mole.',
  false, 'curated', true, 'official',
  '{"minSizes": {"Meerforelle": 40, "Dorsch": 35}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Brandungsangeln", "Spinnfischen", "Pilken"], "specialRules": "Hafenbereiche teilweise gesperrt. Heringsangeln im Frühjahr legendär. Dorsch im Winter."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  permit_price = EXCLUDED.permit_price, permit_type = EXCLUDED.permit_type, permit_info = EXCLUDED.permit_info, regulations = EXCLUDED.regulations, fish_species = EXCLUDED.fish_species, fish_species_confirmed = EXCLUDED.fish_species_confirmed;

-- ═══ Summary Batch 2 ═══
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
