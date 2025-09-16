import { CalendarEvent } from '@/types/calendar';
import { eventColors } from '@/hooks/useCalendar';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EventsSidebarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: () => void;
  className?: string;
}

export const EventsSidebar = ({
  events,
  onEventClick,
  onAddEvent,
  className
}: EventsSidebarProps) => {
  const formatEventDate = (date: Date) => {
    if (isToday(date)) return 'Dziś';
    if (isTomorrow(date)) return 'Jutro';
    if (isYesterday(date)) return 'Wczoraj';
    return format(date, 'EEE, d MMM', { locale: pl });
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const groups: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    // Sort events within each group by title
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.title.localeCompare(b.title));
    });

    return groups;
  };

  const eventGroups = groupEventsByDate(events);
  const sortedDateKeys = Object.keys(eventGroups).sort();

  return (
    <div className={cn("w-80 bg-gradient-card border-l border-border flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Zadania</h2>
          <Button
            onClick={onAddEvent}
            size="sm"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Dodaj
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {events.length === 0 ? 'Brak zadań' : `${events.length} zadań`}
        </div>
      </div>

      {/* Events list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {events.length === 0 ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-muted-foreground text-sm">
                Nie ma żadnych zadań.
                <br />
                Kliknij przycisk "Dodaj" aby utworzyć nowe.
              </div>
            </motion.div>
          ) : (
            sortedDateKeys.map((dateKey, groupIndex) => {
              const groupEvents = eventGroups[dateKey];
              const firstEvent = groupEvents[0];
              
              return (
                <motion.div
                  key={dateKey}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                >
                  {/* Date header */}
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {formatEventDate(firstEvent.date)}
                  </div>
                  
                  {/* Events for this date */}
                  <div className="space-y-2">
                    {groupEvents.map((event, eventIndex) => {
                      const colors = eventColors[event.color];
                      
                      return (
                        <motion.div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all shadow-sm hover:shadow-event",
                            colors.bg,
                            colors.border,
                            "hover:scale-[1.02] active:scale-[0.98]"
                          )}
                          onClick={() => onEventClick(event)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: eventIndex * 0.05 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("w-3 h-3 rounded-full mt-1 flex-shrink-0", colors.text.replace('text-', 'bg-'))} />
                            
                            <div className="flex-1 min-w-0">
                              <div className={cn("font-medium text-sm truncate", colors.text)}>
                                {event.title}
                              </div>
                              
                              {event.description && (
                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};