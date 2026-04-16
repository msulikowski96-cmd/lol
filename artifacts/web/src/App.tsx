import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";
import Home from "@/pages/home";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { setDDVersion } from "@/lib/constants";

const Profile = lazy(() => import("@/pages/profile"));
const Promo = lazy(() => import("@/pages/promo"));
const LiveGame = lazy(() => import("@/pages/live"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const About = lazy(() => import("@/pages/about"));
const Guide = lazy(() => import("@/pages/guide"));
const Champion = lazy(() => import("@/pages/champion"));
const MatchPage = lazy(() => import("@/pages/match"));
const AiAnalysis = lazy(() => import("@/pages/ai-analysis"));
const NotFound = lazy(() => import("@/pages/not-found"));

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    }
  }
});


function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Ładowanie...
        </span>
      </div>
    </div>
  );
}

function DataDragonSync() {
  useEffect(() => {
    fetch(`${BASE_URL}/api/ddragon-version`)
      .then(r => r.json())
      .then(({ version }: { version: string }) => {
        if (version) setDDVersion(version);
      })
      .catch(() => {});
  }, []);
  return null;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/promo" component={Promo} />
        <Route path="/profile/:region/:gameName/:tagLine" component={Profile} />
        <Route path="/champion/:region/:gameName/:tagLine/:championName" component={Champion} />
        <Route path="/match/:region/:gameName/:tagLine/:matchId" component={MatchPage} />
        <Route path="/ai-analysis/:region/:gameName/:tagLine" component={AiAnalysis} />
        <Route path="/live/:region/:gameName/:tagLine" component={LiveGame} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/about" component={About} />
        <Route path="/poradnik" component={Guide} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <DataDragonSync />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <Router />
            </div>
            <Footer />
          </div>
          <CookieConsent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
