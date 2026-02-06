"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={session ? "/biblioteca" : "/"} className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <span className="font-bold text-xl text-purple-700">Cuentos IA</span>
        </Link>

        {session ? (
          <>
            {/* Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/crear" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">
                Crear cuento
              </Link>
              <Link href="/biblioteca" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">
                Mi biblioteca
              </Link>
              <Link href="/perfil" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">
                Mi perfil
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
              Registrarse
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {open && session && (
        <div className="md:hidden border-t border-orange-100 bg-white px-4 py-3 space-y-2">
          <Link href="/crear" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>
            Crear cuento
          </Link>
          <Link href="/biblioteca" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>
            Mi biblioteca
          </Link>
          <Link href="/perfil" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>
            Mi perfil
          </Link>
          <button
            onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
            className="block py-2 text-red-500 font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}
