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

const defaultMindMapData: MindMapData = {
  nodes: [],
  connections: []
};

export function useMindMap() {
  const [mindMapData, setMindMapData] = useLocalStorage<MindMapData>('mindMapData', defaultMindMapData);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const addNode = useCallback((x: number, y: number) => {
    const newNode: MindMapNode = {
      id: crypto.randomUUID(),
      title: 'Nowy węzeł',
      content: '',
      x,
      y,
      width: 200,
      height: 100,
      color: 'blue'
    };

    setMindMapData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    return newNode.id;
  }, [setMindMapData]);

  const updateNode = useCallback((id: string, updates: Partial<MindMapNode>) => {
    setMindMapData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === id ? { ...node, ...updates } : node
      )
    }));
  }, [setMindMapData]);

  const deleteNode = useCallback((id: string) => {
    setMindMapData(prev => ({
      nodes: prev.nodes.filter(node => node.id !== id),
      connections: prev.connections.filter(conn => conn.from !== id && conn.to !== id)
    }));
  }, [setMindMapData]);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    updateNode(id, { x, y });
  }, [updateNode]);

  const addConnection = useCallback((fromId: string, toId: string) => {
    // Check if connection already exists
    const exists = mindMapData.connections.some(
      conn => (conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId)
    );

    if (!exists && fromId !== toId) {
      const newConnection: MindMapConnection = {
        id: crypto.randomUUID(),
        from: fromId,
        to: toId
      };

      setMindMapData(prev => ({
        ...prev,
        connections: [...prev.connections, newConnection]
      }));
    }
  }, [mindMapData.connections, setMindMapData]);

  const deleteConnection = useCallback((id: string) => {
    setMindMapData(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== id)
    }));
  }, [setMindMapData]);

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
    nodes: mindMapData.nodes,
    connections: mindMapData.connections,
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
  };
}