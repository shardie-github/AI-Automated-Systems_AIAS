-- Orchestrator Tables
-- Stores orchestrator reports, dependency reports, cost forecasts, and security audits

-- Orchestrator Reports
create table if not exists public.orchestrator_reports (
  id bigint generated always as identity primary key,
  cycle integer not null,
  timestamp timestamptz not null,
  status text not null check (status in ('success', 'partial', 'failed')),
  report jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_orchestrator_reports_cycle on public.orchestrator_reports(cycle desc);
create index if not exists idx_orchestrator_reports_timestamp on public.orchestrator_reports(timestamp desc);
create index if not exists idx_orchestrator_reports_status on public.orchestrator_reports(status);

-- Dependency Reports
create table if not exists public.dependency_reports (
  id bigint generated always as identity primary key,
  report jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_dependency_reports_created on public.dependency_reports(created_at desc);

-- Cost Forecasts
create table if not exists public.cost_forecasts (
  id bigint generated always as identity primary key,
  forecast jsonb not null,
  trends jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_cost_forecasts_created on public.cost_forecasts(created_at desc);

-- Security Audits
create table if not exists public.security_audits (
  id bigint generated always as identity primary key,
  audit jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_security_audits_created on public.security_audits(created_at desc);

-- RLS Policies
alter table public.orchestrator_reports enable row level security;
alter table public.dependency_reports enable row level security;
alter table public.cost_forecasts enable row level security;
alter table public.security_audits enable row level security;

-- Service role can do everything
create policy "orchestrator_reports_service_role_all" on public.orchestrator_reports
  for all using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

create policy "dependency_reports_service_role_all" on public.dependency_reports
  for all using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

create policy "cost_forecasts_service_role_all" on public.cost_forecasts
  for all using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

create policy "security_audits_service_role_all" on public.security_audits
  for all using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can read
create policy "orchestrator_reports_authenticated_read" on public.orchestrator_reports
  for select using (auth.role() = 'authenticated');

create policy "dependency_reports_authenticated_read" on public.dependency_reports
  for select using (auth.role() = 'authenticated');

create policy "cost_forecasts_authenticated_read" on public.cost_forecasts
  for select using (auth.role() = 'authenticated');

create policy "security_audits_authenticated_read" on public.security_audits
  for select using (auth.role() = 'authenticated');

-- Function to get latest orchestrator report
create or replace function get_latest_orchestrator_report()
returns jsonb as $$
  select report
  from public.orchestrator_reports
  order by cycle desc
  limit 1;
$$ language sql security definer;

-- Function to get RLS status for tables (helper for security audit)
create or replace function get_table_rls_status()
returns table (
  table_name text,
  rls_enabled boolean
) as $$
begin
  return query
  select 
    schemaname||'.'||tablename as table_name,
    rowsecurity as rls_enabled
  from pg_tables
  where schemaname = 'public'
  order by tablename;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant select on public.orchestrator_reports to authenticated, anon;
grant select on public.dependency_reports to authenticated, anon;
grant select on public.cost_forecasts to authenticated, anon;
grant select on public.security_audits to authenticated, anon;
