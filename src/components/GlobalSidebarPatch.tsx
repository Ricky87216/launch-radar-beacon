
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import GlobalSidebar from "./GlobalSidebar";
import { ChatBotMenuItem } from "./chat-bot/ChatBotMenuItem";

export default function PatchedGlobalSidebar() {
  return (
    <GlobalSidebar>
      <div className="border-t pt-2 mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <ChatBotMenuItem />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </GlobalSidebar>
  );
}
