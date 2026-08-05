export default function Brand() {
  return (
    <div className="brand">
      <div className="brand-ikon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M3 21h18" strokeLinecap="round" />
          <path d="M4 21V9l8-5 8 5v12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 11h.01M15 11h.01" strokeLinecap="round" />
        </svg>
      </div>
      <div className="brand-teks">
        <strong>SIMAKRI</strong>
        Sistem Magang Diskominfotik Riau
      </div>
    </div>
  );
}