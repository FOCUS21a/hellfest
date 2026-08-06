import { ArrowLeft, Search, Filter, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface ResaleProps {
  language: "fr" | "en";
}

export default function ResaleNew({ language }: ResaleProps) {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

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
      info: "Les billets sont vérifiés et sécurisés par la plateforme officielle Hellfest. Le prix de revente est limité au prix d'achat initial.",
      howItWorks: "Comment ça marche ?",
      step1: "Recherchez le billet que vous souhaitez",
      step2: "Vérifiez les détails et le prix",
      step3: "Effectuez le paiement sécurisé avec Stripe",
      step4: "Recevez votre billet par e-mail",
      loading: "Chargement...",
      error: "Erreur lors du chargement des billets",
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
      info: "Tickets are verified and secured by the official Hellfest platform. Resale price is limited to the original purchase price.",
      howItWorks: "How it works?",
      step1: "Search for the ticket you want",
      step2: "Check details and price",
      step3: "Make secure payment with Stripe",
      step4: "Receive your ticket by email",
      loading: "Loading...",
      error: "Error loading tickets",
    },
  };

  const t = translations[language];

  // Fetch available resales
  const { data: resales, isLoading, error } = trpc.resale.getAvailable.useQuery({
    limit: 20,
    offset: 0,
  });

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

        {/* Tickets List or Empty State */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-foreground/80">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive">{t.error}</p>
          </div>
        ) : !resales || resales.length === 0 ? (
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
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {resales.map((resale) => (
              <div
                key={resale.id}
                className="bg-secondary border border-border rounded-lg p-6 hover:border-accent transition-colors"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {resale.ticketType || "Festival Pass"}
                  </h3>
                  <p className="text-accent text-2xl font-black">
                    €{(resale.resalePrice / 100).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 mb-4 text-sm text-foreground/80">
                  <p>
                    <span className="font-semibold text-foreground">
                      {language === "fr" ? "Statut:" : "Status:"}
                    </span>{" "}
                    {resale.status}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">
                      {language === "fr" ? "Ajouté:" : "Added:"}
                    </span>{" "}
                    {new Date(resale.createdAt).toLocaleDateString(
                      language === "fr" ? "fr-FR" : "en-US"
                    )}
                  </p>
                </div>

                <button className="w-full px-4 py-2 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {t.buyTicket}
                </button>
              </div>
            ))}
          </div>
        )}

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
