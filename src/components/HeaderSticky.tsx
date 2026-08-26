"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Landmark, LogOut, Menu, User, X } from "lucide-react";
import { useSesi } from "@/lib/useSesi";
import { useSesiPendaftar } from "@/lib/SesiPendaftarContext";
import { useModalMasuk } from "@/lib/ModalMasukContext";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { href: "/", label: "Beranda" },
  { href: "/daftar", label: "Daftar magang" },
  { href: "/info", label: "Info" },
  { href: "/profil-dinas", label: "Profil Dinas" },
  { href: "/statistik", label: "Statistik" },
] as const;

export default function HeaderSticky() {
  const pathname = usePathname();
  const { sesi, memuat } = useSesi();
  const { punyaPendaftaranAktif } = useSesiPendaftar();
  const { bukaModalMasuk } = useModalMasuk();
  const router = useRouter();
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  async function keluar() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const itemTampil = menuItems.filter((item) => {
    if (item.href === "/daftar" && punyaPendaftaranAktif && sesi) return false;
    if (item.href === "/statistik" && !sesi) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold text-foreground">
              SIMAKRI
            </span>
            <span className="block text-xs text-muted-foreground">
              Sistem Magang Diskominfotik Riau
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {itemTampil.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground ${
                pathname === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {!memuat && (
            <>
              {!sesi ? (
                <button
                  type="button"
                  onClick={bukaModalMasuk}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Masuk / Daftar
                </button>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="size-4" />
                    {(sesi.user.user_metadata?.nama as string) || sesi.user.email}
                  </span>
                  <button
                    type="button"
                    onClick={keluar}
                    aria-label="Keluar dari akun"
                    title="Keluar"
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <LogOut className="size-4" />
                  </button>
                </div>
              )}
            </>
          )}

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
            {itemTampil.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuTerbuka(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground ${
                  pathname === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {sesi && (
              <button
                type="button"
                onClick={keluar}
                className="mt-1 flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <LogOut className="size-4" /> Keluar
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}