import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function AdminAssignments() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  const { data: pending, isLoading, refetch } =
    trpc.resale.getPendingAssignments.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "admin",
    });

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
            Billets en attente d'attribution
          </h1>
          <p className="text-foreground/80">
            Billets acquis par revente, en attente du PDF à transmettre à l'acheteur
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
          <p className="text-foreground/80">Accès réservé à l'administrateur.</p>
        ) : isLoading ? (
          <p className="text-foreground/80">…</p>
        ) : !pending || pending.length === 0 ? (
          <p className="text-foreground/80">Rien en attente pour le moment.</p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {pending.map((t) => (
              <AssignmentRow key={t.ticketId} ticket={t} onDone={() => refetch()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function AssignmentRow({
    ticket,
    onDone,
  }: {
    ticket: {
      ticketId: number;
      ticketType: string;
      buyerName: string | null;
      buyerEmail: string | null;
      acquiredAt: string | Date;
    };
    onDone: () => void;
  }) {
    const [url, setUrl] = useState("");
    const assign = trpc.resale.assignTicketPdf.useMutation({ onSuccess: onDone });

    return (
      <div className="bg-secondary border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-foreground">{ticket.ticketType}</p>
            <p className="text-sm text-foreground/70">
              {ticket.buyerName || "—"} · {ticket.buyerEmail}
            </p>
          </div>
          <span className="text-xs text-foreground/50">{formatDate(ticket.acquiredAt)}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="Lien du PDF (ex: Google Drive, S3...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={() => url && assign.mutate({ ticketId: ticket.ticketId, pdfUrl: url })}
            disabled={!url || assign.isPending}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground text-sm font-bold rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {assign.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Attribuer
          </button>
        </div>
        {assign.isError && (
          <p className="text-xs text-destructive mt-2">{assign.error.message}</p>
        )}
      </div>
    );
  }
}