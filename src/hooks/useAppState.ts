import { useState } from 'react';

export type AppTab = 'calendar' | 'mindmap' | 'settings';

export function useAppState() {
  const [activeTab, setActiveTab] = useState<AppTab>('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen),
  };
}