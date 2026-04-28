-- 在 Supabase SQL Editor 中执行（请先已存在 public.appreciations 表且已 enable RLS）
-- 用途：仅允许「本对情侣」的成员读取；仅允许本人作为 from_user 写入，且 to_user 必须是另一半

create policy "appreciations_select_own_couple"
  on public.appreciations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.couples c
      where c.id = appreciations.couple_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  );

create policy "appreciations_insert_as_member"
  on public.appreciations
  for insert
  to authenticated
  with check (
    from_user_id = auth.uid()
    and exists (
      select 1
      from public.couples c
      where c.id = couple_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
        and (
          (auth.uid() = c.user_a and to_user_id is not distinct from c.user_b)
          or
          (auth.uid() = c.user_b and to_user_id = c.user_a)
        )
    )
  );
