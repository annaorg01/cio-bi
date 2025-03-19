
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserLink {
  id: string;
  name: string;
  url: string;
}

interface UserData {
  id: string;
  username: string;
  links: UserLink[];
}

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users and their links
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username');
        
        if (profilesError) throw profilesError;
        
        // For each profile, fetch their links
        const usersWithLinks = await Promise.all(
          profiles.map(async (profile) => {
            const { data: links, error: linksError } = await supabase
              .from('user_links')
              .select('id, name, url')
              .eq('user_id', profile.id);
            
            if (linksError) throw linksError;
            
            return {
              id: profile.id,
              username: profile.username || 'Unknown User',
              links: links || []
            };
          })
        );
        
        setUsers(usersWithLinks);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleAddLink = async () => {
    if (!selectedUser || !newLinkName || !newLinkUrl) return;
    
    if (!newLinkUrl.startsWith('http')) {
      toast({
        variant: "destructive",
        title: "כתובת לא תקינה",
        description: "כתובת URL חייבת להתחיל ב-http:// או https://",
      });
      return;
    }

    try {
      // Add link to database
      const { data, error } = await supabase
        .from('user_links')
        .insert({
          user_id: selectedUser.id,
          name: newLinkName,
          url: newLinkUrl
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            links: [...user.links, data]
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);
      setNewLinkName('');
      setNewLinkUrl('');

      toast({
        title: "הקישור נוסף בהצלחה",
        description: `הקישור "${newLinkName}" נוסף למשתמש ${selectedUser.username}`,
      });
    } catch (err) {
      console.error('Error adding link:', err);
      toast({
        variant: "destructive",
        title: "שגיאה בהוספת הקישור",
        description: "אירעה שגיאה בעת הוספת הקישור. נסה שנית מאוחר יותר.",
      });
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    if (!selectedUser) return;

    try {
      // Delete link from database
      const { error } = await supabase
        .from('user_links')
        .delete()
        .eq('id', linkId);
      
      if (error) throw error;

      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            links: user.links.filter(link => link.id !== linkId)
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);

      toast({
        title: "הקישור הוסר בהצלחה",
        description: `הקישור הוסר ממשתמש ${selectedUser.username}`,
      });
    } catch (err) {
      console.error('Error removing link:', err);
      toast({
        variant: "destructive",
        title: "שגיאה בהסרת הקישור",
        description: "אירעה שגיאה בעת הסרת הקישור. נסה שנית מאוחר יותר.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">טוען משתמשים...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full animate-on-load">
      {/* Users List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>משתמשים</CardTitle>
          <CardDescription>בחר משתמש לניהול הקישורים שלו</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-sm text-gray-500">אין משתמשים להצגה</p>
            ) : (
              users.map(user => (
                <Button
                  key={user.id}
                  variant={selectedUser?.id === user.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex justify-between w-full">
                    <span>{user.username}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {user.links.length} קישורים
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Links */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedUser ? `קישורים עבור ${selectedUser.username}` : 'קישורים'}
          </CardTitle>
          <CardDescription>
            {selectedUser 
              ? 'נהל את הקישורים של המשתמש הנבחר' 
              : 'בחר משתמש מהרשימה כדי לנהל את הקישורים שלו'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedUser ? (
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
                          onClick={() => handleRemoveLink(link.id)}
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
                    disabled={!newLinkName || !newLinkUrl}
                    className="mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    הוסף קישור
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">בחר משתמש מהרשימה כדי להתחיל</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
