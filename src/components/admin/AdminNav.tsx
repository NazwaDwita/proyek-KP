"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Brand from "@/components/Brand";

const menuItems = [
  {
    href: "/admin/beranda",
    label: "Beranda",
    icon: (
      <>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
  },
  {
    href: "/admin/dashboard",
    label: "Data pendaftar",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
  },
  {
    href: "/admin/info",
    label: "Edit info",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
      </>
    ),
  },
  {
    href: "/admin/rekap",
    label: "Rekap data",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-6 4 4 5-8" />
      </>
    ),
  },
];

export default function AdminNav({ onKeluar }: { onKeluar: () => void }) {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);
  const [pathnameSebelumnya, setPathnameSebelumnya] = useState(pathname);

  if (pathname !== pathnameSebelumnya) {
    setPathnameSebelumnya(pathname);
    setTerbuka(false);
  }

  return (
    <div className="admin-header-statis">
      <div className="header-baris-atas">
        <Brand />
        <button
          type="button"
          className="tombol-ikon"
          onClick={onKeluar}
          title="Keluar"
          aria-label="Keluar dari akun admin"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>

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
          {menuItems.map((item) => (
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
    </div>
  );
}