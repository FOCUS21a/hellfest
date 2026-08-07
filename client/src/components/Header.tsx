import { useState } from "react";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import logoImg from "@/assets/logo.png";

interface HeaderProps {
  language: "fr" | "en";
  onLanguageChange: (lang: "fr" | "en") => void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const translations = {
    fr: {
      clientSpace: "Espace Client",
      resale: "Revente de billets",
    },
    en: {
      clientSpace: "Client Space",
      resale: "Ticket Resale",
    },
  };

  const t = translations[language];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b-2 border-b-accent">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={logoImg} alt="Logo" className="h-10 md:h-12 w-auto" />
        </button>

        {/* Language, HOME & Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* HOME - à côté de FR/EN */}
          <button
            onClick={() => navigate("/")}
            className="text-accent font-bold text-sm tracking-wider hover:text-accent/70 transition-colors"
          >
            HOME
          </button>

          {/* Language Toggle */}
          <div className="flex gap-2 border-l border-accent pl-4">
            <button
              onClick={() => onLanguageChange("fr")}
              className={`text-sm font-medium transition-colors ${
                language === "fr"
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FR
            </button>
            <span className="text-accent">/</span>
            <button
              onClick={() => onLanguageChange("en")}
              className={`text-sm font-medium transition-colors ${
                language === "en"
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
          </div>

          {/* Menu Hamburger ☰ en rouge */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu déroulant - HOME + Espace Client + Revente */}
      {isMenuOpen && (
        <nav className="border-t border-accent bg-secondary">
          <div className="container py-4 flex flex-col gap-4">
            <button
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
              className="text-accent font-bold text-sm tracking-wider hover:text-accent/70 transition-colors text-left"
            >
              HOME
            </button>
            <button
              onClick={() => {
                navigate("/espace-client");
                setIsMenuOpen(false);
              }}
              className="text-accent font-bold text-sm tracking-wider hover:text-accent/70 transition-colors text-left"
            >
              {t.clientSpace}
            </button>
            <button
              onClick={() => {
                navigate("/revente");
                setIsMenuOpen(false);
              }}
              className="text-accent font-bold text-sm tracking-wider hover:text-accent/70 transition-colors text-left"
            >
              {t.resale}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}