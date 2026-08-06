import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ArrowLeft, Minus, Plus, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { TICKET_TYPES, type TicketTypeId } from "@shared/const";
import TicketPaymentForm from "@/components/TicketPaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface BilletsProps {
  language: "fr" | "en";
}

export default function Billets({ language }: BilletsProps) {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<TicketTypeId>("4JOURS");
  const [quantity, setQuantity] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [amountTotal, setAmountTotal] = useState(0);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const createPaymentIntent = trpc.payment.createPaymentIntent.useMutation();

  const t = {
    fr: {
      title: "Achat de billets",
      subtitle: "Réservez votre place au Hellfest",
      back: "Retour",
      chooseType: "Choisissez votre pass",
      quantity: "Quantité",
      total: "Total",
      continue: "Passer au paiement",
      loading: "Préparation du paiement...",
      successTitle: "Paiement confirmé !",
      successText: "Vos billets ont été ajoutés à votre espace client.",
      viewTickets: "Voir mes billets",
      backHome: "Retour à l'accueil",
      changeOrder: "Modifier ma commande",
    },
    en: {
      title: "Buy tickets",
      subtitle: "Reserve your spot at Hellfest",
      back: "Back",
      chooseType: "Choose your pass",
      quantity: "Quantity",
      total: "Total",
      continue: "Proceed to payment",
      loading: "Preparing payment...",
      successTitle: "Payment confirmed!",
      successText: "Your tickets have been added to your account.",
      viewTickets: "View my tickets",
      backHome: "Back to home",
      changeOrder: "Change my order",
    },
  }[language];

  const ticketDef = TICKET_TYPES[selectedType];
  const total = ticketDef.priceCents * quantity;

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
    });

  const handleContinue = async () => {
    const result = await createPaymentIntent.mutateAsync({
      ticketType: selectedType,
      quantity,
    });
    setClientSecret(result.clientSecret);
    setOrderId(result.orderId);
    setAmountTotal(result.amountTotal);
  };

  const resetOrder = () => {
    setClientSecret(null);
    setOrderId(null);
  };

  const elementsOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "night" as const,
              variables: {
                colorPrimary: "#e11d48",
              },
            },
          }
        : undefined,
    [clientSecret]
  );

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-20">
        <div className="container max-w-md text-center">
          <div className="inline-block mb-6 p-6 bg-accent/10 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-accent" />
          </div>
          <h1 className="text-4xl font-black text-accent mb-2">{t.successTitle}</h1>
          <p className="text-foreground/80 mb-8">{t.successText}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/espace-client")}
              className="w-full px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors"
            >
              {t.viewTickets}
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
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <div className="border-b border-border">
        <div className="container py-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t.back}</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-accent mb-2">{t.title}</h1>
          <p className="text-foreground/80">{t.subtitle}</p>
        </div>
      </div>

      <div className="container py-12 md:py-20 max-w-2xl">
        {!clientSecret ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold mb-4">{t.chooseType}</h2>
              <div className="space-y-3">
                {Object.values(TICKET_TYPES).map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedType === type.id
                        ? "border-accent bg-accent/10"
                        : "border-border bg-secondary hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{type.label}</p>
                        <p className="text-sm text-foreground/70">{type.description}</p>
                      </div>
                      <p className="font-black text-accent whitespace-nowrap ml-4">
                        {formatPrice(type.priceCents)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-secondary border border-border rounded-lg p-4">
              <span className="font-bold">{t.quantity}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded border border-border hover:border-accent transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(ticketDef.maxPerOrder, q + 1))
                  }
                  className="w-9 h-9 flex items-center justify-center rounded border border-border hover:border-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xl font-black border-t border-border pt-6">
              <span>{t.total}</span>
              <span className="text-accent">{formatPrice(total)}</span>
            </div>

            {createPaymentIntent.isError && (
              <p className="text-sm text-destructive">
                {createPaymentIntent.error.message}
              </p>
            )}

            <button
              onClick={handleContinue}
              disabled={createPaymentIntent.isPending}
              className="w-full px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {createPaymentIntent.isPending ? t.loading : t.continue}
            </button>
          </div>
        ) : (
          <div className="bg-secondary border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-bold">
                  {quantity} × {ticketDef.label}
                </p>
                <p className="text-accent font-black text-lg">{formatPrice(amountTotal)}</p>
              </div>
              <button
                onClick={resetOrder}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                {t.changeOrder}
              </button>
            </div>

            {elementsOptions && (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <TicketPaymentForm
                  language={language}
                  amountTotal={amountTotal}
                  onSuccess={() => setPurchaseComplete(true)}
                />
              </Elements>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
