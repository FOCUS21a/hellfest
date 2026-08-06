import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function AdminPayouts() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  const { data: payouts, isLoading, refetch } =
    trpc.resale.getPendingPayouts.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "admin",
    });

  const markPaid = trpc.resale.markPayoutPaid.useMutation({
    onSuccess: () => refetch(),
  });

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
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
            Paiements vendeurs
          </h1>
          <p className="text-foreground/80">
            Reventes payées par l'acheteur, en attente de virement au vendeur
          </p>
        </div>
      </div>

      <div className="container py-12">
        {loading ? (
          <p className="text-foreground/80">…</p>
        ) : !isAuthenticated ? (
          <button
            onClick={() => startLogin()}
            className="px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors"
          >
            Se connecter
          </button>
        ) : user?.role !== "admin" ? (
          <p className="text-foreground/80">
            Accès réservé à l'administrateur.
          </p>
        ) : isLoading ? (
          <p className="text-foreground/80">…</p>
        ) : !payouts || payouts.length === 0 ? (
          <p className="text-foreground/80">
            Rien en attente — tous les vendeurs ont été payés.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse max-w-4xl">
              <thead>
                <tr className="border-b border-border text-left text-foreground/60">
                  <th className="py-3 pr-4">Vendeur</th>
                  <th className="py-3 pr-4">Billet</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Montant à verser</th>
                  <th className="py-3 pr-4">Payé le</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.resaleId} className="border-b border-border/50">
                    <td className="py-3 pr-4">
                      <div className="font-semibold">{p.sellerName || "—"}</div>
                      <div className="text-foreground/60 text-xs">{p.sellerEmail}</div>
                    </td>
                    <td className="py-3 pr-4">{p.ticketType}</td>
                    <td className="py-3 pr-4">
                      {p.type === "private" ? "Revente privée" : "Revente publique"}
                    </td>
                    <td className="py-3 pr-4 font-black text-accent">
                      {formatPrice(p.resalePrice)}
                    </td>
                    <td className="py-3 pr-4 text-foreground/60">
                      {formatDate(p.completedAt)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => markPaid.mutate({ resaleId: p.resaleId })}
                        disabled={markPaid.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-bold rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        {markPaid.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Marquer payé
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
