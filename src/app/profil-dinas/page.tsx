import { Building2, Compass, Mail, MapPin, Phone, Target } from "lucide-react";
import HeaderSticky from "@/components/HeaderSticky";
import StrukturOrganisasi from "@/components/StrukturOrganisasi";
import Footer from "@/components/Footer";

const BIDANG = [
  {
    nama: "Bidang Aplikasi & Informatika",
    deskripsi: "Pengembangan aplikasi, sistem informasi, dan layanan digital pemerintah.",
  },
  {
    nama: "Bidang Infrastruktur Teknologi Informasi dan Komunikasi",
    deskripsi: "Infrastruktur jaringan, keamanan sistem, dan dukungan teknis TIK.",
  },
  {
    nama: "Bidang Informasi dan Komunikasi Publik",
    deskripsi:
      "Produksi konten, kehumasan, pengelolaan media sosial, dan layanan informasi publik.",
  },
  {
    nama: "Bidang Statistik",
    deskripsi: "Pengolahan data sektoral dan penyediaan data statistik daerah (Satu Data Riau).",
  },
  {
    nama: "Bidang Persandian",
    deskripsi: "Keamanan informasi, persandian, dan pengelolaan komunikasi rahasia pemerintah.",
  },
];

export default function ProfilDinasPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSticky />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <p className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Profil
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-foreground md:text-4xl">
              Dinas Komunikasi, Informatika dan Statistik Provinsi Riau
            </h1>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              Diskominfotik Provinsi Riau menyelenggarakan urusan pemerintahan bidang komunikasi
              dan informatika, statistik sektoral, serta persandian untuk mendukung tata kelola
              pemerintahan yang terbuka, cepat, dan berbasis data.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <Compass className="size-5 text-primary" />
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">Visi</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Mewujudkan Masyarakat Riau yang Informatif dan Kreatif.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <Target className="size-5 text-primary" />
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">Kontak</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Untuk pertanyaan seputar magang/Kerja Praktek, hubungi staf Bidang Aplikasi &amp;
                Informatika melalui kontak resmi Diskominfotik Provinsi Riau.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold text-foreground">Bidang kerja</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Lima bidang yang juga menjadi pilihan penempatan peserta magang.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {BIDANG.map((b) => (
                <div key={b.nama} className="rounded-xl border border-border bg-background p-5">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {b.nama}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl font-semibold text-foreground">Kontak</h2>
          <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <p className="flex items-start gap-2 rounded-lg border border-border bg-card p-4">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              Jalan Diponegoro Nomor 24 A, Pekanbaru
            </p>
            <p className="flex items-start gap-2 rounded-lg border border-border bg-card p-4">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              (0761) 45505
            </p>
            <p className="flex items-start gap-2 rounded-lg border border-border bg-card p-4">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              diskominfotik@riau.go.id
            </p>
          </div>
        </section>

        <section className="border-t border-border py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Struktur organisasi
            </h2>
            <div className="mt-6">
              <StrukturOrganisasi />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
