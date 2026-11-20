import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ExploreKnowledge from "./pages/ExploreKnowledge";
import CareerGuidance from "./pages/CareerGuidance";
import ResearchPublications from "./pages/ResearchPublications";
import NotFound from "./pages/NotFound";
import ScrollManager from "./components/ScrollManager";
// Local-only admin: exists during `npm run dev`, left out of the live build
const SuperAdmin = import.meta.env.DEV ? lazy(() => import("./admin/SuperAdmin")) : null;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/explore-knowledge" element={<ExploreKnowledge />} />
          <Route path="/career-guidance" element={<CareerGuidance />} />
          <Route path="/research-publications" element={<ResearchPublications />} />
          {SuperAdmin && (
            <Route
              path="/super-admin/*"
              element={
                <Suspense fallback={null}>
                  <SuperAdmin />
                </Suspense>
              }
            />
          )}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
