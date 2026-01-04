import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import PropertyForm from "./pages/PropertyForm";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Compare from "./pages/Compare";
import MapDiscovery from "./pages/MapDiscovery";
import PriceChecker from "./pages/PriceChecker";
import NotFound from "./pages/NotFound";
import VirtualAssistant from "./components/assistant/VirtualAssistant";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/new" element={<PropertyForm />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/properties/:id/edit" element={<PropertyForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/map" element={<MapDiscovery />} />
              <Route path="/price-checker" element={<PriceChecker />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <VirtualAssistant />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
