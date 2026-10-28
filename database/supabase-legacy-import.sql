-- Idempotent, backend-only import. Existing Supabase menus are never overwritten.
create or replace function public.plate_import_legacy(p_menu jsonb,p_uploads jsonb,p_metrics jsonb,p_usage jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare imported_owner text;
begin
 insert into public.plate_menus(owner_id,slug,draft,published,updated_at,published_at)
 values(p_menu->>'owner_id',p_menu->>'slug',p_menu->'draft',nullif(p_menu->'published','null'::jsonb),(p_menu->>'updated_at')::timestamptz,(p_menu->>'published_at')::timestamptz)
 on conflict do nothing returning owner_id into imported_owner;
 if imported_owner is null then return; end if;
 insert into public.plate_uploads(id,owner_id,object_key,mime,rights_confirmed_at,rights_source,created_at)
 select (x->>'id')::uuid,x->>'owner_id',x->>'object_key',x->>'mime',(x->>'rights_confirmed_at')::timestamptz,x->>'rights_source',(x->>'created_at')::timestamptz
 from jsonb_array_elements(p_uploads) x where x->>'owner_id'=imported_owner on conflict do nothing;
 insert into public.plate_menu_metrics(key,slug,day,kind,dish_id,count)
 select x->>'key',x->>'slug',(x->>'day')::date,x->>'kind',x->>'dish_id',least((x->>'count')::integer,10000)
 from jsonb_array_elements(p_metrics) x where x->>'slug'=p_menu->>'slug' on conflict do nothing;
 insert into public.plate_ai_usage(key,day,count)
 select x->>'key',(x->>'day')::date,(x->>'count')::integer from jsonb_array_elements(p_usage) x
 on conflict(key) do update set count=greatest(public.plate_ai_usage.count,excluded.count);
end;
$$;
revoke all on function public.plate_import_legacy(jsonb,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.plate_import_legacy(jsonb,jsonb,jsonb,jsonb) to service_role;
