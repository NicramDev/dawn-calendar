import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Settings, Coffee, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePomodoro, PomodoroMode } from '@/hooks/usePomodoro';
import { PomodoroSettings } from './PomodoroSettings';
import { cn } from '@/lib/utils';

export function PomodoroTimer() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    mode,
    timeLeft,
    isRunning,
    completedSessions,
    totalSessions,
    formattedTime,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    switchMode,
    updateSettings,
    settings,
  } = usePomodoro();

  const getModeConfig = (currentMode: PomodoroMode) => {
    switch (currentMode) {
      case 'work':
        return {
          label: 'Praca',
          icon: Target,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
        };
      case 'shortBreak':
        return {
          label: 'Krótka przerwa',
          icon: Coffee,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
        };
      case 'longBreak':
        return {
          label: 'Długa przerwa',
          icon: Brain,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
        };
      default:
        return {
          label: 'Pauza',
          icon: Pause,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          borderColor: 'border-muted/20',
        };
    }
  };

  const currentConfig = getModeConfig(mode);
  const Icon = currentConfig.icon;

  return (
    <div className="space-y-4 p-4">
      <AnimatePresence mode="wait">
        {showSettings ? (
          <PomodoroSettings
            settings={settings}
            onUpdateSettings={updateSettings}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className={cn("h-5 w-5", currentConfig.color)} />
                <h3 className="text-lg font-semibold">{currentConfig.label}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Timer Display */}
            <Card className={cn("relative overflow-hidden", currentConfig.borderColor)}>
              <div className={cn("absolute inset-0 opacity-50", currentConfig.bgColor)} />
              <CardContent className="relative p-6 text-center">
                <motion.div
                  key={mode}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="space-y-3"
                >
                  <div className="text-4xl font-mono font-bold tracking-wider">
                    {formattedTime}
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-1.5 bg-muted"
                  />
                </motion.div>
              </CardContent>
            </Card>

            {/* Mode Selector */}
            <div className="flex space-x-2">
              {(['work', 'shortBreak', 'longBreak'] as const).map((modeOption) => {
                const config = getModeConfig(modeOption);
                const ModeIcon = config.icon;
                return (
                  <Button
                    key={modeOption}
                    variant={mode === modeOption ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchMode(modeOption)}
                    className={cn(
                      "flex-1 transition-all duration-200",
                      mode === modeOption && config.color
                    )}
                  >
                    <ModeIcon className="h-3 w-3 mr-1" />
                    <span className="text-xs">{config.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={isRunning ? pauseTimer : startTimer}
                size="sm"
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Pauza
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetTimer}
                size="sm"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                onClick={skipSession}
                size="sm"
              >
                <SkipForward className="h-3 w-3" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">
                  {completedSessions}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ukończone
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">
                  {totalSessions}
                </div>
                <div className="text-xs text-muted-foreground">
                  Łącznie
                </div>
              </div>
            </div>

            {/* Next session indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Badge variant="secondary" className="text-xs">
                {mode === 'work' ? 
                  `Następna przerwa: ${(completedSessions + 1) % settings.sessionsUntilLongBreak === 0 ? 'długa' : 'krótka'}` :
                  'Następna: sesja pracy'
                }
              </Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}