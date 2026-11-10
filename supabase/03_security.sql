-- =====================================================================
-- GNER.MODA — 03 · Permissões (RLS) e armazenamento de imagens
-- Visitante: lê só o que está publicado. Admin (tabela admins): lê e grava tudo.
-- =====================================================================

-- ---------- Acesso básico às tabelas (o RLS abaixo restringe as linhas) --
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
revoke execute on function public.save_project(jsonb) from public, anon;
revoke execute on function public.save_piece(jsonb)   from public, anon;
grant  execute on function public.save_project(jsonb) to authenticated;
grant  execute on function public.save_piece(jsonb)   to authenticated;
-- a lista de admins nunca é gravada pelo site
revoke insert, update, delete on public.admins from anon, authenticated;

alter table public.admins               enable row level security;
alter table public.pieces               enable row level security;
alter table public.piece_images         enable row level security;
alter table public.projects             enable row level security;
alter table public.project_images       enable row level security;
alter table public.project_credits      enable row level security;
alter table public.project_pieces       enable row level security;
alter table public.project_image_pieces enable row level security;

-- Recria as políticas (permite rodar o arquivo de novo)
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public'
             and tablename in ('admins','pieces','piece_images','projects','project_images',
                               'project_credits','project_pieces','project_image_pieces')
  loop execute format('drop policy %I on public.%I', r.policyname, r.tablename); end loop;
end $$;

-- admins: cada usuário só consegue ver se ele mesmo é admin
create policy admins_self_read on public.admins for select to authenticated
  using (user_id = auth.uid());

-- pieces
create policy pieces_public_read on public.pieces for select
  using (is_published or public.is_admin());
create policy pieces_admin_write on public.pieces for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- piece_images
create policy piece_images_public_read on public.piece_images for select
  using (public.is_admin() or exists (
    select 1 from public.pieces p where p.id = piece_id and p.is_published));
create policy piece_images_admin_write on public.piece_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- projects: visitante só vê publicados; rascunhos e arquivados só admin (inclui pré-visualização)
create policy projects_public_read on public.projects for select
  using (status = 'published' or public.is_admin());
create policy projects_admin_write on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- filhos de projeto: visíveis se o projeto estiver publicado
create policy project_images_public_read on public.project_images for select
  using (public.is_admin() or exists (
    select 1 from public.projects p where p.id = project_id and p.status = 'published'));
create policy project_images_admin_write on public.project_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy project_credits_public_read on public.project_credits for select
  using (public.is_admin() or exists (
    select 1 from public.projects p where p.id = project_id and p.status = 'published'));
create policy project_credits_admin_write on public.project_credits for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy project_pieces_public_read on public.project_pieces for select
  using (public.is_admin() or (
    exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
    and exists (select 1 from public.pieces x where x.id = piece_id and x.is_published)));
create policy project_pieces_admin_write on public.project_pieces for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy project_image_pieces_public_read on public.project_image_pieces for select
  using (public.is_admin() or exists (
    select 1 from public.project_images i join public.projects p on p.id = i.project_id
     where i.id = image_id and p.status = 'published'));
create policy project_image_pieces_admin_write on public.project_image_pieces for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: bucket "media" ------------------------------------
-- Leitura pública (as fotos aparecem no site); envio, troca e remoção só por admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_admin_select on storage.objects;
drop policy if exists media_admin_insert on storage.objects;
drop policy if exists media_admin_update on storage.objects;
drop policy if exists media_admin_delete on storage.objects;

create policy media_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
