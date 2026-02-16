-- Create a table to store authorized admin emails
create table admin_whitelist (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table admin_whitelist enable row level security;

-- Create policy to allow anyone to read (so backend can check)
-- In a real production app with Service Role backend, you might restrict this further.
-- For now, we just need the table to exist.

-- INSERT YOUR EMAIL HERE to grant yourself access
-- insert into admin_whitelist (email) values ('your_email@example.com');
