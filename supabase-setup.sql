create table if not exists public.waitlist (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    name text,
    role text,
    newsletter boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

do $$
begin
    create policy "Allow public waitlist inserts"
        on public.waitlist
        for insert
        to anon, authenticated
        with check (true);
exception
    when duplicate_object then null;
end
$$;
