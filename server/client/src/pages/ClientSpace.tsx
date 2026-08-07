import { ArrowLeft, Copy, Check, Link as LinkIcon, AlertTriangle, Clock, FileDown } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { buildPrivateResaleUrl } from "@shared/const";

interface ClientSpaceProps {
  language: "fr" | "en";
}

export default function ClientSpace({ language }: ClientSpaceProps) {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  const t = {
    fr: {
      title: "Espace Client",
      subtitle: "Gérez vos billets Hellfest 2027",
      back: "Retour",
      loginTitle: "Connectez-vous pour accéder à vos billets",
      signIn: "Se connecter",
      myTickets: "Mes billets",
      noTickets: "Vous n'avez aucun billet pour le moment.",
      buyTickets: "Acheter des billets",
      statusOwned: "En votre possession",
      statusForSale: "En cours de revente",
      statusSold: "Vendu",
      statusTransferred: "En attente d'attribution",
      statusReady: "Billet disponible",
    },
    en: {
      title: "Client Space",
      subtitle: "Manage your Hellfest 2027 tickets",
      back: "Back",
      loginTitle: "Sign in to access your tickets",
      signIn: "Sign in",
      myTickets: "My tickets",
      noTickets: "You don't have any tickets yet.",
      buyTickets: "Buy tickets",
      statusOwned: "In your possession",
      statusForSale: "Being resold",
      statusSold: "Sold",
      statusTransferred: "Pending assignment",
      statusReady: "Ticket ready",
    },
  }[language];

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

      <div className="container py-12 md:py-20">
        {loading ? (
          <p className="text-foreground/80">…</p>
        ) : !isAuthenticated ? (
          <div className="max-w-md">
            <div className="bg-secondary rounded-lg p-8 border border-border text-center">
              <h2 className="text-xl font-bold text-foreground mb-6">{t.loginTitle}</h2>
              <button
                onClick={() => startLogin()}
                className="px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors"
              >
                {t.signIn}
              </button>
            </div>
          </div>
        ) : (
          <TicketsPanel language={language} t={t} />
        )}
        {isAuthenticated && user?.role === "admin" && (
          <div className="mt-10 flex flex-col gap-2 items-start">
            <button
              onClick={() => navigate("/admin/paiements")}
              className="text-sm text-accent hover:text-accent/80 transition-colors underline"
            >
              → Paiements vendeurs en attente (admin)
            </button>
            <button
              onClick={() => navigate("/admin/attributions")}
              className="text-sm text-accent hover:text-accent/80 transition-colors underline"
            >
              → Billets en attente d'attribution (admin)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TicketsPanel({
  language,
  t,
}: {
  language: "fr" | "en";
  t: Record<string, string>;
}) {
  const [, navigate] = useLocation();
  const { data: myTickets, isLoading, refetch } = trpc.resale.getUserTickets.useQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev; // max 2 tickets per resale
      return [...prev, id];
    });
  };

  const statusLabel = (status: string, pdfUrl?: string | null) => {
    switch (status) {
      case "owned": return t.statusOwned;
      case "for_sale": return t.statusForSale;
      case "sold": return t.statusSold;
      case "transferred": return pdfUrl ? t.statusReady : t.statusTransferred;
      default: return status;
    }
  };

  const ownedTickets = (myTickets || []).filter((tk) => tk.status === "owned");

  return (
    <div>
      <h2 className="text-2xl font-black text-accent mb-6">{t.myTickets}</h2>

      {isLoading ? (
        <p className="text-foreground/80">…</p>
      ) : !myTickets || myTickets.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 border border-border text-center max-w-md">
          <p className="text-foreground/80 mb-6">{t.noTickets}</p>
          <button
            onClick={() => navigate("/billets")}
            className="px-6 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors"
          >
            {t.buyTickets}
          </button>
        </div>
      ) : (
        <>
          {ownedTickets.length > 1 && (
            <p className="text-xs text-foreground/60 mb-4">
              {language === "fr"
                ? "Coche jusqu'à 2 billets pour les revendre ensemble en une seule revente."
                : "Check up to 2 tickets to resell them together in a single listing."}
            </p>
          )}
          {selectedIds.length > 0 && (
            <SelectionResaleBar
              language={language}
              ticketIds={selectedIds}
              onDone={() => {
                setSelectedIds([]);
                refetch();
              }}
            />
          )}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {myTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                language={language}
                statusLabel={statusLabel}
                selected={selectedIds.includes(ticket.id)}
                selectable={ticket.status === "owned"}
                onToggleSelect={() => toggleSelect(ticket.id)}
                onResaleCreated={() => {
                  setSelectedIds([]);
                  refetch();
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TicketCard({
  ticket,
  language,
  statusLabel,
  selected,
  selectable,
  onToggleSelect,
  onResaleCreated,
}: {
  ticket: { id: number; ticketType: string; price: number; status: string; pdfUrl?: string | null };
  language: "fr" | "en";
  statusLabel: (status: string, pdfUrl?: string | null) => string;
  selected: boolean;
  selectable: boolean;
  onToggleSelect: () => void;
  onResaleCreated: () => void;
}) {
  const [showPrivateForm, setShowPrivateForm] = useState(false);
  const [resalePrice, setResalePrice] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createPrivateResale = trpc.resale.createPrivateResale.useMutation({
    onSuccess: (result) => {
      const url = buildPrivateResaleUrl(window.location.origin, result.token);
      setGeneratedLink(url);
      onResaleCreated();
    },
  });

  const t = {
    fr: {
      privateResale: "Revente privée",
      price: "Prix de revente (€)",
      generate: "Générer le lien",
      generating: "Génération...",
      linkReady: "Lien généré — envoyez-le uniquement à votre acheteur :",
      copy: "Copier",
      copied: "Copié !",
      warning: "N'ouvrez pas ce lien vous-même : cela bloquerait temporairement (≈1h) la revente.",
      pending: "Le billet sera transmis dès que le vendeur aura confirmé la remise.",
      download: "Télécharger le billet (PDF)",
      select: "Inclure dans une revente groupée",
    },
    en: {
      privateResale: "Private resale",
      price: "Resale price (€)",
      generate: "Generate link",
      generating: "Generating...",
      linkReady: "Link generated — send it only to your buyer:",
      copy: "Copy",
      copied: "Copied!",
      warning: "Do not open this link yourself: it would temporarily block (~1h) the resale.",
      pending: "The ticket will be delivered once the handover is confirmed.",
      download: "Download ticket (PDF)",
      select: "Include in a grouped resale",
    },
  }[language];

  const handleGenerate = () => {
    const priceNum = Math.round(parseFloat(resalePrice) * 100);
    if (!priceNum || priceNum <= 0) return;
    createPrivateResale.mutate({ ticketIds: [ticket.id], resalePrice: priceNum });
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-secondary border rounded-lg p-6 transition-colors ${selected ? "border-accent" : "border-border"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="mt-1.5 w-4 h-4 accent-red-600"
              aria-label={t.select}
            />
          )}
          <div>
            <p className="font-bold text-foreground">{ticket.ticketType}</p>
            <p className="text-accent font-black text-lg">
              {(ticket.price / 100).toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-background border border-border text-foreground/70 whitespace-nowrap">
          {statusLabel(ticket.status, ticket.pdfUrl)}
        </span>
      </div>

      {ticket.status === "transferred" && (
        <div className="border-t border-border pt-4 mt-4">
          {ticket.pdfUrl ? (
            <a
              href={ticket.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              {t.download}
            </a>
          ) : (
            <p className="flex items-center gap-2 text-sm text-foreground/60">
              <Clock className="w-4 h-4 shrink-0" />
              {t.pending}
            </p>
          )}
        </div>
      )}

      {(ticket.status === "owned" || generatedLink) && (
        <div className="border-t border-border pt-4 mt-4">
          {!showPrivateForm && !generatedLink && (
            <button
              onClick={() => setShowPrivateForm(true)}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-semibold"
            >
              <LinkIcon className="w-4 h-4" />
              {t.privateResale}
            </button>
          )}

          {showPrivateForm && !generatedLink && (
            <div className="space-y-3">
              <label className="block text-sm text-foreground/80">{t.price}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={resalePrice}
                onChange={(e) => setResalePrice(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {createPrivateResale.isError && (
                <p className="text-xs text-destructive">{createPrivateResale.error.message}</p>
              )}
              <button
                onClick={handleGenerate}
                disabled={createPrivateResale.isPending}
                className="w-full px-4 py-2 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {createPrivateResale.isPending ? t.generating : t.generate}
              </button>
            </div>
          )}

          {generatedLink && (
            <div className="space-y-3">
              <p className="text-sm text-foreground/80">{t.linkReady}</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground text-xs truncate"
                />
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 bg-accent text-accent-foreground rounded font-semibold text-sm hover:bg-accent/90 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <div className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t.warning}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function SelectionResaleBar({
  language,
  ticketIds,
  onDone,
}: {
  language: "fr" | "en";
  ticketIds: number[];
  onDone: () => void;
}) {
  const [price, setPrice] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createPrivateResale = trpc.resale.createPrivateResale.useMutation({
    onSuccess: (result) => {
      setLink(buildPrivateResaleUrl(window.location.origin, result.token));
    },
  });

  const t = {
    fr: {
      title: `Revendre ${ticketIds.length} billet${ticketIds.length > 1 ? "s" : ""} ensemble`,
      price: "Prix total de revente (€)",
      generate: "Générer le lien",
      generating: "Génération...",
      copy: "Copier",
      copied: "Copié !",
      warning: "N'ouvrez pas ce lien vous-même : cela bloquerait temporairement (≈1h) la revente.",
      done: "Terminé",
    },
    en: {
      title: `Resell ${ticketIds.length} ticket${ticketIds.length > 1 ? "s" : ""} together`,
      price: "Total resale price (€)",
      generate: "Generate link",
      generating: "Generating...",
      copy: "Copy",
      copied: "Copied!",
      warning: "Do not open this link yourself: it would temporarily block (~1h) the resale.",
      done: "Done",
    },
  }[language];

  const handleGenerate = () => {
    const priceNum = Math.round(parseFloat(price) * 100);
    if (!priceNum || priceNum <= 0) return;
    createPrivateResale.mutate({ ticketIds, resalePrice: priceNum });
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-secondary border border-accent rounded-lg p-6 mb-6 max-w-4xl">
      <p className="font-bold text-foreground mb-4">{t.title}</p>

      {!link ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder={t.price}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleGenerate}
            disabled={createPrivateResale.isPending}
            className="px-4 py-2 bg-accent text-accent-foreground font-bold rounded hover:bg-accent/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {createPrivateResale.isPending ? t.generating : t.generate}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground text-xs truncate"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1 px-3 py-2 bg-accent text-accent-foreground rounded font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <div className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded p-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t.warning}</span>
          </div>
          <button onClick={onDone} className="text-sm text-accent hover:text-accent/80 underline">
            {t.done}
          </button>
        </div>
      )}

      {createPrivateResale.isError && (
        <p className="text-xs text-destructive mt-2">{createPrivateResale.error.message}</p>
      )}
    </div>
  );
}