
import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  const suggestions = [
    "What's the coverage for Product Alpha?",
    "What are the current blockers?",
    "Which markets are available?",
    "What's the TAM coverage?",
    "When is the next product launching?",
    "How do I create an escalation?"
  ];

  return (
    <div className="my-4 flex flex-wrap gap-2 justify-center">
      {suggestions.map((question, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size="sm"
          className="text-xs bg-black text-white border-gray-600 hover:bg-white hover:text-black hover:border-white hover:scale-110 hover:shadow-lg hover:shadow-white/20 transition-all duration-300 ease-out transform hover:-translate-y-1"
          onClick={() => onSelectQuestion(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
}
