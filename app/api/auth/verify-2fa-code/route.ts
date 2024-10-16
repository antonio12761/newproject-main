import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { twoFactorCode } = await request.json();

  // Utilizza findFirst per cercare l'utente in base al codice 2FA
  const user = await prisma.user.findFirst({
    where: { twoFactorCode },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Codice 2FA non valido." },
      { status: 400 }
    );
  }

  // Pulisci il codice 2FA dopo la verifica
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorCode: null },
  });

  return NextResponse.json(
    { message: "2FA verificata con successo" },
    { status: 200 }
  );
}
