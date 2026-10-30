"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";

export default function CampanhaDetalhe() {
  const params = useParams();
  const id = params.id as string;

  const [campanha, setCampanha] = useState<Campaign | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!id) return;

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErro("Campanha não encontrada.");
        setCarregando(false);
        return;
      }

      setCampanha(data as Campaign);
      setCarregando(false);
    }

    carregar();
  }, [id]);

  if (carregando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Carregando...</div>
    );
  }

  if (erro || !campanha) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Header />
        <main style={{ maxWidth: "700px", margin: "40px auto", padding: "24px", textAlign: "center" }}>
          <h1>Campanha não encontrada</h1>
          <Link href="/campanhas" style={{ color: "#16a34a" }}>
            Ver todas as campanhas
          </Link>
        </main>
      </div>
    );
  }

  const percentual = Math.min(
    100,
    Math.round((campanha.current_amount / campanha.goal_amount) * 100)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Header />

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
        <Link
          href="/campanhas"
          style={{ color: "#64748b", fontSize: "14px", textDecoration: "none" }}
        >
          ← Voltar às campanhas
        </Link>

        <article
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "32px",
            marginTop: "20px",
          }}
        >
          {campanha.category && (
            <span
              style={{
                display: "inline-block",
                background: "#f0fdf4",
                color: "#166534",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {campanha.category}
            </span>
          )}

          <h1 style={{ margin: "0 0 16px", fontSize: "28px" }}>
            {campanha.title}
          </h1>

          <div
            style={{
              height: "12px",
              background: "#e2e8f0",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percentual}%`,
                background: "#16a34a",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <p style={{ fontSize: "18px", marginBottom: "8px" }}>
            <strong>
              R${" "}
              {Number(campanha.current_amount).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </strong>{" "}
            arrecadados de R${" "}
            {Number(campanha.goal_amount).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>

          <p style={{ color: "#64748b", marginBottom: "28px" }}>
            {percentual}% da meta
          </p>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              color: "#334155",
              marginBottom: "32px",
            }}
          >
            {campanha.description}
          </div>

          <button
            style={{
              width: "100%",
              padding: "16px",
              background: "#16a34a",
              color: "white",
              border: 0,
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
            }}
            onClick={() =>
              alert(
                "A integração de pagamentos (Pix) será implementada na etapa final."
              )
            }
          >
            Quero doar
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "13px",
              marginTop: "16px",
            }}
          >
            Pagamentos reais serão liberados em breve.
          </p>
        </article>
      </main>
    </div>
  );
}
