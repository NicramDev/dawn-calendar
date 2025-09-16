import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Edit3, Trash2, Link, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MindMapNode as MindMapNodeType } from '@/hooks/useMindMap';
import { cn } from '@/lib/utils';

interface MindMapNodeProps {
  node: MindMapNodeType;
  isSelected: boolean;
  isConnecting: boolean;
  onUpdate: (id: string, updates: Partial<MindMapNodeType>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
  onStartConnecting: (id: string) => void;
  onEndConnecting: (id?: string) => void;
}

const nodeColors = {
  blue: 'bg-blue-500/90 border-blue-400 text-white',
  purple: 'bg-purple-500/90 border-purple-400 text-white',
  green: 'bg-green-500/90 border-green-400 text-white',
  orange: 'bg-orange-500/90 border-orange-400 text-white',
  pink: 'bg-pink-500/90 border-pink-400 text-white',
  yellow: 'bg-yellow-500/90 border-yellow-400 text-black',
};

export function MindMapNode({
  node,
  isSelected,
  isConnecting,
  onUpdate,
  onDelete,
  onMove,
  onSelect,
  onStartConnecting,
  onEndConnecting,
}: MindMapNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const newX = node.x + info.offset.x;
    const newY = node.y + info.offset.y;
    onMove(node.id, Math.max(0, newX), Math.max(0, newY));
  };

  const handleSave = () => {
    onUpdate(node.id, { title, content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(node.title);
    setContent(node.content);
    setIsEditing(false);
  };

  const handleClick = () => {
    if (isConnecting) {
      onEndConnecting(node.id);
    } else {
      onSelect(node.id);
    }
  };

  return (
    <motion.div
      ref={nodeRef}
      className={cn(
        "absolute select-none cursor-grab active:cursor-grabbing rounded-lg border-2 shadow-lg backdrop-blur-sm",
        nodeColors[node.color as keyof typeof nodeColors] || nodeColors.blue,
        isSelected && "ring-2 ring-white/50 ring-offset-2 ring-offset-transparent",
        isConnecting && "cursor-crosshair"
      )}
      style={{
        width: node.width,
        height: node.height,
        x: node.x,
        y: node.y,
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragTransition={{ 
        bounceStiffness: 300, 
        bounceDamping: 30,
        power: 0.3,
        timeConstant: 750
      }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(139, 92, 246, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 2,
        boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.6)",
        zIndex: 50
      }}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: Math.random() * 0.2 
      }}
    >
      <div className="h-full flex flex-col p-3">
        {isEditing ? (
          <div className="flex flex-col h-full space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-semibold bg-white/20 border-white/30 text-inherit placeholder:text-inherit/70"
              placeholder="Tytuł węzła..."
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 text-xs bg-white/20 border-white/30 text-inherit placeholder:text-inherit/70 resize-none"
              placeholder="Treść węzła..."
            />
            <div className="flex space-x-1">
              <Button size="sm" variant="secondary" onClick={handleSave} className="flex-1 h-6 text-xs">
                Zapisz
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1 h-6 text-xs">
                Anuluj
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-semibold text-sm leading-tight mb-1 break-words">
                {node.title}
              </h3>
              {node.content && (
                <p className="text-xs opacity-90 leading-tight break-words">
                  {node.content}
                </p>
              )}
            </div>
            
            {isSelected && !isConnecting && (
              <motion.div 
                className="flex justify-between items-center mt-2 pt-2 border-t border-white/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="h-6 w-6 p-0 hover:bg-white/20 text-inherit"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartConnecting(node.id);
                    }}
                    className="h-6 w-6 p-0 hover:bg-white/20 text-inherit"
                  >
                    <Link className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-500/20 text-inherit"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}