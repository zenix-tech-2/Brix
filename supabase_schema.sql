-- ============================================================
-- BRIXNODE — Supabase schema
-- Run this in the Supabase SQL editor before using the app.
-- ============================================================

-- PROFILES ----------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text default '',
  username text unique,
  bio text default '',
  avatar_url text default '',
  banner_url text default '',
  role text default 'buyer',
  is_creator boolean default false,
  payout_method text default '',
  payout_details text default '',
  referral_name text default '',
  links text default '',
  created_at timestamptz default now()
);

-- PRODUCTS ----------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  slug text,
  type text default 'other',
  short_desc text default '',
  description text default '',
  price numeric default 0,
  is_recurring boolean default false,
  tags text[] default '{}',
  category text default '',
  cover_url text default '',
  gallery text[] default '{}',
  preview_text text default '',
  whats_included text default '',
  status text default 'published',
  featured boolean default false,
  views int default 0,
  rating numeric default 0,
  rating_count int default 0,
  created_at timestamptz default now()
);

-- ORDERS ------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  creator_id uuid references public.profiles(id) on delete set null,
  amount numeric default 0,
  status text default 'pending',
  proof_url text default '',
  payment_reference text default '',
  payment_method text default '',
  admin_note text default '',
  payout_status text default 'unpaid',
  created_at timestamptz default now()
);

-- REVIEWS -----------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete cascade,
  rating int default 5,
  comment text default '',
  created_at timestamptz default now()
);

-- PAYMENT METHODS (admin managed) -----------------------------
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text default '💳',
  details text default '',
  active boolean default true
);

-- API KEYS (admin managed) ------------------------------------
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  key_value text default '',
  model text default '',
  active boolean default true
);

-- NOTIFICATIONS ----------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text default '',
  body text default '',
  read boolean default false,
  created_at timestamptz default now()
);

-- Auto-create profile on signup ------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.payment_methods enable row level security;
alter table public.api_keys enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

-- products
create policy "published products readable" on public.products for select
  using (status = 'published' or creator_id = auth.uid());
create policy "creator manage products" on public.products for all
  using (creator_id = auth.uid()) with check (creator_id = auth.uid());

-- orders
create policy "own orders read" on public.orders for select
  using (buyer_id = auth.uid() or creator_id = auth.uid());
create policy "buyer create order" on public.orders for insert
  with check (buyer_id = auth.uid());
create policy "buyer update own order" on public.orders for update
  using (buyer_id = auth.uid());

-- reviews
create policy "reviews readable" on public.reviews for select using (true);
create policy "buyer create review" on public.reviews for insert with check (buyer_id = auth.uid());

-- payment methods (public read; admin write handled in app)
create policy "payment methods readable" on public.payment_methods for select using (true);

-- notifications
create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update using (user_id = auth.uid());

-- STORAGE: create a public bucket named "uploads" in the dashboard
-- and allow authenticated uploads.
