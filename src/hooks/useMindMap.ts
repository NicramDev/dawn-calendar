import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';

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
    return oldMap;
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
      createdAt: oldMap.createdAt || new Date()
    };
  }
  
  // Fallback to default structure
  return {
    id: oldMap.id || crypto.randomUUID(),
    name: oldMap.name || 'Mapa myśli',
    nodes: [],
    edges: [],
    createdAt: oldMap.createdAt || new Date()
  };
};

export function useMindMap() {
  const [rawMindMaps, setRawMindMaps] = useLocalStorage<any[]>('mindMaps', [defaultMindMap]);
  const [currentMapId, setCurrentMapId] = useLocalStorage<string>('currentMapId', 'default');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Migrate and ensure proper data structure
  const mindMaps = rawMindMaps.map(migrateMindMap);
  
  // Update localStorage with migrated data if needed
  const setMindMaps = useCallback((updater: any) => {
    setRawMindMaps(updater);
  }, [setRawMindMaps]);
  
  const currentMap = mindMaps.find(map => map.id === currentMapId) || mindMaps[0] || defaultMindMap;
  const nodes = currentMap?.nodes || [];
  const edges = currentMap?.edges || [];

  const updateCurrentMap = useCallback((updates: Partial<Pick<MindMap, 'nodes' | 'edges'>>) => {
    setMindMaps(prev => prev.map(map => 
      map.id === currentMapId 
        ? { ...map, ...updates }
        : map
    ));
  }, [currentMapId, setMindMaps]);

  const onNodesChange = useCallback((changes: any) => {
    const newNodes = applyNodeChanges(changes, nodes);
    updateCurrentMap({ nodes: newNodes });
  }, [nodes, updateCurrentMap]);

  const onEdgesChange = useCallback((changes: any) => {
    const newEdges = applyEdgeChanges(changes, edges);
    updateCurrentMap({ edges: newEdges });
  }, [edges, updateCurrentMap]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdges = addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'rgba(139, 92, 246, 0.8)', strokeWidth: 3 }
    }, edges);
    updateCurrentMap({ edges: newEdges });
  }, [edges, updateCurrentMap]);

  const addNode = useCallback((x: number, y: number) => {
    const selectedColor = localStorage.getItem('selectedNodeColor') || 'blue';
    
    const newNode: Node<MindMapNodeData> = {
      id: crypto.randomUUID(),
      type: 'mindMapNode',
      position: { x, y },
      data: {
        title: 'Nowy węzeł',
        content: '',
        color: selectedColor
      }
    };

    updateCurrentMap({
      nodes: [...nodes, newNode]
    });

    return newNode.id;
  }, [nodes, updateCurrentMap]);

  const updateNode = useCallback((id: string, updates: Partial<MindMapNodeData>) => {
    const newNodes = nodes.map(node =>
      node.id === id 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    );
    updateCurrentMap({ nodes: newNodes });
  }, [nodes, updateCurrentMap]);

  const deleteNode = useCallback((id: string) => {
    const newNodes = nodes.filter(node => node.id !== id);
    const newEdges = edges.filter(edge => edge.source !== id && edge.target !== id);
    updateCurrentMap({ nodes: newNodes, edges: newEdges });
  }, [nodes, edges, updateCurrentMap]);

  const createNewMap = useCallback((name: string) => {
    const newMap: MindMap = {
      id: crypto.randomUUID(),
      name,
      nodes: [],
      edges: [],
      createdAt: new Date()
    };
    
    setMindMaps(prev => [...prev, newMap]);
    setCurrentMapId(newMap.id);
    return newMap.id;
  }, [setMindMaps, setCurrentMapId]);

  const deleteMap = useCallback((mapId: string) => {
    setMindMaps(prev => {
      const newMaps = prev.filter(map => map.id !== mapId);
      if (newMaps.length === 0) {
        const defaultMap: MindMap = {
          id: 'default',
          name: 'Moja pierwsza mapa',
          nodes: [],
          edges: [],
          createdAt: new Date()
        };
        return [defaultMap];
      }
      return newMaps;
    });
    
    if (currentMapId === mapId) {
      const remainingMaps = mindMaps.filter(map => map.id !== mapId);
      setCurrentMapId(remainingMaps[0]?.id || 'default');
    }
  }, [setMindMaps, currentMapId, setCurrentMapId, mindMaps]);

  const renameMap = useCallback((mapId: string, newName: string) => {
    setMindMaps(prev => prev.map(map => 
      map.id === mapId ? { ...map, name: newName } : map
    ));
  }, [setMindMaps]);

  return {
    // React Flow data
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    currentMap,
    
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