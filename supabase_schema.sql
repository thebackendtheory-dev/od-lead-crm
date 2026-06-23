-- Run this SQL in your Supabase SQL Editor to set up the DB

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  client_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  service TEXT,
  budget NUMERIC,
  stage TEXT,
  assigned_to TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  meeting_date TIMESTAMPTZ,
  notes JSONB,
  tasks JSONB,
  activities JSONB
);

-- Enable RLS just in case (though we use service role key in our server, so it bypasses RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- If you also want to seed to get initial data, just trigger the application with the localstorage fallback to create records!
