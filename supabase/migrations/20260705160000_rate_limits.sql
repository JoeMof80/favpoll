-- Fixed-window rate limiting, shared across serverless instances.
-- Called with the service role only; fail-open in the app layer so a
-- limiter outage can never block pledging.
create table rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null
);

create or replace function check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
as $$
declare
  allowed boolean;
begin
  insert into rate_limits as rl (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    count = case
      when rl.window_start < now() - make_interval(secs => p_window_seconds)
        then 1
      else rl.count + 1
    end,
    window_start = case
      when rl.window_start < now() - make_interval(secs => p_window_seconds)
        then now()
      else rl.window_start
    end
  returning rl.count <= p_max into allowed;

  -- probabilistic sweep of stale windows so the table stays small
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '1 day';
  end if;

  return allowed;
end;
$$;

revoke all on table rate_limits from public, anon, authenticated;
revoke execute on function check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
