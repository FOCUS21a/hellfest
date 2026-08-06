import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PaymentSuccessProps {
  language: "fr" | "en";
}

export default function PaymentSuccess({ language }: PaymentSuccessProps) {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState("");

  const translations = {
    fr: {
      title: "Paiement réussi !",
      subtitle: "Votre billet a été acheté avec succès",
      description: "Vous recevrez un e-mail de confirmation avec les détails de votre billet.",
      orderNumber: "Numéro de commande",
      backHome: "Retour à l'accueil",
      viewTickets: "Voir mes billets",
      loading: "Vérification du paiement...",
      error: "Erreur lors de la vérification du paiement",
    },
    en: {
      title: "Payment successful!",
      subtitle: "Your ticket has been purchased successfully",
      description: "You will receive a confirmation email with your ticket details.",
      orderNumber: "Order number",
      backHome: "Back to home",
      viewTickets: "View my tickets",
      loading: "Verifying payment...",
      error: "Error verifying payment",
    },
  };

  const t = translations[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (sid) {
      setSessionId(sid);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-20">
      <div className="container max-w-md">
        <div className="text-center">
          <div className="inline-block mb-6 p-6 bg-accent/10 rounded-full">
            <CheckCircle className="w-16 h-16 text-accent" />
          </div>

          <h1 className="text-4xl font-black text-accent mb-2">{t.title}</h1>
          <p className="text-foreground/80 mb-6">{t.subtitle}</p>

          <div className="bg-secondary border border-border rounded-lg p-6 mb-8">
            <p className="text-foreground/80 text-sm mb-4">{t.description}</p>

            {sessionId && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-foreground/60 text-xs mb-2">{t.orderNumber}</p>
                <p className="text-foreground font-mono text-sm break-all">{sessionId}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/espace-client")}
              className="w-full px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <span>{t.viewTickets}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 bg-secondary border border-border text-foreground font-bold rounded hover:border-accent transition-colors"
            >
              {t.backHome}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
