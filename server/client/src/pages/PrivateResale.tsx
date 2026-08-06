import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Lock, Clock, ShoppingCart, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

const PENDING_PRIVATE_RESALE_KEY = "pending_private_resale_token";

interface PrivateResaleProps {
  language: "fr" | "en";
}

export default function PrivateResale({ language }: PrivateResaleProps) {
  const [, navigate] = useLocation();
  const params = useParams<{ token: string }>();
  const token = params.token;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data, isLoading, error } = trpc.resale.getPrivateResaleByToken.useQuery(
    { token },
    { refetchInterval: 15000 } // picks up "blocked" cooldown expiring, etc.
  );

  const createCheckoutSession = trpc.payment.createCheckoutSession.useMutation();

  const t = {
    fr: {
      back: "Retour",
      title: "Revente privée",
      subtitle: "Un billet vous a été réservé personnellement",
      loading: "Vérification du lien...",
      notFound: "Ce lien n'est pas valide.",
      completedTitle: "Ce billet a déjà été vendu",
      completedText: "Ce lien de revente privée a déjà été utilisé.",
      expiredTitle: "Ce lien a expiré",
      expiredText:
        "Le délai de la revente privée est passé, le billet n'est plus disponible via ce lien.",
      blockedTitle: "Revente temporairement indisponible",
      blockedText:
        "Ce lien a été ouvert par le vendeur et est bloqué environ 1 heure par sécurité. Réessayez plus tard.",
      blockedSelfTitle: "Vous êtes le vendeur de ce billet",
      blockedSelfText:
        "Pour des raisons de sécurité, vous ne pouvez pas acheter votre propre billet. Ce lien est maintenant bloqué pendant environ 1 heure.",
      pendingTitle: "Achat en cours",
      pendingText: "Quelqu'un est déjà en train d'acheter ce billet. Réessayez dans quelques minutes.",
      loginPrompt: "Connectez-vous pour acheter ce billet",
      signIn: "Se connecter",
      buy: "Acheter ce billet",
      redirecting: "Redirection vers le paiement sécurisé...",
      secureNote: "Paiement sécurisé géré par la plateforme officielle Hellfest.",
    },
    en: {
      back: "Back",
      title: "Private resale",
      subtitle: "A ticket has been personally reserved for you",
      loading: "Checking link...",
      notFound: "This link is not valid.",
      completedTitle: "This ticket has already been sold",
      completedText: "This private resale link has already been used.",
      expiredTitle: "This link has expired",
      expiredText:
        "The private resale window has passed, the ticket is no longer available via this link.",
      blockedTitle: "Resale temporarily unavailable",
      blockedText:
        "This link was opened by the seller and is locked for about 1 hour as a safety measure. Please try again later.",
      blockedSelfTitle: "You are the seller of this ticket",
      blockedSelfText:
        "For security reasons, you cannot buy your own ticket. This link is now locked for about 1 hour.",
      pendingTitle: "Purchase in progress",
      pendingText: "Someone else is already buying this ticket. Try again in a few minutes.",
      loginPrompt: "Sign in to buy this ticket",
      signIn: "Sign in",
      buy: "Buy this ticket",
      redirecting: "Redirecting to secure payment...",
      secureNote: "Secure payment handled by the official Hellfest platform.",
    },
  }[language];

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
    });

  const handleBuy = async () => {
    setIsRedirecting(true);
    try {
      if (data?.state !== "available") return;
      const result = await createCheckoutSession.mutateAsync({
        resaleId: data.resaleId,
        token,
      });
      if (result.url) window.location.href = result.url;
    } catch {
      setIsRedirecting(false);
    }
  };

  const handleLogin = () => {
    sessionStorage.setItem(PENDING_PRIVATE_RESALE_KEY, token);
    startLogin();
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
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
      <div className="container py-12 md:py-20 max-w-lg">{children}</div>
    </div>
  );

  if (isLoading || authLoading) {
    return (
      <Shell>
        <p className="text-foreground/80">{t.loading}</p>
      </Shell>
    );
  }

  if (error || !data || data.state === "not_found") {
    return (
      <Shell>
        <StatusCard icon={<Lock className="w-8 h-8" />} title={t.notFound} text="" />
      </Shell>
    );
  }

  if (data.state === "completed") {
    return (
      <Shell>
        <StatusCard icon={<Lock className="w-8 h-8" />} title={t.completedTitle} text={t.completedText} />
      </Shell>
    );
  }

  if (data.state === "expired") {
    return (
      <Shell>
        <StatusCard icon={<Clock className="w-8 h-8" />} title={t.expiredTitle} text={t.expiredText} />
      </Shell>
    );
  }

  if (data.state === "blocked_self") {
    return (
      <Shell>
        <StatusCard icon={<Lock className="w-8 h-8" />} title={t.blockedSelfTitle} text={t.blockedSelfText} />
      </Shell>
    );
  }

  if (data.state === "blocked") {
    return (
      <Shell>
        <StatusCard icon={<Lock className="w-8 h-8" />} title={t.blockedTitle} text={t.blockedText} />
      </Shell>
    );
  }

  if (data.state === "pending") {
    return (
      <Shell>
        <StatusCard icon={<Clock className="w-8 h-8" />} title={t.pendingTitle} text={t.pendingText} />
      </Shell>
    );
  }

  // data.state === "available"
  return (
    <Shell>
      <div className="bg-secondary border border-border rounded-lg p-6">
        <p className="font-bold text-foreground text-lg mb-1">{data.ticketType}</p>
        <p className="text-accent font-black text-3xl mb-6">{formatPrice(data.resalePrice)}</p>

        {!isAuthenticated ? (
          <div>
            <p className="text-sm text-foreground/80 mb-4">{t.loginPrompt}</p>
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors"
            >
              {t.signIn}
            </button>
          </div>
        ) : (
          <button
            onClick={handleBuy}
            disabled={isRedirecting || createCheckoutSession.isPending}
            className="w-full px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRedirecting || createCheckoutSession.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.redirecting}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {t.buy}
              </>
            )}
          </button>
        )}

        {createCheckoutSession.isError && (
          <p className="text-sm text-destructive mt-3">{createCheckoutSession.error.message}</p>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">{t.secureNote}</p>
      </div>
    </Shell>
  );
}

function StatusCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-secondary border border-border rounded-lg p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      {text && <p className="text-foreground/80 text-sm">{text}</p>}
    </div>
  );
}
