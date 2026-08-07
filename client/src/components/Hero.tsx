import heroBgImg from "@/assets/banner.png";
import heroLogoImg from "@/assets/logo-hero.png";
import { useLocation } from "wouter";

interface HeroProps {
  language: "fr" | "en";
}

export default function Hero({ language }: HeroProps) {
  const [, navigate] = useLocation();

  const translations = {
    fr: {
      title: "HELLFEST 2027",
      subtitle: "DU 17 AU 20 JUIN",
      status: "SOLD OUT",
      menuHome: "HOME",
      menuClient: "ESPACE CLIENT",
      menuResale: "REVENTE DE BILLETS",
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
      menuHome: "HOME",
      menuClient: "CLIENT SPACE",
      menuResale: "TICKET RESALE",
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
      {/* Hero Banner Section - image de fond + logo uniquement */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-black">
        {/* Image de fond */}
        <img
          src={heroBgImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay sombre léger */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Logo au centre (taille réduite) */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <img src={heroLogoImg} alt="Logo" className="max-w-[200px] sm:max-w-[280px] md:max-w-[380px] w-auto" />
        </div>
      </div>

      {/* Barre rouge de séparation */}
      <div className="h-1 bg-accent" />

      {/* Texte HELLFEST 2027 en dessous de la barre rouge */}
      <div className="bg-black py-8 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-accent tracking-wider">
          {t.title}
        </h1>
        <p className="text-base md:text-lg text-accent/80 tracking-widest mt-2">
          {t.subtitle}
        </p>
        <div className="inline-block border-2 border-accent px-6 py-2 mt-3">
          <span className="text-accent font-black text-lg tracking-wider">
            {t.status}
          </span>
        </div>
      </div>

      {/* Menu de navigation style screenshot (à droite en rouge) */}
      <div className="bg-black border-t border-accent/30 py-4">
        <div className="container max-w-3xl flex flex-col md:flex-row items-center gap-4 md:justify-end">
          <button
            onClick={() => navigate("/")}
            className="text-accent font-bold text-sm tracking-wider hover:text-accent/70 transition-colors"
          >
            {t.menuHome}
          </button>
          <span className="hidden md:block text-accent/40">/</span>
          <button
            onClick={() => navigate("/espace-client")}
            className="text-accent font-bold text-sm tracking-wider hover:text-accent/70 transition-colors"
          >
            {t.menuClient}
          </button>
          <span className="hidden md:block text-accent/40">/</span>
          <button
            onClick={() => navigate("/revente")}
            className="text-accent font-bold text-sm tracking-wider hover:text-accent/70 transition-colors"
          >
            {t.menuResale}
          </button>
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