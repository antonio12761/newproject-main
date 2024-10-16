import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import { sendTwoFactorCode } from "./twoFactor";
import { Session } from "next-auth"; // Importa il tipo Session

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e password sono obbligatori");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Credenziali non valide.");
        }

        if (!user.emailVerified) {
          throw new Error("Email non verificata.");
        }

        if (user.twoFactorEnabled) {
          if (!credentials.twoFactorCode) {
            await sendTwoFactorCode(user.email);
            throw new Error("Codice 2FA richiesto.");
          }

          if (credentials.twoFactorCode !== user.twoFactorCode) {
            throw new Error("Codice 2FA non valido.");
          }
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
  callbacks: {
    async session({ session, token }: { session: Session; token: any }) {
      // Tipizza session
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};
