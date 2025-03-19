
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface UserLink {
  id: string;
  name: string;
  url: string;
}

const Dashboard = () => {
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserLinks = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }
        
        const { data, error } = await supabase
          .from('user_links')
          .select('id, name, url')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setLinks(data || []);
      } catch (err) {
        console.error('Error fetching links:', err);
        setError('Failed to load your links. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserLinks();
  }, [navigate]);

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
                onClick={() => handleOpenLink(link.url)} 
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
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-right">הקישורים שלי</h1>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
