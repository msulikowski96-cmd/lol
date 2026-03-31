import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Promo from "@/pages/promo";
import LiveGame from "@/pages/live";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import About from "@/pages/about";
import Champion from "@/pages/champion";
import Footer from "@/components/Footer";
import { setDDVersion } from "@/lib/constants";

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
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/promo" component={Promo} />
      <Route path="/profile/:region/:gameName/:tagLine" component={Profile} />
      <Route path="/champion/:region/:gameName/:tagLine/:championName" component={Champion} />
      <Route path="/live/:region/:gameName/:tagLine" component={LiveGame} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
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
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
