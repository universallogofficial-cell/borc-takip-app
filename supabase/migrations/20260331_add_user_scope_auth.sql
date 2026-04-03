-- Auth-ready user scope migration
-- Bu migration, debt/cash/payment kayıtlarını Supabase Auth kullanıcısına bağlamak için
-- minimum user_id alanlarını ve owner bazlı RLS başlangıcını ekler.
-- Mevcut anonim kayıtlar için gerekirse ayrı bir backfill uygulanmalıdır.

alter table public.debts
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.cash
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.payments
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists debts_user_id_idx on public.debts (user_id);
create index if not exists cash_user_id_idx on public.cash (user_id);
create index if not exists payments_user_id_idx on public.payments (user_id);

alter table public.debts enable row level security;
alter table public.cash enable row level security;
alter table public.payments enable row level security;

create policy "debts_select_own"
on public.debts for select
to authenticated
using (auth.uid() = user_id);

create policy "debts_insert_own"
on public.debts for insert
to authenticated
with check (auth.uid() = user_id);

create policy "debts_update_own"
on public.debts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "debts_delete_own"
on public.debts for delete
to authenticated
using (auth.uid() = user_id);

create policy "cash_select_own"
on public.cash for select
to authenticated
using (auth.uid() = user_id);

create policy "cash_insert_own"
on public.cash for insert
to authenticated
with check (auth.uid() = user_id);

create policy "cash_update_own"
on public.cash for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "cash_delete_own"
on public.cash for delete
to authenticated
using (auth.uid() = user_id);

create policy "payments_select_own"
on public.payments for select
to authenticated
using (auth.uid() = user_id);

create policy "payments_insert_own"
on public.payments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "payments_update_own"
on public.payments for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "payments_delete_own"
on public.payments for delete
to authenticated
using (auth.uid() = user_id);
