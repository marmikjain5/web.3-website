## Supabase changes to support admin event media upload

### 1) Create the storage bucket
1. Open your Supabase project dashboard.
2. Go to `Storage`.
3. Create a new bucket named:
   - `event-media`
4. Set the bucket to public access so `getPublicUrl()` works, or ensure public read access is enabled.

> If you prefer a different bucket name, update `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` in your .env to match.

---

### 2) Add the `event_media` table
1. Go to `Database` → `Tables`.
2. Create a new table named `event_media`.
3. Add these columns:

- `id` — `uuid` — `primary key` — default: `gen_random_uuid()` or `uuid_generate_v4()`
- `event_id` — `uuid` — foreign key to `events.id`
- `title` — `text`
- `description` — `text`
- `file_url` — `text`
- `file_name` — `text`
- `file_size_bytes` — `bigint`
- `mime_type` — `text`
- `storage_path` — `text`
- `uploaded_at` — `timestamp with time zone` — default: `now()`

4. Add the foreign key constraint:
- `event_id` references `events(id)` on delete cascade

If you prefer SQL, use:

```sql
create table event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  title text,
  description text,
  file_url text not null,
  file_name text not null,
  file_size_bytes bigint not null,
  mime_type text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);
```

---

### 3) Verify `events` table metadata columns
Your code already expects `events.title` and `events.description`.

If those columns are missing, add them:
- `title` — `text`
- `description` — `text`

Example SQL:

```sql
alter table events
  add column if not exists title text,
  add column if not exists description text;
```

---

### 4) Configure bucket/public access
Because the code uses:

- `supabase.storage.from(bucketName).upload(...)`
- `supabase.storage.from(bucketName).getPublicUrl(storagePath)`

You need the storage bucket to allow public access for served URLs.

In Supabase Storage:
- Open `event-media`
- Enable public access for objects
- Or use a policy that allows public read

---

### 5) Optional: add database policies
If you are using Row-Level Security (RLS) on `event_media` or `events`, add at least a public SELECT policy for the media page.

Example:

```sql
alter table event_media enable row level security;

create policy "Public select media" on event_media
  for select using (true);
```

And for events:

```sql
alter table events enable row level security;

create policy "Public select events" on events
  for select using (true);
```

> If your app server uses the Supabase service role for these reads then RLS may not be needed, but public select policies are safest for anonymous public pages.

---

### 6) Update your local environment
In your .env file, ensure these values are present and correct:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=event-media
```

---

### 7) Test it
1. Open admin dashboard `/admin`
2. Upload media for an event
3. Confirm:
   - file is stored in `event-media/{eventId}/...`
   - row is created in `event_media`
   - `file_url` points to the stored object
   - `/media` page displays the uploaded media

If you want, I can also give you the exact Supabase SQL to run for the bucket policy and table creation.