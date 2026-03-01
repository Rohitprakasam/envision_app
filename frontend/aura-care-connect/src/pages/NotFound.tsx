import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] text-[#1a1a1a] font-mono">
      <div className="text-center p-12 border border-[#e5e7eb] bg-white shadow-xl">
        <h1 className="mb-6 text-6xl font-bold tracking-tighter text-[#ef4444]">404</h1>
        <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#9ca3af] font-bold">Link Broken / Signal Lost</p>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-[#e35d3d] text-white text-[10px] uppercase tracking-widest hover:bg-[#c94a2d] transition-colors font-bold shadow-lg"
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
