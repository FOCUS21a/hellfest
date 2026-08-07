import heroBgImg from "@/assets/banner.png";
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
      clientSpace: "ESPACE CLIENT",
      resale: "REVENTE DE BILLETS",
      description:
        "Les pass 4 jours pour le festival sont épuisés. Rendez-vous début 2027 pour la vente des pass 1 jour.",
      ticketHolders: "Pour les détenteurs d'un billet Hellfest 2027, vous pouvez accéder à votre",
      actions: [
        "Modifier votre commande",
        "Activer votre option de remboursement de billet",
        "Revendre vos billets",
      ],
      resaleInfo: "Si vous souhaitez racheter des tickets sur la plateforme de revente officielle, rendez-vous sur",
      resaleLink: "Revente de billets",
      resaleDate: "Il sera possible de racheter des billets dès le 8 juillet à 13h.",
    },
    en: {
      title: "HELLFEST 2027",
      subtitle: "FROM JUNE 17-20",
      status: "SOLD OUT",
      clientSpace: "CLIENT SPACE",
      resale: "TICKET RESALE",
      description:
        "The 4-day festival passes are sold out. See you in early 2027 for single-day pass sales.",
      ticketHolders: "For Hellfest 2027 ticket holders, you can access your",
      actions: [
        "Modify your order",
        "Activate your ticket refund option",
        "Resell your tickets",
      ],
      resaleInfo: "If you want to buy tickets on the official resale platform, go to",
      resaleLink: "Ticket Resale",
      resaleDate: "It will be possible to buy tickets from July 8 at 1 PM.",
    },
  };

  const t = translations[language];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-secondary via-background to-background">
      {/* Hero Banner Section */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-black">
        {/* Image de fond */}
        <img
          src={heroBgImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay sombre léger */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Logo au centre de la bannière */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pb-28">
          <img src={heroLogoImg} alt="Logo" className="max-w-xs sm:max-w-md md:max-w-2xl w-auto" />
        </div>

        {/* Texte en bas de la bannière (en blanc) */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-wider drop-shadow-lg">
            {t.title}
          </h1>
          <p className="text-base md:text-lg text-white/80 tracking-widest mt-1">
            {t.subtitle}
          </p>
          <div className="inline-block border border-white/50 px-5 py-1.5 mt-3">
            <span className="text-white font-bold text-sm tracking-wider">
              {t.status}
            </span>
          </div>
        </div>
      </div>

      {/* Barre rouge de séparation */}
      <div className="h-1 bg-accent" />

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
            <a href="#" className="text-accent hover:text-accent/80 transition-colors font-semibold uppercase">
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
            <a href="#" className="text-accent hover:text-accent/80 transition-colors font-semibold uppercase">
              {t.resaleLink}
            </a>
            <span>.</span>
          </p>
          <p className="text-foreground/80 text-sm">{t.resaleDate}</p>
        </div>
      </div>
    </div>
  );
}