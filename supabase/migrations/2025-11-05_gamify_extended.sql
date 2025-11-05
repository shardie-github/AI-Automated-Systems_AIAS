-- Extended Gamification & Community Schema
-- Comments system
create table if not exists public.comments (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  parent_id bigint references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_comments_parent_id on public.comments(parent_id);

-- Moderation flags
create table if not exists public.moderation_flags (
  id bigserial primary key,
  flagged_by uuid not null references auth.users(id) on delete cascade,
  post_id bigint references public.posts(id) on delete cascade,
  comment_id bigint references public.comments(id) on delete cascade,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz default now(),
  constraint one_target check ((post_id is not null)::int + (comment_id is not null)::int = 1)
);

-- Referrals
create table if not exists public.referrals (
  id bigserial primary key,
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete cascade,
  referral_code text not null unique,
  email text,
  status text default 'pending' check (status in ('pending', 'signed_up', 'converted', 'rewarded')),
  converted_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_referrals_referrer on public.referrals(referrer_id);
create index if not exists idx_referrals_code on public.referrals(referral_code);

-- Challenges
create table if not exists public.challenges (
  id bigserial primary key,
  title text not null,
  description text,
  challenge_type text not null check (challenge_type in ('weekly', 'monthly', 'seasonal', 'special')),
  start_date timestamptz not null,
  end_date timestamptz not null,
  xp_reward int default 50,
  badge_id bigint references public.badges(id),
  requirements jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists public.challenge_participants (
  id bigserial primary key,
  challenge_id bigint not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress jsonb default '{}',
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(challenge_id, user_id)
);

create index if not exists idx_challenge_participants_user on public.challenge_participants(user_id);

-- Leaderboards
create table if not exists public.leaderboard_entries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('weekly', 'monthly', 'all_time')),
  period_start timestamptz not null,
  xp_earned int default 0,
  rank int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, period, period_start)
);

create index if not exists idx_leaderboard_period on public.leaderboard_entries(period, period_start, rank);

-- Push notifications
create table if not exists public.push_subscriptions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- Notifications
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('streak_reminder', 'challenge_started', 'challenge_completed', 'badge_earned', 'level_up', 'comment_reply', 'reaction', 'referral_reward', 'milestone')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user_unread on public.notifications(user_id, read_at);

-- User follows
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

create index if not exists idx_user_follows_follower on public.user_follows(follower_id);
create index if not exists idx_user_follows_following on public.user_follows(following_id);

-- Activity feed
create table if not exists public.activities (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('post_created', 'comment_added', 'badge_earned', 'level_up', 'challenge_completed', 'streak_milestone', 'referral_sent')),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_activities_user on public.activities(user_id, created_at desc);

-- Subscription tiers (for premium features)
create table if not exists public.subscription_tiers (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null check (tier in ('free', 'starter', 'pro', 'enterprise')),
  xp_multiplier decimal(3,2) default 1.0,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_subscription_tiers_user on public.subscription_tiers(user_id);

-- User points/rewards (for redemption)
create table if not exists public.user_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points int default 0,
  total_earned int default 0,
  total_spent int default 0,
  updated_at timestamptz default now()
);

create table if not exists public.point_transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  transaction_type text not null check (transaction_type in ('earned', 'spent', 'expired', 'bonus')),
  reason text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_point_transactions_user on public.point_transactions(user_id, created_at desc);

-- Onboarding quests
create table if not exists public.onboarding_quests (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_type text not null check (quest_type in ('profile_setup', 'first_post', 'first_journal', 'first_reaction', 'invite_friend')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, quest_type)
);

-- Milestones
create table if not exists public.milestones (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_type text not null check (milestone_type in ('streak_7', 'streak_30', 'streak_100', 'level_10', 'level_25', 'level_50', 'xp_1000', 'xp_10000', 'first_badge', 'badge_collector')),
  achieved_at timestamptz default now(),
  unique(user_id, milestone_type)
);

-- Enhanced posts (add more fields)
alter table public.posts add column if not exists title text;
alter table public.posts add column if not exists image_url text;
alter table public.posts add column if not exists tags text[];
alter table public.posts add column if not exists is_pinned boolean default false;
alter table public.posts add column if not exists view_count int default 0;

-- Enhanced profiles
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists total_xp int default 0;
alter table public.profiles add column if not exists total_referrals int default 0;

-- RLS Policies
alter table public.comments enable row level security;
alter table public.moderation_flags enable row level security;
alter table public.referrals enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.user_follows enable row level security;
alter table public.activities enable row level security;
alter table public.subscription_tiers enable row level security;
alter table public.user_points enable row level security;
alter table public.point_transactions enable row level security;
alter table public.onboarding_quests enable row level security;
alter table public.milestones enable row level security;

-- Comments policies
create policy "read_comments" on public.comments for select using (true);
create policy "write_comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "edit_own_comments" on public.comments for update using (auth.uid() = user_id);
create policy "delete_own_comments" on public.comments for delete using (auth.uid() = user_id);

-- Moderation policies
create policy "flag_content" on public.moderation_flags for insert with check (auth.uid() = flagged_by);
create policy "view_own_flags" on public.moderation_flags for select using (auth.uid() = flagged_by);

-- Referrals policies
create policy "own_referrals" on public.referrals for all using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "read_referral_code" on public.referrals for select using (true);

-- Challenges policies
create policy "read_challenges" on public.challenges for select using (true);
create policy "join_challenges" on public.challenge_participants for insert with check (auth.uid() = user_id);
create policy "update_own_challenge" on public.challenge_participants for update using (auth.uid() = user_id);
create policy "view_challenge_participants" on public.challenge_participants for select using (true);

-- Leaderboard policies
create policy "read_leaderboards" on public.leaderboard_entries for select using (true);
create policy "update_own_leaderboard" on public.leaderboard_entries for all using (auth.uid() = user_id);

-- Push subscriptions policies
create policy "own_push_subscriptions" on public.push_subscriptions for all using (auth.uid() = user_id);

-- Notifications policies
create policy "own_notifications" on public.notifications for all using (auth.uid() = user_id);

-- Follows policies
create policy "own_follows" on public.user_follows for all using (auth.uid() = follower_id);

-- Activities policies
create policy "read_activities" on public.activities for select using (true);
create policy "create_activities" on public.activities for insert with check (auth.uid() = user_id);

-- Subscription tiers policies
create policy "own_subscription" on public.subscription_tiers for all using (auth.uid() = user_id);
create policy "read_subscription_multiplier" on public.subscription_tiers for select using (true);

-- User points policies
create policy "own_points" on public.user_points for all using (auth.uid() = user_id);
create policy "read_own_points" on public.point_transactions for select using (auth.uid() = user_id);

-- Onboarding policies
create policy "own_onboarding" on public.onboarding_quests for all using (auth.uid() = user_id);

-- Milestones policies
create policy "own_milestones" on public.milestones for all using (auth.uid() = user_id);
create policy "read_milestones" on public.milestones for select using (true);

-- Functions for automatic referral code generation
create or replace function generate_referral_code() returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Trigger to auto-generate referral code on profile creation
create or replace function set_referral_code() returns trigger as $$
begin
  if new.referral_code is null then
    loop
      new.referral_code := generate_referral_code();
      if not exists (select 1 from public.profiles where referral_code = new.referral_code) then
        exit;
      end if;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_referral_code_trigger
  before insert or update on public.profiles
  for each row
  execute function set_referral_code();

-- Function to update leaderboard
create or replace function update_leaderboard() returns trigger as $$
declare
  period_start timestamptz;
  period_type text;
begin
  -- Weekly
  period_start := date_trunc('week', now());
  period_type := 'weekly';
  
  insert into public.leaderboard_entries (user_id, period, period_start, xp_earned)
  values (new.user_id, period_type, period_start, coalesce(new.total_xp, 0))
  on conflict (user_id, period, period_start) 
  do update set xp_earned = coalesce(new.total_xp, 0), updated_at = now();
  
  -- Monthly
  period_start := date_trunc('month', now());
  period_type := 'monthly';
  
  insert into public.leaderboard_entries (user_id, period, period_start, xp_earned)
  values (new.user_id, period_type, period_start, coalesce(new.total_xp, 0))
  on conflict (user_id, period, period_start) 
  do update set xp_earned = coalesce(new.total_xp, 0), updated_at = now();
  
  -- All time
  period_start := '1970-01-01'::timestamptz;
  period_type := 'all_time';
  
  insert into public.leaderboard_entries (user_id, period, period_start, xp_earned)
  values (new.user_id, period_type, period_start, coalesce(new.total_xp, 0))
  on conflict (user_id, period, period_start) 
  do update set xp_earned = coalesce(new.total_xp, 0), updated_at = now();
  
  return new;
end;
$$ language plpgsql;

create trigger update_leaderboard_trigger
  after insert or update of total_xp on public.profiles
  for each row
  execute function update_leaderboard();
