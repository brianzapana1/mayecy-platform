create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'admin',
  creado timestamptz not null default now(),

  constraint admin_profiles_role_check
    check (role in ('admin'))
);

alter table public.admin_profiles enable row level security;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = user_id
      and role = 'admin'
  );
$$;

drop policy if exists "Admins can read own admin profile"
on public.admin_profiles;

create policy "Admins can read own admin profile"
on public.admin_profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Admins can insert categories"
on public.categorias;

create policy "Admins can insert categories"
on public.categorias
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update categories"
on public.categorias;

create policy "Admins can update categories"
on public.categorias
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete categories"
on public.categorias;

create policy "Admins can delete categories"
on public.categorias
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can insert products"
on public.productos;

create policy "Admins can insert products"
on public.productos
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update products"
on public.productos;

create policy "Admins can update products"
on public.productos
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete products"
on public.productos;

create policy "Admins can delete products"
on public.productos
for delete
to authenticated
using (public.is_admin(auth.uid()));