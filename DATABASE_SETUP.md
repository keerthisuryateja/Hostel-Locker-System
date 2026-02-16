# Supabase Database Setup

Follow these steps to configure your Supabase database for the Hostel Locker System.

## 1. Create a Supabase Project

1.  Go to [Supabase Dashboard](https://supabase.com/dashboard).
2.  Click **New Project**.
3.  Choose your Organization.
4.  Enter a **Name** (e.g., `hostel-locker-system`).
5.  Set a **Database Password** (store this securely).
6.  Select a **Region** close to you.
7.  Click **Create new project**.

## 2. Run Database Migrations

1.  Once the project is created, go to the **SQL Editor** (icon on the left sidebar).
2.  Click **New query**.
3.  Copy the content from `backend/schema.sql` in your project.
4.  Paste it into the SQL Editor.
5.  Click **Run**.

This will create the following tables:
- `lockers`: Stores locker information (150 lockers pre-seeded).
- `locker_assignments`: Tracks which student has which locker.
- `stored_items`: Details of items stored in each assignment.

## 3. Get API Credentials

1.  Go to **Project Settings** (gear icon) -> **API**.
2.  Copy the **Project URL**.
3.  Copy the **anon public** key.

## 4. Configure Environment Variables

1.  In your `backend` directory, rename `.env.example` to `.env` (if not already done).
2.  Update the file with your credentials:

```bash
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
```

## 5. (Optional) Disable RLS for Development

By default, new tables might have Row Level Security (RLS) enabled. Since we are using the `service_role` or handling logic via our backend API (using the standard client):

- If you use the **service_role** key (not recommended for frontend), you bypass RLS.
- If you use the **anon** key, you need RLS policies.

**For this initial setup:**
The provided `backend` client uses the standard `createClient`. Ensure RLS policies are set up if you intend to query directly from frontend, OR if the backend uses the secret key (service role key) to bypass RLS.

*Note: The current backend setup uses the `anon` key by default in `.env.example`. You might need to add RLS policies to allow the backend to read/write if you don't switch to `service_role` key or add policies.*

### Add Simple RLS Policies (Allow All - Dev Only)

Run this in SQL Editor if you encounter permission errors:

```sql
ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for lockers" ON lockers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE locker_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for assignments" ON locker_assignments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE stored_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for items" ON stored_items FOR ALL USING (true) WITH CHECK (true);
```
