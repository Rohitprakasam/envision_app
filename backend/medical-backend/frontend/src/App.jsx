import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"
import Predictions from "./pages/Predictions"
import Simulator from "./pages/Simulator"
import Vision from "./pages/Vision"
import Alerts from "./pages/Alerts"
import Patients from "./pages/Patients"
import ERConsole from "./pages/ERConsole"
import Pharmacy from "./pages/Pharmacy"
import Labs from "./pages/Labs"
import Staff from "./pages/Staff"
import ChatbotPanel from "./components/chatbot/ChatbotPanel"
import VoiceNavigator from "./components/layout/VoiceNavigator"
import { useState } from "react"
import { Bot } from "lucide-react"

export default function App() {
    const [chatOpen, setChatOpen] = useState(false)

    return (
        <BrowserRouter>
            <VoiceNavigator />
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/predictions" element={<Predictions />} />
                    <Route path="/simulator" element={<Simulator />} />
                    <Route path="/vision" element={<Vision />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/er-console" element={<ERConsole />} />
                    <Route path="/pharmacy" element={<Pharmacy />} />
                    <Route path="/labs" element={<Labs />} />
                    <Route path="/staff" element={<Staff />} />
                </Routes>
            </Layout>

            {/* Floating Chatbot Button */}
            <button
                onClick={() => setChatOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
                style={{ background: "var(--accent)", color: "#030d12" }}>
                <Bot size={24} />
            </button>

            {/* Chatbot Panel */}
            {chatOpen && <ChatbotPanel onClose={() => setChatOpen(false)} />}
        </BrowserRouter>
    )
}
