
import React, { useState, ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { IframeContainer } from '@/components/iframe/IframeContainer';
import { useAuth } from '@/context/AuthContext';

// Default links - in a real app, these would come from an API/database
const defaultLinks = [
  { name: 'דף בית עירייה', url: 'https://www.hod-hasharon.muni.il/' },
  { name: 'לוח משרות', url: 'https://www.hod-hasharon.muni.il/jobs' },
  { name: 'יצירת קשר', url: 'https://www.hod-hasharon.muni.il/contact' },
];

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLinkSelect = (url: string) => {
    setSelectedUrl(url);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar links={defaultLinks} onSelectLink={handleLinkSelect} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 h-full">
            <div className="h-full rounded-lg animate-on-load">
              <IframeContainer url={selectedUrl} className="h-full" />
            </div>
            
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
