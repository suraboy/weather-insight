import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import { GEMINI_API_KEY } from '../constants';
import { ChatMessage } from '../types';

// Tool Definitions
const tools: FunctionDeclaration[] = [
  {
    name: 'navigate_to_page',
    description: 'Navigate to a specific page in the application.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: {
          type: Type.STRING,
          description: 'The page to navigate to. Options: "home", "search", "compare".',
          enum: ['home', 'search', 'compare']
        }
      },
      required: ['page']
    }
  },
  {
    name: 'search_weather',
    description: 'Search for the weather of a specific city.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: {
          type: Type.STRING,
          description: 'The name of the city to search for.'
        }
      },
      required: ['city']
    }
  },
  {
    name: 'compare_weather',
    description: 'Compare the weather of two cities.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cityA: {
          type: Type.STRING,
          description: 'The first city name.'
        },
        cityB: {
          type: Type.STRING,
          description: 'The second city name.'
        }
      },
      required: ['cityA', 'cityB']
    }
  }
];

const AIAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your Weather Agent. I can help you check weather, compare cities, or navigate the app. What would you like to do?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initialize Chat Session
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  useEffect(() => {
    if (GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are an intelligent agent controlling a Weather App. Your goal is to help the user by navigating the app and retrieving information. When a user asks for weather, use the tools to navigate them to the correct page. Be concise, helpful, and friendly. Do not just describe the weather if you can show it by navigating.',
          tools: [{ functionDeclarations: tools }],
        }
      });
      setChatSession(chat);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const executeFunction = async (name: string, args: any) => {
    switch (name) {
      case 'navigate_to_page':
        if (args.page === 'home') navigate('/');
        else if (args.page === 'search') navigate('/search');
        else if (args.page === 'compare') navigate('/compare');
        return `Navigated to ${args.page} page.`;

      case 'search_weather':
        navigate(`/search?q=${encodeURIComponent(args.city)}`);
        return `Performed search for ${args.city}.`;

      case 'compare_weather':
        navigate(`/compare?cityA=${encodeURIComponent(args.cityA)}&cityB=${encodeURIComponent(args.cityB)}`);
        return `Opened comparison for ${args.cityA} vs ${args.cityB}.`;

      default:
        return 'Function not found.';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let result = await chatSession.sendMessage({ message: userMsg.text });
      
      // Loop to handle function calls until the model returns a final text response
      while (result.functionCalls && result.functionCalls.length > 0) {
        const functionCalls = result.functionCalls;
        const functionResponses = [];

        for (const call of functionCalls) {
          console.log('Executing Tool:', call.name, call.args);
          const functionResult = await executeFunction(call.name, call.args);
          functionResponses.push({
             id: call.id,
             name: call.name,
             response: { result: functionResult }
          });
        }

        // Send execution results back to the model
        result = await chatSession.sendToolResponse({ functionResponses });
      }

      const modelMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: result.text || "I've processed your request."
      };
      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error("Agent Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all z-50 animate-bounce-subtle"
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[90vw] md:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200 dark:border-slate-700 font-sans">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-bold">Weather Agent</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIAgent;
