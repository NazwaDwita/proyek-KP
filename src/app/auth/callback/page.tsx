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

// Halaman transit setelah pengguna kembali dari Google. Dengan flow
// "implicit", token sesi sudah ada langsung di fragment URL
// (#access_token=...) begitu Google mengarahkan kembali ke sini -- client
// Supabase otomatis membacanya (detectSessionInUrl) tanpa perlu kode
// tambahan dari kita. Yang perlu dilakukan di sini cuma menunggu event
// itu selesai lalu mengarahkan pengguna ke Beranda. Kalau Google/Supabase
// menolak proses ini (mis. provider belum aktif), mereka mengirim balik
// ?error=...&error_description=... -- itu ditampilkan apa adanya.
export default function AuthCallback() {
  const router = useRouter();

  // Dihitung sekali saat render pertama (bukan lewat setState di dalam
  // effect) supaya tidak memicu "cascading render" yang diperingatkan
  // aturan react-hooks/set-state-in-effect.
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

    // Sesi biasanya sudah langsung tersedia begitu client Supabase
    // selesai membaca fragment URL -- tapi untuk jaga-jaga (timing di
    // browser bisa berbeda-beda), dengarkan juga event auth-nya.
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