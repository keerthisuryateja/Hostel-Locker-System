-- The backend (using anon key) cannot read the table if RLS is enabled but no policy exists.
-- Option 1: Disable RLS (Simplest for now)
alter table admin_whitelist disable row level security;

-- Option 2: OR keep RLS and allow read access
-- create policy "Allow public read" on admin_whitelist for select using (true);
