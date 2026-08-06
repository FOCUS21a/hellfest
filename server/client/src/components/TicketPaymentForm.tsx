import { useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";

interface TicketPaymentFormProps {
  language: "fr" | "en";
  amountTotal: number; // in cents
  onSuccess: (paymentIntentId: string) => void;
}

export default function TicketPaymentForm({
  language,
  amountTotal,
  onSuccess,
}: TicketPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = {
    fr: {
      pay: "Payer",
      processing: "Traitement du paiement...",
      secure: "Paiement sécurisé par Stripe",
      genericError: "Le paiement a échoué. Vérifiez vos informations et réessayez.",
    },
    en: {
      pay: "Pay",
      processing: "Processing payment...",
      secure: "Secure payment by Stripe",
      genericError: "Payment failed. Check your details and try again.",
    },
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || t.genericError);
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.processing}
          </>
        ) : (
          <span>
            {t.pay} {formatPrice(amountTotal)}
          </span>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        {t.secure}
      </p>
    </form>
  );
}
