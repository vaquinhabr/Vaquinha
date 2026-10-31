-- Least-privilege grants for the browser-facing Supabase roles.
-- Applied to project hibjerbpwprbvveebimb and verified with has_table_privilege.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public discovery is limited by the campaigns RLS policy to active campaigns
-- (or campaigns owned by the authenticated user).
GRANT SELECT ON TABLE public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.campaigns TO authenticated;

-- Profile creation is performed by the trusted auth.users trigger.
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

-- Payment records are read-only from the browser and still restricted by RLS.
GRANT SELECT ON TABLE public.donations TO authenticated;

-- A user may create a withdrawal request, but cannot approve or mark it paid.
GRANT SELECT, INSERT ON TABLE public.withdrawal_requests TO authenticated;

-- payment_events and user_roles intentionally have no grants to anon/authenticated.
