import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Download, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

const nodeColors = [
  { name: 'Niebieski', value: 'blue', color: 'bg-blue-500' },
  { name: 'Fioletowy', value: 'purple', color: 'bg-purple-500' },
  { name: 'Zielony', value: 'green', color: 'bg-green-500' },
  { name: 'Pomarańczowy', value: 'orange', color: 'bg-orange-500' },
  { name: 'Różowy', value: 'pink', color: 'bg-pink-500' },
];

export function Settings() {
  const [selectedNodeColor, setSelectedNodeColor] = useState('blue');

  // Load selected color from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedNodeColor');
    if (saved) {
      setSelectedNodeColor(saved);
    }
  }, []);

  // Save selected color to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedNodeColor', selectedNodeColor);
  }, [selectedNodeColor]);
  const handleExportData = () => {
    const data = {
      events: localStorage.getItem('calendar-events') || '[]',
      mindMap: localStorage.getItem('mindMapData') || '{"nodes":[],"connections":[]}'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.events) {
          localStorage.setItem('calendar-events', data.events);
        }
        if (data.mindMap) {
          localStorage.setItem('mindMapData', data.mindMap);
        }
        window.location.reload();
      } catch (error) {
        console.error('Błąd podczas importowania danych:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna.')) {
      localStorage.removeItem('calendar-events');
      localStorage.removeItem('mindMapData');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ustawienia</h1>
          <p className="text-muted-foreground">Personalizuj swoją aplikację kalendarza i mapy myśli</p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Wygląd</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Tryb ciemny</Label>
              <Switch id="dark-mode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="animations">Animacje</Label>
              <Switch id="animations" defaultChecked />
            </div>
            
            <div className="space-y-3">
              <Label>Kolor domyślny węzłów</Label>
              <div className="grid grid-cols-5 gap-2">
                {nodeColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedNodeColor(color.value)}
                    className={`
                      aspect-square rounded-lg border-2 transition-all hover:scale-105
                      ${color.color} 
                      ${selectedNodeColor === color.value 
                        ? 'border-white ring-2 ring-white/50' 
                        : 'border-white/30'
                      }
                    `}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Wybierz domyślny kolor dla nowych węzłów w mapie myśli
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Zarządzanie danymi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Eksportuj dane</span>
              </Button>
              
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="flex items-center space-x-2 w-full"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importuj dane</span>
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={handleClearAllData}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Wyczyść wszystkie dane</span>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Ta operacja usunie wszystkie zadania i węzły mapy myśli. Nie można jej cofnąć.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>O aplikacji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Kalendarz & Mapa myśli v1.0</p>
              <p>Aplikacja do zarządzania zadaniami i wizualizacji pomysłów</p>
              <p>Wszystkie dane są przechowywane lokalnie w Twojej przeglądarce</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}