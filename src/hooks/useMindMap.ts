import { useState, useEffect, useCallback } from 'react';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
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

// Migration function to convert old format to new format
const migrateMindMap = (oldMap: any): MindMap => {
  // If it's already in the new format, return as is
  if (oldMap.nodes && !oldMap.data) {
    return {
      ...oldMap,
      createdAt: new Date(oldMap.createdAt)
    };
  }
  
  // If it's in the old format, migrate it
  if (oldMap.data) {
    return {
      id: oldMap.id,
      name: oldMap.name,
      nodes: (oldMap.data.nodes || []).map((node: any) => ({
        id: node.id,
        type: 'mindMapNode',
        position: { x: node.x || 0, y: node.y || 0 },
        data: {
          title: node.title || 'Nowy węzeł',
          content: node.content || '',
          color: node.color || 'blue'
        }
      })),
      edges: (oldMap.data.connections || []).map((conn: any) => ({
        id: conn.id,
        source: conn.from,
        target: conn.to,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'rgba(139, 92, 246, 0.8)', strokeWidth: 3 }
      })),
      createdAt: new Date(oldMap.createdAt || Date.now())
    };
  }
  
  // Fallback to default structure
  return {
    id: oldMap.id || crypto.randomUUID(),
    name: oldMap.name || 'Mapa myśli',
    nodes: [],
    edges: [],
    createdAt: new Date(oldMap.createdAt || Date.now())
  };
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

  // Load mind maps from localStorage
  const loadMindMaps = () => {
    try {
      setLoading(true);
      
      const stored = localStorage.getItem('mindMaps');
      if (stored) {
        const rawMaps = JSON.parse(stored);
        const migratedMaps = rawMaps.map(migrateMindMap);
        setMindMaps(migratedMaps);
        
        // Set current map if not set or doesn't exist
        const storedCurrentId = localStorage.getItem('currentMapId');
        if (storedCurrentId && migratedMaps.find(m => m.id === storedCurrentId)) {
          setCurrentMapId(storedCurrentId);
        } else if (migratedMaps.length > 0) {
          setCurrentMapId(migratedMaps[0].id);
        }
      } else {
        // Create default map for new users
        const newMaps = [defaultMindMap];
        setMindMaps(newMaps);
        setCurrentMapId(defaultMindMap.id);
        saveMindMaps(newMaps);
      }
    } catch (error) {
      console.error('Error loading mind maps:', error);
      const newMaps = [defaultMindMap];
      setMindMaps(newMaps);
      setCurrentMapId(defaultMindMap.id);
      saveMindMaps(newMaps);
      
      toast({
        title: "Błąd",
        description: "Błąd ładowania map myśli, utworzono nową mapę",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save mind maps to localStorage
  const saveMindMaps = (maps: MindMap[]) => {
    try {
      localStorage.setItem('mindMaps', JSON.stringify(maps));
    } catch (error) {
      console.error('Error saving mind maps:', error);
      toast({
        title: "Błąd",
        description: "Nie można zapisać map myśli",
        variant: "destructive",
      });
    }
  };

  // Save current map ID to localStorage
  const saveCurrentMapId = (mapId: string) => {
    try {
      localStorage.setItem('currentMapId', mapId);
      setCurrentMapId(mapId);
    } catch (error) {
      console.error('Error saving current map ID:', error);
    }
  };

  // Load on mount
  useEffect(() => {
    loadMindMaps();
  }, []);

  const onNodesChange = useCallback((changes: any) => {
    const updatedMaps = mindMaps.map(map =>
      map.id === currentMapId
        ? { ...map, nodes: applyNodeChanges(changes, map.nodes || []) }
        : map
    );
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);
  }, [currentMapId, mindMaps]);

  const onEdgesChange = useCallback((changes: any) => {
    const updatedMaps = mindMaps.map(map =>
      map.id === currentMapId
        ? { ...map, edges: applyEdgeChanges(changes, map.edges || []) }
        : map
    );
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);
  }, [currentMapId, mindMaps]);

  const onConnect = useCallback((connection: Connection) => {
    const updatedMaps = mindMaps.map(map =>
      map.id === currentMapId
        ? {
            ...map,
            edges: addEdge(
              {
                ...connection,
                type: 'smoothstep',
                animated: true,
                style: { stroke: 'rgba(139, 92, 246, 0.8)', strokeWidth: 3 },
              },
              map.edges || []
            ),
          }
        : map
    );
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);
  }, [currentMapId, mindMaps]);

  const addNode = useCallback((x: number, y: number) => {
    const selectedColor = localStorage.getItem('selectedNodeColor') || 'blue';
    const newId = crypto.randomUUID();

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

    const updatedMaps = mindMaps.map(map =>
      map.id === currentMapId ? { ...map, nodes: [...(map.nodes || []), newNode] } : map
    );
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);

    return newId;
  }, [currentMapId, mindMaps]);

  const updateNode = useCallback((id: string, updates: Partial<MindMapNodeData>) => {
    const updatedMaps = mindMaps.map(map =>
      map.id === currentMapId
        ? {
            ...map,
            nodes: (map.nodes || []).map(node =>
              node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
            ),
          }
        : map
    );
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);
  }, [currentMapId, mindMaps]);

  const deleteNode = useCallback((id: string) => {
    const updatedMaps = mindMaps.map(map =>
      map.id === currentMapId
        ? {
            ...map,
            nodes: (map.nodes || []).filter(node => node.id !== id),
            edges: (map.edges || []).filter(edge => edge.source !== id && edge.target !== id),
          }
        : map
    );
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);
  }, [currentMapId, mindMaps]);

  const createNewMap = useCallback((name: string) => {
    const newMap: MindMap = {
      id: crypto.randomUUID(),
      name,
      nodes: [],
      edges: [],
      createdAt: new Date()
    };
    
    const updatedMaps = [...mindMaps, newMap];
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);
    saveCurrentMapId(newMap.id);
    
    toast({
      title: "Sukces",
      description: "Nowa mapa została utworzona",
    });
    
    return newMap.id;
  }, [mindMaps, toast]);

  const deleteMap = useCallback((mapId: string) => {
    const updatedMaps = mindMaps.filter(map => map.id !== mapId);
    
    if (updatedMaps.length === 0) {
      // Create default map if no maps left
      const defaultMap: MindMap = {
        id: crypto.randomUUID(),
        name: 'Moja pierwsza mapa',
        nodes: [],
        edges: [],
        createdAt: new Date()
      };
      setMindMaps([defaultMap]);
      saveMindMaps([defaultMap]);
      saveCurrentMapId(defaultMap.id);
    } else {
      setMindMaps(updatedMaps);
      saveMindMaps(updatedMaps);
      
      if (currentMapId === mapId) {
        saveCurrentMapId(updatedMaps[0].id);
      }
    }

    toast({
      title: "Sukces",
      description: "Mapa została usunięta",
    });
  }, [currentMapId, mindMaps, toast]);

  const renameMap = useCallback((mapId: string, newName: string) => {
    const updatedMaps = mindMaps.map(map => 
      map.id === mapId ? { ...map, name: newName } : map
    );
    setMindMaps(updatedMaps);
    saveMindMaps(updatedMaps);

    toast({
      title: "Sukces",
      description: "Nazwa mapy została zmieniona",
    });
  }, [mindMaps, toast]);

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
    setCurrentMapId: saveCurrentMapId,
    createNewMap,
    deleteMap,
    renameMap,
  };
}