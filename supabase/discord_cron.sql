-- ============================================================================
-- Braosa Tales — Vôr scheduler: Supabase calls the website every 15 minutes,
-- and the website sends whatever Discord messages are due.
--
-- Run AFTER discord_reminders.sql, and only once the /api/cron/discord route
-- is deployed and CRON_SECRET is set in Vercel.
--
-- Step 1 (once, by hand, NOT saved in this file or in git): store the same
-- CRON_SECRET value you put in Vercel, in the Supabase Vault:
--
--   select vault.create_secret('<paste CRON_SECRET here>', 'discord_cron_secret');
--
-- Step 2: run the rest of this file. Safe to re-run.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Re-running replaces the job instead of adding a second one.
select cron.unschedule(jobid) from cron.job where jobname = 'vor-discord';

select cron.schedule(
  'vor-discord',
  '*/15 * * * *',
  $$
  select net.http_post(
    url     := 'https://www.braosatales.com/api/cron/discord',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'discord_cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- Check the job and its last runs:
-- select jobname, schedule, active from cron.job;
-- select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;
-- What the website answered (should be 200 with {"sent":…}):
-- select status_code, content, created from net._http_response order by created desc limit 5;
--
-- To stop Vôr entirely:  select cron.unschedule('vor-discord');
