"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

export default function Painel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
      setCarregando(false);
    }

    carregar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/entrar");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (carregando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Carregando...
      </div>
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <Link
            href="/campanhas/nova"
            style={{
              background: "#16a34a",
              color: "white",
              padding: "24px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            + Criar nova campanha
          </Link>

          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Minhas campanhas</h3>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Em breve você verá suas campanhas aqui.
            </p>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Doações recebidas</h3>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Acompanhe as contribuições.
            </p>
          </div>
        </div>

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
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            ID: {user?.id}
          </p>
        </section>
      </main>
    </div>
  );
}
