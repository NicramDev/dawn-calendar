import { useState } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { EventModal } from '@/components/calendar/EventModal';
import { EventsSidebar } from '@/components/calendar/EventsSidebar';
import { CalendarEvent } from '@/types/calendar';
import { motion } from 'framer-motion';

const Index = () => {
  const {
    events,
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
  } = useCalendar();

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setSelectedDate(new Date());
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
  };

  const handleMoveEvent = (eventId: string, newDate: Date) => {
    updateEvent(eventId, { plannedDate: newDate });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <motion.div 
        className="flex flex-col h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          searchQuery={searchQuery}
          onNavigate={navigateDate}
          onToday={goToToday}
          onViewChange={setView}
          onSearchChange={setSearchQuery}
        />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Calendar view */}
          <motion.div 
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {view === 'month' && (
              <MonthView
                calendarDays={calendarDays}
                currentDate={currentDate}
                events={viewEvents}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
            
            {/* TODO: Add WeekView and DayView components */}
            {view === 'week' && (
              <div className="flex-1 flex items-center justify-center bg-background">
                <div className="text-center text-muted-foreground">
                  <h3 className="text-lg font-medium mb-2">Widok tygodniowy</h3>
                  <p>W przygotowaniu...</p>
                </div>
              </div>
            )}
            
            {view === 'day' && (
              <div className="flex-1 flex items-center justify-center bg-background">
                <div className="text-center text-muted-foreground">
                  <h3 className="text-lg font-medium mb-2">Widok dzienny</h3>
                  <p>W przygotowaniu...</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden lg:block"
          >
            <EventsSidebar
              events={events}
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
              onMoveEvent={handleMoveEvent}
            />
          </motion.div>
        </div>

        {/* Event modal */}
        <EventModal
          open={showEventModal}
          onClose={closeModal}
          event={selectedEvent}
          selectedDate={selectedDate}
          onSave={addEvent}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
        />
      </motion.div>
    </div>
  );
};

export default Index;
