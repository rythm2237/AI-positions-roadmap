begin;

do $migration$
declare
  v_definition text;
begin
  v_definition := pg_get_functiondef(
    'public.admin_create_manual_salary_candidate(jsonb)'::regprocedure
  );

  if position('digest(jsonb_build_object(' in v_definition) = 0 then
    raise exception 'manual salary digest expression not found';
  end if;

  v_definition := replace(
    v_definition,
    'digest(jsonb_build_object(',
    'extensions.digest(jsonb_build_object('
  );
  v_definition := replace(
    v_definition,
    '''sha256''',
    '''sha256''::text'
  );

  if position('extensions.digest(' in v_definition) = 0
    or position('''sha256''::text' in v_definition) = 0 then
    raise exception 'manual salary digest replacement failed';
  end if;

  -- pg_get_functiondef returns the complete CREATE OR REPLACE FUNCTION statement,
  -- preserving the signature, SECURITY DEFINER flag, and fixed search_path.
  execute v_definition;
end
$migration$;

revoke all on function public.admin_create_manual_salary_candidate(jsonb)
  from public, anon;
grant execute on function public.admin_create_manual_salary_candidate(jsonb)
  to authenticated;

commit;
