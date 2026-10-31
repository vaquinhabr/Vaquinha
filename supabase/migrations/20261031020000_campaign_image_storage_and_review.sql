-- Campaign cover storage, review workflow, and supporting indexes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('campaign-images', 'campaign-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public can view campaign images') then
    create policy "Public can view campaign images" on storage.objects
      for select to public using (bucket_id = 'campaign-images');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users upload own campaign images') then
    create policy "Users upload own campaign images" on storage.objects
      for insert to authenticated with check (bucket_id = 'campaign-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users update own campaign images') then
    create policy "Users update own campaign images" on storage.objects
      for update to authenticated using (bucket_id = 'campaign-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
      with check (bucket_id = 'campaign-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users delete own campaign images') then
    create policy "Users delete own campaign images" on storage.objects
      for delete to authenticated using (bucket_id = 'campaign-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
end $$;

drop policy if exists "campaign owner update draft" on public.campaigns;
create policy "campaign owner update draft" on public.campaigns
  for update to authenticated
  using (owner_id = (select auth.uid()) and status in ('draft'::campaign_status, 'paused'::campaign_status, 'pending_review'::campaign_status))
  with check (owner_id = (select auth.uid()) and status in ('draft'::campaign_status, 'paused'::campaign_status, 'pending_review'::campaign_status));

create index if not exists campaign_hearts_user_id_idx on public.campaign_hearts(user_id);
create index if not exists payment_events_donation_id_idx on public.payment_events(donation_id);
create index if not exists withdrawal_requests_campaign_id_idx on public.withdrawal_requests(campaign_id);
create index if not exists withdrawal_requests_reviewed_by_idx on public.withdrawal_requests(reviewed_by);
