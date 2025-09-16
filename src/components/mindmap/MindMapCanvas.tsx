import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Map, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MindMapNode } from './MindMapNode';
import { useMindMap } from '@/hooks/useMindMap';
import { useState } from 'react';

export function MindMapCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [newMapName, setNewMapName] = useState('');
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  
  const {
    nodes,
    connections,
    selectedNode,
    setSelectedNode,
    isConnecting,
    connectingFrom,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    startConnecting,
    endConnecting,
    // Map management
    mindMaps,
    currentMap,
    currentMapId,
    setCurrentMapId,
    createNewMap,
    deleteMap,
    renameMap,
  } = useMindMap();

  const handleCreateMap = () => {
    if (newMapName.trim()) {
      createNewMap(newMapName.trim());
      setNewMapName('');
      setIsCreatingMap(false);
    }
  };

  // Handle canvas click for adding new nodes and deselecting
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (isConnecting) {
        endConnecting();
      } else {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left - 100; // Center the node
        const y = e.clientY - rect.top - 50;
        const nodeId = addNode(Math.max(0, x), Math.max(0, y));
        setSelectedNode(nodeId);
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConnecting) {
          endConnecting();
        } else {
          setSelectedNode(null);
        }
      } else if (e.key === 'Delete' && selectedNode) {
        deleteNode(selectedNode);
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, isConnecting, deleteNode, setSelectedNode, endConnecting]);

  // Render connections as SVG lines
  const renderConnections = () => {
    return connections.map(connection => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);
      
      if (!fromNode || !toNode) return null;

      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height / 2;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y + toNode.height / 2;

      return (
        <motion.line
          key={connection.id}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="rgba(139, 92, 246, 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
    });
  };

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        style={{ minWidth: '200vw', minHeight: '200vh' }}
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ minWidth: '200vw', minHeight: '200vh' }}
        >
          {renderConnections()}
        </svg>

        {/* Render nodes */}
        {nodes.map(node => (
          <MindMapNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            isConnecting={isConnecting}
            onUpdate={updateNode}
            onDelete={deleteNode}
            onMove={moveNode}
            onSelect={setSelectedNode}
            onStartConnecting={startConnecting}
            onEndConnecting={endConnecting}
          />
        ))}
      </div>

      {/* Map Selector */}
      <div className="absolute top-4 left-4 space-y-2">
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
                      ({map.data.nodes.length} węzłów)
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
              <Trash2 className="h-3 w-3 mr-1" />
              Usuń mapę
            </Button>
          )}
        </div>
      </div>

      {/* Floating UI */}
      <div className="absolute top-4 right-4 space-y-2">
        {isConnecting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <span className="text-sm">Kliknij węzeł, aby połączyć</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => endConnecting()}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
        
        <Button
          onClick={() => {
            const nodeId = addNode(100, 100);
            setSelectedNode(nodeId);
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
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center text-gray-400 max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">Twoja mapa myśli</h3>
            <p className="text-sm leading-relaxed mb-6">
              Kliknij gdziekolwiek na płótnie, aby dodać nowy węzeł.
              Przeciągaj węzły, aby je przemieszczać.
              Używaj przycisku łączenia, aby tworzyć relacje.
            </p>
            <Button
              onClick={() => {
                const nodeId = addNode(300, 200);
                setSelectedNode(nodeId);
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
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs p-3 rounded-lg">
        <div className="space-y-1">
          <div><kbd className="bg-white/20 px-1 rounded">ESC</kbd> - Anuluj / Odznacz</div>
          <div><kbd className="bg-white/20 px-1 rounded">DEL</kbd> - Usuń węzeł</div>
          <div><kbd className="bg-white/20 px-1 rounded">Klik</kbd> - Dodaj węzeł</div>
        </div>
      </div>
    </div>
  );
}