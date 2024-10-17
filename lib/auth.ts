import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import { generateTwoFactorCode, sendTwoFactorCode } from "./twoFactor";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "Codice 2FA", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          throw new Error("Credenziali non fornite.");
        }
      
        const { email, password, twoFactorCode } = credentials;
      
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!user) {
          throw new Error("Credenziali non valide.");
        }

        if (!user.emailVerified) {
          throw new Error("Email non verificata.");
        }
        // Controlla se il 2FA è abilitato
        if (user.twoFactorEnabled) {
          console.log("Codice 2FA inviato a:", user.email);
          console.log("Codice fornito dall'utente:", credentials.twoFactorCode);
          console.log("Codice salvato nel database:", user.twoFactorCode);

          // Se non c'è il codice 2FA, invia l'email e ritorna un errore
          if (!credentials?.twoFactorCode) {
            await sendTwoFactorCode(user.email, generateTwoFactorCode());
            throw new Error(
              "Codice 2FA inviato. Controlla la tua email e riprova."
            );
          }

          // Verifica il codice 2FA inserito
          if (credentials.twoFactorCode !== user.twoFactorCode) {
            throw new Error("Codice 2FA non valido.");
          }

          // Se il codice 2FA è valido, rimuovilo dal database
          await prisma.user.update({
            where: { email: user.email },
            data: { twoFactorCode: null },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role || "user",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};
