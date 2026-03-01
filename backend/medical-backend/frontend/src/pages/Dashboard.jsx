import HealthScore from "../components/dashboard/HealthScore"
import KPICards from "../components/dashboard/KPICards"
import ERTrendChart from "../components/dashboard/ERTrendChart"
import BedSummaryChart from "../components/dashboard/BedSummaryChart"
import AlertFeed from "../components/dashboard/AlertFeed"

export default function Dashboard() {
    return (
        <div className="space-y-6 animate-fade-in relative z-10 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                        Command Center
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Real-time hospital operations overview.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Action buttons could go here */}
                </div>
            </div>

            {/* Top row: Health Score & KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 border border-x-0 border-y-0 relative">
                    <HealthScore />
                </div>
                <div className="lg:col-span-3">
                    <KPICards />
                </div>
            </div>

            {/* Middle row: ER Trend & Bed summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ERTrendChart />
                </div>
                <div className="lg:col-span-1">
                    <BedSummaryChart />
                </div>
            </div>

            {/* Bottom row: Alerts */}
            <div className="grid grid-cols-1 gap-6">
                <AlertFeed limit={5} />
            </div>
        </div>
    )
}
