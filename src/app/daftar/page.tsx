"use client";

import { useEffect, useState, FormEvent } from "react";
import Brand from "@/components/Brand";
import NavPill from "@/components/NavPill";
import { supabase } from "@/lib/supabase";

type Bidang = { id: string; nama: string };

const UKURAN_MAKS_BYTE = 5 * 1024 * 1024; 
const TIPE_FILE_DIIZINKAN = ["application/pdf"];

const OPSI_LAINNYA = "__lainnya__";

const DAFTAR_KAMPUS_PEKANBARU = [
  "Universitas Riau (UNRI)",
  "UIN Sultan Syarif Kasim Riau (UIN Suska)",
  "Universitas Islam Riau (UIR)",
  "Universitas Muhammadiyah Riau (UMRI)",
  "Universitas Lancang Kuning (UNILAK)",
  "Universitas Abdurrab",
  "Politeknik Caltex Riau (PCR)",
  "STIKes Al-Insyirah Pekanbaru",
  "Universitas Terbuka Pekanbaru",
];

const DAFTAR_SMK_PEKANBARU = [
  "SMK Negeri 1 Pekanbaru",
  "SMK Negeri 2 Pekanbaru",
  "SMK Negeri 3 Pekanbaru",
  "SMK Negeri 6 Pekanbaru",
  "SMK Negeri 7 Pekanbaru",
  "SMK Muhammadiyah 2 Pekanbaru",
  "SMKS Darel Hikmah Pekanbaru",
];

export default function DaftarPage() {
  const [daftarBidang, setDaftarBidang] = useState<Bidang[]>([]);
  const [errorBidang, setErrorBidang] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [nomorPendaftaran, setNomorPendaftaran] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama_lengkap: "",
    email: "",
    no_hp: "",
    jenis_institusi: "kampus",
    asal_institusi: "",
    asal_institusi_lainnya: "",
    jurusan_prodi: "",
    bidang_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });
  const [fileSurat, setFileSurat] = useState<File | null>(null);
  const [errorFile, setErrorFile] = useState<string | null>(null);

  const opsiInstitusi =
    form.jenis_institusi === "kampus"
      ? DAFTAR_KAMPUS_PEKANBARU
      : DAFTAR_SMK_PEKANBARU;

  useEffect(() => {
    // Ditulis sebagai fungsi async terpisah (bukan langsung di badan
    // effect) supaya try/catch bekerja dengan benar untuk error jaringan,
    // dan supaya setState tidak dipanggil sinkron langsung di badan effect.
    let komponenMasihTerpasang = true;

    async function muatBidang() {
      try {
        const { data, error } = await supabase
          .from("bidang")
          .select("id, nama")
          .eq("aktif", true)
          .order("nama");

        if (!komponenMasihTerpasang) return;

        if (error) {
          console.error("Gagal memuat daftar bidang:", error);
          setErrorBidang(
            "Gagal memuat daftar bidang. Coba muat ulang halaman ini, atau hubungi staf kalau masih gagal."
          );
          return;
        }
        setDaftarBidang(data ?? []);
      } catch (err) {
        if (!komponenMasihTerpasang) return;
        console.error("Gagal terhubung ke server saat memuat bidang:", err);
        setErrorBidang("Terjadi kesalahan tak terduga saat memuat bidang.");
      }
    }

    muatBidang();
    return () => {
      komponenMasihTerpasang = false;
    };
  }, []);

  function ubahField(field: keyof typeof form, nilai: string) {
    setForm((f) => ({ ...f, [field]: nilai }));
  }

  function pilihFile(f: File | null) {
    setErrorFile(null);
    if (!f) {
      setFileSurat(null);
      return;
    }
    if (!TIPE_FILE_DIIZINKAN.includes(f.type)) {
      setErrorFile("Format file harus PDF, JPG, atau PNG.");
      setFileSurat(null);
      return;
    }
    if (f.size > UKURAN_MAKS_BYTE) {
      setErrorFile("Ukuran file maksimum 5MB.");
      setFileSurat(null);
      return;
    }
    setFileSurat(f);
  }

  async function kirimForm(e: FormEvent) {
    e.preventDefault();
    setPesanGagal(null);

    if (!fileSurat) {
      setErrorFile("Surat pengantar wajib diunggah.");
      return;
    }
    if (form.tanggal_selesai < form.tanggal_mulai) {
      setPesanGagal("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    const asalInstitusiFinal =
      form.asal_institusi === OPSI_LAINNYA
        ? form.asal_institusi_lainnya.trim()
        : form.asal_institusi;

    if (!asalInstitusiFinal) {
      setPesanGagal("Asal sekolah/kampus wajib diisi.");
      return;
    }

    setMengirim(true);
    try {
      const { data: hasilDaftar, error: errorInsert } = await supabase.rpc(
        "daftar_magang",
        {
          p_nama_lengkap: form.nama_lengkap,
          p_email: form.email,
          p_no_hp: form.no_hp,
          p_jenis_institusi: form.jenis_institusi,
          p_asal_institusi: asalInstitusiFinal,
          p_jurusan_prodi: form.jurusan_prodi || null,
          p_bidang_id: form.bidang_id,
          p_tanggal_mulai: form.tanggal_mulai,
          p_tanggal_selesai: form.tanggal_selesai,
        }
      );

      // rpc() dengan fungsi yang RETURNS TABLE mengembalikan array baris,
      // walau di sini kita tahu isinya cuma akan berisi 1 baris.
      const pendaftarBaru = hasilDaftar?.[0];

      if (errorInsert || !pendaftarBaru) {
        console.error("Gagal memanggil daftar_magang:", errorInsert);
        throw new Error(
          errorInsert?.message ??
            "Gagal menyimpan data pendaftaran. Periksa kembali isian formulir."
        );
      }

      const namaFileAman = fileSurat.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const pathFile = `${pendaftarBaru.id}/surat_pengantar-${Date.now()}-${namaFileAman}`;

      const { error: errorUpload } = await supabase.storage
        .from("dokumen-magang")
        .upload(pathFile, fileSurat);

      if (errorUpload) {
        setNomorPendaftaran(pendaftarBaru.nomor_pendaftaran);
        setPesanGagal(
          `Data pendaftaran tersimpan dengan nomor ${pendaftarBaru.nomor_pendaftaran}, namun dokumen gagal diunggah. ` +
            "Mohon hubungi staf Bidang Aptika dengan menyertakan nomor pendaftaran ini untuk mengirim dokumen secara manual."
        );
        return;
      }

      await supabase.from("dokumen_pendaftar").insert({
        pendaftar_id: pendaftarBaru.id,
        jenis_dokumen: "surat_pengantar",
        path_file: pathFile,
        nama_file_asli: fileSurat.name,
      });

      setNomorPendaftaran(pendaftarBaru.nomor_pendaftaran);
    } catch (err) {
      setPesanGagal(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan tak terduga. Silakan coba lagi."
      );
    } finally {
      setMengirim(false);
    }
  }

  if (nomorPendaftaran && !pesanGagal) {
    return (
      <div className="halaman">
        <div className="bungkus">
          <Brand />
          <NavPill />
          <div className="panel-glass panel-sukses">
            <p className="eyebrow">Pendaftaran berhasil</p>
            <h1 className="judul-hero" style={{ fontSize: 24, maxWidth: "none" }}>
              Simpan nomor pendaftaranmu untuk mengecek status
            </h1>
            <div className="nomor-pendaftaran-box">{nomorPendaftaran}</div>
            <p className="sub-hero" style={{ margin: "0 auto" }}>
              Gunakan nomor ini beserta email yang kamu daftarkan pada halaman
              Cek Status untuk memantau perkembangan pendaftaranmu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="halaman">
      <div className="bungkus">
        <Brand />
        <NavPill />

        <form className="panel-glass" onSubmit={kirimForm}>
          <p className="eyebrow">Formulir pendaftaran</p>
          <h1 className="judul-hero" style={{ fontSize: 26, maxWidth: "none" }}>
            Daftar magang / Kerja Praktek
          </h1>
          <p className="sub-hero" style={{ marginBottom: "1.75rem" }}>
            Lengkapi data berikut dan unggah surat pengantar dari
            sekolah/kampus. Data yang sudah dikirim akan diverifikasi oleh
            staf Bidang Aptika.
          </p>

          {pesanGagal && <div className="form-pesan-gagal">{pesanGagal}</div>}

          <div className="form-baris">
            <div className="form-grup">
              <label htmlFor="nama_lengkap">Nama lengkap</label>
              <input
                id="nama_lengkap"
                className="form-input"
                required
                value={form.nama_lengkap}
                onChange={(e) => ubahField("nama_lengkap", e.target.value)}
              />
            </div>
            <div className="form-grup">
              <label htmlFor="email">Email aktif</label>
              <input
                id="email"
                type="email"
                className="form-input"
                required
                value={form.email}
                onChange={(e) => ubahField("email", e.target.value)}
              />
            </div>
          </div>

          <div className="form-baris">
            <div className="form-grup">
              <label htmlFor="no_hp">Nomor HP/WhatsApp Aktif</label>
              <input
                id="no_hp"
                type="tel"
                className="form-input"
                required
                value={form.no_hp}
                onChange={(e) => ubahField("no_hp", e.target.value)}
              />
            </div>
            <div className="form-grup">
              <label htmlFor="jenis_institusi">Jenjang institusi</label>
              <select
                id="jenis_institusi"
                className="form-input"
                value={form.jenis_institusi}
                onChange={(e) => {
                  ubahField("jenis_institusi", e.target.value);
                  ubahField("asal_institusi", "");        
                  ubahField("asal_institusi_lainnya", ""); 
                }}
              >
                <option value="kampus">Perguruan tinggi</option>
                <option value="sekolah">SMK/Sekolah</option>
              </select>
            </div>
          </div>

          <div className="form-baris">
            <div className="form-grup">
              <label htmlFor="asal_institusi">Asal sekolah/kampus</label>
              <select
                id="asal_institusi"
                className="form-input"
                required
                value={form.asal_institusi}
                onChange={(e) => ubahField("asal_institusi", e.target.value)}
              >
                <option value="" disabled>
                  Pilih salah satu
                </option>
                {opsiInstitusi.map((nama) => (
                  <option key={nama} value={nama}>
                    {nama}
                  </option>
                ))}
                <option value={OPSI_LAINNYA}>Lainnya (isi manual)</option>
              </select>
              {form.asal_institusi === OPSI_LAINNYA && (
                <input
                  className="form-input"
                  style={{ marginTop: 8 }}
                  placeholder="Tulis nama sekolah/kampus kamu"
                  required
                  value={form.asal_institusi_lainnya}
                  onChange={(e) =>
                    ubahField("asal_institusi_lainnya", e.target.value)
                  }
                />
              )}
            </div>
            <div className="form-grup">
              <label htmlFor="jurusan_prodi">Jurusan/program studi</label>
              <input
                id="jurusan_prodi"
                className="form-input"
                placeholder="Opsional"
                value={form.jurusan_prodi}
                onChange={(e) => ubahField("jurusan_prodi", e.target.value)}
              />
            </div>
          </div>

          <div className="form-grup">
            <label htmlFor="bidang_id">Bidang yang diminati</label>
            <select
              id="bidang_id"
              className="form-input"
              required
              value={form.bidang_id}
              onChange={(e) => ubahField("bidang_id", e.target.value)}
            >
              <option value="" disabled>
                Pilih salah satu bidang
              </option>
              {daftarBidang.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama}
                </option>
              ))}
            </select>
            {errorBidang && <p className="form-error-teks">{errorBidang}</p>}
          </div>

          <div className="form-baris">
            <div className="form-grup">
              <label htmlFor="tanggal_mulai">Tanggal mulai magang</label>
              <input
                id="tanggal_mulai"
                type="date"
                className="form-input"
                required
                value={form.tanggal_mulai}
                onChange={(e) => ubahField("tanggal_mulai", e.target.value)}
              />
            </div>
            <div className="form-grup">
              <label htmlFor="tanggal_selesai">Tanggal selesai (perkiraan)</label>
              <input
                id="tanggal_selesai"
                type="date"
                className="form-input"
                required
                value={form.tanggal_selesai}
                onChange={(e) => ubahField("tanggal_selesai", e.target.value)}
              />
            </div>
          </div>

          <div className="form-grup">
            <label htmlFor="surat_pengantar">Surat pengantar (PDF, maks 5MB)</label>
            <input
              id="surat_pengantar"
              type="file"
              className="form-input"
              accept=".pdf"
              onChange={(e) => pilihFile(e.target.files?.[0] ?? null)}
            />
            {errorFile && <p className="form-error-teks">{errorFile}</p>}
          </div>

          <button type="submit" className="tombol" disabled={mengirim}>
            {mengirim ? "Mengirim..." : "Kirim pendaftaran"}
          </button>
        </form>
      </div>
    </div>
  );
}
