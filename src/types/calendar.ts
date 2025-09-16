export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: EventColor;
  reminder?: number; // minutes before event
}

export type EventColor = 'blue' | 'pink' | 'green' | 'purple' | 'orange' | 'yellow';

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarState {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarView;
  selectedDate?: Date;
  searchQuery: string;
}