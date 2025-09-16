export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  color: EventColor;
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