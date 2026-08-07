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
      {/* Hero Banner Section */}
    <div className="relative h-96 md:h-[500px] overflow-hidden bg-black">
  {/* Image de fond */}
  <img
    src={heroBgImg}
    alt=""
    className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
  />
  {/* Overlay sombre */}
  <div className="absolute inset-0 bg-black/40" />
        
      </div>

      {/* Main{/* Content avec bordure rouge */}
<div className="relative h-full flex flex-col items-center justify-center text-center px-4">
  <div className="border-2 border-accent p-6 md:p-10 max-w-md md:max-w-lg">
    <img src={heroLogoImg} alt="Logo" className="max-w-xs sm:max-w-md md:max-w-xs w-auto" />
  </div>
</div>
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
