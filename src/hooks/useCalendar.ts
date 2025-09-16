import { useState, useMemo, useEffect } from 'react';
import { CalendarEvent, CalendarView, EventColor } from '@/types/calendar';
import { useLocalStorage } from './useLocalStorage';
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  startOfDay,
  endOfDay
} from 'date-fns';
import { pl } from 'date-fns/locale';

export const useCalendar = () => {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendar-events', []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Clear corrupted data on first load if needed
  const clearCorruptedData = () => {
    try {
      const stored = localStorage.getItem('calendar-events');
      if (stored) {
        const parsed = JSON.parse(stored);
        const hasInvalidDates = parsed.some((event: any) => {
          try {
            const date = new Date(event.date || event.startTime);
            return isNaN(date.getTime());
          } catch {
            return true;
          }
        });
        
        if (hasInvalidDates) {
          console.log('Clearing corrupted calendar data...');
          localStorage.removeItem('calendar-events');
          window.location.reload();
        }
      }
    } catch (error) {
      console.warn('Error checking localStorage, clearing:', error);
      localStorage.removeItem('calendar-events');
      window.location.reload();
    }
  };

  // Run cleanup once on mount
  useEffect(() => {
    clearCorruptedData();
  }, []);

  // Convert stored events back to proper Date objects
  const parsedEvents = useMemo(() => {
    return events.map(event => {
      try {
        const date = new Date(event.date);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date found, using current date:', event);
          return { ...event, date: new Date() };
        }
        return { ...event, date };
      } catch (error) {
        console.warn('Error parsing date, using current date:', event, error);
        return { ...event, date: new Date() };
      }
    });
  }, [events]);

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return parsedEvents;
    
    return parsedEvents.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parsedEvents, searchQuery]);

  // Get events for current view
  const viewEvents = useMemo(() => {
    const start = view === 'month' 
      ? startOfMonth(currentDate)
      : view === 'week' 
        ? startOfWeek(currentDate, { locale: pl })
        : startOfDay(currentDate);
        
    const end = view === 'month' 
      ? endOfMonth(currentDate)
      : view === 'week' 
        ? endOfWeek(currentDate, { locale: pl })
        : endOfDay(currentDate);

    return filteredEvents.filter(event => {
      const eventDate = startOfDay(event.date);
      return eventDate >= start && eventDate <= end;
    });
  }, [filteredEvents, currentDate, view]);

  // Calendar days for month view
  const calendarDays = useMemo(() => {
    if (view !== 'month') return [];
    
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: pl });
    const calendarEnd = endOfWeek(monthEnd, { locale: pl });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate, view]);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(event.date, date)
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + (direction === 'next' ? 1 : -1), 1));
    } else if (view === 'week') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 7) : subDays(prev, 7));
    } else {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return {
    events: filteredEvents,
    viewEvents,
    calendarDays,
    currentDate,
    view,
    searchQuery,
    setView,
    setSearchQuery,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay,
    navigateDate,
    goToToday,
    setCurrentDate
  };
};

export const eventColors: Record<EventColor, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-event-blue-bg', text: 'text-event-blue', border: 'border-event-blue' },
  pink: { bg: 'bg-event-pink-bg', text: 'text-event-pink', border: 'border-event-pink' },
  green: { bg: 'bg-event-green-bg', text: 'text-event-green', border: 'border-event-green' },
  purple: { bg: 'bg-event-purple-bg', text: 'text-event-purple', border: 'border-event-purple' },
  orange: { bg: 'bg-event-orange-bg', text: 'text-event-orange', border: 'border-event-orange' },
  yellow: { bg: 'bg-event-yellow-bg', text: 'text-event-yellow', border: 'border-event-yellow' }
};