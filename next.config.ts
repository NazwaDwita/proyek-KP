import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Diperlukan supaya dev server tidak memblokir resource (termasuk yang
  // dipakai untuk hydration React di browser) saat diakses lewat IP
  // jaringan lokal (192.168.56.1), bukan lewat localhost.
  allowedDevOrigins: ["192.168.56.1"],

  // Pindahkan badge dev-tools Next.js (lingkaran "N") ke kanan bawah,
  // supaya tidak menutupi tombol di pojok kiri bawah saat testing di
  // layar sempit. Badge ini otomatis TIDAK muncul di production/Vercel,
  // jadi ini murni kenyamanan testing lokal saja.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
