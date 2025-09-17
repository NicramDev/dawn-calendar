-- Remove RLS and user_id columns since we don't use auth anymore

-- Disable RLS
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_map_nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_map_edges DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;

DROP POLICY IF EXISTS "Users can view their own mind maps" ON public.mind_maps;
DROP POLICY IF EXISTS "Users can create their own mind maps" ON public.mind_maps;
DROP POLICY IF EXISTS "Users can update their own mind maps" ON public.mind_maps;
DROP POLICY IF EXISTS "Users can delete their own mind maps" ON public.mind_maps;

DROP POLICY IF EXISTS "Users can view their own mind map nodes" ON public.mind_map_nodes;
DROP POLICY IF EXISTS "Users can create their own mind map nodes" ON public.mind_map_nodes;
DROP POLICY IF EXISTS "Users can update their own mind map nodes" ON public.mind_map_nodes;
DROP POLICY IF EXISTS "Users can delete their own mind map nodes" ON public.mind_map_nodes;

DROP POLICY IF EXISTS "Users can view their own mind map edges" ON public.mind_map_edges;
DROP POLICY IF EXISTS "Users can create their own mind map edges" ON public.mind_map_edges;
DROP POLICY IF EXISTS "Users can update their own mind map edges" ON public.mind_map_edges;
DROP POLICY IF EXISTS "Users can delete their own mind map edges" ON public.mind_map_edges;

-- Remove user_id columns and foreign key constraints
ALTER TABLE public.calendar_events DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.mind_maps DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.mind_map_nodes DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.mind_map_edges DROP COLUMN IF EXISTS user_id;