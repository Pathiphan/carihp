-- ============================================================
-- CARIHP.ID v2 — Database Schema
-- Jalankan ini di: Supabase Dashboard > SQL Editor > Run
-- ============================================================

-- Tabel utama smartphones
CREATE TABLE IF NOT EXISTS smartphones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  price_usd INT DEFAULT 0,
  price_idr BIGINT DEFAULT 0,
  price_idr_override BIGINT,
  release_year INT DEFAULT 2024,

  chipset TEXT DEFAULT '',
  ram_gb INT DEFAULT 8,
  storage_gb INT DEFAULT 128,
  battery_mah INT DEFAULT 4000,
  screen_size DECIMAL(4,2) DEFAULT 6.5,
  screen_type TEXT DEFAULT 'AMOLED',
  refresh_rate INT DEFAULT 60,
  os TEXT DEFAULT 'Android',
  weight_gram INT DEFAULT 185,

  main_camera_mp INT DEFAULT 50,
  front_camera_mp INT DEFAULT 16,
  camera_features TEXT[] DEFAULT '{}',

  antutu_score INT DEFAULT 0,
  geekbench_single INT DEFAULT 0,
  geekbench_multi INT DEFAULT 0,

  rating_overall DECIMAL(3,1) DEFAULT 7.0,
  rating_camera DECIMAL(3,1) DEFAULT 7.0,
  rating_battery DECIMAL(3,1) DEFAULT 7.0,
  rating_performance DECIMAL(3,1) DEFAULT 7.0,
  rating_value DECIMAL(3,1) DEFAULT 7.0,

  category TEXT[] DEFAULT '{}',

  link_shopee TEXT,
  link_tiktok TEXT,
  link_official TEXT,

  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  smartphone_id UUID REFERENCES smartphones(id) ON DELETE CASCADE,
  target_price BIGINT,
  notify_drop BOOLEAN DEFAULT TRUE,
  notify_rise BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_smartphones_brand ON smartphones(brand);
CREATE INDEX IF NOT EXISTS idx_smartphones_price ON smartphones(price_idr);
CREATE INDEX IF NOT EXISTS idx_smartphones_rating ON smartphones(rating_overall DESC);
CREATE INDEX IF NOT EXISTS idx_smartphones_slug ON smartphones(slug);
CREATE INDEX IF NOT EXISTS idx_watchlist_email ON watchlist(email);
CREATE INDEX IF NOT EXISTS idx_smartphones_name ON smartphones USING gin(to_tsvector('english', name));

-- Row Level Security
ALTER TABLE smartphones ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read smartphones" ON smartphones FOR SELECT USING (true);
CREATE POLICY "Service insert smartphones" ON smartphones FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update smartphones" ON smartphones FOR UPDATE USING (true);
CREATE POLICY "Public insert watchlist" ON watchlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read watchlist" ON watchlist FOR SELECT USING (true);
CREATE POLICY "Public delete watchlist" ON watchlist FOR DELETE USING (true);

-- Data dummy (10 HP populer Indonesia)
INSERT INTO smartphones (
  name, brand, slug, image_url,
  price_usd, price_idr, release_year,
  chipset, ram_gb, storage_gb, battery_mah,
  screen_size, screen_type, refresh_rate, os, weight_gram,
  main_camera_mp, front_camera_mp, camera_features,
  antutu_score, geekbench_single, geekbench_multi,
  rating_overall, rating_camera, rating_battery, rating_performance, rating_value,
  category, source
) VALUES
('Samsung Galaxy S25', 'Samsung', 'samsung-galaxy-s25',
 '',
 799, 12900000, 2025, 'Snapdragon 8 Elite', 12, 256, 4000,
 6.2, 'Dynamic AMOLED 2X', 120, 'Android 15 / One UI 7', 162,
 50, 12, ARRAY['OIS','AI Camera','4K 60fps','Nightography'],
 2600000, 2900, 9600, 8.5, 8.5, 7.5, 9.0, 8.0,
 ARRAY['flagship','kamera','kerja'], 'manual'),

('iPhone 16', 'Apple', 'iphone-16',
 '',
 799, 12900000, 2024, 'Apple A18', 8, 128, 3561,
 6.1, 'Super Retina XDR OLED', 60, 'iOS 18', 170,
 48, 12, ARRAY['OIS','Cinematic Mode','ProRes','Photonic Engine'],
 1700000, 3800, 9200, 8.8, 9.0, 7.0, 9.2, 7.5,
 ARRAY['flagship','kamera','kerja'], 'manual'),

('Xiaomi 14T', 'Xiaomi', 'xiaomi-14t',
 '',
 649, 7499000, 2024, 'MediaTek Dimensity 8300 Ultra', 12, 256, 5000,
 6.67, 'AMOLED', 144, 'Android 14 / HyperOS', 193,
 50, 32, ARRAY['OIS','Leica Optics','AI Camera','4K 60fps'],
 1050000, 1180, 4600, 8.2, 8.0, 8.5, 8.0, 9.0,
 ARRAY['kamera','baterai','gaming'], 'manual'),

('OPPO Reno13 F', 'OPPO', 'oppo-reno13-f',
 '',
 299, 4499000, 2025, 'MediaTek Dimensity 6300', 8, 256, 5000,
 6.67, 'AMOLED', 120, 'Android 15 / ColorOS 15', 185,
 50, 8, ARRAY['AI Eraser','Portrait Mode','Bokeh'],
 450000, 780, 2100, 7.5, 7.5, 8.0, 7.0, 8.5,
 ARRAY['kamera','budget'], 'manual'),

('Realme GT 6T', 'Realme', 'realme-gt-6t',
 '',
 399, 5999000, 2024, 'Snapdragon 7+ Gen 3', 12, 256, 5500,
 6.78, 'AMOLED', 144, 'Android 14 / Realme UI 5', 186,
 50, 16, ARRAY['OIS','AI Camera','Sony IMX882'],
 1300000, 1450, 4900, 8.0, 7.8, 8.8, 8.2, 9.0,
 ARRAY['gaming','baterai'], 'manual'),

('Vivo V40', 'Vivo', 'vivo-v40',
 '',
 449, 6499000, 2024, 'Snapdragon 7 Gen 3', 12, 256, 5500,
 6.78, 'AMOLED', 120, 'Android 14 / FunTouch OS 14', 192,
 50, 50, ARRAY['ZEISS Optics','ZEISS T* Coating','Aura Light'],
 760000, 1100, 3400, 7.8, 8.5, 8.5, 7.5, 8.0,
 ARRAY['kamera','tipis'], 'manual'),

('Xiaomi Redmi Note 13 Pro+', 'Xiaomi', 'xiaomi-redmi-note-13-pro-plus',
 '',
 299, 4299000, 2024, 'MediaTek Dimensity 7200 Ultra', 12, 256, 5000,
 6.67, 'AMOLED', 120, 'Android 13 / MIUI 14', 204,
 200, 16, ARRAY['OIS','200MP Main','Hyper Capture'],
 720000, 950, 2900, 8.0, 8.8, 8.0, 7.5, 9.2,
 ARRAY['kamera','budget'], 'manual'),

('Samsung Galaxy A55', 'Samsung', 'samsung-galaxy-a55',
 '',
 349, 5499000, 2024, 'Exynos 1480', 8, 128, 5000,
 6.6, 'Super AMOLED', 120, 'Android 14 / One UI 6.1', 213,
 50, 32, ARRAY['OIS','Nightography','AI-powered'],
 650000, 1050, 2750, 7.8, 8.0, 8.2, 7.5, 8.5,
 ARRAY['kamera','kerja'], 'manual'),

('Nothing Phone (2a) Plus', 'Nothing', 'nothing-phone-2a-plus',
 '',
 349, 5299000, 2024, 'MediaTek Dimensity 7350 Pro', 12, 256, 5000,
 6.7, 'AMOLED', 120, 'Android 14 / Nothing OS 2.6', 190,
 50, 50, ARRAY['OIS','Glyph Interface','4K Video'],
 960000, 1250, 3800, 7.9, 7.5, 8.2, 8.0, 8.5,
 ARRAY['kerja','tipis'], 'manual'),

('POCO X6 Pro', 'POCO', 'poco-x6-pro',
 '',
 299, 4499000, 2024, 'MediaTek Dimensity 8300 Ultra', 12, 256, 5000,
 6.67, 'Flow AMOLED', 144, 'Android 14 / HyperOS', 186,
 64, 16, ARRAY['OIS','AI Scene Recognition','4K 30fps'],
 1050000, 1320, 4800, 8.0, 7.5, 8.2, 8.5, 9.5,
 ARRAY['gaming','budget'], 'manual');

-- ============================================================
-- TABEL AFFILIATE LINKS (banyak link per smartphone)
-- Jalankan bagian ini di Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smartphone_id UUID NOT NULL REFERENCES smartphones(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_links_smartphone_id ON affiliate_links(smartphone_id);

ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read affiliate_links" ON affiliate_links
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage affiliate_links" ON affiliate_links
  USING (true) WITH CHECK (true);
