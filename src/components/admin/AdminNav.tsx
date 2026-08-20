"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Home,
  Landmark,
  LogOut,
  Menu,
  Pencil,
  Users,
  X,
} from "lucide-react";

const menuItems = [
  { href: "/admin/beranda", label: "Beranda", icon: Home },
  { href: "/admin/dashboard", label: "Data pendaftar", icon: Users },
  { href: "/admin/info", label: "Edit info", icon: Pencil },
  { href: "/admin/rekap", label: "Rekap data", icon: BarChart3 },
] as const;

export default function AdminNav({ onKeluar }: { onKeluar: () => void }) {
  const pathname = usePathname();
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="flex w-full items-center gap-4 px-4 py-3 md:px-8">
        <Link href="/admin/beranda" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold text-foreground">
              SIMAKRI
            </span>
            <span className="block text-xs text-muted-foreground">
              Panel admin &middot; Diskominfotik Riau
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {menuItems.map((item) => {
            const aktif = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground ${
                  aktif ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <button
            type="button"
            onClick={onKeluar}
            title="Keluar"
            aria-label="Keluar dari akun admin"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <LogOut className="size-4" />
          </button>

          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md text-foreground lg:hidden"
            aria-label={menuTerbuka ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuTerbuka}
            onClick={() => setMenuTerbuka((t) => !t)}
          >
            {menuTerbuka ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuTerbuka && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const aktif = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuTerbuka(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground ${
                    aktif ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
