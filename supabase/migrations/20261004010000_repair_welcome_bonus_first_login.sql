insert into public.profiles (id, full_name)
select auth_user.id, coalesce(auth_user.raw_user_meta_data ->> 'full_name', '')
from auth.users as auth_user
where not exists (
  select 1 from public.profiles as profile where profile.id = auth_user.id
)
on conflict (id) do nothing;

delete from public.welcome_bonus_claims as claim
using auth.users as auth_user
where claim.user_id = auth_user.id
  and auth_user.created_at >= '2026-10-04 17:42:00+00'::timestamptz
  and coalesce(
    (select account.data ->> 'welcomeBonusGranted'
     from public.account_data as account
     where account.user_id = auth_user.id),
    'false'
  ) <> 'true';

create or replace function public.claim_welcome_bonus()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'Authentication is required to claim the welcome bonus.';
  end if;

  insert into public.profiles (id, full_name)
  select auth_user.id, coalesce(auth_user.raw_user_meta_data ->> 'full_name', '')
  from auth.users as auth_user
  where auth_user.id = caller_id
  on conflict (id) do nothing;

  if not exists (
    select 1
    from public.profiles
    where id = caller_id
      and role = 'user'
      and not suspended
  ) then
    raise exception 'This account is not eligible for the welcome bonus.';
  end if;

  insert into public.welcome_bonus_claims (user_id)
  values (caller_id)
  on conflict (user_id) do nothing;

  if not found then
    return false;
  end if;

  insert into public.account_data (user_id, data)
  values (
    caller_id,
    jsonb_build_object(
      'userId', caller_id,
      'welcomeBonusGranted', false,
      'portfolio', jsonb_build_object(
        'totalBalance', 0,
        'availableBalance', 0,
        'unrealizedPnL', 0,
        'realizedPnL', 0
      ),
      'assets', jsonb_build_object(
        'USDT', 0,
        'BTC', 0,
        'ETH', 0,
        'SOL', 0,
        'BNB', 0,
        'XRP', 0,
        'DOGE', 0
      ),
      'positions', '{}'::jsonb,
      'orders', jsonb_build_object(
        'openOrders', '[]'::jsonb,
        'orderHistory', '[]'::jsonb,
        'tradeHistory', '[]'::jsonb
      ),
      'fundingHistory', '[]'::jsonb,
      'watchlist', jsonb_build_array('BTC/USDT', 'ETH/USDT', 'SOL/USDT')
    )
  )
  on conflict (user_id) do nothing;

  update public.account_data as account
  set data = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          account.data,
          '{assets,USDT}',
          to_jsonb(coalesce((account.data #>> '{assets,USDT}')::numeric, 0) + 200),
          true
        ),
        '{portfolio,availableBalance}',
        to_jsonb(coalesce((account.data #>> '{portfolio,availableBalance}')::numeric, 0) + 200),
        true
      ),
      '{portfolio,totalBalance}',
      to_jsonb(coalesce((account.data #>> '{portfolio,totalBalance}')::numeric, 0) + 200),
      true
    ),
    '{welcomeBonusGranted}',
    'true'::jsonb,
    true
  ),
  updated_at = now()
  where account.user_id = caller_id;

  return true;
end;
$$;

revoke all on function public.claim_welcome_bonus() from public, anon, authenticated;
grant execute on function public.claim_welcome_bonus() to authenticated;
