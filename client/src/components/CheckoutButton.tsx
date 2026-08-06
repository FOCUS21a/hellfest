import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CheckoutButtonProps {
  resaleId: number;
  price: number;
  language: "fr" | "en";
}

export default function CheckoutButton({
  resaleId,
  price,
  language,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      const result = await createCheckoutMutation.mutateAsync({
        resaleId,
      });

      if (result.url) {
        // Open Stripe checkout in new tab
        window.open(result.url, "_blank");
        toast.success(
          language === "fr"
            ? "Redirection vers le paiement..."
            : "Redirecting to payment..."
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        language === "fr"
          ? "Erreur lors de la création de la session de paiement"
          : "Error creating checkout session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full px-4 py-2 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {language === "fr" ? "Traitement..." : "Processing..."}
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          {language === "fr" ? "Acheter ce billet" : "Buy this ticket"}
        </>
      )}
    </button>
  );
}
