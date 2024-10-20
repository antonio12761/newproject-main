"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Importa il router per conoscere la pagina corrente
import ThemeToggle from "./ThemeToggle";
import { signOut, useSession } from "next-auth/react"; // Importa signOut e useSession

const Header = () => {
  const pathname = usePathname(); // Ottieni il percorso corrente
  const { data: session } = useSession(); // Ottieni lo stato della sessione

  // Condizione per nascondere i pulsanti "Login" e "Register" su /auth e /dashboard
  const isAuthOrDashboard =
    pathname.startsWith("/auth") || pathname.startsWith("/dashboard");

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
      {/* Logo o nome sito */}
      <div className="text-xl font-bold">
        <Link href="/">MyApp</Link>
      </div>

      <div className="flex items-center">
        {/* Mostra i pulsanti Login e Register solo se non siamo su auth o dashboard e non siamo loggati */}
        {!isAuthOrDashboard && !session && (
          <div className="mr-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="ml-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Registrati
            </Link>
          </div>
        )}

        {/* Mostra il pulsante Logout solo se l'utente è loggato e siamo sulla pagina dashboard */}
        {session && pathname.startsWith("/dashboard") && (
          <button
            onClick={() => signOut()}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        )}

        {/* Sun/Moon Toggle visibile su tutte le pagine */}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
