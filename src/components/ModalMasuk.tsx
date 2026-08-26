"use client";

import { useState, useEffect, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mode = "masuk" | "daftar";

function IkonGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px] flex-shrink-0">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.4 0-13.8 4.1-17.1 10.2z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.6 35.6 26.9 36.5 24 36.5c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.2 40.5 16 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.4C41.5 35.6 45 30.2 45 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function terjemahkanError(pesan: string): string {
  if (pesan.includes("Invalid login credentials")) {
    return "Email atau password salah.";
  }
  if (pesan.includes("User already registered")) {
    return "Email ini sudah terdaftar. Silakan masuk, atau gunakan email lain.";
  }
  if (pesan.includes("Password should be at least")) {
    return "Password minimal 8 karakter, kombinasi huruf kapital, angka, dan simbol.";
  }
  return pesan;
}

function validasiKekuatanPassword(password: string): string | null {
  if (password.length < 8) {
    return "Password minimal 8 karakter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password harus mengandung minimal satu huruf kapital.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password harus mengandung minimal satu angka.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password harus mengandung minimal satu simbol (mis. ! @ # $ %).";
  }
  return null;
}

export default function ModalMasuk({
  terbuka,
  tutup,
}: {
  terbuka: boolean;
  tutup: () => void;
}) {
  const [mode, setMode] = useState<Mode>("masuk");

  const [email, setEmail] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [memproses, setMemproses] = useState(false);
  const [memprosesGoogle, setMemprosesGoogle] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const [lihatSandiMasuk, setLihatSandiMasuk] = useState(false);
  const [lihatSandiDaftar, setLihatSandiDaftar] = useState(false);
  const [lihatKonfirmasi, setLihatKonfirmasi] = useState(false);

  // Reset status Google jika halaman dimuat ulang dari cache browser (bfcache).
  useEffect(() => {
    function tanganiPageshow(e: PageTransitionEvent) {
      if (e.persisted) {
        setMemprosesGoogle(false);
      }
    }
    window.addEventListener("pageshow", tanganiPageshow);
    return () => window.removeEventListener("pageshow", tanganiPageshow);
  }, []);

  async function masukGoogle() {
    setMemprosesGoogle(true);
    setPesanError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Gagal masuk dengan Google:", error);
      setPesanError(
        "Masuk dengan Google belum bisa dipakai saat ini. Silakan pakai email dan kata sandi."
      );
      setMemprosesGoogle(false);
    }
  }

  function resetSemua() {
    setMode("masuk");
    setEmail("");
    setNamaLengkap("");
    setPassword("");
    setKonfirmasiPassword("");
    setPesanError(null);
    setLihatSandiMasuk(false);
    setLihatSandiDaftar(false);
    setLihatKonfirmasi(false);
  }

  function tutupDanReset() {
    tutup();
    setTimeout(resetSemua, 200);
  }

  function pindahMode(modeBaru: Mode) {
    setMode(modeBaru);
    setPesanError(null);
  }

  async function submitMasuk(e: FormEvent) {
    e.preventDefault();
    setMemproses(true);
    setPesanError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Gagal masuk:", error);
        setPesanError(terjemahkanError(error.message));
        return;
      }

      tutupDanReset();
    } catch (err) {
      console.error("Error tak terduga saat masuk:", err);
      setPesanError(
        "Terjadi kesalahan koneksi ke server. Periksa koneksi internet kamu dan coba lagi."
      );
    } finally {
      setMemproses(false);
    }
  }

  async function submitDaftar(e: FormEvent) {
    e.preventDefault();
    setPesanError(null);

    if (namaLengkap.trim().length < 2) {
      setPesanError("Masukkan nama kamu terlebih dahulu.");
      return;
    }
    const errorKekuatan = validasiKekuatanPassword(password);
    if (errorKekuatan) {
      setPesanError(errorKekuatan);
      return;
    }
    if (password !== konfirmasiPassword) {
      setPesanError("Konfirmasi password tidak cocok.");
      return;
    }

    setMemproses(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nama: namaLengkap.trim(),
          },
        },
      });

      if (error) {
        console.error("Gagal daftar:", error);
        setPesanError(terjemahkanError(error.message));
        return;
      }

      if (!data.session) {
        // Penanganan jika verifikasi email Supabase diaktifkan.
        setPesanError(
          "Akun berhasil dibuat, tapi belum bisa langsung masuk. Hubungi admin untuk memeriksa pengaturan verifikasi email."
        );
        return;
      }

      tutupDanReset();
    } catch (err) {
      console.error("Error tak terduga saat daftar:", err);
      setPesanError(
        "Terjadi kesalahan koneksi ke server. Periksa koneksi internet kamu dan coba lagi."
      );
    } finally {
      setMemproses(false);
    }
  }

  if (!terbuka) return null;

  const judul = mode === "masuk" ? "Masuk ke akunmu" : "Buat akun baru";

  const kelasInput =
    "w-full rounded-[10px] border border-primary/15 bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:border-primary focus:outline-none";
  const kelasLabel = "mb-1.5 block text-[13px] text-muted-foreground";
  const kelasKeterangan = "mt-1 text-xs text-muted-foreground/75";
  const kelasTombolUtama =
    "flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";
  const kelasTombolGoogle =
    "flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-primary/15 bg-card py-[11px] text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60";
  const kelasTombolLihatSandi =
    "mr-1 flex w-[34px] flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground";

  const pemisah = (
    <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      <span className="h-px flex-1 bg-primary/10" />
      Atau
      <span className="h-px flex-1 bg-primary/10" />
    </div>
  );

  const tombolGoogle = (
    <button type="button" className={kelasTombolGoogle} onClick={masukGoogle} disabled={memprosesGoogle}>
      <IkonGoogle />
      {memprosesGoogle ? "Mengalihkan ke Google..." : "Lanjutkan dengan Google"}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/45 p-5 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) tutupDanReset();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-primary/10 bg-card p-7 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Masuk / Buat akun
            </p>
            <h2 className="mb-2 mt-1 font-display text-[22px] font-semibold text-foreground">
              {judul}
            </h2>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground"
            onClick={tutupDanReset}
            aria-label="Tutup"
          >
            &times;
          </button>
        </div>

        <div className="mb-6 mt-5 flex gap-1 rounded-full border border-primary/10 bg-primary/5 p-1">
          <button
            type="button"
            onClick={() => pindahMode("masuk")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13.5px] font-medium transition ${
              mode === "masuk"
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
            Masuk
          </button>
          <button
            type="button"
            onClick={() => pindahMode("daftar")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13.5px] font-medium transition ${
              mode === "daftar"
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </svg>
            Daftar
          </button>
        </div>

        {mode === "masuk" ? (
          <form onSubmit={submitMasuk}>
            {pesanError && (
              <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] text-red-700">
                {pesanError}
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="masuk-email" className={kelasLabel}>
                Alamat email
              </label>
              <input
                id="masuk-email"
                type="email"
                className={kelasInput}
                required
                autoFocus
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label htmlFor="masuk-password" className={kelasLabel}>
                Password
              </label>
              <div className="flex items-stretch rounded-[10px] border border-primary/15 bg-card transition focus-within:border-primary">
                <input
                  id="masuk-password"
                  type={lihatSandiMasuk ? "text" : "password"}
                  className="min-w-0 flex-1 rounded-[10px] border-none bg-transparent px-3.5 py-2.5 pr-2 text-sm text-foreground focus:outline-none"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={kelasTombolLihatSandi}
                  onClick={() => setLihatSandiMasuk((v) => !v)}
                  aria-label={lihatSandiMasuk ? "Sembunyikan password" : "Tampilkan password"}
                  tabIndex={-1}
                >
                  {lihatSandiMasuk ? <EyeOff className="h-[15px] w-[15px]" /> : <Eye className="h-[15px] w-[15px]" />}
                </button>
              </div>
            </div>

            <button type="submit" className={kelasTombolUtama} disabled={memproses}>
              {memproses ? "Memproses..." : "Masuk"}
            </button>

            {pemisah}
            {tombolGoogle}
          </form>
        ) : (
          <form onSubmit={submitDaftar}>
            {pesanError && (
              <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] text-red-700">
                {pesanError}
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="daftar-nama" className={kelasLabel}>
                Nama lengkap
              </label>
              <input
                id="daftar-nama"
                type="text"
                className={kelasInput}
                required
                autoFocus
                placeholder="Nama kamu"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
              />
              <p className={kelasKeterangan}>
                Nama ini akan ditampilkan di Beranda, bukan email kamu.
              </p>
            </div>
            <div className="mb-5">
              <label htmlFor="daftar-email" className={kelasLabel}>
                Alamat email
              </label>
              <input
                id="daftar-email"
                type="email"
                className={kelasInput}
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label htmlFor="daftar-password" className={kelasLabel}>
                Password
              </label>
              <div className="flex items-stretch rounded-[10px] border border-primary/15 bg-card transition focus-within:border-primary">
                <input
                  id="daftar-password"
                  type={lihatSandiDaftar ? "text" : "password"}
                  className="min-w-0 flex-1 rounded-[10px] border-none bg-transparent px-3.5 py-2.5 pr-2 text-sm text-foreground focus:outline-none"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={kelasTombolLihatSandi}
                  onClick={() => setLihatSandiDaftar((v) => !v)}
                  aria-label={lihatSandiDaftar ? "Sembunyikan password" : "Tampilkan password"}
                  tabIndex={-1}
                >
                  {lihatSandiDaftar ? <EyeOff className="h-[15px] w-[15px]" /> : <Eye className="h-[15px] w-[15px]" />}
                </button>
              </div>
              <p className={kelasKeterangan}>Minimal 8 karakter, kombinasi huruf kapital, angka, dan simbol.</p>
            </div>
            <div className="mb-5">
              <label htmlFor="daftar-konfirmasi" className={kelasLabel}>
                Konfirmasi password
              </label>
              <div className="flex items-stretch rounded-[10px] border border-primary/15 bg-card transition focus-within:border-primary">
                <input
                  id="daftar-konfirmasi"
                  type={lihatKonfirmasi ? "text" : "password"}
                  className="min-w-0 flex-1 rounded-[10px] border-none bg-transparent px-3.5 py-2.5 pr-2 text-sm text-foreground focus:outline-none"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={kelasTombolLihatSandi}
                  onClick={() => setLihatKonfirmasi((v) => !v)}
                  aria-label={lihatKonfirmasi ? "Sembunyikan password" : "Tampilkan password"}
                  tabIndex={-1}
                >
                  {lihatKonfirmasi ? <EyeOff className="h-[15px] w-[15px]" /> : <Eye className="h-[15px] w-[15px]" />}
                </button>
              </div>
            </div>

            <button type="submit" className={kelasTombolUtama} disabled={memproses}>
              {memproses ? "Mendaftarkan..." : "Buat akun"}
            </button>

            {pemisah}
            {tombolGoogle}
          </form>
        )}
      </div>
    </div>
  );
}