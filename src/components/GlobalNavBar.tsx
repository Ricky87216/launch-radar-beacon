
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDashboard } from '@/context/DashboardContext';
import { useSidebar } from '@/components/ui/sidebar';
import GlobalBreadcrumb from './GlobalBreadcrumb';

const GlobalNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const {
    user,
    setCurrentLevel,
    setSelectedParent,
    setSelectedLOBs,
    setSelectedSubTeams,
    setHideFullCoverage
  } = useDashboard();
  
  // Current path parts to determine navigation level
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isAtTopLevel = pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === '');
  
  const handleBackClick = () => {
    // If we're at a deeper level, navigate up one level
    if (pathParts.length > 0) {
      const newPath = '/' + pathParts.slice(0, -1).join('/');
      navigate(newPath);
    } else {
      navigate('/');
    }
  };

  const handleHomeClick = () => {
    // Navigate to dashboard and reset to mega region level
    navigate('/');
    
    // Reset the dashboard view to mega region level
    setCurrentLevel('mega_region');
    setSelectedParent(null);
    
    // Clear any applied filters
    setSelectedLOBs([]);
    setSelectedSubTeams([]);
    setHideFullCoverage(false);
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
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'editor';
  
  return <header className="sticky top-0 z-50 h-12 w-full border-b bg-white">
      <div className="container flex h-12 items-center px-4">
        <div className="flex items-center mr-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 text-[var(--uber-black)]" aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
          </Button>
          
          {!isAtTopLevel && (
            <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2 text-[var(--uber-black)]" title="Back (Alt+←)">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center cursor-pointer" onClick={handleHomeClick}>
            <img alt="Uber" height="24" className="h-6" src="/lovable-uploads/659408ad-46e7-4fca-8f22-36b2349142cf.png" />
            <span className="ml-2 font-semibold">Global First Launch Coverage</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center">
          <GlobalBreadcrumb />
        </div>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
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
              <DropdownMenuItem asChild>
                <Link to="/feedback">Feedback</Link>
              </DropdownMenuItem>
              
              {hasAdminAccess && <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/bulk-edit">Ops Update Center</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/answer-hub">Answer Hub</Link>
                  </DropdownMenuItem>
                </>}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
};

export default GlobalNavBar;
