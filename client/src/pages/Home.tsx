import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";

const PENDING_PRIVATE_RESALE_KEY = "pending_private_resale_token";

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const [language, setLanguage] = useState<"fr" | "en">("fr");

  // OAuth always redirects back to "/". If the user got here after clicking
  // "Se connecter" from a private resale link, send them back to it now.
  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const pendingToken = sessionStorage.getItem(PENDING_PRIVATE_RESALE_KEY);
    if (pendingToken) {
      sessionStorage.removeItem(PENDING_PRIVATE_RESALE_KEY);
      navigate(`/revente/prive/${pendingToken}`);
    }
  }, [loading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header language={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      <Footer language={language} />
    </div>
  );
}

