import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendar } from '@/hooks/useCalendar';
import { useAppState } from '@/hooks/useAppState';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { EventModal } from '@/components/calendar/EventModal';
import { EventsSidebar } from '@/components/calendar/EventsSidebar';
import { HamburgerMenu } from '@/components/layout/HamburgerMenu';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas';
import { Settings } from '@/pages/Settings';
import { CalendarEvent } from '@/types/calendar';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const { activeTab, sidebarOpen, toggleSidebar, setActiveTab } = useAppState();
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
    toggleEventCompleted,
    getEventsForDay,
    navigateDate,
    goToToday,
    setCurrentDate
  } = useCalendar();

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('app_authenticated') === 'true';
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

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
    // Optional: Add toast notification for better user feedback
    console.log(`Moved task to ${newDate.toDateString()}`);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="flex flex-col h-full">
            {/* Calendar Header */}
            <CalendarHeader
              currentDate={currentDate}
              view={view}
              searchQuery={searchQuery}
              onNavigate={navigateDate}
              onToday={goToToday}
              onViewChange={setView}
              onSearchChange={setSearchQuery}
            />

            {/* Main calendar content */}
            <div className="flex flex-1 overflow-hidden">
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

              {/* Calendar Events Sidebar */}
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
                  onToggleCompleted={toggleEventCompleted}
                />
              </motion.div>
              
              {/* Mobile Events List */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="block lg:hidden"
              >
                <EventsSidebar
                  events={events}
                  onEventClick={handleEventClick}
                  onAddEvent={handleAddEvent}
                  onMoveEvent={handleMoveEvent}
                  onToggleCompleted={toggleEventCompleted}
                  className="w-full border-l-0 border-t"
                />
              </motion.div>
            </div>
          </div>
        );

      case 'mindmap':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <MindMapCanvas />
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full overflow-auto"
          >
            <Settings />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${activeTab === 'mindmap' ? 'bg-mindmap-background' : 'bg-gradient-subtle'}`}>
      <motion.div 
        className="flex flex-col h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top Bar with Hamburger Menu */}
        <div className="flex items-center p-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <HamburgerMenu isOpen={sidebarOpen} onClick={toggleSidebar} />
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-foreground">
              {activeTab === 'calendar' && 'Kalendarz'}
              {activeTab === 'mindmap' && 'Mapa myśli'}
              {activeTab === 'settings' && 'Ustawienia'}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderActiveTab()}
        </div>

        {/* App Sidebar */}
        <AppSidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onClose={() => toggleSidebar()}
          onTabChange={setActiveTab}
        />

        {/* Event modal - only for calendar tab */}
        {activeTab === 'calendar' && (
          <EventModal
            open={showEventModal}
            onClose={closeModal}
            event={selectedEvent}
            selectedDate={selectedDate}
            onSave={addEvent}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Index;
