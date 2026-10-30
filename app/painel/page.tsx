"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";

export default function Painel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [campanhas, setCampanhas] = useState<Campaign[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/entrar");
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setCampanhas(data as Campaign[]);
      setCarregando(false);
    }

    carregar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/entrar");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (carregando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Carregando...</div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Header />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ color: "#172033", marginBottom: "8px" }}>
          Olá, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
        </h1>
        <p style={{ color: "#64748b", marginBottom: "32px" }}>
          Bem-vindo ao seu painel.
        </p>

        <div style={{ marginBottom: "32px" }}>
          <Link
            href="/campanhas/nova"
            style={{
              display: "inline-block",
              background: "#16a34a",
              color: "white",
              padding: "14px 22px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            + Criar nova campanha
          </Link>
        </div>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Minhas campanhas</h2>

          {campanhas.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              Você ainda não criou nenhuma campanha.{" "}
              <Link href="/campanhas/nova" style={{ color: "#16a34a" }}>
                Criar agora
              </Link>
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {campanhas.map((c) => {
                const pct = Math.min(
                  100,
                  Math.round((Number(c.current_amount) / Number(c.goal_amount)) * 100) || 0
                );
                return (
                  <div
                    key={c.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <strong>{c.title}</strong>
                      <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
                        R$ {Number(c.current_amount).toLocaleString("pt-BR")} de{" "}
                        R$ {Number(c.goal_amount).toLocaleString("pt-BR")} ({pct}%) ·{" "}
                        {c.status}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        href={`/campanhas/${c.id}`}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "#166534",
                          fontSize: "14px",
                        }}
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/campanhas/${c.id}/editar`}
                        style={{
                          padding: "8px 12px",
                          background: "#f0fdf4",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "#166534",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Seus dados</h2>
          <p>
            <strong>E-mail:</strong> {user?.email}
          </p>
          <p>
            <strong>Nome:</strong>{" "}
            {user?.user_metadata?.full_name || "Não informado"}
          </p>
        </section>
      </main>
    </div>
  );
}
