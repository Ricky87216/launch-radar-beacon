
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useDashboard } from '@/context/DashboardContext';
import { useSidebar } from '@/components/ui/sidebar';
import GlobalBreadcrumb from './GlobalBreadcrumb';

const GlobalNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const { user } = useDashboard();

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+Left Arrow for back navigation
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        handleBackClick();
      }
      
      // Ctrl+K for sidebar search (this will be implemented in GlobalSidebar)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleSidebar, navigate]);

  // Determine if the user has admin privileges
  // Fix: Check for admin role using the correct role type from the User interface
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'editor';

  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b bg-background">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center mr-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="mr-2"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackClick}
            className="mr-2" 
            title="Back (Alt+←)"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center font-semibold">
            <span>Global First Launch Coverage</span>
          </Link>
        </div>
        
        <div className="flex-1 flex justify-center">
          <GlobalBreadcrumb />
        </div>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {/* Fix: Use user.name for the avatar since avatarUrl doesn't exist */}
                  <AvatarImage src="" />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/my">My Launch Radar</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/">Global Dashboard</Link>
              </DropdownMenuItem>
              
              {hasAdminAccess && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/bulk-edit">Ops Update Center</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/answer-hub">Answer Hub</Link>
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default GlobalNavBar;
