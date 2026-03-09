-- ============================================================
-- BISS Community Schema
-- Privacy-First Sharing + Social Feed
-- ============================================================

-- Catch Shares: Geteilte Fänge in der Community
-- Referenziert catches-Tabelle, enthält Privacy-Einstellungen
CREATE TABLE IF NOT EXISTS catch_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catch_id UUID NOT NULL,
  
  -- Privacy Controls (Opas Rat #2: "Kulturversprechen")
  visibility TEXT NOT NULL DEFAULT 'community' 
    CHECK (visibility IN ('private', 'community', 'public')),
  location_sharing TEXT NOT NULL DEFAULT 'fuzzy'
    CHECK (location_sharing IN ('exact', 'fuzzy', 'none')),
  
  -- Denormalisierte Catch-Daten für schnellen Feed-Zugriff
  fish_species TEXT NOT NULL,
  weight_kg DECIMAL,
  length_cm INTEGER,
  method TEXT,
  bait TEXT,
  notes TEXT,
  photo_url TEXT,
  caught_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Location (wird je nach location_sharing unscharf gemacht)
  water_body_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  
  -- Display Name (anonymisiert möglich)
  display_name TEXT NOT NULL DEFAULT 'Angler',
  
  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community Likes: "Petri Heil!" auf geteilte Fänge
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id UUID NOT NULL REFERENCES catch_shares(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL DEFAULT 'petri_heil'
    CHECK (reaction IN ('petri_heil', 'trophy', 'fire', 'wow')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ein User kann einen Share nur einmal liken
  UNIQUE(user_id, share_id)
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_catch_shares_user ON catch_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_catch_shares_created ON catch_shares(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catch_shares_visibility ON catch_shares(visibility);
CREATE INDEX IF NOT EXISTS idx_community_likes_share ON community_likes(share_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE catch_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Catch Shares: Jeder sieht 'community' und 'public', nur Owner sieht 'private'
CREATE POLICY "Anyone can read community shares"
  ON catch_shares FOR SELECT
  USING (
    visibility IN ('community', 'public')
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create own shares"
  ON catch_shares FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own shares"
  ON catch_shares FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own shares"
  ON catch_shares FOR DELETE
  USING (user_id = auth.uid());

-- Community Likes: Jeder kann lesen, nur eigene erstellen/löschen
CREATE POLICY "Anyone can read likes"
  ON community_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create own likes"
  ON community_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes"
  ON community_likes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- Trigger: likes_count automatisch aktualisieren
-- ============================================================

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE catch_shares SET likes_count = likes_count + 1 WHERE id = NEW.share_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE catch_shares SET likes_count = likes_count - 1 WHERE id = OLD.share_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();
