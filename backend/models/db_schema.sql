-- Users
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  name text,
  avatar_url text,
  created_at timestamp default now()
);

-- Items (hierarchy)
create table if not exists items (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references users(id) on delete cascade,
  parent_id uuid references items(id) on delete set null,
  type text check (type in ('file', 'folder')) not null,
  name text not null,
  size bigint default 0,
  mime_type text,
  storage_path text,
  is_trashed boolean default false,
  trashed_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create unique index if not exists unique_item_name_per_folder
  on items(owner_id, parent_id, lower(name));

-- Permissions
create table if not exists permissions (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('viewer', 'editor', 'owner')),
  created_at timestamp default now(),
  unique(item_id, user_id)
);

-- Shares
create table if not exists shares (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id) on delete cascade,
  token_hash text not null,
  is_public boolean default false,
  expires_at timestamp,
  created_at timestamp default now()
);

-- Versions
create table if not exists versions (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id) on delete cascade,
  version_no int not null,
  storage_path text not null,
  size bigint,
  mime_type text,
  created_by uuid references users(id),
  created_at timestamp default now(),
  unique(item_id, version_no)
);

-- Files (standalone)
create table if not exists files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  filename text not null,
  size bigint,
  type text,
  path text,
  created_at timestamp default now(),
  is_deleted boolean default false,
  trashed_at timestamp,
  is_public boolean default false,
  share_token text,
  permissions jsonb default '{"viewer":[],"editor":[]}'
);

-- Indexes
create index if not exists idx_files_user_deleted on files (user_id, is_deleted);
create index if not exists idx_items_owner on items(owner_id);
create index if not exists idx_items_parent on items(parent_id);
create index if not exists idx_permissions_item on permissions(item_id);
create index if not exists idx_permissions_user on permissions(user_id);
create index if not exists idx_shares_item on shares(item_id);
create index if not exists idx_versions_item on versions(item_id);
create index if not exists idx_files_user on files(user_id);

alter table files 
add column if not exists item_id uuid references items(id) on delete cascade;