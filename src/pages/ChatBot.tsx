
import { SplineSceneBasic } from "@/components/ui/demo";

export default function ChatBot() {
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="p-4 border-b bg-black border-gray-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-white">Launch Radar AI Assistant</h1>
        </div>
      </div>
      
      {/* Main Content - Integrated Chat Interface */}
      <div className="flex-1 p-4 bg-black">
        <SplineSceneBasic />
      </div>
    </div>
  );
}
