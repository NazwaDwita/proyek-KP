insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dokumen-magang',
  'dokumen-magang',
  false,
  5242880, 
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "dokumen_magang_insert_publik" on storage.objects
  for insert
  with check (bucket_id = 'dokumen-magang');

create policy "dokumen_magang_select_admin" on storage.objects
  for select using (bucket_id = 'dokumen-magang' and is_admin());

create policy "dokumen_magang_delete_admin" on storage.objects
  for delete using (bucket_id = 'dokumen-magang' and is_admin());
