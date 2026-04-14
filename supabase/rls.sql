-- GroupGifts.me — Row Level Security policies
-- Run this in: Supabase Dashboard > SQL Editor
--
-- IMPORTANT: All writes to contributions go through the service_role key
-- in API routes (webhooks/stripe, close-pool, delete-pool, refund).
-- Service role bypasses RLS, so no public INSERT/UPDATE policies are needed.
--
-- NOTE: There is an `organisers` table used to store profile data (name, email).
-- It is written to on signup via the anon key, so it needs permissive policies.

-- ============================================================
-- POOLS
-- ============================================================
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

-- Anyone can read pools (needed for /contribute and /card pages)
CREATE POLICY "Public can view pools"
  ON pools FOR SELECT
  USING (true);

-- Only the authenticated organiser can create pools for themselves
CREATE POLICY "Organisers can create pools"
  ON pools FOR INSERT
  WITH CHECK (auth.uid() = organiser_id);

-- Only the organiser can update their own pools
CREATE POLICY "Organisers can update their pools"
  ON pools FOR UPDATE
  USING (auth.uid() = organiser_id);

-- Only the organiser can delete their own pools
CREATE POLICY "Organisers can delete their pools"
  ON pools FOR DELETE
  USING (auth.uid() = organiser_id);


-- ============================================================
-- CONTRIBUTIONS
-- ============================================================
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Anyone can read paid contributions (for pool progress / contributor list)
-- INSERT/UPDATE/DELETE are all done server-side via service_role and bypass RLS.
CREATE POLICY "Public can view paid contributions"
  ON contributions FOR SELECT
  USING (status = 'paid');


-- ============================================================
-- ORGANISERS
-- ============================================================
ALTER TABLE organisers ENABLE ROW LEVEL SECURITY;

-- Organisers can read their own profile
CREATE POLICY "Organisers can read own profile"
  ON organisers FOR SELECT
  USING (auth.uid() = id);

-- Organisers can insert their own profile (called during sign-up with anon key)
CREATE POLICY "Organisers can create own profile"
  ON organisers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Organisers can update their own profile
CREATE POLICY "Organisers can update own profile"
  ON organisers FOR UPDATE
  USING (auth.uid() = id);
