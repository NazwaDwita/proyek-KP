"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "masuk" | "daftar";

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
  const [pesanError, setPesanError] = useState<string | null>(null);

  function resetSemua() {
    setMode("masuk");
    setEmail("");
    setNamaLengkap("");
    setPassword("");
    setKonfirmasiPassword("");
    setPesanError(null);
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
              <input
                id="masuk-password"
                type="password"
                className="form-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="tombol" disabled={memproses} style={{ width: "100%", justifyContent: "center" }}>
              {memproses ? "Memproses..." : "Masuk"}
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
              <input
                id="daftar-password"
                type="password"
                className="form-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="keterangan-field">Minimal 6 karakter.</p>
            </div>
            <div className="form-grup">
              <label htmlFor="daftar-konfirmasi">Konfirmasi password</label>
              <input
                id="daftar-konfirmasi"
                type="password"
                className="form-input"
                required
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="tombol" disabled={memproses} style={{ width: "100%", justifyContent: "center" }}>
              {memproses ? "Mendaftarkan..." : "Buat akun"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
