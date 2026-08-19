"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mode = "masuk" | "daftar";

function IkonGoogle() {
  return (
    <svg viewBox="0 0 48 48">
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
    return "Password minimal 6 karakter.";
  }
  return pesan;
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

  async function masukGoogle() {
    setMemprosesGoogle(true);
    setPesanError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
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
    if (password.length < 6) {
      setPesanError("Password minimal 6 karakter.");
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
        // Ini terjadi kalau "Confirm email" di Supabase masih aktif.
        // Seharusnya sudah dimatikan supaya bisa langsung login.
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

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) tutupDanReset();
      }}
    >
      <div className="modal-isi" style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="eyebrow">Masuk / Buat akun</p>
            <h2 className="judul-hero" style={{ fontSize: 22, maxWidth: "none", marginBottom: "0.5rem" }}>
              {judul}
            </h2>
          </div>
          <button type="button" className="modal-tutup" onClick={tutupDanReset} aria-label="Tutup">
            &times;
          </button>
        </div>

        <div className="toggle-mode">
          <button
            type="button"
            className={mode === "masuk" ? "aktif" : ""}
            onClick={() => pindahMode("masuk")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
            Masuk
          </button>
          <button
            type="button"
            className={mode === "daftar" ? "aktif" : ""}
            onClick={() => pindahMode("daftar")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </svg>
            Daftar
          </button>
        </div>

        {mode === "masuk" ? (
          <form onSubmit={submitMasuk}>
            {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}

            <div className="form-grup">
              <label htmlFor="masuk-email">Alamat email</label>
              <input
                id="masuk-email"
                type="email"
                className="form-input"
                required
                autoFocus
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-grup">
              <label htmlFor="masuk-password">Password</label>
              <div className="input-sandi-bungkus">
                <input
                  id="masuk-password"
                  type={lihatSandiMasuk ? "text" : "password"}
                  className="form-input"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="tombol-lihat-sandi"
                  onClick={() => setLihatSandiMasuk((v) => !v)}
                  aria-label={lihatSandiMasuk ? "Sembunyikan password" : "Tampilkan password"}
                  tabIndex={-1}
                >
                  {lihatSandiMasuk ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button type="submit" className="tombol" disabled={memproses} style={{ width: "100%", justifyContent: "center" }}>
              {memproses ? "Memproses..." : "Masuk"}
            </button>

            <div className="pemisah-atau">Atau</div>

            <button
              type="button"
              className="tombol-google"
              onClick={masukGoogle}
              disabled={memprosesGoogle}
            >
              <IkonGoogle />
              {memprosesGoogle ? "Mengalihkan ke Google..." : "Lanjutkan dengan Google"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitDaftar}>
            {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}

            <div className="form-grup">
              <label htmlFor="daftar-nama">Nama lengkap</label>
              <input
                id="daftar-nama"
                type="text"
                className="form-input"
                required
                autoFocus
                placeholder="Nama kamu"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
              />
              <p className="keterangan-field">
                Nama ini akan ditampilkan di Beranda, bukan email kamu.
              </p>
            </div>
            <div className="form-grup">
              <label htmlFor="daftar-email">Alamat email</label>
              <input
                id="daftar-email"
                type="email"
                className="form-input"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-grup">
              <label htmlFor="daftar-password">Password</label>
              <div className="input-sandi-bungkus">
                <input
                  id="daftar-password"
                  type={lihatSandiDaftar ? "text" : "password"}
                  className="form-input"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="tombol-lihat-sandi"
                  onClick={() => setLihatSandiDaftar((v) => !v)}
                  aria-label={lihatSandiDaftar ? "Sembunyikan password" : "Tampilkan password"}
                  tabIndex={-1}
                >
                  {lihatSandiDaftar ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <p className="keterangan-field">Minimal 6 karakter.</p>
            </div>
            <div className="form-grup">
              <label htmlFor="daftar-konfirmasi">Konfirmasi password</label>
              <div className="input-sandi-bungkus">
                <input
                  id="daftar-konfirmasi"
                  type={lihatKonfirmasi ? "text" : "password"}
                  className="form-input"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="tombol-lihat-sandi"
                  onClick={() => setLihatKonfirmasi((v) => !v)}
                  aria-label={lihatKonfirmasi ? "Sembunyikan password" : "Tampilkan password"}
                  tabIndex={-1}
                >
                  {lihatKonfirmasi ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button type="submit" className="tombol" disabled={memproses} style={{ width: "100%", justifyContent: "center" }}>
              {memproses ? "Mendaftarkan..." : "Buat akun"}
            </button>

            <div className="pemisah-atau">Atau</div>

            <button
              type="button"
              className="tombol-google"
              onClick={masukGoogle}
              disabled={memprosesGoogle}
            >
              <IkonGoogle />
              {memprosesGoogle ? "Mengalihkan ke Google..." : "Lanjutkan dengan Google"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}