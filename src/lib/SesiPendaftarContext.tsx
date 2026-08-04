"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SesiPendaftarContextValue = {
  sesi: Session | null;
  memuat: boolean;
  sudahDiterima: boolean;
};

const SesiPendaftarContext = createContext<SesiPendaftarContextValue>({
  sesi: null,
  memuat: true,
  sudahDiterima: false,
});

export function SesiPendaftarProvider({ children }: { children: ReactNode }) {
  const [sesi, setSesi] = useState<Session | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [sudahDiterima, setSudahDiterima] = useState(false);

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
        if (!sesiBaru) setSudahDiterima(false);
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

    async function cekStatusDiterima() {
      const { data, error } = await supabase
        .from("pendaftar")
        .select("id")
        .eq("user_id", sesi!.user.id)
        .eq("status", "diverifikasi")
        .limit(1)
        .maybeSingle();

      if (!masihTerpasang) return;
      if (error) {
        console.error("Gagal memeriksa status pendaftaran:", error);
        return;
      }
      setSudahDiterima(!!data);
    }

    cekStatusDiterima();
    return () => {
      masihTerpasang = false;
    };
  }, [sesi]);

  return (
    <SesiPendaftarContext.Provider value={{ sesi, memuat, sudahDiterima }}>
      {children}
    </SesiPendaftarContext.Provider>
  );
}

export function useSesiPendaftar() {
  return useContext(SesiPendaftarContext);
}