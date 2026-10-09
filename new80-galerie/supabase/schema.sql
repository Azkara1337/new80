-- NEW80 Galerie : schéma Supabase. À exécuter une fois dans SQL Editor.

create type public.couleur as enum ('rouge', 'bleu', 'or', 'blanc');

-- Comptes équipe autorisés à l'admin
create table public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table public.soirees (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  date date not null,
  color public.couleur not null,
  artist text,
  cover_key text,
  cover_thumb_key text,
  cover_color text,
  published boolean not null default false,
  photo_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index soirees_published_date on public.soirees (published, date desc);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  soiree_id uuid not null references public.soirees on delete cascade,
  thumb_key text not null,
  full_key text not null,
  width int not null,
  height int not null,
  color text not null default '#1a1a1c',
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index photos_soiree_position on public.photos (soiree_id, position);

-- Compteur de photos tenu à jour automatiquement
create or replace function public.sync_photo_count() returns trigger
language plpgsql security definer set search_path = public as $$
declare sid uuid := coalesce(new.soiree_id, old.soiree_id);
begin
  update public.soirees
     set photo_count = (select count(*) from public.photos where soiree_id = sid),
         updated_at = now()
   where id = sid;
  return null;
end $$;

create trigger photos_count after insert or delete on public.photos
for each row execute function public.sync_photo_count();

-- Sécurité (RLS)
alter table public.admins enable row level security;
alter table public.soirees enable row level security;
alter table public.photos enable row level security;

create policy "admin voit sa ligne" on public.admins for select using (user_id = auth.uid());

create policy "lecture soirées publiées" on public.soirees for select
  using (published or public.is_admin());
create policy "admin écrit soirées" on public.soirees for all
  using (public.is_admin()) with check (public.is_admin());

create policy "lecture photos publiées" on public.photos for select
  using (public.is_admin() or exists (select 1 from public.soirees s where s.id = soiree_id and s.published));
create policy "admin écrit photos" on public.photos for all
  using (public.is_admin()) with check (public.is_admin());

-- Ajouter un membre de l'équipe (après l'avoir invité dans Authentication > Users) :
-- insert into public.admins (user_id) select id from auth.users where email = 'prenom@new80.fr';
