-- Run in Supabase SQL Editor. Adds unread-message tracking.

alter table public.messages
  add column if not exists read boolean not null default false;

-- Recipients need to be able to mark messages as read when they open a
-- conversation. (Insert/select policies for messages already exist from
-- schema.sql — this only adds update.)
create policy "Participants can mark messages as read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.participant_a = auth.uid() or conversations.participant_b = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.participant_a = auth.uid() or conversations.participant_b = auth.uid())
    )
  );
