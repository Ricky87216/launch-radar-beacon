
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, Star, AlertTriangle, Wrench, Database, Search, ShieldAlert, BarChartIcon, HelpCircle, MessageSquare, Bot } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { SplineScene } from '@/components/ui/splite';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInput
} from '@/components/ui/sidebar';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  requiresRole?: string[];
}

const GlobalSidebar = () => {
  const location = useLocation();
  const { user } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems: MenuItem[] = [
    { icon: Grid, label: 'Dashboard', href: '/' },
    { icon: BarChartIcon, label: 'Analytics', href: '/analytics' },
    { icon: Star, label: 'My Coverage', href: '/my' },
    { 
      icon: ShieldAlert, 
      label: 'Escalations', 
      href: '/admin/escalations',
      requiresRole: ['admin', 'can_edit_status']
    },
    { 
      icon: AlertTriangle, 
      label: 'Escalations Log', 
      href: '/escalations' 
    },
    { 
      icon: Wrench, 
      label: 'Ops Update Center', 
      href: '/admin/bulk-edit',
      requiresRole: ['admin', 'can_edit_status']
    },
    { 
      icon: Database, 
      label: 'Data Sync', 
      href: '/admin/data-sync',
      requiresRole: ['admin', 'can_edit_status']
    },
    { 
      icon: HelpCircle, 
      label: 'How To Guide', 
      href: '/how-to' 
    },
    { 
      icon: MessageSquare, 
      label: 'Feedback', 
      href: '/feedback' 
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.requiresRole) return true;
    return user?.role && item.requiresRole.includes(user.role);
  });

  // Filter items based on search
  const searchResults = searchQuery 
    ? filteredMenuItems.filter(
        item => item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredMenuItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-2">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <SidebarInput 
            placeholder="Search... (Ctrl+K)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {searchResults.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={item.label}
              >
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <SidebarSeparator className="my-2" />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === '/chat'}
              tooltip="AI Assistant"
            >
              <Link to="/chat">
                <Bot className="h-4 w-4" />
                <span>AI Assistant</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Mini Robot Component */}
          <SidebarMenuItem>
            <Link to="/chat" className="block p-2">
              <div className="h-48 w-full relative overflow-hidden rounded-md bg-transparent hover:bg-sidebar-accent transition-colors cursor-pointer flex justify-start">
                <SplineScene 
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" 
                  className="h-full w-48 scale-[2.25] hover:scale-[2.5] transition-transform duration-300 origin-left"
                />
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          <p>Global First Launch Coverage</p>
          <p>© 2025 Launch Systems</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default GlobalSidebar;
