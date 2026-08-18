import type { Metadata } from "next";
import "./globals.css";
import { ModalMasukProvider } from "@/lib/ModalMasukContext";
import { SesiPendaftarProvider } from "@/lib/SesiPendaftarContext";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "SIMAKRI — Sistem Magang Diskominfotik Provinsi Riau",
  description:
    "Sistem pendaftaran dan informasi magang Dinas Komunikasi, Informatika dan Statistik Provinsi Riau",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SesiPendaftarProvider>
          <ModalMasukProvider>
            <PageTransition>{children}</PageTransition>
          </ModalMasukProvider>
        </SesiPendaftarProvider>
      </body>
    </html>
  );
}