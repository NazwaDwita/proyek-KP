export function periodeSudahSelesai(tanggalSelesai: string) {
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  return new Date(tanggalSelesai) < hariIni;
}