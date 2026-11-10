-- =====================================================================
-- GNER.MODA — 01 · Estrutura do banco
-- Rodar no Supabase: SQL Editor → colar → Run. (Pode rodar de novo sem erro.)
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tipos ----------------------------------------------------
do $$ begin
  create type piece_category as enum ('superior','inferior','conjuntos','externas','acessorios','calcados');
exception when duplicate_object then null; end $$;

do $$ begin
  create type piece_status as enum ('disponivel','reservada','alugada','sob_consulta');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('draft','published','archived');
exception when duplicate_object then null; end $$;

-- ---------- Administradores ------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Acervo ---------------------------------------------------
create sequence if not exists public.piece_code_seq start 1;

create table if not exists public.pieces (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique
               default ('GM-' || lpad(nextval('public.piece_code_seq')::text, 4, '0')),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null check (length(trim(name)) > 0),
  category     piece_category not null,
  sizes        text[] not null default '{}',
  colors       text[] not null default '{}',
  materials    text[] not null default '{}',
  status       piece_status not null default 'sob_consulta',
  description  text,
  measurements text,
  condition    text,
  price_note   text,
  is_published boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.piece_images (
  id        uuid primary key default gen_random_uuid(),
  piece_id  uuid not null references public.pieces(id) on delete cascade,
  path      text not null,          -- caminho no Storage (bucket "media") ou "/static/..." servido pelo site
  thumb     text,                   -- versão pequena (opcional)
  width     integer not null check (width > 0),
  height    integer not null check (height > 0),
  alt       text,
  position  integer not null default 0
);
create index if not exists piece_images_piece_idx on public.piece_images(piece_id, position);

-- ---------- Projetos & Cases -----------------------------------------
create sequence if not exists public.project_code_seq start 1;

create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique
                    default ('PRJ-' || lpad(nextval('public.project_code_seq')::text, 4, '0')),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title             text not null check (length(trim(title)) > 0),
  artist            text,
  stylist           text,
  short_description text,
  body              text,
  category          text,
  project_date      text,            -- livre: "2026" ou "março de 2026"
  status            project_status not null default 'draft',
  published_at      timestamptz,
  sort_order        integer not null default 0,
  featured_home     boolean not null default false,
  is_test           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  updated_by        uuid references auth.users(id) on delete set null
);
create index if not exists projects_status_idx on public.projects(status, sort_order);

create table if not exists public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  path       text not null,
  thumb      text,
  width      integer not null check (width > 0),
  height     integer not null check (height > 0),
  alt        text,
  caption    text,
  position   integer not null default 0,
  is_cover   boolean not null default false
);
create index if not exists project_images_project_idx on public.project_images(project_id, position);
-- no máximo uma capa por projeto
create unique index if not exists project_images_one_cover
  on public.project_images(project_id) where is_cover;

create table if not exists public.project_credits (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  role       text,
  position   integer not null default 0
);
create index if not exists project_credits_project_idx on public.project_credits(project_id, position);

create table if not exists public.project_pieces (
  project_id uuid not null references public.projects(id) on delete cascade,
  piece_id   uuid not null references public.pieces(id)   on delete restrict,  -- peça usada não pode ser apagada
  position   integer not null default 0,
  primary key (project_id, piece_id)
);
create index if not exists project_pieces_piece_idx on public.project_pieces(piece_id);

-- Preparado para o futuro: marcar peças dentro de uma foto específica
create table if not exists public.project_image_pieces (
  image_id uuid not null references public.project_images(id) on delete cascade,
  piece_id uuid not null references public.pieces(id)         on delete restrict,
  x        numeric check (x between 0 and 1),   -- posição relativa na foto (opcional)
  y        numeric check (y between 0 and 1),
  primary key (image_id, piece_id)
);

-- ---------- Gatilhos -------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if tg_table_name = 'projects' then
    new.updated_by := coalesce(auth.uid(), new.updated_by);
    if new.status = 'published' and new.published_at is null then
      new.published_at := now();
    end if;
  end if;
  return new;
end $$;

drop trigger if exists pieces_touch on public.pieces;
create trigger pieces_touch before insert or update on public.pieces
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before insert or update on public.projects
  for each row execute function public.touch_updated_at();
