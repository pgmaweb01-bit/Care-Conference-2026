-- Fix: next_registration_id runs as SECURITY DEFINER so the internal
-- UPDATE on id_counter bypasses RLS/safe-update restrictions.
-- The UPDATE is intentionally WHERE-less (single-row table), which is
-- safe inside a SECURITY DEFINER function.

CREATE OR REPLACE FUNCTION next_registration_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  UPDATE id_counter SET last_value = last_value + 1 RETURNING last_value INTO next_num;
  RETURN 'MYC2026-' || LPAD(next_num::TEXT, 5, '0');
END;
$$;
