import Sidebar from './Sidebar'

export default function Layout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 relative z-0">{children}</main>
        </div>
    )
}
