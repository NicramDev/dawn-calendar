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
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
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
    if (e.target === canvasRef.current && !isPanning) {
      if (isConnecting) {
        endConnecting();
      } else {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom - 100;
        const y = (e.clientY - rect.top - pan.y) / zoom - 50;
        const nodeId = addNode(Math.max(0, x), Math.max(0, y));
        setSelectedNode(nodeId);
      }
    }
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === canvasRef.current) { // Left click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.1), 3);
    setZoom(newZoom);
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

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectedNode, isConnecting, deleteNode, setSelectedNode, endConnecting]);

  // Calculate connection points from edge to edge
  const getConnectionPoint = (fromNode: any, toNode: any) => {
    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;

    // Calculate direction vector
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { fromX: fromCenterX, fromY: fromCenterY, toX: toCenterX, toY: toCenterY };
    
    // Normalize direction
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // Calculate edge points
    const fromX = fromCenterX + unitX * (fromNode.width / 2);
    const fromY = fromCenterY + unitY * (fromNode.height / 2);
    const toX = toCenterX - unitX * (toNode.width / 2);
    const toY = toCenterY - unitY * (toNode.height / 2);

    return { fromX, fromY, toX, toY };
  };

  // Render connections as SVG lines
  const renderConnections = () => {
    return connections.map(connection => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);
      
      if (!fromNode || !toNode) return null;

      const { fromX, fromY, toX, toY } = getConnectionPoint(fromNode, toNode);

      // Create curved path for smoother connections
      const controlX1 = fromX + (toX - fromX) * 0.5;
      const controlY1 = fromY;
      const controlX2 = fromX + (toX - fromX) * 0.5;
      const controlY2 = toY;

      const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

      return (
        <motion.path
          key={connection.id}
          d={pathData}
          stroke="rgba(139, 92, 246, 0.7)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            ease: "easeInOut"
          }}
          filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))"
        />
      );
    });
  };

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ minWidth: '200vw', minHeight: '200vh' }}
      >
        {/* Zoomed and panned content */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '200vw',
            height: '200vh',
          }}
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
            style={{ width: '200vw', height: '200vh' }}
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
              connectingFrom={connectingFrom}
              onUpdate={updateNode}
              onDelete={deleteNode}
              onMove={moveNode}
              onSelect={setSelectedNode}
              onStartConnecting={startConnecting}
              onEndConnecting={endConnecting}
            />
          ))}
        </div>
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
            const x = (100 - pan.x) / zoom;
            const y = (100 - pan.y) / zoom;
            const nodeId = addNode(x, y);
            setSelectedNode(nodeId);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj węzeł
        </Button>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
          className="w-10 h-10 p-0"
        >
          +
        </Button>
        <div className="text-center text-white text-xs bg-black/50 px-2 py-1 rounded">
          {Math.round(zoom * 100)}%
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setZoom(Math.max(zoom / 1.2, 0.1))}
          className="w-10 h-10 p-0"
        >
          -
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="w-10 h-10 p-0 text-xs"
        >
          ⌂
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
                const x = (300 - pan.x) / zoom;
                const y = (200 - pan.y) / zoom;
                const nodeId = addNode(x, y);
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
          <div><kbd className="bg-white/20 px-1 rounded">Scroll</kbd> - Zoom</div>
          <div><kbd className="bg-white/20 px-1 rounded">Przeciągnij</kbd> - Przesuń mapę</div>
        </div>
      </div>
    </div>
  );
}