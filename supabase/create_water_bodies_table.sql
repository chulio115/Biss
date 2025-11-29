-- ═══════════════════════════════════════════════════════════════════════════════
-- BISS Water Bodies Table
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to create the table

-- Drop existing table (if you want fresh start)
-- DROP TABLE IF EXISTS water_bodies;

-- Create water_bodies table
CREATE TABLE IF NOT EXISTS water_bodies (
  -- Primary key (OSM-based ID)
  id TEXT PRIMARY KEY,
  
  -- Basic info
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lake', 'pond', 'river', 'reservoir', 'canal', 'stream')),
  
  -- Location
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  region TEXT DEFAULT 'Niedersachsen',
  
  -- Fishing info
  fish_species TEXT[] DEFAULT '{}',
  permit_price NUMERIC,
  permit_required BOOLEAN DEFAULT true,
  permit_contact TEXT,
  permit_url TEXT,
  
  -- Data quality
  is_assumed BOOLEAN DEFAULT true,
  data_source TEXT DEFAULT 'osm',
  
  -- Google Places enrichment
  place_id TEXT,
  place_photo TEXT,
  place_rating NUMERIC,
  place_website TEXT,
  place_phone TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast location queries
CREATE INDEX IF NOT EXISTS idx_water_bodies_location 
ON water_bodies (latitude, longitude);

-- Create index for region filtering
CREATE INDEX IF NOT EXISTS idx_water_bodies_region 
ON water_bodies (region);

-- Create index for type filtering
CREATE INDEX IF NOT EXISTS idx_water_bodies_type 
ON water_bodies (type);

-- Enable Row Level Security (RLS)
ALTER TABLE water_bodies ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
ON water_bodies 
FOR SELECT 
USING (true);

-- Create policy for authenticated insert/update
CREATE POLICY "Allow authenticated insert" 
ON water_bodies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update" 
ON water_bodies 
FOR UPDATE 
USING (true);

-- Grant permissions
GRANT SELECT ON water_bodies TO anon;
GRANT ALL ON water_bodies TO authenticated;

-- Show success message
SELECT 'Table water_bodies created successfully!' AS status;
