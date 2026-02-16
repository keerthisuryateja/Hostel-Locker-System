-- Create lockers table
CREATE TABLE IF NOT EXISTS lockers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  locker_number INT UNIQUE NOT NULL CHECK (locker_number BETWEEN 1 AND 150),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locker_assignments table
CREATE TABLE IF NOT EXISTS locker_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  locker_id BIGINT REFERENCES lockers(id),
  password VARCHAR(6) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  returned_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned'))
);

-- Create stored_items table
CREATE TABLE IF NOT EXISTS stored_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES locker_assignments(id),
  item_type TEXT NOT NULL,
  model TEXT,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed lockers (1 to 150)
DO $$
BEGIN
  FOR i IN 1..150 LOOP
    INSERT INTO lockers (locker_number) VALUES (i) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
