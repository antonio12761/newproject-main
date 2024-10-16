import { Resend } from "resend";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

// Verifica che la chiave API sia valida
if (
  !process.env.RESEND_API_KEY ||
  !process.env.RESEND_API_KEY.startsWith("re_")
) {
  throw new Error("La chiave API di Resend non è valida.");
}

export const generateTwoFactorCode = () => {
  return randomBytes(3).toString("hex").toUpperCase(); // Genera un codice a 6 caratteri
};

export const sendTwoFactorCode = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Utente non trovato");
  }

  const twoFactorCode = generateTwoFactorCode();

  try {
    // Aggiorna il database con il codice 2FA
    await prisma.user.update({
      where: { email },
      data: { twoFactorCode },
    });

    // Invia l'email con il codice 2FA
    await resend.emails.send({
      from: process.env.EMAIL_USER ?? "no-reply@example.com",
      to: email,
      subject: "Il tuo codice 2FA",
      html: `<p>Il tuo codice 2FA è: ${twoFactorCode}</p>`,
    });

    console.log("Codice 2FA inviato con successo a:", email);
  } catch (error) {
    console.error("Errore durante l'invio del codice 2FA:", error);
    throw new Error(
      "Errore durante l'invio del codice 2FA. Riprova più tardi."
    );
  }
};
