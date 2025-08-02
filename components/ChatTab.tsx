import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import api from '../src/services/api';

interface ChatTabProps {
  projectId: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatTab({ projectId }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm ready to help you analyze your Q3 sales data. I see you've uploaded your data and provided context about the QTY and RRP columns. What would you like to explore first?",
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'user',
      content:
        'What are some good metrics to analyze based on the data I\'ve provided?',
      timestamp: new Date(),
    },
    {
      id: '3',
      role: 'assistant',
      content:
        "Based on your sales data, you could analyze several key metrics that are specific to your columns:\n\n1. **Total Revenue** (QTY × RRP)\n   - Calculate overall revenue by multiplying units sold by recommended retail price\n   - Track revenue by product, date, or region\n\n2. **Average Units per Transaction**\n   - Identify bulk purchase patterns\n   - Understand typical order sizes\n\n3. **Top Selling Products**\n   - Rank products by total units sold or revenue\n   - Identify your best performers\n\n4. **Regional Performance**\n   - Compare sales across different regions\n   - Identify geographic opportunities\n\n5. **Time-based Analysis**\n   - Daily/weekly sales trends\n   - Identify peak selling periods\n   - Month-over-month growth rates\n\nWould you like me to start with any of these analyses? I can provide specific calculations based on your july_sales.csv data.",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await api.chat.sendMessage(projectId, userMessage.content);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show error message
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col min-h-0 max-w-4xl mx-auto w-full">
      {/* Messages */}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  /* User message - right aligned bubble */
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="bg-gray-600 rounded-2xl rounded-br-md px-4 py-3">
                        <div className="text-[#ECECF1] whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI Assistant message - left aligned with avatar */
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600">
                      <Bot className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm text-gray-400">AI Assistant</div>
                      <div className="text-[#ECECF1] whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600">
                  <Bot className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm text-gray-400">AI Assistant</div>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-6 bg-[#343541]">
        {/* Chat Input Container */}
        <div className="bg-gray-600 rounded-2xl border border-gray-500 p-4">
          <div className="flex items-center space-x-3">
            {/* Plus Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-[#ECECF1] hover:bg-gray-600 h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Input Field */}
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your data..."
                className="bg-transparent border-none text-[#ECECF1] placeholder-gray-400 focus:ring-0 focus:outline-none p-0 h-auto"
                disabled={isLoading}
              />
            </div>

            {/* Send Button */}
            <div className="flex items-center">
              {input.trim() && (
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-[#ECECF1] hover:bg-gray-300 text-gray-800 h-8 w-8 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
