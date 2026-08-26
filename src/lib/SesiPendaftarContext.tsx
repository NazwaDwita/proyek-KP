"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SesiPendaftarContextValue = {
  sesi: Session | null;
  memuat: boolean;
  sudahDiterima: boolean;
  punyaPendaftaranAktif: boolean;
};

const SesiPendaftarContext = createContext<SesiPendaftarContextValue>({
  sesi: null,
  memuat: true,
  sudahDiterima: false,
  punyaPendaftaranAktif: false,
});

export function SesiPendaftarProvider({ children }: { children: ReactNode }) {
  const [sesi, setSesi] = useState<Session | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [sudahDiterima, setSudahDiterima] = useState(false);
  const [punyaPendaftaranAktif, setPunyaPendaftaranAktif] = useState(false);

  useEffect(() => {
    let masihTerpasang = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!masihTerpasang) return;
        setSesi(data.session);
        setMemuat(false);
      })
      .catch(() => {
        if (!masihTerpasang) return;
        setMemuat(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, sesiBaru) => {
        setSesi(sesiBaru);
        if (!sesiBaru) {
          setSudahDiterima(false);
          setPunyaPendaftaranAktif(false);
        }
      }
    );

    return () => {
      masihTerpasang = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sesi) return;

    let masihTerpasang = true;

    async function cekStatusPendaftar() {
      const { data, error } = await supabase
        .from("pendaftar")
        .select("status")
        .eq("user_id", sesi!.user.id)
        .in("status", ["menunggu", "diverifikasi"]);

      if (!masihTerpasang) return;
      if (error) {
        console.error("Gagal memeriksa status pendaftaran:", error);
        return;
      }
      const daftarStatus = data ? data.map((d) => d.status) : [];
      setSudahDiterima(daftarStatus.includes("diverifikasi"));
      setPunyaPendaftaranAktif(daftarStatus.length > 0);
    }

    cekStatusPendaftar();
    return () => {
      masihTerpasang = false;
    };
  }, [sesi]);

  return (
    <SesiPendaftarContext.Provider
      value={{ sesi, memuat, sudahDiterima, punyaPendaftaranAktif }}
    >
      {children}
    </SesiPendaftarContext.Provider>
  );
}

export function useSesiPendaftar() {
  return useContext(SesiPendaftarContext);
}