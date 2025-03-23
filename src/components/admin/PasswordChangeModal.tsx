
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserData } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { logPasswordChange } from '@/services/userService';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('לא נבחר משתמש');
      return;
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להיות באורך של 6 תווים לפחות');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const currentUser = sessionData.session?.user;
      
      if (!token) {
        throw new Error('No authentication token available - please login again');
      }

      console.log("Calling change-password with email:", user.email);
      
      // Call the change-password function with the auth token
      const { data, error: functionError } = await supabase.functions.invoke('change-password', {
        body: {
          email: user.email,
          password: password
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Function response:", data);

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message);
      }

      if (data && data.error) {
        console.error('Data error:', data.error);
        throw new Error(data.error);
      }
      
      // Log the password change
      if (currentUser && user.id) {
        await logPasswordChange(currentUser.id, user.id);
        
        // Also log to activity_logs
        try {
          await supabase.from('activity_logs').insert({
            user_id: currentUser.id,
            action_type: 'change_password',
            details: {
              target_user_id: user.id,
              target_user_email: user.email
            }
          });
        } catch (logError) {
          console.error('Error logging to activity_logs:', logError);
        }
      }
      
      toast({
        title: "הסיסמה שונתה בהצלחה",
        description: `הסיסמה של ${user.username} שונתה בהצלחה`,
      });
      
      // Reset form and close modal
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'אירעה שגיאה בעת שינוי הסיסמה');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>שינוי סיסמה</DialogTitle>
          <DialogDescription>
            {user ? `שנה את הסיסמה עבור ${user.full_name || user.username}` : 'בחר משתמש לשינוי סיסמה'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="new-password">סיסמה חדשה</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="הזן סיסמה חדשה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">אימות סיסמה</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="הזן שוב את הסיסמה החדשה"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="text-right"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading || !user}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  <span>מעדכן...</span>
                </div>
              ) : (
                'שינוי סיסמה'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
