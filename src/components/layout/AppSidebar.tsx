import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Brain, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppTab } from '@/hooks/useAppState';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  isOpen: boolean;
  activeTab: AppTab;
  onClose: () => void;
  onTabChange: (tab: AppTab) => void;
}

const tabs = [
  {
    id: 'calendar' as AppTab,
    label: 'Kalendarz',
    icon: CalendarIcon,
    description: 'Zarządzaj swoimi zadaniami i terminami'
  },
  {
    id: 'mindmap' as AppTab,
    label: 'Mapa myśli',
    icon: Brain,
    description: 'Wizualizuj swoje pomysły i połączenia'
  },
  {
    id: 'settings' as AppTab,
    label: 'Ustawienia',
    icon: Settings,
    description: 'Personalizuj aplikację'
  }
];

export function AppSidebar({ isOpen, activeTab, onClose, onTabChange }: AppSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className={cn(
              "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border shadow-lg",
              "w-full lg:w-80"
            )}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
                <motion.h2 
                  className="text-xl font-semibold text-sidebar-foreground"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Menu
                </motion.h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6">
                <div className="space-y-2">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.div
                        key={tab.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                      >
                         <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start p-4 h-auto text-left transition-all duration-200",
                            isActive 
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          onClick={() => {
                            onTabChange(tab.id);
                            onClose();
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon className={cn(
                              "h-5 w-5 mt-0.5 flex-shrink-0",
                              // First icon (Calendar) gets special color
                              index === 0 && !isActive && "text-blue-500"
                            )} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{tab.label}</div>
                              <div className={cn(
                                "text-xs mt-1 opacity-70",
                                isActive ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/70"
                              )}>
                                {tab.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Footer */}
              <motion.div 
                className="p-6 border-t border-sidebar-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-xs text-sidebar-foreground/60 text-center">
                  Kalendarz & Mapa myśli
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}