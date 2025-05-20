
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ChatBotCallout() {
  return (
    <Card className="mb-4 mx-4 mt-4 bg-primary/5 border-primary/20">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium text-lg">Try our new AI Assistant</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get quick answers about product coverage, blockers, and more with our AI-powered assistant.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to="/chat">
          <Button variant="outline" className="text-primary hover:text-primary hover:bg-primary/10">
            <Bot className="mr-2 h-4 w-4" />
            <span>Ask AI Assistant</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
