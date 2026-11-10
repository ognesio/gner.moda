-- =====================================================================
-- GNER.MODA — 02 · Funções de gravação do painel
-- Cada salvamento acontece numa única transação: ou grava tudo, ou nada.
-- As funções rodam com as permissões de quem chama (RLS continua valendo).
-- =====================================================================

-- ---------- Salvar projeto -------------------------------------------
-- p = { id, slug, title, artist, stylist, short_description, body, category,
--       project_date, status, sort_order, featured_home,
--       images:  [{ id, path, thumb, width, height, alt, caption, is_cover }]  (ordem = posição)
--       credits: [{ name, role }]
--       piece_ids: [uuid] }
-- Retorna { id, code, slug, status, removed_paths[] } — removed_paths são arquivos a apagar do Storage.
create or replace function public.save_project(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id      uuid := coalesce((p->>'id')::uuid, gen_random_uuid());
  v_status  project_status := coalesce((p->>'status')::project_status, 'draft');
  v_images  jsonb := coalesce(p->'images', '[]'::jsonb);
  v_removed text[];
  v_row     public.projects;
  v_has_cover boolean;
begin
  if not public.is_admin() then
    raise exception 'Sem permissão' using errcode = '42501';
  end if;

  if coalesce(trim(p->>'title'), '') = '' then
    raise exception 'Informe o nome do projeto.';
  end if;
  if coalesce(trim(p->>'slug'), '') = '' then
    raise exception 'Informe a URL amigável (slug).';
  end if;
  if v_status = 'published' and jsonb_array_length(v_images) = 0 then
    raise exception 'Para publicar, envie ao menos uma imagem.';
  end if;
  if exists (select 1 from public.projects where slug = p->>'slug' and id <> v_id) then
    raise exception 'Já existe um projeto com a URL "%".', p->>'slug';
  end if;

  insert into public.projects as t (id, slug, title, artist, stylist, short_description, body,
                                    category, project_date, status, sort_order, featured_home)
  values (v_id, p->>'slug', trim(p->>'title'),
          nullif(trim(p->>'artist'), ''), nullif(trim(p->>'stylist'), ''),
          nullif(trim(p->>'short_description'), ''), nullif(trim(p->>'body'), ''),
          nullif(trim(p->>'category'), ''), nullif(trim(p->>'project_date'), ''),
          v_status, coalesce((p->>'sort_order')::int, 0), coalesce((p->>'featured_home')::boolean, false))
  on conflict (id) do update set
    slug = excluded.slug, title = excluded.title, artist = excluded.artist, stylist = excluded.stylist,
    short_description = excluded.short_description, body = excluded.body, category = excluded.category,
    project_date = excluded.project_date, status = excluded.status,
    sort_order = excluded.sort_order, featured_home = excluded.featured_home
  returning * into v_row;

  -- Imagens: remove as que saíram (devolvendo os arquivos), atualiza e insere as demais
  select coalesce(array_agg(x.path) || array_agg(x.thumb) filter (where x.thumb is not null), '{}')
    into v_removed
    from public.project_images x
   where x.project_id = v_id
     and x.id not in (select (e->>'id')::uuid from jsonb_array_elements(v_images) e where e ? 'id');

  delete from public.project_images x
   where x.project_id = v_id
     and x.id not in (select (e->>'id')::uuid from jsonb_array_elements(v_images) e where e ? 'id');

  update public.project_images set is_cover = false where project_id = v_id;

  v_has_cover := exists (select 1 from jsonb_array_elements(v_images) e where (e->>'is_cover')::boolean);

  insert into public.project_images as t (id, project_id, path, thumb, width, height, alt, caption, position, is_cover)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), v_id, e->>'path', nullif(e->>'thumb', ''),
         (e->>'width')::int, (e->>'height')::int,
         nullif(trim(e->>'alt'), ''), nullif(trim(e->>'caption'), ''),
         (ord - 1)::int,
         case when v_has_cover then coalesce((e->>'is_cover')::boolean, false) else ord = 1 end
    from jsonb_array_elements(v_images) with ordinality as a(e, ord)
  on conflict (id) do update set
    path = excluded.path, thumb = excluded.thumb, width = excluded.width, height = excluded.height,
    alt = excluded.alt, caption = excluded.caption, position = excluded.position, is_cover = excluded.is_cover;

  -- Créditos
  delete from public.project_credits where project_id = v_id;
  insert into public.project_credits (project_id, name, role, position)
  select v_id, trim(e->>'name'), nullif(trim(e->>'role'), ''), (ord - 1)::int
    from jsonb_array_elements(coalesce(p->'credits', '[]'::jsonb)) with ordinality as a(e, ord)
   where coalesce(trim(e->>'name'), '') <> '';

  -- Peças do acervo
  delete from public.project_pieces where project_id = v_id;
  insert into public.project_pieces (project_id, piece_id, position)
  select v_id, (e #>> '{}')::uuid, (ord - 1)::int
    from jsonb_array_elements(coalesce(p->'piece_ids', '[]'::jsonb)) with ordinality as a(e, ord)
  on conflict do nothing;

  return jsonb_build_object('id', v_row.id, 'code', v_row.code, 'slug', v_row.slug,
                            'status', v_row.status, 'removed_paths', to_jsonb(v_removed));
end $$;

-- ---------- Salvar peça ----------------------------------------------
-- p = { id, slug, name, category, sizes[], colors[], materials[], status, description,
--       measurements, condition, price_note, is_published, sort_order,
--       images: [{ id, path, thumb, width, height, alt }] }
create or replace function public.save_piece(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id      uuid := coalesce((p->>'id')::uuid, gen_random_uuid());
  v_images  jsonb := coalesce(p->'images', '[]'::jsonb);
  v_removed text[];
  v_row     public.pieces;
  v_slug    text := p->>'slug';
begin
  if not public.is_admin() then
    raise exception 'Sem permissão' using errcode = '42501';
  end if;
  if coalesce(trim(p->>'name'), '') = '' then
    raise exception 'Informe o nome da peça.';
  end if;
  if coalesce(trim(v_slug), '') = '' then
    raise exception 'Informe a URL amigável (slug).';
  end if;
  if exists (select 1 from public.pieces where slug = v_slug and id <> v_id) then
    raise exception 'Já existe uma peça com a URL "%".', v_slug;
  end if;

  insert into public.pieces as t (id, slug, name, category, sizes, colors, materials, status,
                                  description, measurements, condition, price_note, is_published, sort_order)
  values (v_id, v_slug, trim(p->>'name'), (p->>'category')::piece_category,
          coalesce(array(select jsonb_array_elements_text(p->'sizes')), '{}'),
          coalesce(array(select jsonb_array_elements_text(p->'colors')), '{}'),
          coalesce(array(select jsonb_array_elements_text(p->'materials')), '{}'),
          coalesce((p->>'status')::piece_status, 'sob_consulta'),
          nullif(trim(p->>'description'), ''), nullif(trim(p->>'measurements'), ''),
          nullif(trim(p->>'condition'), ''), nullif(trim(p->>'price_note'), ''),
          coalesce((p->>'is_published')::boolean, true), coalesce((p->>'sort_order')::int, 0))
  on conflict (id) do update set
    slug = excluded.slug, name = excluded.name, category = excluded.category, sizes = excluded.sizes,
    colors = excluded.colors, materials = excluded.materials, status = excluded.status,
    description = excluded.description, measurements = excluded.measurements,
    condition = excluded.condition, price_note = excluded.price_note,
    is_published = excluded.is_published, sort_order = excluded.sort_order
  returning * into v_row;

  select coalesce(array_agg(x.path) || array_agg(x.thumb) filter (where x.thumb is not null), '{}')
    into v_removed
    from public.piece_images x
   where x.piece_id = v_id
     and x.id not in (select (e->>'id')::uuid from jsonb_array_elements(v_images) e where e ? 'id');

  delete from public.piece_images x
   where x.piece_id = v_id
     and x.id not in (select (e->>'id')::uuid from jsonb_array_elements(v_images) e where e ? 'id');

  insert into public.piece_images as t (id, piece_id, path, thumb, width, height, alt, position)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), v_id, e->>'path', nullif(e->>'thumb', ''),
         (e->>'width')::int, (e->>'height')::int, nullif(trim(e->>'alt'), ''), (ord - 1)::int
    from jsonb_array_elements(v_images) with ordinality as a(e, ord)
  on conflict (id) do update set
    path = excluded.path, thumb = excluded.thumb, width = excluded.width, height = excluded.height,
    alt = excluded.alt, position = excluded.position;

  return jsonb_build_object('id', v_row.id, 'code', v_row.code, 'slug', v_row.slug,
                            'removed_paths', to_jsonb(v_removed));
end $$;
