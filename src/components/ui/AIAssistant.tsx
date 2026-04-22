import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import { api } from "../../lib/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your ApnaPG assistant. How can I help you find the perfect PG today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await api.post("/api/ai/chat", { prompt: userMessage });
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! I hit a snag. Please check your connection or try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Toggle Button with Pulse Effect */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative group p-4 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95",
          isOpen ? "bg-zinc-800 text-white rotate-90" : "bg-indigo-600 text-white"
        )}
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20 group-hover:hidden"></span>
        )}
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window Container */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[90vw] md:w-96 h-[550px] max-h-[70vh] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-zinc-200/50 flex flex-col overflow-hidden animate-[slide-up_0.3s_ease-out]">
          
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">ApnaPG Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-white/80 font-medium">Always Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div 
            ref={scrollRef} 
            className="flex-grow p-6 overflow-y-auto space-y-6 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3 max-w-[88%] animate-[fade-in_0.3s_ease-out]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl h-8 w-8 flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === "user" ? "bg-zinc-100 text-zinc-600" : "bg-indigo-100 text-indigo-600"
                )}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200/50"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl h-8 w-8 flex items-center justify-center shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="bg-zinc-100 p-4 rounded-2xl rounded-tl-none border border-zinc-200/50">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modern Input Area */}
          <div className="p-5 bg-zinc-50/50 border-t border-zinc-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about PGs, locations, rules..."
                className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 pr-14 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:border-zinc-300"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 text-center mt-3 font-medium uppercase tracking-widest">
              Powered by ApnaPG AI & Gemini
            </p>
          </div>
        </div>
      )}

      {/* Tailwind Custom Keyframes (can also be in layout.css if better) */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
