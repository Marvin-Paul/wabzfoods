-- ═══════════════════════════════════════════════════════════════════
-- Wabz Foods — Disable RLS then Seed Database
-- ═══════════════════════════════════════════════════════════════════
-- NOTE: Superseded for new setups by supabase/setup.sql (RLS +
-- site_settings + feedback). This file is kept for legacy databases
-- that are still RLS-disabled; do NOT run it after enabling RLS.
-- ═══════════════════════════════════════════════════════════════════
-- Paste this entire block at:
--   https://supabase.com/dashboard/project/apnxvhjlpahiepwntpmn/sql/new
-- Then click "Run".
--
-- This disables RLS + inserts 3 categories.
-- After running this, the Node seed script (lib/seed-food-items.mjs)
-- will populate the 31 food items with images.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Disable RLS so the anon key can read/write from the frontend
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_items  DISABLE ROW LEVEL SECURITY;

-- 2. Insert the three uniform categories
INSERT INTO categories (category_code, name, description, icon, sort_order) VALUES
    ('local',  'Local Foods', 'Traditional Ugandan dishes — matooke, luwombo, rolex and more.', 'wheat', 1),
    ('fast',   'Fast Foods',  'Burgers, pizza, chips, chicken — quick and delicious.',           'pizza', 2),
    ('drinks', 'Drinks',      'Fresh juices, sodas, coffee, tea — hot and cold beverages.',      'coffee', 3)
ON CONFLICT (category_code) DO NOTHING;

-- 3. Verify
SELECT * FROM categories ORDER BY sort_order;
