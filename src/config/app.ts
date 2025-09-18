export const appConfig = {
  // Godzina wysyłania przypomnień (format 24h)
  reminderHour: 18,
  reminderMinute: 0,
  
  // Wersja aplikacji
  version: '1.0.0',
  
  // Nazwa aplikacji
  name: 'Calendar & Mind Map',
  
  // Opis aplikacji
  description: 'Aplikacja do zarządzania zadaniami i mapami myśli'
} as const;

export type AppConfig = typeof appConfig;