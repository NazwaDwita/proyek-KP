import type { Metadata } from "next";
import "./globals.css";
import { ModalMasukProvider } from "@/lib/ModalMasukContext";

export const metadata: Metadata = {
  title: "Portal Magang Diskominfotik Provinsi Riau",
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ModalMasukProvider>{children}</ModalMasukProvider>
      </body>
    </html>
  );
}
