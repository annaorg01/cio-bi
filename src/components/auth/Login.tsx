
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('שם משתמש או סיסמה שגויים');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('אירעה שגיאה בתהליך ההתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="w-full max-w-md animate-on-load">
        <div className="text-center mb-8">
          <img 
            src="https://www.hod-hasharon.muni.il/content/images/logo.png?v=4a" 
            alt="Logo" 
            className="h-20 mx-auto mb-6" 
          />
          <h1 className="text-3xl font-bold text-gray-900">מערכת ניהול בינה עסקית</h1>
          <p className="text-gray-600 mt-2">התחבר כדי לגשת למערכת</p>
        </div>

        <Card className="glass shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center">התחברות</CardTitle>
            <CardDescription className="text-center">
              הזן את פרטי ההתחברות שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="הזן אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="הזן סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    <span>מתחבר...</span>
                  </div>
                ) : (
                  'התחבר'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          מערכת ניהול בינה עסקית | עיריית הוד השרון
        </div>
      </div>
    </div>
  );
};
