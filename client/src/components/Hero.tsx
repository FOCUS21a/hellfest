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
      {/* Hero Banner Section - image zoomée + logo */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-black">
        {/* Image de fond avec zoom léger */}
        <img
          src={heroBgImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-110"
        />
        {/* Overlay sombre léger */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Logo au centre */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <img src={heroLogoImg} alt="Logo" className="max-w-[300px] sm:max-w-[400px] md:max-w-[500px] w-auto" />
        </div>
      </div>

      {/* Barre rouge épaisse après la bannière */}
      <div className="h-1 bg-accent" />

      {/* Texte HELLFEST 2027 en blanc */}
      <div className="bg-black py-8 text-center pb-10">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-wider">
          {t.title}
        </h1>
        <p className="text-base md:text-lg text-white/80 tracking-widest mt-2">
          {t.subtitle}
        </p>
        <div className="inline-block border border-white/50 px-5 py-1.5 mt-3">
          <span className="text-white font-bold text-sm tracking-wider">
            {t.status}
          </span>
        </div>
      </div>

      {/* Barre fine/légère en bas du bloc HELLFEST */}
      <div className="h-px bg-accent/30" />

      {/* Texte (sans séparation entre les paragraphes) */}
      <div className="container py-12 md:py-16 max-w-3xl">
        {/* Description */}
        <p className="text-foreground text-lg leading-relaxed mb-8">
          {t.description}
        </p>

        {/* Client Space */}
        <p className="text-foreground mb-4">
          <span>{t.ticketHolders} </span>
          <a href="#" className="text-accent hover:text-accent/80 transition-colors font-semibold">
            {t.clientSpace}
          </a>
          <span> {language === "fr" ? "et effectuer les actions suivantes :" : "and perform the following actions:"}</span>
        </p>
        <ul className="space-y-3 ml-4 mb-8">
          {t.actions.map((action, idx) => (
            <li key={idx} className="text-foreground/80 flex items-start gap-3">
              <span className="text-accent font-bold mt-1">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>

        {/* Resale */}
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
  );
}