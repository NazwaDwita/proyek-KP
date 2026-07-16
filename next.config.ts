import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Diperlukan supaya dev server tidak memblokir resource (termasuk yang
  // dipakai untuk hydration React di browser) saat diakses lewat IP
  // jaringan lokal (192.168.56.1), bukan lewat localhost.
  allowedDevOrigins: ["192.168.56.1"],
};

export default nextConfig;
