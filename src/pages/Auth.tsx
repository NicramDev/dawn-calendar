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

  // Check if already authenticated in this session
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('app_authenticated') === 'true';
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
      sessionStorage.setItem('app_authenticated', 'true');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary mb-2">SKUULY</CardTitle>
          <CardDescription className="text-base sm:text-lg">
            Wprowadź kod dostępu do aplikacji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-8">
          {/* Code Input */}
          <div className="space-y-6">
            <div className="flex justify-center gap-3 sm:gap-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl sm:text-3xl font-bold border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 ${
                    error 
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5' 
                      : 'border-input focus:border-primary'
                  } ${
                    digit 
                      ? 'bg-primary/10 border-primary shadow-sm' 
                      : 'bg-background hover:bg-muted/30'
                  } ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-text'
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