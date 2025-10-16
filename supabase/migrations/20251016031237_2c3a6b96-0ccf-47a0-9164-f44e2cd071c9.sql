-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create app_role enum for user roles
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create profiles table for user data
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create user_roles table (security best practice - separate from profiles)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Create chat_conversations table
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create chat_messages table
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.chat_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_chat_conversations_user_id on public.chat_conversations(user_id);
create index idx_chat_messages_conversation_id on public.chat_messages(conversation_id);
create index idx_chat_messages_created_at on public.chat_messages(created_at);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Security definer function to check user roles (prevents RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Security definer function to check if user is admin
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can manage all roles"
  on public.user_roles for all
  using (public.is_admin(auth.uid()));

-- RLS Policies for chat_conversations
create policy "Users can view their own conversations"
  on public.chat_conversations for select
  using (auth.uid() = user_id);

create policy "Users can create their own conversations"
  on public.chat_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.chat_conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on public.chat_conversations for delete
  using (auth.uid() = user_id);

create policy "Admins can view all conversations"
  on public.chat_conversations for select
  using (public.is_admin(auth.uid()));

-- RLS Policies for chat_messages
create policy "Users can view messages in their conversations"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_conversations
      where id = chat_messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create messages in their conversations"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_conversations
      where id = chat_messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can view all messages"
  on public.chat_messages for select
  using (public.is_admin(auth.uid()));

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  
  -- Assign default 'user' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Trigger to create profile and role on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_conversations_updated_at
  before update on public.chat_conversations
  for each row execute procedure public.update_updated_at_column();