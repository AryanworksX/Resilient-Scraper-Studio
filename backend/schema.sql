-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
create table if not exists items (
  id bigint generated always as identity primary key,
  title text not null,
  price float8 not null,
  stock text not null,
  scraped_at text not null
);

-- Optional but recommended: index for the "last row for this title" lookup
create index if not exists items_title_id_idx on items (title, id desc);

-- Enable RLS. For a hackathon demo using the SERVICE ROLE key on the backend,
-- you can leave this locked down (service role bypasses RLS automatically).
alter table items enable row level security;
