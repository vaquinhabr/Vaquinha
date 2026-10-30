-- Schema de referência do Vaquinha
-- Execute no SQL Editor do Supabase se as tabelas ainda não existirem
-- ou ajuste o código se suas colunas tiverem nomes diferentes

-- Perfis
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Campanhas
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  goal_amount numeric(12,2) not null check (goal_amount > 0),
  current_amount numeric(12,2) not null default 0,
  image_url text,
  category text,
  status text not null default 'active' check (status in ('draft','active','paused','completed','cancelled')),
  deadline date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Doações (estrutura preparada para etapa de pagamentos)
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  donor_id uuid references auth.users(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  message text,
  is_anonymous boolean default false,
  status text not null default 'pending' check (status in ('pending','confirmed','failed')),
  created_at timestamptz default now()
);

-- Trigger: cria perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS básico
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.donations enable row level security;

-- Profiles: usuário vê e edita o próprio
create policy if not exists "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy if not exists "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy if not exists "profiles_select_public" on public.profiles for select using (true);

-- Campaigns: públicas ativas, dono gerencia as próprias
create policy if not exists "campaigns_select_active" on public.campaigns for select using (status = 'active' or auth.uid() = user_id);
create policy if not exists "campaigns_insert_own" on public.campaigns for insert with check (auth.uid() = user_id);
create policy if not exists "campaigns_update_own" on public.campaigns for update using (auth.uid() = user_id);
create policy if not exists "campaigns_delete_own" on public.campaigns for delete using (auth.uid() = user_id);

-- Donations: leitura pública de confirmadas, inserção autenticada (ajustaremos na etapa Pix)
create policy if not exists "donations_select_confirmed" on public.donations for select using (status = 'confirmed' or auth.uid() = donor_id);
