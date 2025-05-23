'use client';

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "@/context/DashboardContext";
import { Send, Bot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SuggestedQuestions } from "@/components/chat-bot/SuggestedQuestions";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  links?: Array<{
    text: string;
    url: string;
  }>;
}

export function SplineSceneBasic() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    content: "Hello! I'm your Launch Radar assistant. How can I help you today?",
    role: "assistant",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    products,
    markets,
    coverageData,
    blockers,
    getProductById,
    getMarketById
  } = useDashboard();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // Focus input field on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowSuggestions(false);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        content: aiResponse.content,
        role: "assistant",
        timestamp: new Date(),
        links: aiResponse.links
      }]);
      setIsTyping(false);
    }, 1500);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleSelectSuggestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };
  const generateAIResponse = (query: string): {
    content: string;
    links?: Array<{
      text: string;
      url: string;
    }>;
  } => {
    // Convert query to lowercase for easier matching
    const q = query.toLowerCase();

    // Product coverage question
    if (q.includes("coverage") && (q.includes("product") || products.some(p => q.includes(p.name.toLowerCase())))) {
      let productName = "Product Alpha";

      // Try to extract product name from query
      for (const product of products) {
        if (q.includes(product.name.toLowerCase())) {
          productName = product.name;
          break;
        }
      }
      const product = products.find(p => p.name === productName);
      if (product) {
        // Get some mock coverage data
        const productCoverage = coverageData.filter(c => c.product_id === product.id).slice(0, 3);
        const coverageDetails = productCoverage.map(c => {
          const market = markets.find(m => m.id === c.market_id);
          return market ? `${market.name}: ${Math.round(c.city_percentage)}%` : '';
        }).filter(Boolean).join(", ");
        return {
          content: `${productName} has varying coverage across different markets. Here are some key metrics: ${coverageDetails}`,
          links: [{
            text: "View Full Coverage Dashboard",
            url: "/"
          }, {
            text: "View Product Details",
            url: `/products/${product.id}`
          }]
        };
      }
    }

    // Blockers question
    if (q.includes("blocker") || q.includes("issue") || q.includes("problem")) {
      const activeBlockers = blockers.filter(b => !b.resolved).slice(0, 2);
      if (activeBlockers.length > 0) {
        const blockerDetails = activeBlockers.map(b => {
          const product = getProductById(b.product_id);
          const market = getMarketById(b.market_id);
          return `${product?.name || 'Unknown Product'} in ${market?.name || 'Unknown Market'}: ${b.category} (ETA: ${new Date(b.eta).toLocaleDateString()})`;
        }).join("\n\n");
        return {
          content: `Here are the current top blockers:\n\n${blockerDetails}`,
          links: [{
            text: "View All Blockers",
            url: "/escalations"
          }]
        };
      }
    }

    // Markets question
    if ((q.includes("market") || q.includes("region") || q.includes("country") || q.includes("city")) && (q.includes("available") || q.includes("list") || q.includes("which"))) {
      const marketsByType = {
        regions: markets.filter(m => m.type === "region").slice(0, 4),
        countries: markets.filter(m => m.type === "country").slice(0, 4),
        cities: markets.filter(m => m.type === "city").slice(0, 4)
      };
      return {
        content: `We have coverage data across multiple market levels. Some key markets include:\n\nRegions: ${marketsByType.regions.map(m => m.name).join(", ")}\n\nCountries: ${marketsByType.countries.map(m => m.name).join(", ")}\n\nCities: ${marketsByType.cities.map(m => m.name).join(", ")}`,
        links: [{
          text: "Explore Markets",
          url: "/"
        }]
      };
    }

    // TAM question
    if (q.includes("tam") || (q.includes("target") || q.includes("addressable")) && q.includes("market")) {
      return {
        content: "The TAM (Total Addressable Market) view allows you to focus on markets that are strategically important. You can toggle the TAM filter on the dashboard to see coverage specifically for your target markets.",
        links: [{
          text: "View TAM Coverage",
          url: "/?tam=true"
        }]
      };
    }

    // Launch dates question
    if (q.includes("launch") && (q.includes("date") || q.includes("when"))) {
      const upcomingProducts = products.filter(p => p.launch_date && new Date(p.launch_date) > new Date()).slice(0, 3);
      if (upcomingProducts.length > 0) {
        const launchDetails = upcomingProducts.map(p => `${p.name}: ${new Date(p.launch_date!).toLocaleDateString()}`).join("\n");
        return {
          content: `Here are the upcoming product launches:\n\n${launchDetails}`,
          links: [{
            text: "View Launch Calendar",
            url: "/analytics"
          }]
        };
      }
    }

    // Escalations question
    if (q.includes("escalation") || q.includes("escalate")) {
      return {
        content: "Escalations are tracked in the Escalation Log. You can view current escalations, their status, and create new ones from the dashboard by clicking on any cell with issues.",
        links: [{
          text: "View Escalation Log",
          url: "/escalations"
        }]
      };
    }

    // Default response for other questions
    return {
      content: "I don't have specific information on that query. The Launch Radar dashboard provides comprehensive data on product coverage, blockers, and market performance. Would you like me to help you navigate to a specific section?",
      links: [{
        text: "Dashboard Home",
        url: "/"
      }, {
        text: "Analytics",
        url: "/analytics"
      }, {
        text: "My Launch Radar",
        url: "/my"
      }]
    };
  };

  return <Card className="w-full h-[500px] bg-transparent border-transparent relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      <div className="flex h-full">
        {/* Left content - 3D Robot */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            AI Assistant
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">Ask me anything about Global First</p>
          <div className="mt-4 h-64">
            <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
          </div>
        </div>

        {/* Right content - Chat Interface */}
        <div className="flex-1 relative flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-black/50 to-gray-900/30">
            {messages.map(message => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
                <div className={`relative max-w-[85%] ${message.role === "user" ? "order-1" : "order-2"}`}>
                  {/* Message bubble */}
                  <div className={`p-4 rounded-2xl border backdrop-blur-sm shadow-lg ${
                    message.role === "user" 
                      ? "bg-white/90 text-black border-white/20 rounded-br-md ml-4" 
                      : "bg-black/80 text-white border-gray-700/50 rounded-bl-md mr-4"
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    {message.links && message.links.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-300/20 space-y-1">
                        {message.links.map((link, index) => (
                          <Link
                            key={index}
                            to={link.url}
                            className={`block text-xs underline transition-colors ${
                              message.role === "user" 
                                ? "text-blue-600 hover:text-blue-800" 
                                : "text-blue-400 hover:text-blue-300"
                            }`}
                          >
                            {link.text}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs text-gray-400 mt-1 ${
                    message.role === "user" ? "text-right mr-4" : "text-left ml-4"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {/* Avatar indicator */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user" 
                    ? "bg-white text-black order-2 ml-2" 
                    : "bg-gray-800 text-white order-1 mr-2"
                }`}>
                  {message.role === "user" ? (
                    <span className="text-xs font-bold">U</span>
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
              </div>)}
            
            {isTyping && <div className="flex justify-start mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center order-1 mr-2">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="relative max-w-[85%] order-2">
                  <div className="p-4 bg-black/80 border border-gray-700/50 rounded-2xl rounded-bl-md mr-4 backdrop-blur-sm shadow-lg">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{
                    animationDelay: "0ms"
                  }}></div>
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{
                    animationDelay: "150ms"
                  }}></div>
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{
                    animationDelay: "300ms"
                  }}></div>
                    </div>
                  </div>
                </div>
              </div>}
            
            {showSuggestions && messages.length === 1 && <div className="flex justify-center">
                <div className="p-4 w-full bg-transparent rounded-lg">
                  <p className="text-sm text-center mb-4 text-gray-300">Try asking one of these questions:</p>
                  <SuggestedQuestions onSelectQuestion={handleSelectSuggestion} />
                </div>
              </div>}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-700/50 p-4 bg-black/20 backdrop-blur-sm">
            <div className="flex gap-3">
              <Input 
                ref={inputRef} 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder="Ask me about product coverage, blockers, markets..." 
                className="flex-1 bg-gray-900/50 border-gray-600/50 text-white placeholder-gray-400 text-sm rounded-xl focus:border-white/50 focus:ring-1 focus:ring-white/20" 
                disabled={isTyping} 
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isTyping} 
                size="sm"
                className="rounded-xl bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>Try asking about product coverage, blockers, or launch dates</span>
            </div>
          </div>
        </div>
      </div>
    </Card>;
}
