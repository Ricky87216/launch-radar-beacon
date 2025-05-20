
import { useEffect } from "react";
import { ChatBotMenuItem } from "@/components/chat-bot/ChatBotMenuItem";

export function useSideMenuPatch() {
  useEffect(() => {
    // This is a hacky way to inject a menu item
    // In a real application, we would modify the GlobalSidebar component directly
    setTimeout(() => {
      try {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
          // Create container for our new menu item
          const chatBotMenuContainer = document.createElement('div');
          chatBotMenuContainer.className = 'chat-bot-menu-container mt-2 border-t pt-2';
          
          // Render our ChatBotMenuItem into a temporary div
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = `
            <a href="/chat" class="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent/50 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              <span>AI Assistant</span>
            </a>
          `;
          
          chatBotMenuContainer.appendChild(tempDiv.firstChild!);
          sidebarNav.appendChild(chatBotMenuContainer);
        }
      } catch (error) {
        console.error('Failed to patch sidebar menu:', error);
      }
    }, 500);
  }, []);
}
