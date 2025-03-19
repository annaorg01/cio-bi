
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      }
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
          <h1 className="text-3xl font-bold text-gray-900">מערכת ניהול HR Brew</h1>
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
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">שם משתמש</Label>
                  <Input
                    id="username"
                    placeholder="הזן שם משתמש"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
          <CardFooter className="flex justify-center text-sm text-gray-500">
            <p>שם משתמש: admin | סיסמה: admin123</p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          מערכת ניהול HR Brew | עיריית הוד השרון
        </div>
      </div>
    </div>
  );
};
