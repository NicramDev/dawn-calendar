import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const CORRECT_CODE = '1602';

export default function Auth() {
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('app_authenticated') === 'true';
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Check code when all fields are filled
    if (newCode.every(digit => digit !== '')) {
      checkCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        // Move to previous input if current is empty
        inputRefs[index - 1].current?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
    // Handle paste
    else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        if (digits.length === 4) {
          const newCode = digits.split('');
          setCode(newCode);
          checkCode(digits);
        }
      });
    }
  };

  const checkCode = async (inputCode: string) => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (inputCode === CORRECT_CODE) {
      localStorage.setItem('app_authenticated', 'true');
      toast({
        title: "Dostęp przyznany",
        description: "Witaj w SKUULY!",
      });
      navigate('/');
    } else {
      setError('Nieprawidłowy kod dostępu');
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
    
    setLoading(false);
  };

  const clearCode = () => {
    setCode(['', '', '', '']);
    setError('');
    inputRefs[0].current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">SKUULY</CardTitle>
          <CardDescription>
            Wprowadź kod dostępu do aplikacji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Input */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    error 
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
                      : 'border-input focus:border-primary'
                  } ${
                    digit 
                      ? 'bg-primary/5 border-primary' 
                      : 'bg-background'
                  } ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-center">{error}</AlertDescription>
              </Alert>
            )}

            {/* Clear button */}
            {code.some(digit => digit !== '') && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={clearCode}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wyczyść kod
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>Wprowadź 4-cyfrowy kod dostępu</p>
            <p className="text-xs">Możesz także wkleić kod (Ctrl+V)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}