-- Add completed field to calendar_events table
ALTER TABLE public.calendar_events 
ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;