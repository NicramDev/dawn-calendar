import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  NodeProps,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMindMap, MindMapNodeData } from '@/hooks/useMindMap';
import ReactFlowMindMapNode from './ReactFlowMindMapNode';

function MindMapCanvasInner() {
  const [newMapName, setNewMapName] = useState('');
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    setSelectedNode,
    addNode,
    updateNode,
    deleteNode,
    // Map management
    mindMaps,
    currentMap,
    currentMapId,
    setCurrentMapId,
    createNewMap,
    deleteMap,
  } = useMindMap();

  const updateNodeRef = useRef(updateNode);
  const deleteNodeRef = useRef(deleteNode);
  useEffect(() => {
    updateNodeRef.current = updateNode;
    deleteNodeRef.current = deleteNode;
  }, [updateNode, deleteNode]);

  const nodeTypes = useMemo(() => ({
    mindMapNode: (props: NodeProps<MindMapNodeData>) => (
      <ReactFlowMindMapNode 
        {...props} 
        onUpdate={(id, updates) => updateNodeRef.current(id, updates)}
        onDelete={(id) => deleteNodeRef.current(id)}
      />
    ),
  }), []);
  const handleCreateMap = () => {
    if (newMapName.trim()) {
      createNewMap(newMapName.trim());
      setNewMapName('');
      setIsCreatingMap(false);
    }
  };

  const handlePaneClick = useCallback(async (event: React.MouseEvent) => {
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    const nodeId = await addNode(position.x - 100, position.y - 50);
    if (nodeId) {
      setSelectedNode(nodeId);
    }
  }, [addNode, setSelectedNode, screenToFlowPosition]);

  // Removed keyboard deletion - nodes can only be deleted via button

  return (
    <div className="relative w-full h-full bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onSelectionChange={({ nodes }) => setSelectedNode(nodes[0]?.id ?? null)}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        isValidConnection={() => true}
        connectOnClick={false}
        panOnDrag
        selectionOnDrag={false}
        zoomOnScroll
        connectionLineStyle={{
          stroke: 'rgba(139, 92, 246, 0.8)',
          strokeWidth: 3,
        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'rgba(139, 92, 246, 0.8)', strokeWidth: 3 }
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background color="rgba(139, 92, 246, 0.3)" gap={30} />
        <Controls 
          position="bottom-right"
          showInteractive={false}
        />
        <MiniMap 
          position="bottom-left"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
          nodeColor={(node) => {
            const colors = {
              blue: '#3b82f6',
              purple: '#8b5cf6',
              green: '#10b981',
              orange: '#f59e0b',
              pink: '#ec4899',
            };
            return colors[node.data.color as keyof typeof colors] || colors.blue;
          }}
        />
      </ReactFlow>

      {/* Map Selector */}
      <div className="absolute top-4 left-4 space-y-2 z-10">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white min-w-64">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Mapy myśli</h3>
            <Dialog open={isCreatingMap} onOpenChange={setIsCreatingMap}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white hover:bg-white/20">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nowa mapa myśli</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nazwa mapy..."
                    value={newMapName}
                    onChange={(e) => setNewMapName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateMap()}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateMap} className="flex-1">
                      Utwórz
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingMap(false)} className="flex-1">
                      Anuluj
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Select value={currentMapId} onValueChange={setCurrentMapId}>
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mindMaps.map(map => (
                <SelectItem key={map.id} value={map.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{map.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({(map.nodes || []).length} węzłów)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {mindMaps.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteMap(currentMapId)}
              className="w-full mt-2 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <X className="h-3 w-3 mr-1" />
              Usuń mapę
            </Button>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={async () => {
            const nodeId = await addNode(100, 100);
            if (nodeId) {
              setSelectedNode(nodeId);
            }
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj węzeł
        </Button>
      </div>

      {/* Instructions */}
      {nodes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="text-center text-gray-400 max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">Twoja mapa myśli</h3>
            <p className="text-sm leading-relaxed mb-6">
              Kliknij gdziekolwiek na płótnie, aby dodać nowy węzeł.
              Przeciągaj węzły, aby je przemieszczać.
              Przeciągnij od kropki do kropki, aby połączyć węzły.
            </p>
            <Button
              onClick={async () => {
                const nodeId = await addNode(0, 0);
                if (nodeId) {
                  setSelectedNode(nodeId);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Utwórz pierwszy węzeł
            </Button>
          </div>
        </motion.div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs p-3 rounded-lg z-10">
        <div className="space-y-1">
          <div><kbd className="bg-white/20 px-1 rounded">Klik</kbd> - Dodaj węzeł</div>
          <div><kbd className="bg-white/20 px-1 rounded">Przeciągnij węzeł</kbd> - Przenieś</div>
          <div><kbd className="bg-white/20 px-1 rounded">Przeciągnij kropkę</kbd> - Połącz</div>
        </div>
      </div>
    </div>
  );
}

export function MindMapCanvas() {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner />
    </ReactFlowProvider>
  );
}