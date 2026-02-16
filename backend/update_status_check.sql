-- Drop the existing check constraint
ALTER TABLE lockers DROP CONSTRAINT lockers_status_check;

-- Add the new check constraint including 'maintenance'
ALTER TABLE lockers ADD CONSTRAINT lockers_status_check CHECK (status IN ('available', 'occupied', 'maintenance'));
