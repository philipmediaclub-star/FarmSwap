-- Run this in Supabase SQL Editor AFTER you have a Resend API key (see the
-- step-by-step from Claude for creating one). Replace 'PASTE_YOUR_KEY_HERE'
-- below before running.

-- pg_net lets Postgres make outbound HTTP calls (e.g. to Resend's API).
-- It's usually already available on Supabase projects.
create extension if not exists pg_net;

-- Stores the Resend API key encrypted, rather than in plain SQL text
-- visible in your migration history.
select vault.create_secret('PASTE_YOUR_KEY_HERE', 'resend_api_key');

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient_id uuid;
  recipient_email text;
  sender_name text;
  api_key text;
begin
  -- Figure out who the *other* person in the conversation is.
  select case
    when conversations.participant_a = new.sender_id then conversations.participant_b
    else conversations.participant_a
  end
  into recipient_id
  from conversations
  where conversations.id = new.conversation_id;

  select email into recipient_email from auth.users where id = recipient_id;
  select full_name into sender_name from public.profiles where id = new.sender_id;
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';

  if recipient_email is not null and api_key is not null then
    perform net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || api_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'from', 'FarmSwap <onboarding@resend.dev>',
        'to', recipient_email,
        'subject', coalesce(sender_name, 'Noen') || ' sendte deg en melding på FarmSwap',
        'html',
          '<p>' || replace(new.body, '<', '&lt;') || '</p>' ||
          '<p><a href="https://neosoft.no/meldinger/' || new.conversation_id || '">Åpne samtalen</a></p>'
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_new_message_notify on public.messages;

create trigger on_new_message_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();
