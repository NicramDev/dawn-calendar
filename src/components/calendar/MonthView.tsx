import { format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';
import { eventColors } from '@/hooks/useCalendar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthViewProps {
  calendarDays: Date[];
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const MonthView = ({
  calendarDays,
  currentDate,
  events,
  onDateClick,
  onEventClick
}: MonthViewProps) => {
  const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
  const isMobile = useIsMobile();

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.plannedDate, date));
  };

  return (
    <div className="flex-1 bg-background">
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-1 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <motion.div
              key={day.toISOString()}
              className={cn(
                "min-h-[80px] sm:min-h-[120px] border-r border-b border-border bg-background hover:bg-muted/30 transition-colors cursor-pointer relative",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground"
              )}
              onClick={() => onDateClick(day)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Day number */}
              <div className="p-1 sm:p-2">
                <div
                  className={cn(
                    "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-medium rounded-full transition-colors",
                    isDayToday && "bg-calendar-today-bg text-calendar-today font-bold",
                    !isDayToday && isCurrentMonth && "text-foreground",
                    !isDayToday && !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>

              {/* Events */}
              <div className="px-1 sm:px-2 pb-1 sm:pb-2 space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, isMobile ? 4 : 3).map((event) => {
                  const colors = eventColors[event.color];
                  return (
                    <motion.div
                      key={event.id}
                      className={cn(
                        "px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium truncate cursor-pointer shadow-sm",
                        event.completed ? "bg-muted/50 text-muted-foreground" : colors.bg,
                        event.completed ? "text-muted-foreground" : colors.text,
                        "hover:shadow-event transition-shadow"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0", 
                          event.completed ? "bg-muted-foreground" : colors.text.replace('text-', 'bg-')
                        )} />
                        <span className={cn("truncate", event.completed && "line-through")}>{event.title}</span>
                      </div>
                    </motion.div>
                  );
                })}
                
                {dayEvents.length > (isMobile ? 4 : 3) && (
                  <div className="px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-muted-foreground">
                    +{dayEvents.length - (isMobile ? 4 : 3)} więcej
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};