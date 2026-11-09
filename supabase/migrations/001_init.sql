-- No Names: initial schema
-- Security model: every table has RLS enabled and NO policies.
-- That means the anon/authenticated keys used in the browser can read NOTHING.
-- All access goes through Next.js server code using the service-role key.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text,
  dob                   date,
  ig_username           text unique,          -- set ONLY once verified
  ig_user_id            text unique,          -- Instagram-scoped id of the verifying DM sender
  verified_at           timestamptz,
  show_count_public     boolean not null default false,
  allow_revealing_hints boolean not null default false,
  created_at            timestamptz not null default now(),
  constraint ig_username_format check (ig_username is null or ig_username ~ '^[a-z0-9._]{1,30}$')
);

-- ---------------------------------------------------------------------------
-- Verification codes (user DMs the code to @nonames.love)
-- ---------------------------------------------------------------------------
create table if not exists public.verification_codes (
  code        text primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists verification_codes_user_idx on public.verification_codes(user_id);

-- ---------------------------------------------------------------------------
-- Crushes
-- A crush is ACTIVE when removed_at is null and expires_at > now().
-- ---------------------------------------------------------------------------
create table if not exists public.crushes (
  id               uuid primary key default gen_random_uuid(),
  from_user_id     uuid not null references public.profiles(id) on delete cascade,
  to_username      text not null check (to_username ~ '^[a-z0-9._]{1,30}$'),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '30 days'),
  removed_at       timestamptz,
  matched_at       timestamptz,
  boosted_at       timestamptz,
  reminder_sent_at timestamptz
);
create unique index if not exists crushes_one_live_per_pair
  on public.crushes(from_user_id, to_username) where removed_at is null;
create index if not exists crushes_to_username_idx on public.crushes(to_username) where removed_at is null;

-- ---------------------------------------------------------------------------
-- Matches (user_a < user_b so each pair exists once)
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id          uuid primary key default gen_random_uuid(),
  user_a      uuid not null references public.profiles(id) on delete cascade,
  user_b      uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  seen_by_a   boolean not null default false,
  seen_by_b   boolean not null default false,
  hidden_at   timestamptz,                    -- set when either side blocks
  constraint matches_order check (user_a < user_b),
  constraint matches_unique unique (user_a, user_b)
);

-- ---------------------------------------------------------------------------
-- Safety
-- ---------------------------------------------------------------------------
create table if not exists public.opt_outs (
  ig_username text primary key,
  source      text not null default 'web',   -- web | dm | admin
  created_at  timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id  uuid not null references public.profiles(id) on delete cascade,
  blocked_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  reported_id  uuid not null references public.profiles(id) on delete cascade,
  match_id     uuid references public.matches(id) on delete set null,
  reason       text not null,
  status       text not null default 'open',  -- open | resolved
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Entitlements (used by v1.1 payments; extra_slots already honored by add_crush)
-- ---------------------------------------------------------------------------
create table if not exists public.entitlements (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  extra_slots    int  not null default 0,
  hint_credits   int  not null default 0,
  boost_credits  int  not null default 0,
  sub_status     text,
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Lock everything down
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.verification_codes enable row level security;
alter table public.crushes            enable row level security;
alter table public.matches            enable row level security;
alter table public.opt_outs           enable row level security;
alter table public.blocks             enable row level security;
alter table public.reports            enable row level security;
alter table public.entitlements       enable row level security;

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- add_crush: the heart of the app. Runs in ONE transaction:
-- validation -> insert -> mutual detection -> match creation.
-- Returns json: { ok, error?, crush_id?, match_id? }
-- ---------------------------------------------------------------------------
create or replace function public.add_crush(p_user uuid, p_username text, p_base_slots int default 5)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_me         public.profiles%rowtype;
  v_target     public.profiles%rowtype;
  v_username   text := lower(trim(both '@' from trim(p_username)));
  v_active     int;
  v_slots      int;
  v_crush_id   uuid;
  v_match_id   uuid;
  v_a          uuid;
  v_b          uuid;
begin
  select * into v_me from public.profiles where id = p_user;
  if not found or v_me.verified_at is null or v_me.ig_username is null then
    return json_build_object('ok', false, 'error', 'not_verified');
  end if;

  if v_username !~ '^[a-z0-9._]{1,30}$' then
    return json_build_object('ok', false, 'error', 'invalid_username');
  end if;
  if v_username = v_me.ig_username then
    return json_build_object('ok', false, 'error', 'self');
  end if;
  if exists (select 1 from public.opt_outs where ig_username = v_username) then
    return json_build_object('ok', false, 'error', 'opted_out');
  end if;

  select * into v_target from public.profiles where ig_username = v_username;
  if found and exists (
    select 1 from public.blocks
    where (blocker_id = p_user and blocked_id = v_target.id)
       or (blocker_id = v_target.id and blocked_id = p_user)
  ) then
    return json_build_object('ok', false, 'error', 'unavailable');
  end if;

  -- Serialize work on this pair of usernames so simultaneous mutual adds can't race.
  perform pg_advisory_xact_lock(hashtext(least(v_me.ig_username, v_username) || '|' || greatest(v_me.ig_username, v_username)));
  -- Also serialize per-user so slot counting is exact.
  perform pg_advisory_xact_lock(hashtext('slots|' || p_user::text));

  -- Retire any expired-but-not-removed row for this pair so the unique index allows a fresh one.
  update public.crushes set removed_at = now()
   where from_user_id = p_user and to_username = v_username
     and removed_at is null and expires_at <= now();

  if exists (select 1 from public.crushes
              where from_user_id = p_user and to_username = v_username and removed_at is null) then
    return json_build_object('ok', false, 'error', 'duplicate');
  end if;

  select count(*) into v_active from public.crushes
   where from_user_id = p_user and removed_at is null and expires_at > now() and matched_at is null;
  select p_base_slots + coalesce((select extra_slots from public.entitlements where user_id = p_user), 0)
    into v_slots;
  if v_active >= v_slots then
    return json_build_object('ok', false, 'error', 'no_slots');
  end if;

  insert into public.crushes (from_user_id, to_username) values (p_user, v_username)
  returning id into v_crush_id;

  -- Mutual?
  if v_target.id is not null and exists (
    select 1 from public.crushes
     where from_user_id = v_target.id and to_username = v_me.ig_username
       and removed_at is null and expires_at > now()
  ) then
    v_a := least(p_user, v_target.id);
    v_b := greatest(p_user, v_target.id);
    insert into public.matches (user_a, user_b) values (v_a, v_b)
    on conflict (user_a, user_b) do update set hidden_at = null
    returning id into v_match_id;

    update public.crushes set matched_at = now()
     where removed_at is null and matched_at is null
       and ((from_user_id = p_user and to_username = v_username)
         or (from_user_id = v_target.id and to_username = v_me.ig_username));
  end if;

  return json_build_object('ok', true, 'crush_id', v_crush_id, 'match_id', v_match_id);
end $$;

-- When someone verifies a username, any crushes already waiting for them may now be mutual
-- (e.g. A added B, then B joined and added A before verifying is impossible, but B may have
-- been added by A AND B's pending crushes are created only after verification, so add_crush
-- covers it). This helper counts unmatched active incoming crushes for a username.
create or replace function public.incoming_count(p_username text)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.crushes c
   where c.to_username = lower(p_username)
     and c.removed_at is null and c.expires_at > now() and c.matched_at is null;
$$;

-- Only the service role may execute these.
revoke all on function public.add_crush(uuid, text, int) from public, anon, authenticated;
revoke all on function public.incoming_count(text) from public, anon, authenticated;
