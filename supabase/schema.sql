-- Mr Wisdom Tech Media and Business Consult: Supabase schema
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Admin allow-list (add the owner's auth.users id after first sign-up)
create table public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  category text not null,
  short_description text not null, full_details text not null default '',
  pricing_model text not null check (pricing_model in ('Fixed','Custom Quote','Hourly')),
  price numeric, currency text default 'NGN',
  deliverables text[] not null default '{}',
  cta_url text, is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  product_type text not null,
  summary text not null, description text not null default '',
  price numeric not null default 0, currency text default 'NGN',
  cover_image text, purchase_or_access_url text,
  features text[] not null default '{}',
  is_available boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Articles (News + Announcements)
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  category text not null check (category in ('News','Announcement')),
  summary text not null, featured_image text,
  content text not null default '', author text not null,
  tags text[] not null default '{}',
  published_date timestamptz not null default now(),
  external_reference_url text, is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  institution text not null, country text not null,
  funding_type text not null check (funding_type in ('Full','Partial')),
  value text, deadline date,
  eligibility_summary text not null, requirements text not null default '',
  application_url text not null, is_featured boolean not null default false,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.grants (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  funding_organization text not null, focal_area text not null,
  grant_amount text, application_deadline date,
  eligibility text not null default '', application_url text not null,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  organization text not null, location text not null,
  work_mode text not null check (work_mode in ('Remote','Hybrid','On-site')),
  job_type text not null check (job_type in ('Full-time','Contract','Internship')),
  salary_range text, description text not null default '',
  deadline date, application_url text not null,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.empowerment (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  organizer text not null, program_type text not null,
  target_audience text not null, benefits text not null default '',
  deadline date, registration_url text not null,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- RAG knowledge base (kept in sync by Server Actions)
create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_table text not null, source_id uuid not null,
  title text not null, url text not null,
  content text not null, embedding vector(1536),
  updated_at timestamptz not null default now(),
  unique (source_table, source_id)
);
create index on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);

create or replace function public.match_knowledge(query_embedding vector(1536), match_count int default 6)
returns table (title text, url text, content text, source_table text, similarity float)
language sql stable as $$
  select title, url, content, source_table, 1 - (embedding <=> query_embedding)
  from public.knowledge_chunks
  order by embedding <=> query_embedding limit match_count
$$;

-- Chat logs and leads
create table public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null, question text not null, answer text,
  created_at timestamptz not null default now()
);
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text, phone text, message text not null,
  source text default 'chat', created_at timestamptz not null default now()
);

-- Triggers + RLS
do $$
declare t text;
begin
  foreach t in array array['services','products','articles','scholarships','grants','jobs','empowerment','knowledge_chunks']
  loop
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "public read" on public.services for select using (is_active);
create policy "public read" on public.products for select using (is_available);
create policy "public read" on public.articles for select using (is_published);
create policy "public read" on public.scholarships for select using (is_published);
create policy "public read" on public.grants for select using (is_published);
create policy "public read" on public.jobs for select using (is_published);
create policy "public read" on public.empowerment for select using (is_published);
alter table public.admins enable row level security;
alter table public.chat_logs enable row level security;
alter table public.leads enable row level security;
create policy "admin read" on public.chat_logs for select using (public.is_admin());
create policy "admin read" on public.leads for select using (public.is_admin());
create policy "admin read" on public.admins for select using (public.is_admin());
-- chat_logs / leads inserts happen server-side with the service role key.

-- Storage: create a public bucket named "media" in the dashboard; restrict writes to admins.
