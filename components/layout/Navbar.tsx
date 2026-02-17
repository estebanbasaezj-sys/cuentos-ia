"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Plus,
  Library,
  User,
  LogOut,
} from "lucide-react";
import CreditCounter from "@/components/CreditCounter";
import SofiaLogo from "@/components/SofiaLogo";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50">
      {/* Decorative gradient line */}
      <div className="h-1 bg-gradient-to-r from-brand-600 via-amber-400 to-brand-400" />

      <div className="glass border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <Link href={session ? "/biblioteca" : "/"} className="group">
            <SofiaLogo size="small" />
          </Link>

          {session ? (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/crear" icon={<Plus className="w-4 h-4" />}>
                  Crear cuento
                </NavLink>
                <NavLink href="/biblioteca" icon={<Library className="w-4 h-4" />}>
                  Mi biblioteca
                </NavLink>
                <NavLink href="/perfil" icon={<User className="w-4 h-4" />}>
                  Mi perfil
                </NavLink>
                <div className="ml-2">
                  <CreditCounter />
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-2 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                  title="Cerrar sesion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile: just credit counter (nav is in bottom bar) */}
              <div className="md:hidden">
                <CreditCounter />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-brand-700 hover:text-brand-900 font-heading font-bold text-sm transition-colors"
              >
                Iniciar sesion
              </Link>
              <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-heading font-bold text-gray-600 hover:text-brand-700 hover:bg-brand-50 transition-all duration-200"
    >
      {icon}
      {children}
    </Link>
  );
}
