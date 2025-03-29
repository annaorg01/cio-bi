
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { fetchUserLinks } from '@/services/userService';
import { toast } from '@/components/ui/use-toast';

interface UserLink {
  id: string;
  name: string;
  url: string;
}

const Dashboard = () => {
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadUserLinks = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          setLinks([]);
          setLoading(false);
          return;
        }
        
        console.log('Fetching links for user:', user);
        
        // Fetch links from service - this will handle both auth types
        const userLinks = await fetchUserLinks(user.id);
        console.log('Received links:', userLinks);
        setLinks(userLinks || []);
        
      } catch (err) {
        console.error('Error fetching links:', err);
        setError('כשלון בטעינת הקישורים. אנא נסו שוב מאוחר יותר.');
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת קישורים",
          description: "אירעה שגיאה בטעינת הקישורים. נסה שנית מאוחר יותר."
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserLinks();
  }, [user]);

  const handleLinkSelect = (url: string) => {
    // This will now be handled by the DashboardLayout component
  };
  
  const renderUserInfo = () => {
    if (!user) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <User className="h-5 w-5 mr-2" />
            פרטי משתמש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-right">
            <p className="font-bold text-lg">{user.full_name || user.username}</p>
            {user.department && <p className="text-gray-600">{user.department}</p>}
            {user.email && <p className="text-gray-500 text-sm">{user.email}</p>}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">טוען קישורים...</span>
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
    
    if (links.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין קישורים להצגה</h3>
          <p className="text-gray-500">המנהל שלך עדיין לא הוסיף קישורים לחשבון שלך.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Card key={link.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{link.name}</CardTitle>
              <CardDescription className="truncate">{link.url}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleLinkSelect(link.url)} 
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                פתח קישור
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout userLinks={links}>
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-right">הקישורים שלי</h1>
        {renderUserInfo()}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
