-- BISS App - Spot Ratings Schema
-- User können Spots mit 1-5 Sternen bewerten + optionaler Kommentar

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  water_body_id UUID REFERENCES water_bodies(id) ON DELETE CASCADE NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, water_body_id)
);

-- RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Jeder kann Bewertungen lesen (öffentlich)
CREATE POLICY "Anyone can view ratings" ON ratings
  FOR SELECT USING (true);

-- Nur eigene Bewertungen erstellen
CREATE POLICY "Users can insert own ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Nur eigene Bewertungen updaten
CREATE POLICY "Users can update own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Nur eigene Bewertungen löschen
CREATE POLICY "Users can delete own ratings" ON ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ratings_water_body_id ON ratings(water_body_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Materialized View für schnelle Durchschnittsberechnung (optional)
-- CREATE MATERIALIZED VIEW water_body_ratings AS
-- SELECT water_body_id, AVG(stars)::NUMERIC(3,2) as avg_rating, COUNT(*) as rating_count
-- FROM ratings
-- GROUP BY water_body_id;
