import { createClient } from "@supabase/supabase-js";

// Client untuk komponen sisi browser/publik (form pendaftaran, cek status,
// statistik). Menggunakan anon key — aman dipakai di client karena akses
// datanya sudah dibatasi lewat Row Level Security + fungsi RPC
// (lihat supabase/migrations/).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
