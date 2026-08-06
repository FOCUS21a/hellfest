import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ClientSpace from "./pages/ClientSpace";
import Resale from "./pages/Resale";
import Billets from "./pages/Billets";
import PrivateResale from "./pages/PrivateResale";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminPayouts from "./pages/AdminPayouts";
import { useState } from "react";

function Router({ language, onLanguageChange }: { language: "fr" | "en"; onLanguageChange: (lang: "fr" | "en") => void }) {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={() => <Home />} />
      <Route path={"/espace-client"} component={() => <ClientSpace language={language} />} />
      <Route path={"/revente"} component={() => <Resale language={language} />} />
      <Route path={"/revente/prive/:token"} component={() => <PrivateResale language={language} />} />
      <Route path={"/billets"} component={() => <Billets language={language} />} />
      <Route path={"/success"} component={() => <PaymentSuccess language={language} />} />
      <Route path={"/admin/paiements"} component={() => <AdminPayouts />} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router language={language} onLanguageChange={setLanguage} />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
