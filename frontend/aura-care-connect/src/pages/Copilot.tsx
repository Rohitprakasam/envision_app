import { motion } from "framer-motion";
import { MessageSquare, Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { useProactiveAlert } from "@/hooks/useQueries";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Copilot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: proactive } = useProactiveAlert();
  const [showInsight, setShowInsight] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));
      const response = await api.sendChatbotMessage(msg, history);
      setMessages([...newMessages, { role: "assistant", content: response.response }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Could not reach AI backend. Please ensure the server is running on port 8000." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const proactiveMessage = proactive?.has_alert ? proactive.message : null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Intelligence Copilot Terminal</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Direct Hospital Intelligence Link • ENCRYPTED ACTIVE</p>
      </div>

      {/* Proactive Insight from real API */}
      {showInsight && proactiveMessage && (
        <motion.div variants={item} className="clinical-card border-l-4 border-l-[#e35d3d] p-4 flex items-center gap-4 bg-[#e35d3d]/5">
          <Sparkles className="w-4 h-4 text-[#e35d3d] flex-shrink-0" />
          <p className="text-[11px] font-mono text-[#1a1a1a] flex-1 uppercase tracking-tight font-bold">{proactiveMessage}</p>
          <button onClick={() => setShowInsight(false)} className="text-[#9ca3af] hover:text-[#1a1a1a] font-mono text-xs font-bold">DISMISS</button>
        </motion.div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 clinical-card p-6 overflow-y-auto space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#9ca3af]">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-10 text-center font-bold">System initialized. Awaiting diagnostic query.</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-[480px]">
              {["Free bed count?", "Current ER wait trend", "Sector staffing levels", "Stock depletion report"].map(q => (
                <button 
                  key={q} 
                  onClick={() => handleSend(q)} 
                  className="p-4 text-[10px] font-mono uppercase text-[#6b7280] bg-[#f9fafb] border border-[#e5e7eb] hover:border-[#e35d3d]/50 hover:text-[#1a1a1a] transition-colors text-left font-bold"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-5 py-4 text-[13px] leading-relaxed whitespace-pre-wrap border font-bold ${
              msg.role === "user" 
                ? "bg-[#e35d3d]/5 text-[#e35d3d] border-[#e35d3d]/20" 
                : "bg-[#f9fafb] text-[#1a1a1a] border-[#e5e7eb]"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#f9fafb] border border-[#e5e7eb] px-5 py-4 flex items-center gap-4 text-[11px] font-mono text-[#9ca3af] uppercase tracking-widest font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-[#e35d3d]" /> Analyzing clinical telemetry...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <motion.div variants={item} className="flex items-center gap-3 bg-[#f9fafb] p-1 border border-[#e5e7eb]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="QUERY HOSPITAL INTELLIGENCE..."
          className="flex-1 h-12 px-5 bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] font-mono focus:outline-none font-bold"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="w-12 h-12 bg-[#e35d3d] text-white flex items-center justify-center hover:bg-[#c94a2d] transition-colors disabled:opacity-20"
        >
          <Send className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}
