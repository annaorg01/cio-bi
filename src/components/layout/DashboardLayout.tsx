
import React, { useState, ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { IframeContainer } from '@/components/iframe/IframeContainer';
import { useAuth } from '@/context/AuthContext';

interface UserLink {
  id: string;
  name: string;
  url: string;
}

interface DashboardLayoutProps {
  children?: ReactNode;
  userLinks?: UserLink[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  userLinks = [] 
}) => {
  const { isAuthenticated } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  // Default links - in a real app, these would come from an API/database
  const defaultLinks = [
    { name: 'דף בית עירייה', url: 'https://www.hod-hasharon.muni.il/' },
    { name: 'לוח משרות', url: 'https://www.hod-hasharon.muni.il/jobs' },
    { name: 'יצירת קשר', url: 'https://www.hod-hasharon.muni.il/contact' },
  ];

  // Combine default links with user-specific links
  const allLinks = [
    ...defaultLinks,
    ...userLinks.map(link => ({ name: link.name, url: link.url }))
  ];

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLinkSelect = (url: string) => {
    setSelectedUrl(url);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar links={allLinks} onSelectLink={handleLinkSelect} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {selectedUrl ? (
            <div className="h-screen w-full animate-on-load">
              <IframeContainer url={selectedUrl} className="h-full" />
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 h-full">
                {children || <Outlet />}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
