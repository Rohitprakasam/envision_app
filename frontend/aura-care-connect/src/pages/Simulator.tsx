import { motion } from "framer-motion";
import { FlaskRound, Send, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const prebuiltScenarios = [
  "20 trauma arrivals in 30 minutes",
  "Staff shortage 30% across all departments",
  "Supply chain failure — no deliveries for 48h",
  "Power outage affecting Wing B",
];

export default function Simulator() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Add user message
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Connect to the real FastAPI backend which has the live hospital context
      const response = await api.sendChatbotMessage(
        `[SIMULATE WHAT-IF SCENARIO]: ${text}`,
        messages // pass history
      );
      
      setMessages([...newMessages, { role: "ai" as const, content: response.response }]);
    } catch (error) {
      setMessages([...newMessages, { role: "ai" as const, content: "⚠️ Connection error to AI backend. Please ensure the backend server is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Scenario Simulation Engine</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Advanced Scenario Stress-Testing • REAL-TIME CTX ACTIVE</p>
      </div>

      {/* Quick Scenarios */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        {prebuiltScenarios.map(s => (
          <button
            key={s}
            onClick={() => handleSubmit(s)}
            className="flex items-center gap-2 px-4 py-3 font-mono text-[10px] uppercase bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] hover:border-[#e35d3d]/50 transition-colors font-bold"
          >
            <Zap className="w-3.5 h-3.5 text-[#e35d3d]" /> {s}
          </button>
        ))}
      </motion.div>

      {/* Chat Area */}
      <motion.div variants={item} className="clinical-card p-6 min-h-[500px] flex flex-col bg-white">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto mb-6 px-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[#9ca3af]">
              <FlaskRound className="w-10 h-10 mb-6 opacity-30" />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Awaiting scenario parameters</p>
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
                <Loader2 className="w-4 h-4 animate-spin text-[#e35d3d]" /> Synthesizing sector telemetry...
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-[#f9fafb] p-1 border border-[#e5e7eb]">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit(input)}
            placeholder="INJECT HYPOTHETICAL PARAMETERS..."
            className="flex-1 h-12 px-5 bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] font-mono focus:outline-none font-bold"
          />
          <button
            onClick={() => handleSubmit(input)}
            className="w-12 h-12 bg-[#e35d3d] text-white flex items-center justify-center hover:bg-[#c94a2d] transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
