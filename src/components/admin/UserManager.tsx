
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

// Sample data for demonstration
const initialUsers: UserData[] = [
  {
    id: '1',
    username: 'user1',
    links: [
      { id: '1-1', name: 'פורטל עובדים', url: 'https://example.com/portal' },
      { id: '1-2', name: 'מערכת נוכחות', url: 'https://example.com/attendance' }
    ]
  },
  {
    id: '2',
    username: 'user2',
    links: [
      { id: '2-1', name: 'פורטל עובדים', url: 'https://example.com/portal' }
    ]
  }
];

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const { toast } = useToast();

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleAddLink = () => {
    if (!selectedUser || !newLinkName || !newLinkUrl) return;
    
    if (!newLinkUrl.startsWith('http')) {
      toast({
        variant: "destructive",
        title: "כתובת לא תקינה",
        description: "כתובת URL חייבת להתחיל ב-http:// או https://",
      });
      return;
    }

    const newLink: UserLink = {
      id: `${selectedUser.id}-${Date.now()}`,
      name: newLinkName,
      url: newLinkUrl
    };

    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          links: [...user.links, newLink]
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
  };

  const handleRemoveLink = (linkId: string) => {
    if (!selectedUser) return;

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
  };

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
            {users.map(user => (
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
            ))}
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
