"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "masuk" | "daftar" | "verifikasi";

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
  if (pesan.includes("Token has expired") || pesan.includes("invalid")) {
    return "Kode salah atau sudah kedaluwarsa. Periksa kembali, atau minta kode baru.";
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
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [kode, setKode] = useState("");

  const [memproses, setMemproses] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanInfo, setPesanInfo] = useState<string | null>(null);

  function resetSemua() {
    setMode("masuk");
    setEmail("");
    setPassword("");
    setKonfirmasiPassword("");
    setKode("");
    setPesanError(null);
    setPesanInfo(null);
  }

  function tutupDanReset() {
    tutup();
    setTimeout(resetSemua, 200);
  }

  function pindahMode(modeBaru: Mode) {
    setMode(modeBaru);
    setPesanError(null);
    setPesanInfo(null);
  }

  async function submitMasuk(e: FormEvent) {
    e.preventDefault();
    setMemproses(true);
    setPesanError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setMemproses(false);

    if (error) {
      console.error("Gagal masuk:", error);

      if (error.message.includes("Email not confirmed")) {
        setPesanInfo(
          "Akun ini belum diverifikasi. Kami kirim ulang kode verifikasi ke emailmu."
        );
        await supabase.auth.resend({ type: "signup", email: email.trim() });
        setMode("verifikasi");
        return;
      }

      setPesanError(terjemahkanError(error.message));
      return;
    }

    tutupDanReset();
  }

  async function submitDaftar(e: FormEvent) {
    e.preventDefault();
    setPesanError(null);

    if (password.length < 6) {
      setPesanError("Password minimal 6 karakter.");
      return;
    }
    if (password !== konfirmasiPassword) {
      setPesanError("Konfirmasi password tidak cocok.");
      return;
    }

    setMemproses(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setMemproses(false);

    if (error) {
      console.error("Gagal daftar:", error);
      setPesanError(terjemahkanError(error.message));
      return;
    }

    setMode("verifikasi");
  }

  async function submitVerifikasi(e: FormEvent) {
    e.preventDefault();
    setMemproses(true);
    setPesanError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: kode.trim(),
      type: "signup",
    });

    setMemproses(false);

    if (error) {
      console.error("Gagal verifikasi:", error);
      setPesanError(terjemahkanError(error.message));
      return;
    }

    tutupDanReset();
  }

  async function kirimUlangKode() {
    setMemproses(true);
    setPesanError(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
    });
    setMemproses(false);
    if (error) {
      setPesanError("Gagal mengirim ulang kode. Coba lagi sebentar.");
    } else {
      setPesanInfo("Kode baru sudah dikirim.");
    }
  }

  if (!terbuka) return null;

  const judul =
    mode === "masuk"
      ? "Masuk ke akunmu"
      : mode === "daftar"
      ? "Buat akun baru"
      : "Verifikasi email";

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

        {mode !== "verifikasi" && (
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
        )}

        {mode === "masuk" && (
          <form onSubmit={submitMasuk}>
            {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}
            {pesanInfo && !pesanError && (
              <div className="info-placeholder" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
                {pesanInfo}
              </div>
            )}

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
        )}

        {mode === "daftar" && (
          <form onSubmit={submitDaftar}>
            {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}

            <div className="form-grup">
              <label htmlFor="daftar-email">Alamat email</label>
              <input
                id="daftar-email"
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

        {mode === "verifikasi" && (
          <form onSubmit={submitVerifikasi}>
            <p className="sub-hero" style={{ marginBottom: "1.5rem" }}>
              Kode verifikasi sudah dikirim ke <strong>{email}</strong>.
              Masukkan kode 6 digit dari email tersebut untuk mengaktifkan
              akunmu.
            </p>

            {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}
            {pesanInfo && !pesanError && (
              <div className="info-placeholder" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
                {pesanInfo}
              </div>
            )}

            <div className="form-grup">
              <label htmlFor="kode-verifikasi">Kode verifikasi</label>
              <input
                id="kode-verifikasi"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="form-input"
                required
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                style={{ letterSpacing: "0.3em", fontSize: 18 }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="tombol" disabled={memproses} style={{ flex: 1, justifyContent: "center" }}>
                {memproses ? "Memverifikasi..." : "Verifikasi"}
              </button>
              <button type="button" className="tombol sekunder" onClick={kirimUlangKode} disabled={memproses}>
                Kirim ulang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
