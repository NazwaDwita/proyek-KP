"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import HeaderSticky from "@/components/HeaderSticky";
import { supabase } from "@/lib/supabase";

type Tahap = "email" | "kode";

export default function MasukPage() {
  const router = useRouter();
  const [tahap, setTahap] = useState<Tahap>("email");
  const [email, setEmail] = useState("");
  const [kode, setKode] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  async function kirimKode(e: FormEvent) {
    e.preventDefault();
    setMemproses(true);
    setPesanError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
      },
    });

    setMemproses(false);

    if (error) {
      console.error("Gagal mengirim kode:", error);
      setPesanError(
        "Gagal mengirim kode verifikasi. Periksa kembali alamat email, lalu coba lagi."
      );
      return;
    }

    setTahap("kode");
  }

  async function verifikasiKode(e: FormEvent) {
    e.preventDefault();
    setMemproses(true);
    setPesanError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: kode.trim(),
      type: "email",
    });

    setMemproses(false);

    if (error) {
      console.error("Gagal verifikasi kode:", error);
      setPesanError(
        "Kode salah atau sudah kedaluwarsa. Periksa kembali, atau minta kode baru."
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function kirimUlang() {
    setMemproses(true);
    setPesanError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setMemproses(false);
    if (error) {
      setPesanError("Gagal mengirim ulang kode. Coba lagi sebentar.");
    }
  }

  return (
    <div className="halaman">
      <div className="bungkus">
        <HeaderSticky />

        <div className="panel-glass">
          <p className="eyebrow">Masuk / Buat akun</p>
          <h1 className="judul-hero" style={{ fontSize: 26, maxWidth: "none" }}>
            {tahap === "email"
              ? "Masuk untuk mendaftar magang"
              : "Masukkan kode verifikasi"}
          </h1>

          {tahap === "email" ? (
            <>
              <p className="sub-hero" style={{ marginBottom: "1.75rem" }}>
                Tidak perlu membuat kata sandi. Masukkan email kamu, kami
                akan mengirimkan kode verifikasi 6 digit. Kalau email ini
                belum pernah dipakai, akun baru akan otomatis dibuat.
              </p>

              <form onSubmit={kirimKode}>
                {pesanError && (
                  <div className="form-pesan-gagal">{pesanError}</div>
                )}

                <div className="form-grup">
                  <label htmlFor="email">Alamat email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="tombol" disabled={memproses}>
                  {memproses ? "Mengirim..." : "Kirim kode verifikasi"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="sub-hero" style={{ marginBottom: "1.75rem" }}>
                Kode verifikasi sudah dikirim ke <strong>{email}</strong>.
                Masukkan kode 6 digit dari email tersebut di bawah ini.
              </p>

              <form onSubmit={verifikasiKode}>
                {pesanError && (
                  <div className="form-pesan-gagal">{pesanError}</div>
                )}

                <div className="form-grup">
                  <label htmlFor="kode">Kode verifikasi</label>
                  <input
                    id="kode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="form-input"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    style={{ letterSpacing: "0.3em", fontSize: 18 }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button type="submit" className="tombol" disabled={memproses}>
                    {memproses ? "Memverifikasi..." : "Masuk"}
                  </button>
                  <button
                    type="button"
                    className="tombol sekunder"
                    onClick={kirimUlang}
                    disabled={memproses}
                  >
                    Kirim ulang kode
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={() => {
                  setTahap("email");
                  setKode("");
                  setPesanError(null);
                }}
                style={{
                  marginTop: "1.25rem",
                  background: "none",
                  border: "none",
                  color: "var(--teks-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                &larr; Ganti email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
