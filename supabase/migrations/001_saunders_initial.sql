-- =============================================================================
-- Saunders Wood Works — Initial Schema
-- Project: https://usdenbguhahvzmufwvgo.supabase.co
--
-- Run this once in the Saunders project SQL editor:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- =============================================================================

-- =============================================================================
-- TABLE: intake_submissions
-- Stores each client intake form submission from intake.html
-- =============================================================================
create table if not exists public.intake_submissions (
  id                    uuid        default gen_random_uuid() primary key,
  created_at            timestamptz default now() not null,
  client_name           text,
  client_email          text,
  project_type          text,
  target_date           text,
  -- Full form state blob so nothing is ever lost
  state_json            jsonb,
  -- Array of public Supabase Storage URLs for appliance PDFs
  appliance_packet_urls jsonb       default '[]'::jsonb
);

-- Enable Row Level Security (good habit even before auth is wired)
alter table public.intake_submissions enable row level security;

-- Allow inserts from anonymous/publishable key sessions (intake form submits without login)
create policy "Allow public insert"
  on public.intake_submissions
  for insert
  with check (true);

-- Matt (authenticated) can read all submissions
create policy "Allow authenticated read"
  on public.intake_submissions
  for select
  using (auth.role() = 'authenticated');

-- =============================================================================
-- STORAGE BUCKET: appliance-packets
-- Stores appliance PDF spec sheets uploaded from intake.html
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('appliance-packets', 'appliance-packets', true)
on conflict (id) do nothing;

-- Allow anyone with the publishable key to upload PDFs
create policy "Allow public upload to appliance-packets"
  on storage.objects
  for insert
  with check (bucket_id = 'appliance-packets');

-- Public read so uploaded files can be linked/downloaded
create policy "Allow public read from appliance-packets"
  on storage.objects
  for select
  using (bucket_id = 'appliance-packets');
