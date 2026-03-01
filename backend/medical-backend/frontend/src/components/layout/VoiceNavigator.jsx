import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Mic, Navigation, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function VoiceNavigator() {
    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [actionMsg, setActionMsg] = useState("")
    const [showOverlay, setShowOverlay] = useState(false)
    const navigate = useNavigate()
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
                setTranscript(text)

                if (event.results[current].isFinal) {
                    processCommand(text)
                }
            }

            recognitionRef.current.onend = () => {
                setListening(false)
                setTimeout(() => {
                    setShowOverlay(false)
                    setTranscript("")
                    setActionMsg("")
                }, 4000)
            }
        }
    }, [navigate])

    const processCommand = (text) => {
        const lower = text.toLowerCase()
        let route = null
        let msg = ""

        if (lower.includes("dashboard") || lower.includes("home") || lower.includes("command center")) {
            route = "/dashboard"
            msg = "Navigating to Command Center"
        } else if (lower.includes("predict") || lower.includes("forecast") || lower.includes("future")) {
            route = "/predictions"
            msg = "Navigating to Predictive Intelligence"
        } else if (lower.includes("simulat") || lower.includes("what if") || lower.includes("scenario")) {
            route = "/simulator"
            msg = "Navigating to What-If Simulator"
        } else if (lower.includes("vision") || lower.includes("camera") || lower.includes("monitor")) {
            route = "/vision"
            msg = "Navigating to CV Edge Monitor"
        } else if (lower.includes("alert") || lower.includes("warning") || lower.includes("notification")) {
            route = "/alerts"
            msg = "Navigating to Alert Center"
        } else {
            msg = "Command not recognized for navigation. Try opening the Chatbot."
        }

        setActionMsg(msg)
        if (route) {
            navigate(route)
            // Optional: Speak the action
            const synth = window.speechSynthesis
            const utterance = new SpeechSynthesisUtterance(msg)
            synth.speak(utterance)
        }
    }

    const toggleListen = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.")
            return
        }

        if (listening) {
            recognitionRef.current.stop()
            setListening(false)
        } else {
            setTranscript("")
            setActionMsg("")
            setShowOverlay(true)
            recognitionRef.current.start()
            setListening(true)
        }
    }

    return (
        <>
            <button
                onClick={toggleListen}
                className={`fixed top-6 right-6 w-10 h-10 rounded-sm shadow-xl flex items-center justify-center transition-all z-50 ${listening ? 'animate-pulse' : ''}`}
                style={{
                    background: listening ? "var(--critical)" : "var(--bg-elevated)",
                    color: listening ? "#fff" : "var(--accent)",
                    border: "1px solid var(--border)"
                }}
                title="AI Voice Navigator"
            >
                <Mic size={18} />
            </button>

            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
                    >
                        <div className="rounded-md p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center border"
                            style={{ background: "rgba(3, 13, 18, 0.85)", borderColor: "var(--accent)" }}>

                            <div className="flex gap-3 items-center mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(77, 200, 200, 0.1)" }}>
                                    {listening ? <Mic size={16} style={{ color: "var(--critical)" }} className="animate-pulse" /> : <Navigation size={16} style={{ color: "var(--accent)" }} />}
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                                    AOAI Voice Navigator
                                </span>
                            </div>

                            <div className="text-xl font-serif mb-2" style={{ color: "var(--text-primary)" }}>
                                {transcript ? `"${transcript}"` : "Listening for command..."}
                            </div>

                            {actionMsg && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 px-4 py-2 rounded-sm border text-sm font-mono flex items-center gap-2"
                                    style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--success)" }}>
                                    <Sparkles size={14} />
                                    {actionMsg}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
