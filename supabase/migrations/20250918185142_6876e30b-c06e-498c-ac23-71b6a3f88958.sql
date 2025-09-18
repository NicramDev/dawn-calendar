-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing cron job if it exists (to avoid duplicates)
SELECT cron.unschedule('daily-reminder-check');

-- Schedule the daily reminder function to run every minute
SELECT
  cron.schedule(
    'daily-reminder-check',
    '* * * * *', -- every minute
    $$
    SELECT
      net.http_post(
          url:='https://uattapdsfpbjpvfabqce.supabase.co/functions/v1/daily-reminder',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdHRhcGRzZnBianB2ZmFicWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjYxNjEsImV4cCI6MjA3MzcwMjE2MX0.rB3dJKYasgsNr1U4Rk5ELbqxRSRoHQ2JPwJKrFdfXEk"}'::jsonb,
          body:=concat('{"time": "', now(), '"}')::jsonb
      ) as request_id;
    $$
  );