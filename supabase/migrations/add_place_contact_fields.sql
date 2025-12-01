-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Add Google Places Contact Fields
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to add new columns to existing table

-- Add place_address column (if not exists)
ALTER TABLE water_bodies 
ADD COLUMN IF NOT EXISTS place_address TEXT;

-- Add place_open_now column (if not exists)
ALTER TABLE water_bodies 
ADD COLUMN IF NOT EXISTS place_open_now BOOLEAN;

-- Add place_hours column (if not exists)
ALTER TABLE water_bodies 
ADD COLUMN IF NOT EXISTS place_hours TEXT[];

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'water_bodies' 
AND column_name IN ('place_address', 'place_open_now', 'place_hours');

-- Show success
SELECT 'Migration complete: place_address, place_open_now, place_hours added!' AS status;
