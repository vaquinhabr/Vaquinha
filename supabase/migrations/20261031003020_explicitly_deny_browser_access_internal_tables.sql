-- Defense in depth for internal tables.
-- Direct browser-role table grants are revoked by the preceding migration.
DROP POLICY IF EXISTS "deny browser access to payment events" ON public.payment_events;
CREATE POLICY "deny browser access to payment events"
ON public.payment_events
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "deny browser access to user roles" ON public.user_roles;
CREATE POLICY "deny browser access to user roles"
ON public.user_roles
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
