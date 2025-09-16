import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface MindMapNode {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface MindMapConnection {
  id: string;
  from: string;
  to: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
  connections: MindMapConnection[];
}

export interface MindMap {
  id: string;
  name: string;
  data: MindMapData;
  createdAt: Date;
}

const defaultMindMap: MindMap = {
  id: 'default',
  name: 'Moja pierwsza mapa',
  data: { nodes: [], connections: [] },
  createdAt: new Date()
};

export function useMindMap() {
  const [mindMaps, setMindMaps] = useLocalStorage<MindMap[]>('mindMaps', [defaultMindMap]);
  const [currentMapId, setCurrentMapId] = useLocalStorage<string>('currentMapId', 'default');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  
  const currentMap = mindMaps.find(map => map.id === currentMapId) || mindMaps[0];
  const currentData = currentMap?.data || { nodes: [], connections: [] };

  const updateCurrentMap = useCallback((updates: Partial<MindMapData>) => {
    setMindMaps(prev => prev.map(map => 
      map.id === currentMapId 
        ? { ...map, data: { ...map.data, ...updates } }
        : map
    ));
  }, [currentMapId, setMindMaps]);

  const addConnection = useCallback((fromId: string, toId: string) => {
    // Check if connection already exists
    const exists = currentData.connections.some(
      conn => (conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId)
    );

    if (!exists && fromId !== toId) {
      const newConnection: MindMapConnection = {
        id: crypto.randomUUID(),
        from: fromId,
        to: toId
      };

      updateCurrentMap({
        connections: [...currentData.connections, newConnection]
      });
    }
  }, [currentData.connections, updateCurrentMap]);

  // Auto-connect nodes when they're close
  const checkAutoConnect = useCallback((nodeId: string, x: number, y: number) => {
    const CONNECT_DISTANCE = 120;
    const draggedNodeObj = currentData.nodes.find(n => n.id === nodeId);
    
    if (!draggedNodeObj) return;
    
    const closeNodes = currentData.nodes.filter(node => {
      if (node.id === nodeId) return false;
      
      const distance = Math.sqrt(
        Math.pow(node.x + node.width/2 - (x + draggedNodeObj.width/2), 2) +
        Math.pow(node.y + node.height/2 - (y + draggedNodeObj.height/2), 2)
      );
      
      return distance < CONNECT_DISTANCE;
    });
    
    closeNodes.forEach(node => {
      const exists = currentData.connections.some(
        conn => (conn.from === nodeId && conn.to === node.id) || (conn.from === node.id && conn.to === nodeId)
      );
      
      if (!exists) {
        addConnection(nodeId, node.id);
      }
    });
  }, [currentData, addConnection]);

  const addNode = useCallback((x: number, y: number) => {
    const colors = ['blue', 'purple', 'green', 'orange', 'pink', 'yellow'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newNode: MindMapNode = {
      id: crypto.randomUUID(),
      title: 'Nowy węzeł',
      content: '',
      x,
      y,
      width: 200,
      height: 100,
      color: randomColor
    };

    updateCurrentMap({
      nodes: [...currentData.nodes, newNode]
    });

    return newNode.id;
  }, [currentData.nodes, updateCurrentMap]);

  const updateNode = useCallback((id: string, updates: Partial<MindMapNode>) => {
    updateCurrentMap({
      nodes: currentData.nodes.map(node =>
        node.id === id ? { ...node, ...updates } : node
      )
    });
  }, [currentData.nodes, updateCurrentMap]);

  const deleteNode = useCallback((id: string) => {
    updateCurrentMap({
      nodes: currentData.nodes.filter(node => node.id !== id),
      connections: currentData.connections.filter(conn => conn.from !== id && conn.to !== id)
    });
  }, [currentData, updateCurrentMap]);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    updateNode(id, { x, y });
    checkAutoConnect(id, x, y);
  }, [updateNode, checkAutoConnect]);


  const deleteConnection = useCallback((id: string) => {
    updateCurrentMap({
      connections: currentData.connections.filter(conn => conn.id !== id)
    });
  }, [currentData.connections, updateCurrentMap]);

  const createNewMap = useCallback((name: string) => {
    const newMap: MindMap = {
      id: crypto.randomUUID(),
      name,
      data: { nodes: [], connections: [] },
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
          data: { nodes: [], connections: [] },
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

  const startConnecting = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
  }, []);

  const endConnecting = useCallback((nodeId?: string) => {
    if (isConnecting && connectingFrom && nodeId && nodeId !== connectingFrom) {
      addConnection(connectingFrom, nodeId);
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  }, [isConnecting, connectingFrom, addConnection]);

  return {
    // Current map data
    nodes: currentData.nodes,
    connections: currentData.connections,
    currentMap,
    
    // Node operations
    selectedNode,
    setSelectedNode,
    draggedNode,
    setDraggedNode,
    isConnecting,
    connectingFrom,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    addConnection,
    deleteConnection,
    startConnecting,
    endConnecting,
    
    // Map management
    mindMaps,
    currentMapId,
    setCurrentMapId,
    createNewMap,
    deleteMap,
    renameMap,
  };
}