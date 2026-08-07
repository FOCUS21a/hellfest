   import heroLogoImg from "@/assets/logo-hero.png";
interface HeroProps {
  language: "fr" | "en";
}

export default function Hero({ language }: HeroProps) {
  const translations = {
    fr: {
      title: "HELLFEST 2027",
      subtitle: "DU 17 AU 20 JUIN",
      status: "SOLD OUT",
      description:
        "Les pass 4 jours pour le festival sont épuisés. Rendez-vous début 2027 pour la vente des pass 1 jour.",
      ticketHolders: "Pour les détenteurs d'un billet Hellfest 2027, vous pouvez accéder à votre",
      clientSpace: "Espace Client",
      actions: [
        "Modifier votre commande",
        "Activer votre option de remboursement de billet",
        "Revendre vos billets",
      ],
      resaleInfo: "Si vous souhaitez racheter des tickets sur la plateforme de revente officielle, rendez-vous sur",
      resale: "Revente de billets",
      resaleDate: "Il sera possible de racheter des billets dès le 8 juillet à 13h.",
    },
    en: {
      title: "HELLFEST 2027",
      subtitle: "FROM JUNE 17-20",
      status: "SOLD OUT",
      description:
        "The 4-day festival passes are sold out. See you in early 2027 for single-day pass sales.",
      ticketHolders: "For Hellfest 2027 ticket holders, you can access your",
      clientSpace: "Client Space",
      actions: [
        "Modify your order",
        "Activate your ticket refund option",
        "Resell your tickets",
      ],
      resaleInfo: "If you want to buy tickets on the official resale platform, go to",
      resale: "Ticket Resale",
      resaleDate: "It will be possible to buy tickets from July 8 at 1 PM.",
    },
  };

  const t = translations[language];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-secondary via-background to-background">
      {/* Hero Banner Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-black">
        {/* Textured background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlUGVybGluTm9pc2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjIiIC8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-30" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <img src={heroLogoImg} alt="Logo" className="max-w-xs sm:max-w-md md:max-w-2xl w-auto" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 md:py-20 max-w-3xl">
        {/* Status Message */}
        <div className="mb-12 pb-8 border-b border-border">
          <p className="text-foreground text-lg leading-relaxed mb-6">
            {t.description}
          </p>
        </div>

        {/* Client Space Section */}
        <div className="mb-12 pb-8 border-b border-border">
          <p className="text-foreground mb-4">
            <span>{t.ticketHolders} </span>
            <a href="#" className="text-accent hover:text-accent/80 transition-colors font-semibold">
              {t.clientSpace}
            </a>
            <span> {language === "fr" ? "et effectuer les actions suivantes :" : "and perform the following actions:"}</span>
          </p>
          <ul className="space-y-3 ml-4">
            {t.actions.map((action, idx) => (
              <li key={idx} className="text-foreground/80 flex items-start gap-3">
                <span className="text-accent font-bold mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Resale Section */}
        <div>
          <p className="text-foreground mb-4">
            <span>{t.resaleInfo} </span>
            <a href="#" className="text-accent hover:text-accent/80 transition-colors font-semibold">
              {t.resale}
            </a>
            <span>.</span>
          </p>
          <p className="text-foreground/80 text-sm">{t.resaleDate}</p>
        </div>
      </div>
    </div>
  );
}
