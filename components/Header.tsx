"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCarregando(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header
      style={{
        background: "#ffffff",
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#16a34a",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        💚 Vaquinha
      </Link>

      <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <Link href="/campanhas" style={{ color: "#166534", textDecoration: "none" }}>
          Campanhas
        </Link>

        {carregando ? (
          <span style={{ color: "#94a3b8", fontSize: "14px" }}>...</span>
        ) : user ? (
          <>
            <Link
              href="/painel"
              style={{ color: "#166534", textDecoration: "none" }}
            >
              Meu painel
            </Link>
            <button
              onClick={sair}
              style={{
                background: "transparent",
                border: "1px solid #e2e8f0",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link href="/entrar" style={{ color: "#166534", textDecoration: "none" }}>
              Entrar
            </Link>
            <Link
              href="/criar-conta"
              style={{
                background: "#16a34a",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
