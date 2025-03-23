
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UserData, UserLink } from './types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserLinksManagerProps {
  selectedUser: UserData | null;
  onAddLink: (name: string, url: string) => Promise<void>;
  onRemoveLink: (linkId: string) => Promise<void>;
}

export const UserLinksManager: React.FC<UserLinksManagerProps> = ({
  selectedUser,
  onAddLink,
  onRemoveLink
}) => {
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddLink = async () => {
    if (!selectedUser || !newLinkName || !newLinkUrl) return;
    
    setError(null);
    
    // Validate URL format
    if (!newLinkUrl.startsWith('http')) {
      setError('כתובת URL חייבת להתחיל ב-http:// או https://');
      toast({
        variant: "destructive",
        title: "כתובת לא תקינה",
        description: "כתובת URL חייבת להתחיל ב-http:// או https://",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Adding link for user:', selectedUser.id, newLinkName, newLinkUrl);
      await onAddLink(newLinkName, newLinkUrl);
      
      // Only clear the form if the submission was successful
      setNewLinkName('');
      setNewLinkUrl('');
      
      toast({
        title: "הקישור נוסף בהצלחה",
        description: `הקישור "${newLinkName}" נוסף למשתמש ${selectedUser.username}`,
      });
    } catch (err) {
      console.error('Error in link addition:', err);
      setError('אירעה שגיאה בעת הוספת הקישור. נסה שנית.');
      toast({
        variant: "destructive",
        title: "שגיאה בהוספת הקישור",
        description: "אירעה שגיאה בעת הוספת הקישור. נסה שנית מאוחר יותר.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedUser) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>קישורים</CardTitle>
          <CardDescription>בחר משתמש מהרשימה כדי לנהל את הקישורים שלו</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">בחר משתמש מהרשימה כדי להתחיל</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>{`קישורים עבור ${selectedUser.username}`}</CardTitle>
        <CardDescription>נהל את הקישורים של המשתמש הנבחר</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">קישורים קיימים</h3>
            {selectedUser.links.length === 0 ? (
              <p className="text-sm text-gray-500">אין קישורים למשתמש זה</p>
            ) : (
              <div className="space-y-2">
                {selectedUser.links.map(link => (
                  <div 
                    key={link.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <LinkIcon className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{link.name}</p>
                        <p className="text-xs text-gray-500">{link.url}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveLink(link.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">הוסף קישור חדש</h3>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="linkName">שם הקישור</Label>
                <Input
                  id="linkName"
                  placeholder="לדוגמה: פורטל עובדים"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  className="text-right"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkUrl">כתובת URL</Label>
                <Input
                  id="linkUrl"
                  placeholder="https://example.com"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="text-right"
                />
              </div>
              <Button 
                onClick={handleAddLink}
                disabled={!newLinkName || !newLinkUrl || isSubmitting}
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? 'מוסיף...' : 'הוסף קישור'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
