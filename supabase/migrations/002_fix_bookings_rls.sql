-- ─────────────────────────────────────────────────────────────────────────────
-- 002_fix_bookings_rls.sql
-- Fix: "infinite recursion detected in policy for relation bookings"
--
-- Root cause: The WITH CHECK clause in the UPDATE policy had a self-referencing
-- subquery: (SELECT user_id FROM bookings WHERE id = id)
-- "id" was never aliased, so Postgres resolved both sides as the column name,
-- causing it to query the same table it was already evaluating under RLS →
-- infinite recursion.
--
-- Fix: Remove the redundant self-referencing check entirely. The USING clause
-- already guarantees auth.uid() = user_id before the update is attempted.
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the broken policy
DROP POLICY IF EXISTS "Admins, Venue owners and Users update bookings" ON bookings;

-- Re-create the UPDATE policy without the recursive subquery
CREATE POLICY "Admins, Venue owners and Users update bookings"
ON bookings
FOR UPDATE
USING (
  -- Who can attempt an update:
  public.is_admin()
  OR (auth.uid() = user_id AND status = 'pending')
  OR EXISTS(
    SELECT 1 FROM pitches p
    JOIN venues v ON p.venue_id = v.id
    WHERE p.id = bookings.pitch_id AND v.owner_id = auth.uid()
  )
)
WITH CHECK (
  -- What the resulting row must look like after the update:
  public.is_admin()
  OR (
    -- Player: can only set status = 'cancelled'
    -- The USING clause already guarantees auth.uid() = user_id
    auth.uid() = user_id
    AND status = 'cancelled'
  )
  OR EXISTS(
    SELECT 1 FROM pitches p
    JOIN venues v ON p.venue_id = v.id
    WHERE p.id = bookings.pitch_id AND v.owner_id = auth.uid()
  )
);
