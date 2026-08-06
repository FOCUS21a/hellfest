import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">H</span>
          </div>
          <span className="text-foreground font-bold hidden sm:inline">HELLFEST</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate("/espace-client")}
            className="text-foreground hover:text-accent transition-colors"
          >
            {t.clientSpace}
          </button>
          <button
            onClick={() => navigate("/revente")}
            className="text-foreground hover:text-accent transition-colors"
          >
            {t.resale}
          </button>
        </nav>

        {/* Language & Mobile Menu */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2 border-l border-border pl-4">
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
            <span className="text-muted-foreground">/</span>
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-border bg-secondary">
          <div className="container py-4 flex flex-col gap-4">
            <button
              onClick={() => {
                navigate("/espace-client");
                setIsMenuOpen(false);
              }}
              className="text-foreground hover:text-accent transition-colors text-left"
            >
              {t.clientSpace}
            </button>
            <button
              onClick={() => {
                navigate("/revente");
                setIsMenuOpen(false);
              }}
              className="text-foreground hover:text-accent transition-colors text-left"
            >
              {t.resale}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
