/*
 * Customer Area Page — Hellfest Ticketing
 * Direct access to ticket management (Order list -> Manage -> Actions)
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Settings, 
  Info, 
  Hash, 
  Download, 
  ShoppingCart, 
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";

// Animation variants
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
};

// Mock ticket data
const mockTickets = [
  {
    id: "1",
    type: "PASS 4 JOURS",
    name: "JOHN DOE",
    number: "66-1234-5678",
    available: true,
  },
  {
    id: "2",
    type: "PASS 4 JOURS",
    name: "JANE SMITH",
    number: "66-8765-4321",
    available: true,
  }
];

export default function CustomerArea() {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setIsDownloading(id);
    
    // Simulation d'un chargement de 2 secondes
    setTimeout(() => {
      setIsDownloading(null);
      toast.success("Billet téléchargé avec succès !", {
        description: "Le fichier PDF a été enregistré sur votre appareil.",
        duration: 4000,
      });
    }, 2000);
  };

  const handleResale = () => {
    toast.info("Redirection vers la plateforme de revente...");
  };

  const handleInfo = (number: string) => {
    toast.info(`Numéro du billet : ${number}`);
  };

  return (
    <div className="min-h-screen bg-black text-[#F5F0E8] pt-16">
      {/* Hero Section */}
      <section className="relative py-16 text-center">
        <div className="container">
          <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl md:text-7xl text-[#F5F0E8] tracking-wide mb-2">
              HELLFEST 2027
            </motion.h1>
            <motion.p variants={fadeUp} className="font-display text-3xl sm:text-4xl text-[#CC0000] tracking-wider mb-6">
              ESPACE CLIENT
            </motion.p>
            <motion.div variants={fadeUp} className="crimson-line max-w-lg mx-auto mb-8" />
          </motion.div>
        </div>
      </section>

      {/* Orders Section */}
      <section className="pb-20">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="w-6 h-6 text-[#CC0000]" />
            <h2 className="font-display text-2xl text-[#F5F0E8] tracking-wide uppercase">
              Mes Billets
            </h2>
          </div>
          
          <div className="space-y-4">
            {mockTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-[#0A0A0A] border border-[#CC0000]/20 overflow-hidden transition-all duration-300 hover:border-[#CC0000]/40"
              >
                {/* Ticket Header */}
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-[#F5F0E8] tracking-wider mb-1">
                      {ticket.type}
                    </h3>
                    <p className="text-[#9A9A9A] text-sm font-mono">
                      NOM : <span className="text-[#F5F0E8]">{ticket.name}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                    className="w-full sm:w-auto bg-[#CC0000] hover:bg-[#AA0000] text-white font-mono text-xs tracking-widest px-8 py-6 rounded-none transition-all active:scale-95"
                  >
                    <Settings className="mr-2 w-4 h-4" />
                    {expandedTicket === ticket.id ? "FERMER" : "GÉRER"}
                    {expandedTicket === ticket.id ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
                  </Button>
                </div>

                {/* Expanded Actions */}
                <AnimatePresence>
                  {expandedTicket === ticket.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="border-t border-[#CC0000]/10 bg-black/40"
                    >
                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Action: Resale */}
                        <button
                          onClick={handleResale}
                          className="flex items-center gap-4 p-4 bg-[#111] border border-[#333] hover:border-[#CC0000] transition-all group text-left"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-black border border-[#333] group-hover:border-[#CC0000]">
                            <ShoppingCart className="w-5 h-5 text-[#CC0000]" />
                          </div>
                          <div>
                            <p className="text-[#F5F0E8] text-sm font-display tracking-wider">REVENTE</p>
                            <p className="text-[#666] text-xs">Mettre en vente au prix facial</p>
                          </div>
                        </button>

                        {/* Action: Info */}
                        <button
                          onClick={() => handleInfo(ticket.number)}
                          className="flex items-center gap-4 p-4 bg-[#111] border border-[#333] hover:border-[#CC0000] transition-all group text-left"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-black border border-[#333] group-hover:border-[#CC0000]">
                            <Info className="w-5 h-5 text-[#CC0000]" />
                          </div>
                          <div>
                            <p className="text-[#F5F0E8] text-sm font-display tracking-wider">INFOS</p>
                            <p className="text-[#666] text-xs">Détails de la commande</p>
                          </div>
                        </button>

                        {/* Action: Cashless/Hash */}
                        <button
                          onClick={() => handleInfo(ticket.number)}
                          className="flex items-center gap-4 p-4 bg-[#111] border border-[#333] hover:border-[#CC0000] transition-all group text-left"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-black border border-[#333] group-hover:border-[#CC0000]">
                            <Hash className="w-5 h-5 text-[#CC0000]" />
                          </div>
                          <div>
                            <p className="text-[#F5F0E8] text-sm font-display tracking-wider">CASHLESS</p>
                            <p className="text-[#666] text-xs">Numéro unique du billet</p>
                          </div>
                        </button>

                        {/* Action: Download */}
                        <button
                          onClick={() => handleDownload(ticket.id)}
                          disabled={isDownloading !== null}
                          className={`flex items-center gap-4 p-4 bg-[#111] border transition-all group text-left w-full ${
                            isDownloading === ticket.id 
                              ? "border-[#CC0000] bg-[#CC0000]/5 cursor-wait" 
                              : "border-[#CC0000]/30 hover:bg-[#CC0000]/10 hover:border-[#CC0000]"
                          }`}
                        >
                          <div className={`w-10 h-10 flex items-center justify-center bg-black border transition-all ${
                            isDownloading === ticket.id ? "border-[#CC0000]" : "border-[#CC0000]/30 group-hover:border-[#CC0000]"
                          }`}>
                            {isDownloading === ticket.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              >
                                <Settings className="w-5 h-5 text-[#CC0000]" />
                              </motion.div>
                            ) : (
                              <Download className="w-5 h-5 text-[#CC0000]" />
                            )}
                          </div>
                          <div>
                            <p className="text-[#F5F0E8] text-sm font-display tracking-wider">
                              {isDownloading === ticket.id ? "CHARGEMENT..." : "TÉLÉCHARGER"}
                            </p>
                            <p className="text-[#666] text-xs">
                              {isDownloading === ticket.id ? "Préparation du PDF" : "PDF avec QR Code"}
                            </p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Important Info Section */}
          <div className="mt-16 p-8 bg-[#0A0A0A] border border-[#333] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#CC0000]" />
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-[#CC0000] shrink-0 mt-1" />
              <div>
                <h3 className="font-display text-lg text-[#F5F0E8] tracking-wider mb-4 uppercase">
                  Informations sur le téléchargement
                </h3>
                <div className="space-y-4 text-sm leading-relaxed">
                  <p className="text-[#9A9A9A]">
                    Depuis 2026, le Hellfest n'envoie plus les billets en PDF par e-mail. Vous recevez uniquement une confirmation d'achat.
                  </p>
                  <p className="text-[#9A9A9A]">
                    Le billet devient disponible environ un mois avant le festival directement dans votre Espace Client.
                  </p>
                  <p className="text-[#666] italic">
                    Le PDF contient le QR code, le numéro unique du billet et les informations du pass. C'est ce document qui est présenté à l'entrée du festival.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}