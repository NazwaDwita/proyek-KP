import Brand from "@/components/Brand";
import NavPill from "@/components/NavPill";

// Menggabungkan Brand + NavPill dalam satu wrapper "sticky", supaya
// menempel di atas layar saat halaman di-scroll — dipakai di semua
// halaman publik (Beranda, Daftar, Cek Status, Statistik, Info) supaya
// perilakunya konsisten dan cukup diubah di satu tempat.
export default function HeaderSticky() {
  return (
    <div className="header-sticky">
      <Brand />
      <NavPill />
    </div>
  );
}
