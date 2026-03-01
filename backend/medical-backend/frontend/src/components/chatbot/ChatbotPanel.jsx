import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Send, Bot, Sparkles, Mic } from "lucide-react"
import api from "../../lib/api"

export default function ChatbotPanel({ onClose }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [listening, setListening] = useState(false)
    const scrollRef = useRef(null)
    const recognitionRef = useRef(null)

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex
                const text = event.results[current][0].transcript
                setInput(text)
            }

            recognitionRef.current.onend = () => {
                setListening(false)
            }
        }
    }, [])

    const toggleListen = () => {
        if (!recognitionRef.current) return alert("Speech recognition not supported")
        if (listening) {
            recognitionRef.current.stop()
            setListening(false)
        } else {
            setInput("")
            recognitionRef.current.start()
            setListening(true)
        }
    }

    useEffect(() => {
        api.get("/api/chatbot/proactive-alert").then(r => {
            if (r.data.has_alert) {
                setMessages([{ role: "assistant", content: `⚡ **Proactive Alert**\n\n${r.data.message}` }])
            } else {
                setMessages([{ role: "assistant", content: "I'm your **Gemini 2.0 AOAI Agent**. I see live operational data. How can I assist you today?" }])
            }
        }).catch(() => {
            setMessages([{ role: "assistant", content: "AOAI System standing by." }])
        })
    }, [])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [messages])

    const send = async () => {
        if (!input.trim() || loading) return
        const userMsg = { role: "user", content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)
        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }))
            const res = await api.post("/api/chatbot/message", {
                message: input,
                conversation_history: history
            })
            setMessages(prev => [...prev, { role: "assistant", content: res.data.response }])
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }])
        } finally { setLoading(false) }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 z-50 flex flex-col shadow-2xl"
            style={{ background: "var(--bg-surface)", borderLeft: "1px solid var(--border)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center border"
                        style={{ background: "var(--bg-elevated)", borderColor: "var(--border-active)" }}>
                        <Sparkles size={16} style={{ color: "var(--accent)" }} />
                    </div>
                    <div>
                        <div className="text-sm font-serif font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>AOAI Copilot</div>
                        <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "var(--accent)" }}>Gemini 2.0 Flash</div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        {msg.role === "assistant" && (
                            <div className="w-7 h-7 rounded-sm flex-shrink-0 flex items-center justify-center border mt-1"
                                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                                <Bot size={14} style={{ color: "var(--accent)" }} />
                            </div>
                        )}
                        <div className={`max-w-[85%] px-4 py-3 text-xs leading-relaxed font-mono ${msg.role === "user" ? "rounded-l-md rounded-tr-md" : "rounded-r-md rounded-tl-md border"}`}
                            style={{
                                background: msg.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
                                color: msg.role === "user" ? "#030d12" : "var(--text-primary)",
                                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                                fontSize: "11px"
                            }}
                            dangerouslySetInnerHTML={{
                                __html: msg.content
                                    .replace(/\*\*(.*?)\*\*/g, msg.role === "user" ? '<strong>$1</strong>' : '<strong style="color:var(--accent)">$1</strong>')
                                    .replace(/\n/g, '<br/>')
                            }}
                        />
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-sm flex-shrink-0 flex items-center justify-center border mt-1" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                            <Bot size={14} style={{ color: "var(--accent)" }} />
                        </div>
                        <div className="flex gap-1.5 px-4 py-3 rounded-md border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="flex gap-2">
                    <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        placeholder="Query hospital network..."
                        className="flex-1 px-4 py-3 rounded-sm text-xs font-mono outline-none border transition-colors focus:border-accent"
                        style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    />
                    <button onClick={toggleListen}
                        className={`w-12 rounded-sm flex items-center justify-center transition-all ${listening ? 'animate-pulse' : ''}`}
                        style={{ background: listening ? "var(--critical)" : "var(--bg-elevated)", color: listening ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)" }}>
                        <Mic size={16} />
                    </button>
                    <button onClick={send} disabled={loading || !input.trim()}
                        className="w-12 rounded-sm flex items-center justify-center transition-all disabled:opacity-50"
                        style={{ background: input.trim() ? "var(--accent)" : "var(--bg-elevated)", color: input.trim() ? "#030d12" : "var(--text-muted)" }}>
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
