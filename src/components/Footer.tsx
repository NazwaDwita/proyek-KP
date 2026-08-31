export default function Footer() {
  return (
    <footer className="border-t border-emerald-900/30 bg-[#064E3B] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-sm font-semibold text-white">Profil</p>
            <p className="mt-2 text-sm text-white">
              Jalan Diponegoro Nomor 24 A, Pekanbaru
            </p>
            <p className="mt-1 text-sm text-white">diskominfotik@riau.go.id</p>
            <p className="mt-1 text-sm text-white">(0761) 45505</p>
          </div>

          <div>
            <p className="font-display text-sm font-semibold text-white">Lokasi</p>
            <div className="mt-2 overflow-hidden rounded-lg border border-emerald-700">
              <iframe
                title="Lokasi Diskominfotik Provinsi Riau"
                src="https://www.google.com/maps?q=Dinas+Komunikasi+Informatika+dan+Statistik+Provinsi+Riau+Jalan+Diponegoro+No+24A+Pekanbaru&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-32 w-full"
              />
            </div>
          </div>

          <div>
            <p className="font-display text-sm font-semibold text-white">Tautan terkait</p>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-white">
              <a
                href="https://diskominfotik.riau.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Website Diskominfotik Provinsi Riau
              </a>
              <a
                href="https://riau.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Portal Pemerintah Provinsi Riau
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-emerald-700 pt-6 text-sm text-white">
          Pemerintah Provinsi Riau &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
