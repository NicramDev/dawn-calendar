-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  planned_date TIMESTAMP WITH TIME ZONE NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('blue', 'pink', 'green', 'purple', 'orange', 'yellow')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mind maps table
CREATE TABLE public.mind_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mind map nodes table
CREATE TABLE public.mind_map_nodes (
  id TEXT NOT NULL PRIMARY KEY,
  mind_map_id UUID NOT NULL REFERENCES public.mind_maps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'custom',
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT 'New Node',
  content TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT 'blue' CHECK (color IN ('blue', 'pink', 'green', 'purple', 'orange', 'yellow')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mind map edges table
CREATE TABLE public.mind_map_edges (
  id TEXT NOT NULL PRIMARY KEY,
  mind_map_id UUID NOT NULL REFERENCES public.mind_maps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_map_edges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for mind_maps
CREATE POLICY "Users can view their own mind maps" 
ON public.mind_maps 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mind maps" 
ON public.mind_maps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind maps" 
ON public.mind_maps 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind maps" 
ON public.mind_maps 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for mind_map_nodes
CREATE POLICY "Users can view their own mind map nodes" 
ON public.mind_map_nodes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mind map nodes" 
ON public.mind_map_nodes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind map nodes" 
ON public.mind_map_nodes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind map nodes" 
ON public.mind_map_nodes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for mind_map_edges
CREATE POLICY "Users can view their own mind map edges" 
ON public.mind_map_edges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mind map edges" 
ON public.mind_map_edges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind map edges" 
ON public.mind_map_edges 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind map edges" 
ON public.mind_map_edges 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mind_maps_updated_at
BEFORE UPDATE ON public.mind_maps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mind_map_nodes_updated_at
BEFORE UPDATE ON public.mind_map_nodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_due_date ON public.calendar_events(due_date);
CREATE INDEX idx_calendar_events_planned_date ON public.calendar_events(planned_date);
CREATE INDEX idx_mind_maps_user_id ON public.mind_maps(user_id);
CREATE INDEX idx_mind_map_nodes_mind_map_id ON public.mind_map_nodes(mind_map_id);
CREATE INDEX idx_mind_map_nodes_user_id ON public.mind_map_nodes(user_id);
CREATE INDEX idx_mind_map_edges_mind_map_id ON public.mind_map_edges(mind_map_id);
CREATE INDEX idx_mind_map_edges_user_id ON public.mind_map_edges(user_id);