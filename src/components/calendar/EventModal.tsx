import { useState, useEffect } from 'react';
import { CalendarEvent, EventColor } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon, Clock, Palette, Trash2 } from 'lucide-react';
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
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState<EventColor>('blue');
  const [reminder, setReminder] = useState<number>(15);

  const isEditing = !!event;

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(event.startTime);
      setStartTime(format(event.startTime, 'HH:mm'));
      setEndTime(format(event.endTime, 'HH:mm'));
      setColor(event.color);
      setReminder(event.reminder || 15);
    } else {
      setTitle('');
      setDescription('');
      setDate(selectedDate || new Date());
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('blue');
      setReminder(15);
    }
  }, [event, selectedDate]);

  const handleSave = () => {
    if (!title.trim() || !date) return;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMin, 0, 0);

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      startTime: startDateTime,
      endTime: endDateTime,
      color,
      reminder
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
            {isEditing ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
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
              placeholder="Nazwa wydarzenia"
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

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-foreground">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-border bg-background",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: pl }) : 'Wybierz datę'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border bg-background">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Początek
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Koniec
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border-border bg-background"
              />
            </div>
          </div>

          {/* Color and Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-1">
                <Palette className="h-4 w-4" />
                Kolor
              </Label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(eventColors) as EventColor[]).map((colorOption) => {
                  const colors = eventColors[colorOption];
                  return (
                    <motion.button
                      key={colorOption}
                      type="button"
                      onClick={() => setColor(colorOption)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        colors.bg.replace('bg-', 'bg-').replace('-bg', ''),
                        color === colorOption ? 'border-foreground scale-110' : 'border-border hover:scale-105'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground">Przypomnienie</Label>
              <Select value={reminder.toString()} onValueChange={(value) => setReminder(Number(value))}>
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-background">
                  <SelectItem value="0">Bez przypomnienia</SelectItem>
                  <SelectItem value="5">5 minut wcześniej</SelectItem>
                  <SelectItem value="15">15 minut wcześniej</SelectItem>
                  <SelectItem value="30">30 minut wcześniej</SelectItem>
                  <SelectItem value="60">1 godzinę wcześniej</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || !date}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isEditing ? 'Zapisz zmiany' : 'Dodaj wydarzenie'}
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