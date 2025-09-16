import { useState, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MindMapNodeData } from '@/hooks/useMindMap';
import { cn } from '@/lib/utils';

const nodeColors = {
  blue: 'bg-blue-500/90 border-blue-400 text-white',
  purple: 'bg-purple-500/90 border-purple-400 text-white',
  green: 'bg-green-500/90 border-green-400 text-white',
  orange: 'bg-orange-500/90 border-orange-400 text-white',
  pink: 'bg-pink-500/90 border-pink-400 text-white',
};

interface ReactFlowMindMapNodeProps extends NodeProps<MindMapNodeData> {
  onUpdate?: (id: string, updates: Partial<MindMapNodeData>) => void;
  onDelete?: (id: string) => void;
}

function ReactFlowMindMapNode({ id, data, selected, onUpdate, onDelete, isConnectable }: ReactFlowMindMapNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [content, setContent] = useState(data.content);

  const handleSave = () => {
    onUpdate?.(id, { title, content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(data.title);
    setContent(data.content);
    setIsEditing(false);
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-lg border-2 shadow-lg backdrop-blur-sm min-w-[200px] min-h-[100px]",
        nodeColors[data.color as keyof typeof nodeColors] || nodeColors.blue,
        selected && "ring-2 ring-white/50 ring-offset-2 ring-offset-transparent"
      )}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(139, 92, 246, 0.4)" }}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: Math.random() * 0.2 
      }}
    >
      {/* Source Handles */}
      <Handle
        type="source"
        position={Position.Top}
        id="s-top"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ left: '50%', top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="s-right"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ right: -6, top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="s-bottom"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ left: '50%', bottom: -6 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="s-left"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ left: -6, top: '50%' }}
      />
      
      {/* Target Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="t-top"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ left: '50%', top: -6 }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="t-right"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ right: -6, top: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="t-bottom"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ left: '50%', bottom: -6 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="t-left"
        isConnectable={true}
        className="w-3 h-3 bg-white border-2 border-current shadow-lg hover:scale-110 transition-transform"
        style={{ left: -6, top: '50%' }}
      />

      <div className="p-3 flex flex-col h-full">
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
              className="flex-1 text-xs bg-white/20 border-white/30 text-inherit placeholder:text-inherit/70 resize-none min-h-[60px]"
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
                {data.title}
              </h3>
              {data.content && (
                <p className="text-xs opacity-90 leading-tight break-words">
                  {data.content}
                </p>
              )}
            </div>
            
            {selected && (
              <motion.div 
                className="flex justify-between items-center mt-2 pt-2 border-t border-white/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 w-6 p-0 hover:bg-white/20 text-inherit"
                      aria-label="Zmień kolor"
                    >
                      <Palette className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" sideOffset={4} className="p-2">
                    <div className="flex gap-2">
                      {(['blue','purple','green','orange','pink'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={(e) => { e.stopPropagation(); onUpdate?.(id, { color: c }); }}
                          className={cn(
                            'h-5 w-5 rounded-full border-2 ring-offset-1',
                            {
                              blue: 'bg-blue-500 border-blue-300',
                              purple: 'bg-purple-500 border-purple-300',
                              green: 'bg-green-500 border-green-300',
                              orange: 'bg-orange-500 border-orange-300',
                              pink: 'bg-pink-500 border-pink-300',
                            }[c],
                            data.color === c ? 'ring-2 ring-white' : 'ring-0'
                          )}
                          aria-label={`Zmień kolor na ${c}`}
                        />
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(id);
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

export default memo(ReactFlowMindMapNode);