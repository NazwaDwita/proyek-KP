"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masuk, setMasuk] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [mengecekSesi, setMengecekSesi] = useState(true);

  useEffect(() => {
    // Kalau sudah login sebelumnya (sesi masih ada), langsung lempar
    // ke dashboard tanpa perlu login ulang.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          router.replace("/admin/beranda");
        } else {
          setMengecekSesi(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memeriksa sesi:", err);
        setMengecekSesi(false);
      });
  }, [router]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setPesanError(null);
    setMasuk(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setPesanError("Email atau kata sandi salah.");
        return;
      }

      // Login Supabase Auth berhasil BUKAN berarti otomatis admin —
      // wajib dicek lagi apakah user ini terdaftar di admin_pengguna.
      // Kalau tidak, RLS akan memblokir semua query di dashboard,
      // jadi lebih baik dicek eksplisit di sini dan kasih pesan jelas.
      const { data: dataAdmin, error: errorAdmin } = await supabase
        .from("admin_pengguna")
        .select("id")
        .maybeSingle();

      if (errorAdmin || !dataAdmin) {
        setPesanError(
          "Akun ini tidak memiliki akses admin. Hubungi staf lain untuk didaftarkan."
        );
        await supabase.auth.signOut();
        return;
      }

      router.replace("/admin/beranda");
    } catch {
      setPesanError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
    } finally {
      setMasuk(false);
    }
  }

  if (mengecekSesi) {
    return null;
  }

  return (
    <div className="halaman">
      <div className="bungkus" style={{ maxWidth: 420 }}>
        <form className="panel-glass" onSubmit={login}>
          <p className="eyebrow">Khusus staf</p>
          <h1 className="judul-hero" style={{ fontSize: 24, maxWidth: "none" }}>
            Login admin
          </h1>
          <p className="sub-hero" style={{ marginBottom: "1.5rem" }}>
            Halaman ini untuk staf Bidang Aptika yang mengelola data
            pendaftaran magang.
          </p>

          {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}

          <div className="form-grup">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-grup">
            <label htmlFor="password">Kata sandi</label>
            <input
              id="password"
              type="password"
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="tombol" disabled={masuk}>
            {masuk ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}