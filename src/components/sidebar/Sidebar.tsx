
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  links: { name: string; url: string }[];
  onSelectLink: (url: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ links, onSelectLink }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Close mobile sidebar when route changes
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarLinks: SidebarLink[] = [
    {
      name: 'לוח בקרה',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'ניהול משתמשים',
      href: '/admin',
      icon: Users,
      adminOnly: true
    },
    {
      name: 'הגדרות',
      href: '/settings',
      icon: Settings
    },
    {
      name: 'התנתק',
      href: '#',
      icon: LogOut,
      onClick: logout
    }
  ];

  const filteredLinks = sidebarLinks.filter(
    link => !link.adminOnly || isAdmin
  );

  // Mobile sidebar toggle button
  const MobileToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 right-4 z-50"
      onClick={toggleMobileSidebar}
    >
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </Button>
  );

  return (
    <>
      <MobileToggle />
      
      <aside
        className={cn(
          'h-screen z-40 flex flex-col bg-sidebar transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
          isMobile && (mobileOpen ? 'translate-x-0' : 'translate-x-full'),
          isMobile ? 'fixed right-0 shadow-xl' : 'relative'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center rtl:space-x-reverse space-x-2">
              <img 
                src="https://www.hod-hasharon.muni.il/content/images/logo.png?v=4a" 
                alt="Logo" 
                className="h-8 w-auto object-contain" 
              />
              {!collapsed && <span className="text-sidebar-foreground font-bold">HR Brew</span>}
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex"
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {filteredLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={link.onClick}
                className={cn(
                  'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                  'transition-colors duration-200',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  location.pathname === link.href 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground'
                )}
              >
                <link.icon className={cn(
                  'flex-shrink-0',
                  collapsed ? 'mx-auto h-6 w-6' : 'ml-1 h-6 w-6'
                )} />
                {!collapsed && <span>{link.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className={cn(
            'flex items-center',
            collapsed ? 'justify-center' : 'justify-start'
          )}>
            {!collapsed && (
              <div className="rtl:ml-2 ltr:mr-2 text-sidebar-foreground">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs opacity-60">
                  {isAdmin ? 'מנהל מערכת' : 'משתמש רגיל'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4">
          <h2 className="text-sm font-semibold mb-2 text-sidebar-foreground">קישורים מהירים</h2>
          <div className="space-y-2">
            {links.map((link, index) => (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed && "p-2 justify-center"
                )}
                onClick={() => onSelectLink(link.url)}
              >
                {collapsed ? "#" + (index + 1) : link.name}
              </Button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
