"use client";

import { useEffect, useRef, useState } from "react";
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

// Halaman transit setelah pengguna kembali dari Google. Supabase (mode
// PKCE) mengirim kode di query string (?code=...) yang perlu ditukar jadi
// sesi login lewat exchangeCodeForSession -- baru setelah itu pengguna
// diarahkan kembali ke Beranda. Kalau Google/Supabase menolak proses ini
// (mis. provider belum aktif, atau Redirect URL belum terdaftar), mereka
// mengirim balik ?error=...&error_description=... -- itu ditampilkan
// apa adanya di sini, bukan didiamkan lalu diam-diam kembali ke Beranda.
export default function AuthCallback() {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const sudahDiproses = useRef(false);

  useEffect(() => {
    // Di mode development, React (Strict Mode) sengaja menjalankan effect
    // dua kali untuk mendeteksi bug. Kode & code-verifier PKCE cuma bisa
    // dipakai SEKALI -- kalau selesaikanMasuk() jalan dua kali, percobaan
    // kedua akan gagal dengan "code verifier not found" walau yang
    // pertama sukses. Ref ini memastikan proses tukar-sesi cuma jalan
    // sekali walau effect-nya terpanggil berkali-kali.
    if (sudahDiproses.current) return;
    sudahDiproses.current = true;

    async function selesaikanMasuk() {
      try {
        const url = new URL(window.location.href);
        const kodeError = url.searchParams.get("error") || url.searchParams.get("error_code");
        const deskripsiError = url.searchParams.get("error_description");

        if (kodeError) {
          console.error("OAuth callback error:", kodeError, deskripsiError);
          setPesanError(terjemahkanErrorOAuth(kodeError, deskripsiError));
          return;
        }

        if (url.searchParams.has("code")) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );

          if (error) {
            console.error("Gagal menukar kode OAuth jadi sesi:", error);
            setPesanError(
              "Gagal menyelesaikan proses masuk dengan Google: " + error.message
            );
            return;
          }

          if (!data.session) {
            setPesanError(
              "Proses dengan Google selesai, tapi sesi login tidak terbentuk. Silakan coba lagi."
            );
            return;
          }
        } else {
          // Tidak ada ?code= maupun ?error= -- kemungkinan halaman ini
          // dibuka langsung, bukan lewat redirect dari Google.
          setPesanError(
            "Halaman ini seharusnya diakses lewat proses masuk dengan Google, bukan dibuka langsung."
          );
          return;
        }

        router.replace("/");
      } catch (err) {
        console.error("Error tak terduga di auth callback:", err);
        setPesanError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      }
    }

    selesaikanMasuk();
  }, [router]);

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