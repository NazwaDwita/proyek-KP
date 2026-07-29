"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSesi } from "@/lib/useSesi";
import { supabase } from "@/lib/supabase";

const menuItems = [
  {
    href: "/",
    label: "Beranda",
    icon: (
      <>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
  },
  {
    href: "/daftar",
    label: "Daftar magang",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
  },
  {
    href: "/info",
    label: "Info dan ketentuan",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
      </>
    ),
  },
  {
    href: "/profil-dinas",
    label: "Profil dinas",
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 9h1M9 13h1M14 9h1M14 13h1" />
      </>
    ),
  },
];

export default function NavPill() {
  const pathname = usePathname();
  const { sesi } = useSesi();
  const [terbuka, setTerbuka] = useState(false);
  const [pathnameSebelumnya, setPathnameSebelumnya] = useState(pathname);
  const [sudahDiterima, setSudahDiterima] = useState(false);

  if (pathname !== pathnameSebelumnya) {
    setPathnameSebelumnya(pathname);
    setTerbuka(false);
  }

  useEffect(() => {
    if (!sesi) return;

    let masihTerpasang = true;

    async function cekStatusDiterima() {
      const { data, error } = await supabase
        .from("pendaftar")
        .select("id")
        .eq("user_id", sesi!.user.id)
        .eq("status", "diverifikasi")
        .limit(1)
        .maybeSingle();

      if (!masihTerpasang) return;
      if (error) {
        console.error("Gagal memeriksa status pendaftaran:", error);
        return;
      }
      setSudahDiterima(!!data);
    }

    cekStatusDiterima();
    return () => {
      masihTerpasang = false;
    };
  }, [sesi]);

  // Link "Daftar magang" cuma disembunyikan kalau pendaftar sudah
  // berstatus Diterima -- kalau masih Menunggu atau Ditolak, link ini
  // tetap perlu tampil (Ditolak butuh jalan buat daftar ulang). Ikut
  // syarat `sesi` di sini (bukan cuma reset state di effect) supaya
  // begitu logout, link ini otomatis muncul lagi tanpa perlu setState
  // tambahan yang bisa memicu cascading render.
  const itemTampil = menuItems.filter(
    (item) => !(item.href === "/daftar" && sudahDiterima && sesi)
  );

  return (
    <div className="nav-wrapper">
      <button
        type="button"
        className="nav-hamburger"
        aria-label={terbuka ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={terbuka}
        onClick={() => setTerbuka((t) => !t)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          {terbuka ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </>
          )}
        </svg>
      </button>

      <nav className={`nav-pill${terbuka ? " nav-pill-terbuka" : ""}`}>
        {itemTampil.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "aktif" : ""}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {item.icon}
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}