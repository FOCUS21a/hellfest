import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { z } from "zod";
import crypto from "crypto";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { resaleRouter } from "./routers/resale";
import { paymentRouter } from "./routers/payment";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    // Connexion simplifiée par email : aucune vérification de propriété de
    // l'adresse (pas de mot de passe, pas de lien magique). L'utilisateur
    // tape son email et est connecté/inscrit instantanément. Le compte est
    // créé automatiquement s'il n'existe pas encore (upsert), exactement
    // comme pour la connexion Google.
    emailLogin: publicProcedure
      .input(z.object({ email: z.string().trim().toLowerCase().email() }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email;
        // openId stable et borné à 64 caractères (contrainte de colonne),
        // dérivé de l'email par hash pour éviter tout souci de longueur ou
        // de caractères spéciaux.
        const openId = `email_${crypto.createHash("sha256").update(email).digest("hex").slice(0, 40)}`;

        await db.upsertUser({
          openId,
          name: null,
          email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name: "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true } as const;
      }),
  }),

  resale: resaleRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;