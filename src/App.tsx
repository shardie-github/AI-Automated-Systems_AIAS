import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { monitoringService, initializeErrorHandling } from "@/lib/monitoring";
import { useEffect } from "react";
import Index from "./pages/Index";
import Services from "./pages/Services";
import CaseStudies from "./pages/CaseStudies";
import ROICalculator from "./pages/ROICalculator";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Platform from "./pages/Platform";
import NotFound from "./pages/NotFound";
import PrivacyCompliance from "./components/PrivacyCompliance";
import TrustBadges from "./components/TrustBadges";
import AutomationDashboard from "./components/AutomationDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize error handling
    initializeErrorHandling();
    
    // Track app initialization
    monitoringService.trackEvent('app_initialized', {
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE,
      userAgent: navigator.userAgent,
    });

    // Track page view
    monitoringService.trackPageView(window.location.pathname);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatedBackground />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/roi-calculator" element={<ROICalculator />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/platform/*" element={<Platform />} />
            <Route path="/privacy" element={<PrivacyCompliance />} />
            <Route path="/trust" element={<TrustBadges />} />
            <Route path="/automation" element={<AutomationDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
