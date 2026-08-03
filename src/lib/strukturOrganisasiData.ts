export type Jabatan = {
  nama: string;
  pangkat: string;
};

export type AnggotaTim = { peran: string; nama: string; pangkat: string };

export type Bidang = {
  nama: string;
  kepala: Jabatan;
  timList: AnggotaTim[];
};

export const stafAhli: Jabatan[] = [
  { nama: "Zamri, S.E.", pangkat: "Arsiparis Ahli Madya — Pembina (IV/a)" },
  {
    nama: "Irawaty, S.Kom., M.Si.",
    pangkat: "Pranata Komputer Ahli Madya — Pembina (IV/a)",
  },
  {
    nama: "Ria Indah Sari, S.Si.",
    pangkat: "Statistisi Ahli Madya — Pembina (IV/a)",
  },
];

export const subbagianSekretariat: AnggotaTim[] = [
  {
    peran: "Ketua Tim Perencanaan Program",
    nama: "Lusiana, S.E., M.I.P.",
    pangkat: "Penata Tk. I (III/d)",
  },
  {
    peran: "Kasubbag Keuangan, Perlengkapan & BMD",
    nama: "Novendry, S.A.P.",
    pangkat: "Penata (III/c)",
  },
  {
    peran: "Kasubbag Kepegawaian dan Umum",
    nama: "Muhammad Zarviyan, S.S.T.P., M.Si.",
    pangkat: "Penata (III/c)",
  },
];

export const daftarBidang: Bidang[] = [
  {
    nama: "Bidang Informasi dan Komunikasi Publik",
    kepala: { nama: "Eriadi Fahmi, S.P., M.M.", pangkat: "Pembina (IV/a)" },
    timList: [
      {
        peran: "Ketua Tim Komunikasi Informasi",
        nama: "Kanty Amalia, S.I.Kom.",
        pangkat: "Penata (III/c)",
      },
      {
        peran: "Ketua Tim Diseminasi Informasi",
        nama: "Trisna Damayanti Z.A., S.Kpm.",
        pangkat: "Penata (III/c)",
      },
      {
        peran: "Ketua Tim Multimedia dan Dokumentasi",
        nama: "Rizan Ardianov, S.S.T.P., M.Si.",
        pangkat: "Penata Tk. I (III/d)",
      },
    ],
  },
  {
    nama: "Bidang Infrastruktur Teknologi Informasi dan Komunikasi",
    kepala: { nama: "Tommy Nanda, M.M.", pangkat: "Pembina Tk. I (IV/b)" },
    timList: [
      {
        peran: "Ketua Tim Jaringan Infrastruktur, Informasi dan Komunikasi",
        nama: "Ir. Junaidi, M.Sc.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Pemeliharaan TIK, CCTV & Command Center",
        nama: "Raja Wira Kesuma, S.Kom.",
        pangkat: "Penata Tk. I (III/d)",
      },
      {
        peran: "Ketua Tim Pengendalian Infrastruktur TIK & Data Center",
        nama: "Hardiansyah Parsamaan B., S.ST.",
        pangkat: "Penata Muda (III/a)",
      },
    ],
  },
  {
    nama: "Bidang Aplikasi & Informatika",
    kepala: {
      nama: "T. Indriany Novitalia, S.Sos., M.H.",
      pangkat: "Pembina Tk. I (IV/b)",
    },
    timList: [
      {
        peran: "Ketua Tim Standarisasi Penyelenggaraan Aplikasi & Informatika",
        nama: "Budhi Yan Putra Ali, M.Si.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Integrasi dan Interoperabilitas",
        nama: "Syarifah Zuraida Hanom, S.Sos.",
        pangkat: "Penata Tk. I (III/d)",
      },
      {
        peran: "Ketua Tim Pengelolaan dan Pengembangan Aplikasi",
        nama: "Irawaty, S.Kom., M.Si.",
        pangkat: "Pembina (IV/a)",
      },
    ],
  },
  {
    nama: "Bidang Statistik",
    kepala: { nama: "Ermila Roza, S.Sos., M.Si.", pangkat: "Pembina Tk. I (IV/b)" },
    timList: [
      {
        peran: "Ketua Tim Statistik Sosial",
        nama: "Ria Indah Sari, S.Si.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Statistik Ekonomi dan Sumber Daya Manusia",
        nama: "Dra. Darmawati Embas, M.Si.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Statistik Infrastruktur dan Kewilayahan",
        nama: "Akhyan Fajri, S.Sos.",
        pangkat: "Penata Tk. I (III/d)",
      },
    ],
  },
  {
    nama: "Bidang Persandian",
    kepala: {
      nama: "Candra Lisano Saputra, S.T.",
      pangkat: "Pembina Tk. I (IV/b)",
    },
    timList: [
      {
        peran: "Ketua Tim Tata Kelola Persandian",
        nama: "Dodi Sutejo, S.Sos., M.Si.",
        pangkat: "Penata Tk. I (III/d)",
      },
      {
        peran: "Ketua Tim Operasional Pengamanan Persandian",
        nama: "T. Nova Sukma, S.T., M.M.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Pengawasan dan Evaluasi Persandian",
        nama: "Tengku Afrizal Lukman, S.Kom.",
        pangkat: "Penata Tk. I (III/d)",
      },
    ],
  },
];