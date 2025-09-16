import { format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';
import { eventColors } from '@/hooks/useCalendar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
            className="p-3 text-sm font-medium text-muted-foreground text-center"
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
                "min-h-[120px] border-r border-b border-border bg-background hover:bg-muted/30 transition-colors cursor-pointer relative",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground"
              )}
              onClick={() => onDateClick(day)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Day number */}
              <div className="p-2">
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full transition-colors",
                    isDayToday && "bg-calendar-today-bg text-calendar-today font-bold",
                    !isDayToday && isCurrentMonth && "text-foreground",
                    !isDayToday && !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>

              {/* Events */}
              <div className="px-2 pb-2 space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const colors = eventColors[event.color];
                  return (
                    <motion.div
                      key={event.id}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium truncate cursor-pointer shadow-sm",
                        colors.bg,
                        colors.text,
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
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", colors.text.replace('text-', 'bg-'))} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    </motion.div>
                  );
                })}
                
                {dayEvents.length > 3 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    +{dayEvents.length - 3} więcej
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