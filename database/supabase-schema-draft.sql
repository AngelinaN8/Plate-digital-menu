-- Plate Supabase schema snapshot. Applied through the Supabase migration tool.
-- Application access is through the authenticated Plate backend only.
-- No anonymous/authenticated Data API table grants or permissive RLS policies.
begin;
create table if not exists public.plate_menus (
 owner_id text primary key,
 slug text not null unique,
 draft jsonb not null check (jsonb_typeof(draft)='object'),
 published jsonb check (published is null or jsonb_typeof(published)='object'),
 updated_at timestamptz not null,
 published_at timestamptz
);
create table if not exists public.plate_uploads (
 id uuid primary key,
 owner_id text not null,
 object_key text not null unique,
 mime text not null check (mime in ('image/jpeg','image/png','image/webp')),
 rights_confirmed_at timestamptz not null,
 rights_source text not null,
 created_at timestamptz not null
);
create index if not exists plate_uploads_owner_idx on public.plate_uploads(owner_id);
create table if not exists public.plate_menu_metrics (
 key text primary key,
 slug text not null references public.plate_menus(slug) on delete cascade,
 day date not null,
 kind text not null check (kind in ('menu_open','dish_view','dish_save')),
 dish_id text not null,
 count integer not null default 0 check (count between 0 and 10000)
);
create index if not exists plate_menu_metrics_slug_day on public.plate_menu_metrics(slug,day);
create table if not exists public.plate_ai_usage (
 key text primary key,
 day date not null,
 count integer not null default 0 check (count>=0)
);
alter table public.plate_menus enable row level security;
alter table public.plate_uploads enable row level security;
alter table public.plate_menu_metrics enable row level security;
alter table public.plate_ai_usage enable row level security;
revoke all on public.plate_menus,public.plate_uploads,public.plate_menu_metrics,public.plate_ai_usage from anon,authenticated;
grant select,insert,update,delete on public.plate_menus,public.plate_uploads,public.plate_menu_metrics,public.plate_ai_usage to service_role;

create or replace function public.plate_reserve_ai(p_key text,p_day date,p_limit integer)
returns integer language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 if p_limit<1 or p_limit>1000 then raise exception 'Invalid quota'; end if;
 insert into public.plate_ai_usage(key,day,count) values(p_key,p_day,1)
 on conflict(key) do update set count=public.plate_ai_usage.count+1
 where public.plate_ai_usage.count<p_limit returning count into n;
 return coalesce(n,0);
end;
$$;
create or replace function public.plate_increment_metric(p_key text,p_slug text,p_day date,p_kind text,p_dish_id text)
returns void language sql security invoker set search_path='' as $$
 insert into public.plate_menu_metrics(key,slug,day,kind,dish_id,count)
 values(p_key,p_slug,p_day,p_kind,p_dish_id,1)
 on conflict(key) do update set count=public.plate_menu_metrics.count+1
 where public.plate_menu_metrics.count<10000;
$$;
create or replace function public.plate_compare_and_swap_menu(
 p_owner_id text,p_expected_draft jsonb,p_expected_published jsonb,
 p_draft jsonb,p_published jsonb,p_updated_at timestamptz,p_published_at timestamptz
) returns setof public.plate_menus language sql security invoker set search_path='' as $$
 update public.plate_menus set draft=p_draft,published=p_published,updated_at=p_updated_at,published_at=p_published_at
 where owner_id=p_owner_id and draft=p_expected_draft and published is not distinct from p_expected_published
 returning *;
$$;
revoke all on function public.plate_reserve_ai(text,date,integer) from public,anon,authenticated;
revoke all on function public.plate_increment_metric(text,text,date,text,text) from public,anon,authenticated;
revoke all on function public.plate_compare_and_swap_menu(text,jsonb,jsonb,jsonb,jsonb,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.plate_reserve_ai(text,date,integer) to service_role;
grant execute on function public.plate_increment_metric(text,text,date,text,text) to service_role;
grant execute on function public.plate_compare_and_swap_menu(text,jsonb,jsonb,jsonb,jsonb,timestamptz,timestamptz) to service_role;
commit;
