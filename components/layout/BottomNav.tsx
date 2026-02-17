"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Plus, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/biblioteca", icon: Library, label: "Biblioteca" },
  { href: "/crear", icon: Plus, label: "Crear", fab: true },
  { href: "/perfil", icon: User, label: "Perfil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav md:hidden" aria-label="Navegacion principal">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.fab) {
            const fabActive = isActive || pathname === "/crear";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`bottom-nav-fab ${fabActive ? "bottom-nav-fab-active" : ""}`}
                aria-label="Crear cuento"
                aria-current={fabActive ? "page" : undefined}
              >
                <item.icon className="w-6 h-6" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${isActive ? "bottom-nav-item-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="w-5 h-5" />
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
