import { useState, useEffect } from 'react';
import { CalendarEvent, EventColor } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon, Palette, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { eventColors } from '@/hooks/useCalendar';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  selectedDate?: Date;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<CalendarEvent>) => void;
  onDelete?: (id: string) => void;
}

export const EventModal = ({
  open,
  onClose,
  event,
  selectedDate,
  onSave,
  onUpdate,
  onDelete
}: EventModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [plannedDate, setPlannedDate] = useState<Date>();
  const [color, setColor] = useState<EventColor>('blue');

  const isEditing = !!event;

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDueDate(event.dueDate);
      setPlannedDate(event.plannedDate);
      setColor(event.color);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(selectedDate || new Date());
      setPlannedDate(selectedDate || new Date());
      setColor('blue');
    }
  }, [event, selectedDate]);

  const handleSave = () => {
    if (!title.trim() || !dueDate || !plannedDate) return;

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate,
      plannedDate: plannedDate,
      color
    };

    if (isEditing && event && onUpdate) {
      onUpdate(event.id, eventData);
    } else {
      onSave(eventData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {isEditing ? 'Edytuj zadanie' : 'Nowe zadanie'}
          </DialogTitle>
        </DialogHeader>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Tytuł</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nazwa zadania"
              className="border-border bg-background"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodatkowe informacje..."
              className="border-border bg-background resize-none"
              rows={3}
            />
          </div>

          {/* Due Date - Na kiedy jest */}
          <div className="space-y-2">
            <Label className="text-foreground">Na kiedy jest</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-border bg-background",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP', { locale: pl }) : 'Wybierz datę'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border bg-background">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Planned Date - Kiedy zamierzam zrobić */}
          <div className="space-y-2">
            <Label className="text-foreground">Kiedy zamierzam zrobić</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-border bg-background",
                    !plannedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {plannedDate ? format(plannedDate, 'PPP', { locale: pl }) : 'Wybierz datę'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border bg-background">
                <Calendar
                  mode="single"
                  selected={plannedDate}
                  onSelect={setPlannedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Kolor
            </Label>
            <div className="flex gap-3 flex-wrap">
              {(Object.keys(eventColors) as EventColor[]).map((colorOption) => {
                const colorMap = {
                  blue: 'bg-blue-400',
                  pink: 'bg-pink-400', 
                  green: 'bg-green-400',
                  purple: 'bg-purple-400',
                  orange: 'bg-orange-400',
                  yellow: 'bg-yellow-400'
                };
                
                return (
                  <motion.button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      colorMap[colorOption],
                      color === colorOption ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-primary' : 'border-border hover:scale-105'
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || !dueDate || !plannedDate}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isEditing ? 'Zapisz zmiany' : 'Dodaj zadanie'}
            </Button>
            
            {isEditing && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};