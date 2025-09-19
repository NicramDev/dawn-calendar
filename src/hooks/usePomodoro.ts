import { useState, useEffect, useCallback } from 'react';

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak' | 'paused';

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
}

export function usePomodoro() {
  // Settings
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  // Timer state
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  // Calculate current session duration
  const getCurrentDuration = useCallback(() => {
    switch (mode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  }, [mode, settings]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session completed
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    
    if (mode === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      setTotalSessions(prev => prev + 1);
      
      // Determine next break type
      const shouldTakeLongBreak = newCompletedSessions % settings.sessionsUntilLongBreak === 0;
      const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
      
      setMode(nextMode);
      setTimeLeft(nextMode === 'longBreak' ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60);
    } else {
      // Break completed, start work session
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
    }
  }, [mode, completedSessions, settings]);

  // Control functions
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentDuration());
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsRunning(false);
    switch (newMode) {
      case 'work':
        setTimeLeft(settings.workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreakDuration * 60);
        break;
    }
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Reset timer if not running
    if (!isRunning) {
      setTimeLeft(getCurrentDuration());
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100;

  return {
    // State
    mode,
    timeLeft,
    isRunning,
    completedSessions,
    totalSessions,
    settings,
    progress,
    
    // Computed
    formattedTime: formatTime(timeLeft),
    currentDuration: getCurrentDuration(),
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    switchMode,
    updateSettings,
  };
}