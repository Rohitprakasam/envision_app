import { useState, useRef, useEffect } from "react"
import { View, ShieldCheck, VideoOff } from "lucide-react"

export default function Vision() {
    const [active, setActive] = useState(false)
    const [events, setEvents] = useState([])
    const videoRef = useRef(null)

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setActive(true)
                logEvent("Monitor started", "var(--success)")
            }
        } catch (e) {
            logEvent("Camera access denied", "var(--critical)")
        }
    }

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop())
            videoRef.current.srcObject = null
            setActive(false)
            logEvent("Monitor stopped", "var(--text-muted)")
        }
    }

    const mockDetect = (type) => {
        if (!active) return
        if (type === 'fall') logEvent("Patient Fall Detected! (Ward B, Bed 12)", "var(--critical)")
        if (type === 'hand') logEvent("Assistance Requested (Ward A, Bed 4)", "var(--warning)")
        if (type === 'missing') {
            const photoUrl = captureSnapshot()
            logEvent("ALERT: Patient Wandered Off-Ward! (John Doe, Ward C)", "var(--critical)", photoUrl)
        }
    }

    const captureSnapshot = () => {
        if (!videoRef.current) return null
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth || 640
        canvas.height = videoRef.current.videoHeight || 480
        const ctx = canvas.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', 0.8)
    }

    const logEvent = (msg, color, image = null) => {
        setEvents(prev => [{ time: new Date().toLocaleTimeString(), msg, color, image }, ...prev].slice(0, 10))
    }

    useEffect(() => {
        return () => stopCamera()
    }, [])

    return (
        <div className="space-y-6 animate-fade-in relative z-10 max-w-6xl mx-auto p-4 flex flex-col h-full">
            <div>
                <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    <View className="inline mr-2 text-accent" />
                    Computer Vision Edge Monitor
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Privacy-preserving client-side pose detection. Zero video data leaving device.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                <div className="md:col-span-2 rounded-md overflow-hidden relative" style={{ background: "#000", border: "1px solid var(--border)" }}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {!active && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary opacity-50">
                            <VideoOff size={48} className="mb-4" />
                            <div className="text-xs font-mono uppercase tracking-widest">Feed Offline</div>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 flex gap-2">
                        {!active ? (
                            <button onClick={startCamera} className="bg-accent text-black px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity">
                                Start Monitor
                            </button>
                        ) : (
                            <button onClick={stopCamera} className="bg-red-500 text-white px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-red-600 transition-opacity">
                                Stop Monitor
                            </button>
                        )}
                    </div>

                    {active && (
                        <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                            <button onClick={() => mockDetect('fall')} className="bg-black/50 border border-critical text-critical px-3 py-1 font-mono text-[10px] uppercase backdrop-blur-md rounded-sm hover:bg-critical/20 transition-all">
                                Simulate Fall
                            </button>
                            <button onClick={() => mockDetect('hand')} className="bg-black/50 border border-warning text-warning px-3 py-1 font-mono text-[10px] uppercase backdrop-blur-md rounded-sm hover:bg-warning/20 transition-all">
                                Simulate Hand Raise
                            </button>
                            <button onClick={() => mockDetect('missing')} className="bg-black/50 border border-critical text-critical px-3 py-1 font-mono text-[10px] uppercase backdrop-blur-md rounded-sm hover:bg-critical/20 transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                Simulate Missing Patient
                            </button>
                        </div>
                    )}
                </div>

                <div className="rounded-md p-5 flex flex-col" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <ShieldCheck size={16} style={{ color: "var(--accent)" }} />
                        Detection Logs
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {events.length === 0 ? (
                            <div className="text-center opacity-40 mt-10">
                                <p className="text-xs font-mono">No events recorded.</p>
                            </div>
                        ) : (
                            events.map((e, i) => (
                                <div key={i} className="p-2 border-l-2 text-xs" style={{ background: "var(--bg-elevated)", borderLeftColor: e.color }}>
                                    <span className="opacity-50 font-mono text-[10px] mr-2 block mb-1">{e.time}</span>
                                    <span style={{ color: e.color }} className="block mb-2 font-medium">{e.msg}</span>
                                    {e.image && (
                                        <div className="mt-2 rounded overflow-hidden border border-red-500/30">
                                            <div className="text-[9px] font-mono text-red-400 bg-red-950/50 px-2 py-1 uppercase tracking-widest border-b border-red-500/30 flex justify-between">
                                                <span>Security Camera Capture</span>
                                                <span>ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                            </div>
                                            <img src={e.image} alt="Security Capture" className="w-full h-auto opacity-90" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
