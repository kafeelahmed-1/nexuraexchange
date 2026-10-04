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
