
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

export function ChatBotMenuItem() {
  const location = useLocation();
  const isChatBotPage = location.pathname === "/chat";

  return (
    <Link
      to="/chat"
      className={cn(
        buttonVariants({ variant: isChatBotPage ? "default" : "ghost", size: "sm" }),
        "justify-start w-full"
      )}
    >
      <Bot className="mr-2 h-4 w-4" />
      <span>AI Assistant</span>
    </Link>
  );
}
