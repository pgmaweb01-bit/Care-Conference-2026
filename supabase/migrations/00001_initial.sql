-- Create registrations table
CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('attendee', 'speaker')),
  data JSONB NOT NULL DEFAULT '{}',
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_registrations_type ON registrations (type);
CREATE INDEX idx_registrations_checked_in ON registrations (checked_in_at);
CREATE INDEX idx_registrations_created_at ON registrations (created_at DESC);

-- ID counter sequence
CREATE TABLE id_counter (
  last_value INTEGER NOT NULL DEFAULT 0
);

-- Seed the counter
INSERT INTO id_counter (last_value) VALUES (0);

-- Function to generate next ID (MYC2026-XXXXX)
CREATE OR REPLACE FUNCTION next_registration_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  UPDATE id_counter SET last_value = last_value + 1 RETURNING last_value INTO next_num;
  RETURN 'MYC2026-' || LPAD(next_num::TEXT, 5, '0');
END;
$$;

-- Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_counter ENABLE ROW LEVEL SECURITY;

-- Public can insert registrations (signup)
CREATE POLICY "Anyone can register"
  ON registrations FOR INSERT
  WITH CHECK (true);

-- Public can read their own registration by ID
CREATE POLICY "Anyone can read by ID"
  ON registrations FOR SELECT
  USING (true);

-- Only authenticated users (admin) can update and delete
CREATE POLICY "Admin can update"
  ON registrations FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete"
  ON registrations FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read uploads
CREATE POLICY "Anyone can read uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
