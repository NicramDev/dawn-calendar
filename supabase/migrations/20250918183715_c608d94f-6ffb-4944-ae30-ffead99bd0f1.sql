-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily reminder function to run every day at 18:00 (6 PM)
SELECT cron.schedule(
  'daily-reminder-18-00',
  '0 18 * * *', -- Every day at 18:00
  $$
  SELECT
    net.http_post(
        url:='https://uattapdsfpbjpvfabqce.supabase.co/functions/v1/daily-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdHRhcGRzZnBianB2ZmFicWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjYxNjEsImV4cCI6MjA3MzcwMjE2MX0.rB3dJKYasgsNr1U4Rk5ELbqxRSRoHQ2JPwJKrFdfXEk"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);