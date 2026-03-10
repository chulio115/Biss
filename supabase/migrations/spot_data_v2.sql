-- ═══════════════════════════════════════════════════════════════════════════════
-- BISS Spot-Daten 2.0 Migration
-- ═══════════════════════════════════════════════════════════════════════════════
-- Erweitert water_bodies um Angelerlaubnis-Details, Pegel-Stationen, Regulations
-- Run in Supabase SQL Editor

-- 1. Angelerlaubnis-Details
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS permit_info TEXT;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS permit_type TEXT CHECK (permit_type IN ('free', 'day_permit', 'club_only', 'private', 'unknown'));
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS permit_buy_location TEXT;

-- 2. Regulations (als JSONB für Flexibilität)
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS regulations JSONB DEFAULT '{}';
-- Struktur: { "minSizes": {"Hecht": 50, "Zander": 45}, "dailyLimit": 3, "nightFishing": true, "allowedMethods": ["Spinnfischen","Ansitz"], "specialRules": "C&R für Karpfen" }

-- 3. Pegel-Station Zuordnung (für Flüsse)
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS pegel_station TEXT;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS river_segment TEXT;

-- 4. Fischarten-Vertrauen
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS fish_species_confirmed BOOLEAN DEFAULT false;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS fish_species_source TEXT DEFAULT 'estimated';
-- Values: 'estimated' (Algorithmus), 'manual' (kuratiert), 'community' (User-bestätigt), 'official' (Verband/Verein)

-- 5. Community-Korrekturen
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS community_verified BOOLEAN DEFAULT false;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS community_verified_at TIMESTAMPTZ;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS coordinate_verified BOOLEAN DEFAULT false;

-- 6. Erweiterte Metadaten
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS max_depth NUMERIC;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS surface_area NUMERIC;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS stocking_info TEXT;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS access_info TEXT;
ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS parking_info TEXT;

-- 7. Index für Pegel-Station (schnelles Matching)
CREATE INDEX IF NOT EXISTS idx_water_bodies_pegel_station
ON water_bodies (pegel_station) WHERE pegel_station IS NOT NULL;

-- 8. Index für permit_type (Filter)
CREATE INDEX IF NOT EXISTS idx_water_bodies_permit_type
ON water_bodies (permit_type) WHERE permit_type IS NOT NULL;

-- Verify
SELECT 
  column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'water_bodies' 
ORDER BY ordinal_position;
