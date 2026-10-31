-- Private administrator allowlist; populated only after verifying the account owner.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all privileges on table public.admin_users from anon, authenticated;
grant all privileges on table public.admin_users to service_role;

drop policy if exists "deny browser access to admin_users" on public.admin_users;
create policy "deny browser access to admin_users"
  on public.admin_users
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.admin_users is
  'Private administrator allowlist. Only server-side service role may read/write; never grant browser access.';
