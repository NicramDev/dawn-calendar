import { useState, useMemo, useEffect } from 'react';
import { CalendarEvent, CalendarView, EventColor } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';
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
import { useToast } from '@/hooks/use-toast';

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load events from Supabase
  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('planned_date', { ascending: true });

      if (error) throw error;

      const mappedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        dueDate: new Date(event.due_date),
        plannedDate: new Date(event.planned_date),
        color: event.color as EventColor,
        completed: event.completed || false
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Błąd",
        description: "Nie można załadować wydarzeń",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    
    return events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

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
      const eventDate = startOfDay(event.plannedDate);
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

  const toggleEventCompleted = async (id: string) => {
    const eventToUpdate = events.find(e => e.id === id);
    if (!eventToUpdate) return;

    const updatedEvent = { ...eventToUpdate, completed: !eventToUpdate.completed };
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ completed: updatedEvent.completed })
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    } catch (error) {
      console.error('Error updating event completion:', error);
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          title: event.title,
          description: event.description,
          due_date: event.dueDate.toISOString(),
          planned_date: event.plannedDate.toISOString(),
          color: event.color,
          completed: event.completed || false
        }])
        .select()
        .single();

      if (error) throw error;

      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.due_date),
        plannedDate: new Date(data.planned_date),
        color: data.color as EventColor,
        completed: data.completed || false
      };

      setEvents(prev => [...prev, newEvent]);
      toast({
        title: "Sukces",
        description: "Wydarzenie zostało dodane",
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Błąd",
        description: "Nie można dodać wydarzenia",
        variant: "destructive",
      });
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString();
      if (updates.plannedDate !== undefined) updateData.planned_date = updates.plannedDate.toISOString();
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.completed !== undefined) updateData.completed = updates.completed;

      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      ));

      toast({
        title: "Sukces",
        description: "Wydarzenie zostało zaktualizowane",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Błąd",
        description: "Nie można zaktualizować wydarzenia",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast({
        title: "Sukces",
        description: "Wydarzenie zostało usunięte",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Błąd",
        description: "Nie można usunąć wydarzenia",
        variant: "destructive",
      });
    }
  };

  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(event.plannedDate, date)
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
    loading,
    setView,
    setSearchQuery,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompleted,
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