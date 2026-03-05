-- BISS Fang-Tagebuch Schema
-- Run after schema.sql

-- Catches table
CREATE TABLE IF NOT EXISTS catches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  water_body_id UUID REFERENCES water_bodies(id) ON DELETE SET NULL,
  water_body_name TEXT NOT NULL,
  fish_species TEXT NOT NULL,
  weight_kg DECIMAL(5,2),
  length_cm INTEGER,
  method TEXT,
  bait TEXT,
  photo_url TEXT,
  notes TEXT,
  weather_temp DECIMAL(4,1),
  weather_desc TEXT,
  fang_index INTEGER,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  caught_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

-- Users can only see their own catches
CREATE POLICY "Users can view own catches" ON catches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own catches" ON catches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catches" ON catches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catches" ON catches
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_catches_user_id ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_caught_at ON catches(caught_at DESC);
