import { useState, useEffect, useCallback } from 'react';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MindMapNodeData {
  title: string;
  content: string;
  color: string;
}

export interface MindMap {
  id: string;
  name: string;
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  createdAt: Date;
}

const defaultMindMap: MindMap = {
  id: 'default',
  name: 'Moja pierwsza mapa',
  nodes: [],
  edges: [],
  createdAt: new Date()
};

export function useMindMap() {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string>('default');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const currentMap = mindMaps.find(map => map.id === currentMapId) || mindMaps[0] || defaultMindMap;
  const nodes = currentMap?.nodes || [];
  const edges = currentMap?.edges || [];

  // Load mind maps from Supabase
  const loadMindMaps = async () => {
    try {
      setLoading(true);
      
      // Load mind maps
      const { data: mapsData, error: mapsError } = await supabase
        .from('mind_maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (mapsError) throw mapsError;

      if (!mapsData || mapsData.length === 0) {
        // Create default map for new users
        await createNewMap('Moja pierwsza mapa');
        return;
      }

      // Load nodes for all maps
      const { data: nodesData, error: nodesError } = await supabase
        .from('mind_map_nodes')
        .select('*');

      if (nodesError) throw nodesError;

      // Load edges for all maps  
      const { data: edgesData, error: edgesError } = await supabase
        .from('mind_map_edges')
        .select('*');

      if (edgesError) throw edgesError;

      // Group nodes and edges by mind map
      const mapsWithData: MindMap[] = mapsData.map(map => {
        const mapNodes = (nodesData || [])
          .filter(node => node.mind_map_id === map.id)
          .map(node => ({
            id: node.id,
            type: 'mindMapNode' as const,
            position: { x: node.position_x, y: node.position_y },
            data: {
              title: node.title,
              content: node.content,
              color: node.color
            }
          }));

        const mapEdges = (edgesData || [])
          .filter(edge => edge.mind_map_id === map.id)
          .map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: 'smoothstep' as const,
            animated: true,
            style: { stroke: 'rgba(139, 92, 246, 0.8)', strokeWidth: 3 }
          }));

        return {
          id: map.id,
          name: map.name,
          nodes: mapNodes,
          edges: mapEdges,
          createdAt: new Date(map.created_at)
        };
      });

      setMindMaps(mapsWithData);
      
      // Set current map if not set or doesn't exist
      if (!currentMapId || !mapsWithData.find(m => m.id === currentMapId)) {
        setCurrentMapId(mapsWithData[0]?.id || 'default');
      }
    } catch (error) {
      console.error('Error loading mind maps:', error);
      toast({
        title: "Błąd",
        description: "Nie można załadować map myśli",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadMindMaps();
  }, []);

  const onNodesChange = useCallback((changes: any) => {
    setMindMaps(prev => prev.map(map =>
      map.id === currentMapId
        ? { ...map, nodes: applyNodeChanges(changes, map.nodes || []) }
        : map
    ));

    // Update positions in database
    changes.forEach(async (change: any) => {
      if (change.type === 'position' && change.position) {
        try {
          await supabase
            .from('mind_map_nodes')
            .update({
              position_x: change.position.x,
              position_y: change.position.y
            })
            .eq('id', change.id);
        } catch (error) {
          console.error('Error updating node position:', error);
        }
      }
    });
  }, [currentMapId]);

  const onEdgesChange = useCallback((changes: any) => {
    setMindMaps(prev => prev.map(map =>
      map.id === currentMapId
        ? { ...map, edges: applyEdgeChanges(changes, map.edges || []) }
        : map
    ));

    // Handle edge deletions
    changes.forEach(async (change: any) => {
      if (change.type === 'remove') {
        try {
          await supabase
            .from('mind_map_edges')
            .delete()
            .eq('id', change.id);
        } catch (error) {
          console.error('Error deleting edge:', error);
        }
      }
    });
  }, [currentMapId]);

  const onConnect = useCallback(async (connection: Connection) => {
    try {
      const newEdgeId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('mind_map_edges')
        .insert({
          id: newEdgeId,
          mind_map_id: currentMapId,
          source: connection.source,
          target: connection.target
        });

      if (error) throw error;

      setMindMaps(prev => prev.map(map =>
        map.id === currentMapId
          ? {
              ...map,
              edges: addEdge(
                {
                  ...connection,
                  id: newEdgeId,
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: 'rgba(139, 92, 246, 0.8)', strokeWidth: 3 },
                },
                map.edges || []
              ),
            }
          : map
      ));
    } catch (error) {
      console.error('Error creating edge:', error);
      toast({
        title: "Błąd",
        description: "Nie można utworzyć połączenia",
        variant: "destructive",
      });
    }
  }, [currentMapId, toast]);

  const addNode = useCallback(async (x: number, y: number) => {
    try {
      const selectedColor = localStorage.getItem('selectedNodeColor') || 'blue';
      const newId = crypto.randomUUID();

      const { error } = await supabase
        .from('mind_map_nodes')
        .insert({
          id: newId,
          mind_map_id: currentMapId,
          position_x: x,
          position_y: y,
          title: 'Nowy węzeł',
          content: '',
          color: selectedColor
        });

      if (error) throw error;

      const newNode: Node<MindMapNodeData> = {
        id: newId,
        type: 'mindMapNode',
        position: { x, y },
        data: {
          title: 'Nowy węzeł',
          content: '',
          color: selectedColor,
        },
      };

      setMindMaps(prev => prev.map(map =>
        map.id === currentMapId ? { ...map, nodes: [...(map.nodes || []), newNode] } : map
      ));

      return newId;
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        title: "Błąd",
        description: "Nie można dodać węzła",
        variant: "destructive",
      });
    }
  }, [currentMapId, toast]);

  const updateNode = useCallback(async (id: string, updates: Partial<MindMapNodeData>) => {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.color !== undefined) updateData.color = updates.color;

      const { error } = await supabase
        .from('mind_map_nodes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setMindMaps(prev => prev.map(map =>
        map.id === currentMapId
          ? {
              ...map,
              nodes: (map.nodes || []).map(node =>
                node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
              ),
            }
          : map
      ));
    } catch (error) {
      console.error('Error updating node:', error);
      toast({
        title: "Błąd",
        description: "Nie można zaktualizować węzła",
        variant: "destructive",
      });
    }
  }, [currentMapId, toast]);

  const deleteNode = useCallback(async (id: string) => {
    try {
      // Delete node and its edges
      await Promise.all([
        supabase.from('mind_map_nodes').delete().eq('id', id),
        supabase.from('mind_map_edges').delete().or(`source.eq.${id},target.eq.${id}`)
      ]);

      setMindMaps(prev => prev.map(map =>
        map.id === currentMapId
          ? {
              ...map,
              nodes: (map.nodes || []).filter(node => node.id !== id),
              edges: (map.edges || []).filter(edge => edge.source !== id && edge.target !== id),
            }
          : map
      ));
    } catch (error) {
      console.error('Error deleting node:', error);
      toast({
        title: "Błąd",
        description: "Nie można usunąć węzła",
        variant: "destructive",
      });
    }
  }, [currentMapId, toast]);

  const createNewMap = useCallback(async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('mind_maps')
        .insert({
          name
        })
        .select()
        .single();

      if (error) throw error;

      const newMap: MindMap = {
        id: data.id,
        name: data.name,
        nodes: [],
        edges: [],
        createdAt: new Date(data.created_at)
      };
      
      setMindMaps(prev => [...prev, newMap]);
      setCurrentMapId(newMap.id);
      
      toast({
        title: "Sukces",
        description: "Nowa mapa została utworzona",
      });
      
      return newMap.id;
    } catch (error) {
      console.error('Error creating map:', error);
      toast({
        title: "Błąd",
        description: "Nie można utworzyć mapy",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteMap = useCallback(async (mapId: string) => {
    try {
      const { error } = await supabase
        .from('mind_maps')
        .delete()
        .eq('id', mapId);

      if (error) throw error;

      setMindMaps(prev => {
        const newMaps = prev.filter(map => map.id !== mapId);
        return newMaps;
      });
      
      if (currentMapId === mapId) {
        const remainingMaps = mindMaps.filter(map => map.id !== mapId);
        setCurrentMapId(remainingMaps[0]?.id || '');
        
        // Create default map if no maps left
        if (remainingMaps.length === 0) {
          createNewMap('Moja pierwsza mapa');
        }
      }

      toast({
        title: "Sukces",
        description: "Mapa została usunięta",
      });
    } catch (error) {
      console.error('Error deleting map:', error);
      toast({
        title: "Błąd",
        description: "Nie można usunąć mapy",
        variant: "destructive",
      });
    }
  }, [currentMapId, mindMaps, toast, createNewMap]);

  const renameMap = useCallback(async (mapId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('mind_maps')
        .update({ name: newName })
        .eq('id', mapId);

      if (error) throw error;

      setMindMaps(prev => prev.map(map => 
        map.id === mapId ? { ...map, name: newName } : map
      ));

      toast({
        title: "Sukces",
        description: "Nazwa mapy została zmieniona",
      });
    } catch (error) {
      console.error('Error renaming map:', error);
      toast({
        title: "Błąd",
        description: "Nie można zmienić nazwy mapy",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    // React Flow data
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    currentMap,
    loading,
    
    // Node operations
    selectedNode,
    setSelectedNode,
    addNode,
    updateNode,
    deleteNode,
    
    // Map management
    mindMaps,
    currentMapId,
    setCurrentMapId,
    createNewMap,
    deleteMap,
    renameMap,
  };
}