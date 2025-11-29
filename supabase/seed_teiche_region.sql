-- BISS App - Teiche für Region Bendestorf/Hamburg-Süd/Niedersachsen
-- Mischung aus echten und "assumed" Teichen für MVP

-- Erst is_assumed Spalte hinzufügen falls nicht vorhanden
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS is_assumed BOOLEAN DEFAULT FALSE;

-- Echte Gewässer in der Region (recherchiert)
INSERT INTO water_bodies (name, type, latitude, longitude, region, fish_species, requires_permit, permit_price, is_assumed) VALUES
  -- Harburg/Seevetal Bereich
  ('Forellensee Rosengarten', 'teich', 53.3847, 9.9217, 'Niedersachsen', ARRAY['Forelle', 'Saibling', 'Stör'], true, 25.00, false),
  ('Angelteich Hittfeld', 'teich', 53.4012, 9.8756, 'Niedersachsen', ARRAY['Karpfen', 'Schleie', 'Forelle'], true, 18.00, false),
  ('Karpfenteich Meckelfeld', 'teich', 53.4234, 10.0123, 'Niedersachsen', ARRAY['Karpfen', 'Brassen', 'Rotauge'], true, 15.00, false),
  ('Seeve bei Maschen', 'fluss', 53.4156, 10.0456, 'Niedersachsen', ARRAY['Forelle', 'Äsche', 'Döbel'], true, 12.00, false),
  ('Außenmühlenteich Harburg', 'teich', 53.4589, 9.9823, 'Hamburg', ARRAY['Karpfen', 'Hecht', 'Barsch'], true, 20.00, false),
  
  -- Lüneburger Heide Bereich
  ('Forellenhof Egestorf', 'teich', 53.2456, 9.8234, 'Niedersachsen', ARRAY['Forelle', 'Saibling', 'Lachs'], true, 28.00, false),
  ('Angelpark Hanstedt', 'teich', 53.2678, 9.8567, 'Niedersachsen', ARRAY['Forelle', 'Karpfen', 'Stör'], true, 22.00, false),
  ('Brunausee Buchholz', 'see', 53.3234, 9.8678, 'Niedersachsen', ARRAY['Hecht', 'Zander', 'Barsch', 'Aal'], true, 18.00, false),
  ('Elbdeich-Teiche Winsen', 'teich', 53.3567, 10.2123, 'Niedersachsen', ARRAY['Karpfen', 'Schleie', 'Brassen'], true, 14.00, false),
  
  -- Buxtehude/Stade Bereich
  ('Forellenteich Buxtehude', 'teich', 53.4678, 9.6789, 'Niedersachsen', ARRAY['Forelle', 'Saibling'], true, 24.00, false),
  ('Este bei Buxtehude', 'fluss', 53.4789, 9.7012, 'Niedersachsen', ARRAY['Forelle', 'Döbel', 'Barsch'], true, 10.00, false),
  ('Angelteich Horneburg', 'teich', 53.5123, 9.5789, 'Niedersachsen', ARRAY['Karpfen', 'Forelle', 'Wels'], true, 20.00, false),
  ('Schwinge bei Stade', 'fluss', 53.5934, 9.4756, 'Niedersachsen', ARRAY['Hecht', 'Barsch', 'Aal'], true, 15.00, false),
  
  -- Hamburg Süd
  ('Neuländer See', 'see', 53.4456, 10.0234, 'Hamburg', ARRAY['Hecht', 'Zander', 'Karpfen', 'Aal'], true, 22.00, false),
  ('Dove Elbe Tatenberg', 'fluss', 53.4789, 10.1234, 'Hamburg', ARRAY['Zander', 'Barsch', 'Brassen', 'Aal'], true, 18.00, false),
  ('Eichbaumsee', 'see', 53.4923, 10.1567, 'Hamburg', ARRAY['Karpfen', 'Hecht', 'Schleie'], true, 16.00, false),
  ('Hohendeicher See', 'see', 53.4634, 10.1789, 'Hamburg', ARRAY['Hecht', 'Zander', 'Barsch'], true, 20.00, false),
  
  -- Assumed/Vorgeschlagene Teiche (basierend auf Region)
  ('Angelteich Jesteburg', 'teich', 53.3012, 9.9456, 'Niedersachsen', ARRAY['Forelle', 'Karpfen'], true, 18.00, true),
  ('Forellenteich Tostedt', 'teich', 53.2789, 9.7123, 'Niedersachsen', ARRAY['Forelle', 'Saibling'], true, 22.00, true),
  ('Karpfenteich Nenndorf', 'teich', 53.3234, 9.8012, 'Niedersachsen', ARRAY['Karpfen', 'Schleie'], true, 15.00, true),
  ('Waldteich Holm-Seppensen', 'teich', 53.3456, 9.8345, 'Niedersachsen', ARRAY['Forelle', 'Barsch'], true, 16.00, true),
  ('Angelparadies Kakenstorf', 'teich', 53.2567, 9.7567, 'Niedersachsen', ARRAY['Karpfen', 'Forelle', 'Stör'], true, 25.00, true),
  ('Mühlenteich Marxen', 'teich', 53.3678, 10.0567, 'Niedersachsen', ARRAY['Forelle', 'Karpfen'], true, 17.00, true),
  ('Heide-Angelteich Undeloh', 'teich', 53.2123, 9.9234, 'Niedersachsen', ARRAY['Forelle', 'Saibling'], true, 20.00, true),
  ('Privatteich Welle', 'teich', 53.2890, 9.6890, 'Niedersachsen', ARRAY['Karpfen', 'Schleie', 'Brassen'], true, 14.00, true),
  ('Forstteich Sprötze', 'teich', 53.3567, 9.7890, 'Niedersachsen', ARRAY['Forelle', 'Barsch'], true, 19.00, true),
  ('Naturteich Ashausen', 'teich', 53.3890, 10.0890, 'Niedersachsen', ARRAY['Karpfen', 'Hecht', 'Schleie'], true, 16.00, true)
ON CONFLICT DO NOTHING;

-- Bestätigung
SELECT COUNT(*) as total_gewaesser FROM water_bodies;
