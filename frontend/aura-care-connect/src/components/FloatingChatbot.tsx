import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Speech-to-Text (STT) using Web Speech API ──
  const toggleListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Auto-send after voice input
      handleSend(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // ── Text-to-Speech (TTS) using Web Speech API ──
  const speak = useCallback((text: string) => {
    if (!ttsEnabled) return;
    // Strip markdown-ish symbols for cleaner speech
    const clean = text.replace(/[#*_`\-•]/g, "").replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

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
      const aiMsg = response.response;
      setMessages([...newMessages, { role: "assistant", content: aiMsg }]);
      speak(aiMsg);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Could not reach AI backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-[9999] w-14 h-14 rounded-full bg-[#e35d3d] text-white shadow-xl shadow-[#e35d3d]/20 flex items-center justify-center border-4 border-[#120f0e]"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 right-8 z-[9999] w-[420px] h-[600px] bg-[#120f0e] border border-[#332a28] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#25201e] bg-[#191513]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border border-[#e35d3d]/30 flex items-center justify-center bg-[#e35d3d]/5">
                  <Sparkles className="w-4 h-4 text-[#e35d3d]" />
                </div>
                <div>
                  <p className="text-xs font-bold font-mono tracking-widest text-[#e8e4e3]">AURA-M | COPILOT</p>
                  <p className="text-[9px] font-mono text-[#615754] uppercase tracking-widest mt-0.5">Neural Diagnostic Sync • ACTIVE</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="w-8 h-8 flex items-center justify-center text-[#615754] hover:text-[#e8e4e3] transition-colors"
                  title={ttsEnabled ? "Mute voice" : "Enable voice"}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setIsOpen(false); window.speechSynthesis.cancel(); }}
                  className="w-8 h-8 flex items-center justify-center text-[#615754] hover:text-[#e8e4e3] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#120f0e]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-[#615754]">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-6">Awaiting system query</p>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                    {["Beds status?", "ER Wait trend", "Low stock meds", "Staffing sync"].map(q => (
                      <button 
                        key={q} 
                        onClick={() => handleSend(q)} 
                        className="p-3 text-[10px] font-mono uppercase text-[#e8e4e3]/60 bg-[#191513] border border-[#25201e] hover:border-[#e35d3d]/50 hover:text-[#e8e4e3] transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap border ${
                    msg.role === "user"
                      ? "bg-[#e35d3d]/10 text-[#e8e4e3] border-[#e35d3d]/30"
                      : "bg-[#191513] text-[#938b88] border-[#25201e]"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#191513] border border-[#25201e] px-4 py-3 flex items-center gap-3 text-[10px] font-mono text-[#615754] uppercase tracking-widest">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e35d3d]" /> Analyzing telemetry...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-[#25201e] bg-[#191513] flex items-center gap-3">
              <button
                onClick={toggleListening}
                className={`w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0 border ${
                  isListening
                    ? "bg-[#f03a3a]/20 border-[#f03a3a] text-[#f03a3a] animate-pulse"
                    : "border-[#25201e] text-[#615754] hover:text-[#e8e4e3] hover:bg-[#120f0e]"
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={isListening ? "SAMPLING AUDIO..." : "QUERY SYSTEM..."}
                className="flex-1 h-10 px-4 bg-[#120f0e] border border-[#25201e] text-[13px] text-[#e8e4e3] placeholder:text-[#615754] font-mono focus:outline-none focus:border-[#e35d3d]/50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-[#e35d3d] text-white flex items-center justify-center hover:bg-[#c94a2d] transition-colors disabled:opacity-20 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
