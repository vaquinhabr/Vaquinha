-- Eleva Payments integration.
-- Review against the live schema before applying in Supabase production.
alter table public.donations
  add column if not exists amount_cents bigint,
  add column if not exists currency text not null default 'BRL',
  add column if not exists donor_user_id uuid references auth.users(id) on delete set null,
  add column if not exists donor_display_name text,
  add column if not exists provider text,
  add column if not exists provider_payment_id text,
  add column if not exists idempotency_key text,
  add column if not exists paid_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists donations_idempotency_key_unique on public.donations (idempotency_key) where idempotency_key is not null;
create index if not exists donations_provider_payment_id_idx on public.donations (provider, provider_payment_id) where provider_payment_id is not null;
create index if not exists donations_campaign_status_idx on public.donations (campaign_id, status, created_at desc);

create table if not exists public.payment_webhook_events (
  id text primary key,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);
alter table public.payment_webhook_events enable row level security;
revoke all on public.payment_webhook_events from anon, authenticated;
