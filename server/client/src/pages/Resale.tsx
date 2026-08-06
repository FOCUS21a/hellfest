import { ArrowLeft, Search, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface ResaleProps {
  language: "fr" | "en";
}

export default function Resale({ language }: ResaleProps) {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const translations = {
    fr: {
      title: "Revente de billets",
      subtitle: "Plateforme officielle de revente Hellfest",
      searchPlaceholder: "Rechercher des billets...",
      filter: "Filtrer",
      noTickets: "Aucun billet disponible pour le moment",
      waitlist: "Rejoindre la liste d'attente",
      buyTicket: "Acheter ce billet",
      price: "Prix",
      type: "Type de billet",
      seller: "Vendeur",
      date: "Date d'ajout",
      info: "Les billets sont vérifiés et sécurisés par la plateforme officielle Hellfest.",
      howItWorks: "Comment ça marche ?",
      step1: "Recherchez le billet que vous souhaitez",
      step2: "Vérifiez les détails et le prix",
      step3: "Effectuez le paiement sécurisé",
      step4: "Recevez votre billet par e-mail",
    },
    en: {
      title: "Ticket Resale",
      subtitle: "Hellfest official resale platform",
      searchPlaceholder: "Search for tickets...",
      filter: "Filter",
      noTickets: "No tickets available at the moment",
      waitlist: "Join the waitlist",
      buyTicket: "Buy this ticket",
      price: "Price",
      type: "Ticket type",
      seller: "Seller",
      date: "Added date",
      info: "Tickets are verified and secured by the official Hellfest platform.",
      howItWorks: "How it works?",
      step1: "Search for the ticket you want",
      step2: "Check details and price",
      step3: "Make secure payment",
      step4: "Receive your ticket by email",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container py-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-accent mb-2">
            {t.title}
          </h1>
          <p className="text-foreground/80">{t.subtitle}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 md:py-20">
        {/* Info Banner */}
        <div className="bg-secondary border border-accent/30 rounded-lg p-4 mb-8">
          <p className="text-foreground text-sm">{t.info}</p>
        </div>

        {/* Search & Filter */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary border border-border rounded hover:border-accent transition-colors">
            <Filter className="w-5 h-5" />
            <span>{t.filter}</span>
          </button>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="inline-block mb-6 p-8 bg-secondary rounded-lg border border-border">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t.noTickets}
            </h3>
            <p className="text-foreground/80 mb-6">
              {language === "fr"
                ? "Les billets s'afficheront ici dès qu'ils seront disponibles."
                : "Tickets will appear here as soon as they are available."}
            </p>
            <button className="px-6 py-2 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors">
              {t.waitlist}
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 pt-12 border-t border-border">
          <h2 className="text-3xl font-black text-accent mb-8">{t.howItWorks}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", text: t.step1 },
              { step: "2", text: t.step2 },
              { step: "3", text: t.step3 },
              { step: "4", text: t.step4 },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-black text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <p className="text-foreground text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
