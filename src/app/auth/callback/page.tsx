"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function terjemahkanErrorOAuth(kode: string | null, deskripsi: string | null): string {
  if (kode === "access_denied") {
    return "Kamu membatalkan proses masuk dengan Google.";
  }
  if (deskripsi) {
    return `Google/Supabase menolak permintaan ini: ${deskripsi}`;
  }
  return "Gagal masuk dengan Google. Kemungkinan provider Google belum diaktifkan di pengaturan Supabase, atau Redirect URL belum cocok.";
}

// Halaman transit setelah login Google. Supabase otomatis membaca token
// dari fragment URL; kita cuma tunggu sesi tersedia lalu redirect ke Beranda.
export default function AuthCallback() {
  const router = useRouter();

  // Baca error dari query string (kalau ada) sekali saat render pertama.
  const [pesanError, setPesanError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const url = new URL(window.location.href);
    const kodeError = url.searchParams.get("error") || url.searchParams.get("error_code");
    const deskripsiError = url.searchParams.get("error_description");
    if (kodeError) {
      console.error("OAuth callback error:", kodeError, deskripsiError);
      return terjemahkanErrorOAuth(kodeError, deskripsiError);
    }
    return null;
  });

  useEffect(() => {
    if (pesanError) return;

    // Dengarkan event auth untuk berjaga-jaga kalau sesi belum langsung tersedia.
    const { data: pelanggan } = supabase.auth.onAuthStateChange((event, sesi) => {
      if (sesi) {
        router.replace("/");
      }
    });

    let sudahDicoba = false;
    const batasWaktu = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
        return;
      }
      if (!sudahDicoba) {
        sudahDicoba = true;
        setPesanError(
          "Tidak berhasil mendeteksi sesi login dari Google setelah beberapa saat. Silakan coba lagi."
        );
      }
    }, 4000);

    return () => {
      pelanggan.subscription.unsubscribe();
      clearTimeout(batasWaktu);
    };
  }, [router, pesanError]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        {pesanError ? (
          <>
            <p className="text-sm text-red-600">{pesanError}</p>
            <a href="/akun/masuk" className="mt-3 inline-block text-sm text-primary underline">
              Kembali ke halaman masuk
            </a>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Menyelesaikan proses masuk...</p>
        )}
      </div>
    </div>
  );
}