"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setCarregando(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCarregando(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function sair() {
    const { error } = await supabase.auth.signOut();
    if (error) return;
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(255,255,255,.94)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ minHeight: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <Link href="/" aria-label="Vaquinha - página inicial" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--green-950)" }}>
          <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 14, background: "var(--green-100)", fontSize: 22 }}>💚</span>
          <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-.06em" }}>Vaquinha<span style={{ color: "var(--green-700)" }}>.</span></span>
        </Link>

        <nav aria-label="Navegação principal" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 20, flexWrap: "wrap" }}>
          <Link href="/campanhas" style={{ color: "var(--ink)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Explorar campanhas</Link>
          <Link href="/vaquinhas/mais-amadas" style={{ color: "var(--ink)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Mais amadas ♡</Link>
          {!carregando && (user ? (
            <>
              <Link href="/painel" style={{ color: "var(--ink)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Meu painel</Link>
              <button type="button" onClick={sair} className="btn btn-secondary" style={{ minHeight: 40, padding: "9px 15px", fontSize: 14 }}>Sair</button>
            </>
          ) : (
            <>
              <Link href="/entrar" className="hide-mobile" style={{ color: "var(--ink)", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>Entrar</Link>
              <Link href="/criar-conta" className="btn btn-primary" style={{ minHeight: 42, padding: "10px 17px", fontSize: 14 }}>Criar vaquinha <span aria-hidden="true">↗</span></Link>
            </>
          ))}
        </nav>
      </div>
    </header>
  );
}
