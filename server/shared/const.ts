export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// One-time nonce cookie that binds an OAuth login to the browser that started
// it. The `__Host-` prefix forces the cookie host-only (Secure, Path=/, no
// Domain), so a sibling *.manus.space site cannot plant a matching value in a
// victim's browser.
export const OAUTH_STATE_COOKIE = "__Host-oauth_state";

// `state` carries the callback redirect URI (used at token exchange) plus the
// CSRF nonce. Defined here so the client encoder and server decoder never drift.
export type OAuthState = { redirectUri: string; nonce?: string };

export const encodeOAuthState = (state: OAuthState): string =>
  btoa(JSON.stringify(state));

// Catalogue des pass festival vendus en vente primaire (achat de billets neufs).
// Prix en centimes d'euro (unité attendue par Stripe). Ajuste librement.
export type TicketTypeId = "1JOUR" | "4JOURS" | "VIP4JOURS";

export interface TicketTypeDef {
  id: TicketTypeId;
  label: string;
  description: string;
  priceCents: number; // prix unitaire en centimes
  maxPerOrder: number;
}

export const TICKET_TYPES: Record<TicketTypeId, TicketTypeDef> = {
  "1JOUR": {
    id: "1JOUR",
    label: "Pass 1 Jour",
    description: "Accès au festival pour une journée au choix",
    priceCents: 9500,
    maxPerOrder: 10,
  },
  "4JOURS": {
    id: "4JOURS",
    label: "Pass 4 Jours",
    description: "Accès au festival pour les 4 jours",
    priceCents: 27000,
    maxPerOrder: 10,
  },
  "VIP4JOURS": {
    id: "VIP4JOURS",
    label: "Pass VIP 4 Jours",
    description: "Accès 4 jours + espace VIP et avantages exclusifs",
    priceCents: 45000,
    maxPerOrder: 6,
  },
};

// === Revente privée ===
// Durée de validité d'un lien de revente privée avant que le billet ne
// redevienne disponible pour une autre revente.
export const PRIVATE_RESALE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
// Si le vendeur ouvre lui-même son propre lien, la revente est bloquée
// temporairement (anti auto-transaction / fraude).
export const PRIVATE_RESALE_SELF_OPEN_BLOCK_MS = 60 * 60 * 1000; // 1 heure

export const buildPrivateResaleUrl = (origin: string, token: string): string =>
  `${origin}/revente/prive/${token}`;

export const decodeOAuthState = (state: string): OAuthState => {
  let decoded: string;
  try {
    decoded = atob(state);
  } catch {
    // Malformed base64 (e.g. attacker-supplied garbage). Return no nonce so the
    // callback's CSRF guard rejects it with 403 — never throw, since the caller
    // runs outside the request handler's try/catch.
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
    // Legacy links: `state` was a bare base64(redirectUri) with no nonce.
  }
  return { redirectUri: decoded };
};
