import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarView } from '@/types/calendar';
import { motion } from 'framer-motion';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  searchQuery: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onSearchChange: (query: string) => void;
}

export const CalendarHeader = ({
  currentDate,
  view,
  searchQuery,
  onNavigate,
  onToday,
  onViewChange,
  onSearchChange
}: CalendarHeaderProps) => {
  const getDateFormat = () => {
    switch (view) {
      case 'month':
        return 'LLLL yyyy';
      case 'week':
        return "'Tydzień' d MMMM yyyy";
      case 'day':
        return 'EEEE, d MMMM yyyy';
      default:
        return 'LLLL yyyy';
    }
  };

  return (
    <motion.div 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-6 bg-gradient-card border-b border-border"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left section - Navigation */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-1 sm:gap-2 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prev')}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-primary-soft border-border"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <motion.h1 
            className="text-lg sm:text-2xl font-semibold text-foreground min-w-0 flex-1 text-center sm:text-left sm:min-w-[200px]"
            key={currentDate.toISOString() + view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {format(currentDate, getDateFormat(), { locale: pl })}
          </motion.h1>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('next')}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-primary-soft border-border"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={onToday}
          className="hidden sm:flex hover:bg-primary-soft border-border"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Dziś
        </Button>
      </div>

      {/* Right section - View switcher and search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-auto order-2 sm:order-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj zadań..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 sm:pl-10 w-full sm:w-64 border-border bg-background h-8 sm:h-10 text-sm"
          />
        </div>

        {/* View switcher */}
        <div className="flex bg-muted rounded-lg p-1 w-full sm:w-auto order-1 sm:order-2">
          {(['month', 'week', 'day'] as CalendarView[]).map((viewType) => (
            <Button
              key={viewType}
              variant={view === viewType ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(viewType)}
              className={`flex-1 sm:flex-none px-2 sm:px-4 h-7 sm:h-8 text-xs sm:text-sm ${
                view === viewType 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {viewType === 'month' ? 'Miesiąc' : 
               viewType === 'week' ? 'Tydzień' : 'Dzień'}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};