import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface HeaderProps {
  language: "fr" | "en";
  onLanguageChange: (lang: "fr" | "en") => void;
}

// Small carved-stone rune mark, standing in for the festival's cross-shaped
// wordmark glyph — kept as an inline SVG so it stays crisp at any size and
// needs no image asset.
function RuneMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M6 2v22M20 2v22M2 8h8M16 8h8M2 18h8M16 18h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const t = {
    fr: { home: "Home", clientSpace: "Espace Client", resale: "Revente de billets", tickets: "Billets" },
    en: { home: "Home", clientSpace: "Client Space", resale: "Ticket Resale", tickets: "Tickets" },
  }[language];

  // Lock page scroll while the panel is open, and let Escape close it.
  useEffect(() => {
    if (!isMenuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const go = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const links: Array<{ label: string; path: string }> = [
    { label: t.home, path: "/" },
    { label: t.tickets, path: "/billets" },
    { label: t.clientSpace, path: "/espace-client" },
    { label: t.resale, path: "/revente" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => navigate("/")}
            aria-label="Hellfest — accueil"
            className="text-foreground hover:text-accent transition-colors"
          >
            <RuneMark />
          </button>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-xs tracking-widest">
              <button
                onClick={() => onLanguageChange("fr")}
                aria-current={language === "fr"}
                className={`transition-colors ${language === "fr" ? "text-accent" : "text-foreground/50 hover:text-foreground"}`}
              >
                FR
              </button>
              <span className="text-foreground/30">|</span>
              <button
                onClick={() => onLanguageChange("en")}
                aria-current={language === "en"}
                className={`transition-colors ${language === "en" ? "text-accent" : "text-foreground/50 hover:text-foreground"}`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={isMenuOpen}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              <div className="w-3.5 flex flex-col gap-[3px]">
                <span className="block h-[2px] bg-current" />
                <span className="block h-[2px] bg-current" />
                <span className="block h-[2px] bg-current w-2/3" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in panel, bordered in the brand red, listing the site's sections. */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <nav
          className={`absolute top-0 right-0 h-full w-[85vw] max-w-sm bg-background border-l-2 border-accent
            flex flex-col justify-center gap-2 px-10 transition-transform duration-300 ease-out
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fermer le menu"
            className="absolute top-6 right-8 w-9 h-9 flex items-center justify-center rounded-full bg-accent text-accent-foreground"
          >
            <span className="relative block w-3.5 h-3.5">
              <span className="absolute inset-0 top-1/2 h-[2px] bg-current rotate-45" />
              <span className="absolute inset-0 top-1/2 h-[2px] bg-current -rotate-45" />
            </span>
          </button>

          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => go(link.path)}
              className="text-left text-accent text-2xl font-display tracking-wide uppercase py-2 hover:translate-x-1 transition-transform"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
