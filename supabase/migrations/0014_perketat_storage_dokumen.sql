drop policy if exists "dokumen_magang_insert_publik" on storage.objects;

create policy "dokumen_magang_insert_pemilik" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'dokumen-magang'
    and exists (
      select 1 from pendaftar p
      where p.id::text = (storage.foldername(name))[1]
        and p.user_id = auth.uid()
    )
  );