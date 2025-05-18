
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Settings, UploadCloud, Grid2x2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboard } from '@/context/DashboardContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';

const Header = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useDashboard();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={handleLogoClick}
            className="inline-flex items-center mr-6"
          >
            <span className="font-bold text-xl">Global First Launch Coverage</span>
          </button>

          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                to="/my"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                My Coverage
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium">
                    Admin
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Product Ops Center</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/data-sync')}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Data Sync
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/bulk-edit')}>
                    <Grid2x2 className="mr-2 h-4 w-4" />
                    Bulk Edit Workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Add more header items here if needed */}
          
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link
                    to="/"
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my"
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Coverage
                  </Link>
                  
                  <div className="pt-2 pb-1">
                    <h4 className="text-sm font-semibold mb-2">Admin</h4>
                    <Link
                      to="/admin"
                      className="text-sm font-medium transition-colors hover:text-primary block py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/data-sync"
                      className="text-sm font-medium transition-colors hover:text-primary block py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Data Sync
                    </Link>
                    <Link
                      to="/admin/bulk-edit"
                      className="text-sm font-medium transition-colors hover:text-primary block py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Bulk Edit Workspace
                    </Link>
                    <Link
                      to="/admin/logs"
                      className="text-sm font-medium transition-colors hover:text-primary block py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      System Logs
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
