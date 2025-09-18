-- Enable Row Level Security on all tables
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_map_edges ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_events (allow all operations for now since no authentication)
CREATE POLICY "Allow all access to calendar_events" ON calendar_events
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for mind_maps (allow all operations for now since no authentication)
CREATE POLICY "Allow all access to mind_maps" ON mind_maps
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for mind_map_nodes (allow all operations for now since no authentication)
CREATE POLICY "Allow all access to mind_map_nodes" ON mind_map_nodes
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for mind_map_edges (allow all operations for now since no authentication)
CREATE POLICY "Allow all access to mind_map_edges" ON mind_map_edges
  FOR ALL USING (true) WITH CHECK (true);