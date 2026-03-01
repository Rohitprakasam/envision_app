import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";
import CommandCenter from "@/pages/CommandCenter";
import EMRDirectory from "@/pages/EMRDirectory";
import ERConsole from "@/pages/ERConsole";
import Pharmacy from "@/pages/Pharmacy";
import LabResults from "@/pages/LabResults";
import StaffOT from "@/pages/StaffOT";
import Predictions from "@/pages/Predictions";
import Simulator from "@/pages/Simulator";
import CVMonitor from "@/pages/CVMonitor";
import Copilot from "@/pages/Copilot";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/emr" element={<EMRDirectory />} />
            <Route path="/er-console" element={<ERConsole />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/labs" element={<LabResults />} />
            <Route path="/staff" element={<StaffOT />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/cv-monitor" element={<CVMonitor />} />
            <Route path="/copilot" element={<Copilot />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
