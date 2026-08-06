import { Facebook, Instagram, Youtube, MessageCircle, Twitch } from "lucide-react";

interface FooterProps {
  language: "fr" | "en";
}

export default function Footer({ language }: FooterProps) {
  const translations = {
    fr: {
      copyright: "© 2026",
      hellfestProductions: "Hellfest Productions",
      ticketing: "Billetterie Weezevent",
    },
    en: {
      copyright: "© 2026",
      hellfestProductions: "Hellfest Productions",
      ticketing: "Weezevent Ticketing",
    },
  };

  const t = translations[language];

  const socialLinks = [
    { icon: MessageCircle, label: "Forum", href: "https://forum.hellfest.fr/" },
    { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/hellfest" },
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/hellfestopenair/" },
    { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/c/HellfestOfficial" },
    { icon: Twitch, label: "Twitch", href: "https://www.twitch.tv/hellfestopenair" },
  ];

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container py-12 md:py-16">
        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-12">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded hover:bg-border transition-colors text-foreground hover:text-accent"
                aria-label={social.label}
              >
                <Icon className="w-6 h-6" />
              </a>
            );
          })}
        </div>

        {/* Links */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8 pb-8 border-b border-border">
          <a
            href="https://hellfest.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-accent transition-colors text-sm"
          >
            {t.hellfestProductions}
          </a>
          <a
            href="https://weezevent.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-accent transition-colors text-sm"
          >
            {t.ticketing}
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-muted-foreground text-sm">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
}
