-- ============================================================
-- Wabz Foods — Supabase Storage setup (bucket: Wabzfoods)
-- Paste this into Supabase SQL Editor (SQL > New query) and Run.
-- Idempotent: safe to run more than once.
-- ============================================================

-- 1. Create the bucket if it doesn't exist yet, then make it public.
insert into storage.buckets (id, name, public)
values ('Wabzfoods', 'Wabzfoods', true)
on conflict (id) do update set public = excluded.public;

-- 2. Let anon/authenticated SEE buckets (fixes "Bucket not found")
drop policy if exists "anon select buckets" on storage.buckets;
create policy "anon select buckets"
  on storage.buckets for select
  to anon, authenticated
  using (true);

-- 3. Objects: public read
drop policy if exists "public read wabzfoods" on storage.objects;
create policy "public read wabzfoods"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'Wabzfoods');

-- 4. Objects: anonymous uploads
drop policy if exists "anon upload wabzfoods" on storage.objects;
create policy "anon upload wabzfoods"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'Wabzfoods');

-- 5. Objects: upsert / re-upload
drop policy if exists "anon update wabzfoods" on storage.objects;
create policy "anon update wabzfoods"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'Wabzfoods')
  with check (bucket_id = 'Wabzfoods');

-- 6. Objects: delete
drop policy if exists "anon delete wabzfoods" on storage.objects;
create policy "anon delete wabzfoods"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'Wabzfoods');
