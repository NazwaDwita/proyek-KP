import { createClient } from "@supabase/supabase-js";

// Client untuk komponen sisi browser/publik (form pendaftaran, cek status,
// statistik). Menggunakan anon key — aman dipakai di client karena akses
// datanya sudah dibatasi lewat Row Level Security + fungsi RPC
// (lihat supabase/migrations/).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// DIAGNOSTIK SEMENTARA — hapus setelah masalah dropdown bidang selesai.
// Menampilkan apakah env variable benar-benar terbaca saat runtime,
// tanpa membocorkan key penuh (cuma 6 karakter awal).
if (typeof window !== "undefined") {
  console.log("[debug supabase] URL:", supabaseUrl || "(KOSONG/undefined)");
  console.log(
    "[debug supabase] ANON KEY (6 char awal):",
    supabaseAnonKey ? supabaseAnonKey.slice(0, 6) + "..." : "(KOSONG/undefined)"
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[debug supabase] Environment variable belum terbaca! Cek file .env.local " +
      "dan pastikan dev server sudah di-restart setelah file itu dibuat/diubah."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key"
);
