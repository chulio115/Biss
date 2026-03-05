-- BISS Leaderboard Schema
-- Stores aggregated user scores for ranking
-- Run after catches_schema.sql

-- Leaderboard scores table
CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Angler',
  total_score INTEGER NOT NULL DEFAULT 0,
  catches_count INTEGER NOT NULL DEFAULT 0,
  achievements_count INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  spots_visited INTEGER NOT NULL DEFAULT 0,
  biggest_catch_kg DECIMAL(5,2) DEFAULT 0,
  total_weight_kg DECIMAL(8,2) DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Everyone can view the leaderboard
CREATE POLICY "Anyone can view leaderboard" ON leaderboard_scores
  FOR SELECT TO authenticated USING (true);

-- Users can only update their own scores
CREATE POLICY "Users can upsert own score" ON leaderboard_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own score" ON leaderboard_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for fast ranking queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_score ON leaderboard_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard_scores(user_id);
