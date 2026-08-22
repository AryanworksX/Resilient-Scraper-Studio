-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New Query)
create table if not exists items (
  id bigint generated always as identity primary key,
  title text not null,
  price float8 not null,
  stock text not null,
  scraped_at text not null
);

create index if not exists items_title_id_idx on items (title, id desc);
alter table items enable row level security;