-- BISS App - Supabase Database Schema
-- Führe dieses SQL im Supabase Dashboard aus (SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profile (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  fishing_license_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fishing Licenses
CREATE TABLE IF NOT EXISTS fishing_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  license_number TEXT,
  issuing_authority TEXT,
  valid_from DATE,
  valid_until DATE,
  image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  ocr_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water Bodies (Gewässer)
CREATE TABLE IF NOT EXISTS water_bodies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('see', 'fluss', 'teich', 'kanal')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  region TEXT,
  fish_species TEXT[],
  requires_permit BOOLEAN DEFAULT TRUE,
  permit_price DECIMAL(10, 2),
  pegel_station_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permits (Angelerlaubnisse)
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  water_body_id UUID REFERENCES water_bodies(id) NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  permit_type TEXT CHECK (permit_type IN ('tag', 'woche', 'monat', 'jahr')),
  price DECIMAL(10, 2),
  stripe_payment_id TEXT,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_bodies ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own licenses" ON fishing_licenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own licenses" ON fishing_licenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own permits" ON permits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own permits" ON permits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Water bodies are public read
CREATE POLICY "Anyone can view water bodies" ON water_bodies
  FOR SELECT USING (true);

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample Water Bodies (50 Spots für MVP)
INSERT INTO water_bodies (name, type, latitude, longitude, region, fish_species, requires_permit, permit_price) VALUES
  ('Müggelsee', 'see', 52.4333, 13.6500, 'Berlin', ARRAY['Hecht', 'Zander', 'Barsch', 'Aal'], true, 15.00),
  ('Wannsee', 'see', 52.4167, 13.1667, 'Berlin', ARRAY['Hecht', 'Zander', 'Karpfen'], true, 12.00),
  ('Tegeler See', 'see', 52.5833, 13.2500, 'Berlin', ARRAY['Hecht', 'Barsch', 'Plötze'], true, 10.00),
  ('Rhein bei Köln', 'fluss', 50.9375, 6.9603, 'NRW', ARRAY['Zander', 'Barsch', 'Rapfen', 'Wels'], true, 20.00),
  ('Rhein bei Düsseldorf', 'fluss', 51.2277, 6.7735, 'NRW', ARRAY['Zander', 'Barsch', 'Rapfen'], true, 20.00),
  ('Elbe bei Hamburg', 'fluss', 53.5511, 9.9937, 'Hamburg', ARRAY['Zander', 'Aal', 'Stint'], true, 25.00),
  ('Alster', 'fluss', 53.5600, 10.0000, 'Hamburg', ARRAY['Hecht', 'Barsch', 'Karpfen'], true, 15.00),
  ('Bodensee', 'see', 47.6500, 9.4500, 'BaWü', ARRAY['Felchen', 'Seeforelle', 'Barsch'], true, 30.00),
  ('Chiemsee', 'see', 47.8600, 12.4000, 'Bayern', ARRAY['Renke', 'Hecht', 'Zander'], true, 25.00),
  ('Starnberger See', 'see', 47.9000, 11.3167, 'Bayern', ARRAY['Renke', 'Seeforelle', 'Hecht'], true, 35.00),
  ('Main bei Frankfurt', 'fluss', 50.1109, 8.6821, 'Hessen', ARRAY['Zander', 'Barsch', 'Karpfen'], true, 18.00),
  ('Neckar bei Heidelberg', 'fluss', 49.4094, 8.6942, 'BaWü', ARRAY['Barbe', 'Döbel', 'Forelle'], true, 15.00),
  ('Mosel bei Trier', 'fluss', 49.7596, 6.6439, 'RLP', ARRAY['Zander', 'Barsch', 'Aal'], true, 20.00),
  ('Weser bei Bremen', 'fluss', 53.0793, 8.8017, 'Bremen', ARRAY['Zander', 'Aal', 'Stint'], true, 22.00),
  ('Donau bei Passau', 'fluss', 48.5667, 13.4667, 'Bayern', ARRAY['Wels', 'Zander', 'Huchen'], true, 28.00),
  ('Ammersee', 'see', 47.9833, 11.1167, 'Bayern', ARRAY['Renke', 'Hecht', 'Aal'], true, 20.00),
  ('Edersee', 'see', 51.1833, 9.0667, 'Hessen', ARRAY['Hecht', 'Zander', 'Barsch'], true, 18.00),
  ('Biggesee', 'see', 51.1000, 7.9000, 'NRW', ARRAY['Hecht', 'Zander', 'Forelle'], true, 15.00),
  ('Möhnesee', 'see', 51.4833, 8.0667, 'NRW', ARRAY['Hecht', 'Zander', 'Karpfen'], true, 14.00),
  ('Sorpesee', 'see', 51.3500, 7.9667, 'NRW', ARRAY['Forelle', 'Hecht', 'Barsch'], true, 16.00),
  ('Schweriner See', 'see', 53.6167, 11.4500, 'MV', ARRAY['Hecht', 'Zander', 'Aal'], true, 12.00),
  ('Müritz', 'see', 53.4167, 12.7000, 'MV', ARRAY['Hecht', 'Zander', 'Aal', 'Barsch'], true, 15.00),
  ('Plauer See', 'see', 53.4500, 12.3333, 'MV', ARRAY['Hecht', 'Zander', 'Karpfen'], true, 12.00),
  ('Steinhuder Meer', 'see', 52.4667, 9.3333, 'Niedersachsen', ARRAY['Hecht', 'Zander', 'Aal'], true, 18.00),
  ('Dümmer', 'see', 52.5000, 8.3667, 'Niedersachsen', ARRAY['Hecht', 'Zander', 'Brassen'], true, 14.00),
  ('Maschsee', 'see', 52.3500, 9.7500, 'Niedersachsen', ARRAY['Karpfen', 'Hecht', 'Barsch'], true, 10.00),
  ('Baldeneysee', 'see', 51.4000, 7.0333, 'NRW', ARRAY['Zander', 'Hecht', 'Karpfen'], true, 12.00),
  ('Kemnader See', 'see', 51.4333, 7.2667, 'NRW', ARRAY['Karpfen', 'Hecht', 'Forelle'], true, 10.00),
  ('Phoenixsee', 'see', 51.4833, 7.5167, 'NRW', ARRAY['Karpfen', 'Hecht', 'Barsch'], true, 15.00),
  ('Aasee Münster', 'see', 51.9500, 7.6000, 'NRW', ARRAY['Karpfen', 'Hecht', 'Schleie'], true, 12.00),
  ('Halterner Stausee', 'see', 51.7500, 7.1833, 'NRW', ARRAY['Hecht', 'Zander', 'Karpfen'], true, 16.00),
  ('Unterbacher See', 'see', 51.1833, 6.8667, 'NRW', ARRAY['Karpfen', 'Hecht', 'Forelle'], true, 14.00),
  ('Xantener Südsee', 'see', 51.6500, 6.4500, 'NRW', ARRAY['Karpfen', 'Hecht', 'Zander'], true, 18.00),
  ('Diemelsee', 'see', 51.3667, 8.7333, 'Hessen', ARRAY['Forelle', 'Hecht', 'Barsch'], true, 15.00),
  ('Twistesee', 'see', 51.3833, 9.0167, 'Hessen', ARRAY['Forelle', 'Karpfen', 'Hecht'], true, 12.00),
  ('Hennesee', 'see', 51.2000, 8.2333, 'NRW', ARRAY['Forelle', 'Hecht', 'Zander'], true, 16.00),
  ('Listertalsperre', 'see', 51.0833, 7.8833, 'NRW', ARRAY['Forelle', 'Hecht', 'Barsch'], true, 14.00),
  ('Aggertalsperre', 'see', 51.0000, 7.5333, 'NRW', ARRAY['Forelle', 'Hecht', 'Karpfen'], true, 15.00),
  ('Wuppertalsperre', 'see', 51.1833, 7.3000, 'NRW', ARRAY['Forelle', 'Barsch', 'Hecht'], true, 12.00),
  ('Bevertalsperre', 'see', 51.1500, 7.3667, 'NRW', ARRAY['Forelle', 'Karpfen', 'Hecht'], true, 14.00),
  ('Rurtalsperre', 'see', 50.6333, 6.4167, 'NRW', ARRAY['Forelle', 'Hecht', 'Zander'], true, 18.00),
  ('Bleilochtalsperre', 'see', 50.5000, 11.7000, 'Thüringen', ARRAY['Zander', 'Hecht', 'Barsch'], true, 15.00),
  ('Hohenwarte-Stausee', 'see', 50.6167, 11.5167, 'Thüringen', ARRAY['Zander', 'Hecht', 'Karpfen'], true, 14.00),
  ('Talsperre Pöhl', 'see', 50.5667, 12.2000, 'Sachsen', ARRAY['Zander', 'Hecht', 'Karpfen'], true, 12.00),
  ('Cospudener See', 'see', 51.2667, 12.3333, 'Sachsen', ARRAY['Hecht', 'Zander', 'Karpfen'], true, 10.00),
  ('Kulkwitzer See', 'see', 51.3167, 12.2667, 'Sachsen', ARRAY['Karpfen', 'Hecht', 'Wels'], true, 12.00),
  ('Senftenberger See', 'see', 51.5000, 14.0000, 'Brandenburg', ARRAY['Hecht', 'Zander', 'Karpfen'], true, 14.00),
  ('Partwitzer See', 'see', 51.5333, 14.1000, 'Brandenburg', ARRAY['Hecht', 'Zander', 'Barsch'], true, 12.00),
  ('Geierswalder See', 'see', 51.5167, 14.1333, 'Brandenburg', ARRAY['Hecht', 'Zander', 'Karpfen'], true, 14.00),
  ('Bärwalder See', 'see', 51.3833, 14.5333, 'Sachsen', ARRAY['Hecht', 'Zander', 'Barsch'], true, 15.00)
ON CONFLICT DO NOTHING;
