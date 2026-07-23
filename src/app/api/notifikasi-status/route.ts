import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const LABEL_STATUS: Record<string, string> = {
  menunggu: "Menunggu",
  diverifikasi: "Diverifikasi",
  ditolak: "Ditolak",
};

export async function POST(req: NextRequest) {
  try {
    const { pendaftarId } = await req.json();
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

    if (!pendaftarId || !accessToken) {
      return NextResponse.json(
        { error: "pendaftarId dan token akses wajib diisi." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !resendApiKey) {
      console.error(
        "Env var belum lengkap: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / RESEND_API_KEY"
      );
      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    const supabaseSebagaiPemanggil = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false },
    });

    const { data: pendaftar, error: errorAmbil } = await supabaseSebagaiPemanggil
      .from("pendaftar")
      .select("nama_lengkap, email, nomor_pendaftaran, status, catatan_admin")
      .eq("id", pendaftarId)
      .single();

    if (errorAmbil || !pendaftar) {
      console.error("Gagal mengambil data pendaftar untuk notifikasi:", errorAmbil);
      return NextResponse.json(
        { error: "Data pendaftar tidak ditemukan atau akses ditolak." },
        { status: 403 }
      );
    }

    const labelStatus = LABEL_STATUS[pendaftar.status] ?? pendaftar.status;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1c2b3d;">
        <p>Halo ${escapeHtml(pendaftar.nama_lengkap)},</p>
        <p>Status pendaftaran magang kamu di <strong>Diskominfotik Provinsi Riau</strong>
        dengan nomor pendaftaran <strong>${escapeHtml(pendaftar.nomor_pendaftaran)}</strong>
        telah diperbarui menjadi:</p>
        <p style="font-size: 20px; font-weight: bold; margin: 16px 0;">${escapeHtml(labelStatus)}</p>
        ${
          pendaftar.catatan_admin
            ? `<p><strong>Catatan dari admin:</strong><br />${escapeHtml(pendaftar.catatan_admin)}</p>`
            : ""
        }
        <p>Cek detail lengkapnya kapan saja lewat halaman "Cek Status" di website kami.</p>
        <p style="margin-top: 28px; color: #6b7280; font-size: 12px;">
          Email ini dikirim otomatis oleh sistem, mohon tidak membalas ke alamat ini.
        </p>
      </div>
    `;

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const { error: errorKirim } = await resend.emails.send({
      from: `Portal Magang Diskominfotik Riau <${fromEmail}>`,
      to: pendaftar.email,
      subject: `Update status pendaftaran magang - ${pendaftar.nomor_pendaftaran}`,
      html,
    });

    if (errorKirim) {
      console.error("Gagal mengirim email lewat Resend:", errorKirim);
      return NextResponse.json({ error: "Gagal mengirim email." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error tak terduga di /api/notifikasi-status:", err);
    return NextResponse.json({ error: "Terjadi kesalahan tak terduga." }, { status: 500 });
  }
}

function escapeHtml(teks: string) {
  return teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}