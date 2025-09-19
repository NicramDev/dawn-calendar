import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PomodoroSettingsProps {
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  };
  onUpdateSettings: (settings: Partial<{
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  }>) => void;
  onClose: () => void;
}

export function PomodoroSettings({ settings, onUpdateSettings, onClose }: PomodoroSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleInputChange = (key: keyof typeof localSettings, value: string) => {
    const numValue = parseInt(value) || 1;
    setLocalSettings(prev => ({
      ...prev,
      [key]: Math.max(1, Math.min(key === 'sessionsUntilLongBreak' ? 10 : 180, numValue))
    }));
  };

  const presets = [
    { name: 'Klasyczny', work: 25, shortBreak: 5, longBreak: 15, sessions: 4 },
    { name: 'Krótki', work: 15, shortBreak: 3, longBreak: 10, sessions: 4 },
    { name: 'Długi', work: 45, shortBreak: 10, longBreak: 30, sessions: 3 },
    { name: 'Ultra krótki', work: 10, shortBreak: 2, longBreak: 8, sessions: 6 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setLocalSettings({
      workDuration: preset.work,
      shortBreakDuration: preset.shortBreak,
      longBreakDuration: preset.longBreak,
      sessionsUntilLongBreak: preset.sessions,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">Ustawienia Pomodoro</h3>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Gotowe ustawienia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="w-full justify-start text-left"
            >
              <div>
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {preset.work}min praca • {preset.shortBreak}min przerwa • {preset.longBreak}min długa przerwa
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Custom Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Własne ustawienia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work" className="text-xs text-muted-foreground">
                Sesja pracy (min)
              </Label>
              <Input
                id="work"
                type="number"
                min="1"
                max="180"
                value={localSettings.workDuration}
                onChange={(e) => handleInputChange('workDuration', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="shortBreak" className="text-xs text-muted-foreground">
                Krótka przerwa (min)
              </Label>
              <Input
                id="shortBreak"
                type="number"
                min="1"
                max="60"
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleInputChange('shortBreakDuration', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="longBreak" className="text-xs text-muted-foreground">
                Długa przerwa (min)
              </Label>
              <Input
                id="longBreak"
                type="number"
                min="1"
                max="180"
                value={localSettings.longBreakDuration}
                onChange={(e) => handleInputChange('longBreakDuration', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sessions" className="text-xs text-muted-foreground">
                Sesje do długiej przerwy
              </Label>
              <Input
                id="sessions"
                type="number"
                min="1"
                max="10"
                value={localSettings.sessionsUntilLongBreak}
                onChange={(e) => handleInputChange('sessionsUntilLongBreak', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Zapisz ustawienia
        </Button>
        <Button variant="outline" onClick={onClose}>
          Anuluj
        </Button>
      </div>
    </motion.div>
  );
}