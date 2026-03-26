-- GroupGifts.me — Row Level Security policies
-- Run this in: Supabase Dashboard > SQL Editor

-- ============================================================
-- POOLS
-- ============================================================
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

-- Anyone can read active pools by slug (needed for /contribute and /card pages)
CREATE POLICY "Public can view active pools"
  ON pools FOR SELECT
  USING (status = 'active' OR status = 'paid_out');

-- Only the authenticated organiser can insert their own pools
CREATE POLICY "Organisers can create pools"
  ON pools FOR INSERT
  WITH CHECK (auth.uid() = organiser_id);

-- Only the organiser can update/delete their own pools
CREATE POLICY "Organisers can manage their pools"
  ON pools FOR UPDATE
  USING (auth.uid() = organiser_id);

CREATE POLICY "Organisers can delete their pools"
  ON pools FOR DELETE
  USING (auth.uid() = organiser_id);


-- ============================================================
-- CONTRIBUTIONS
-- ============================================================
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Anyone can read paid contributions (for pool progress display)
CREATE POLICY "Public can view paid contributions"
  ON contributions FOR SELECT
  USING (status = 'paid');

-- INSERT and UPDATE are done server-side via service_role key (bypasses RLS).
-- Do NOT add a public insert policy — contributions must go through Stripe webhook.


-- ============================================================
-- ORGANISERS
-- ============================================================
ALTER TABLE organisers ENABLE ROW LEVEL SECURITY;

-- Organisers can read their own profile
CREATE POLICY "Organisers can read own profile"
  ON organisers FOR SELECT
  USING (auth.uid() = id);

-- Organisers can insert their own profile (called during sign-up)
CREATE POLICY "Organisers can create own profile"
  ON organisers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Organisers can update their own profile
CREATE POLICY "Organisers can update own profile"
  ON organisers FOR UPDATE
  USING (auth.uid() = id);
