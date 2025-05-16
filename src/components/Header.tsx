
import { useState } from "react";
import { User, Bell, ChevronDown } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user } = useDashboard();
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">Launch Radar</h1>
          <span className="ml-2 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">MVP</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-md bg-white p-4 shadow-lg">
                <h3 className="font-medium">Notifications</h3>
                <div className="mt-2 space-y-2">
                  <div className="rounded-md bg-gray-50 p-2 text-sm">
                    <p className="font-medium">Blocker added for Product Alpha</p>
                    <p className="text-gray-500">2 hours ago</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-2 text-sm">
                    <p className="font-medium">Coverage updated for EMEA region</p>
                    <p className="text-gray-500">Yesterday</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
