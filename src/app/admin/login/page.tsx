"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <form
        onSubmit={login}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-soft"
      >
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Landmark className="size-6" />
        </span>

        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-[color:var(--emas-tua)]">
          Khusus staf
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Login admin
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman ini untuk staf Bidang Aptika yang mengelola data pendaftaran
          magang.
        </p>

        {pesanError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            {pesanError}
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="password" className="mb-1.5 block text-sm text-muted-foreground">
            Kata sandi
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <button
          type="submit"
          disabled={masuk}
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {masuk ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
