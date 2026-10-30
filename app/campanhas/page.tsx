"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";

export default function Campanhas() {
  const [campanhas, setCampanhas] = useState<Campaign[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setCampanhas(data as Campaign[]);
      }
      setCarregando(false);
    }

    carregar();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#172033" }}>
      <Header />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px" }}>Campanhas</h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Conheça as causas e descubra como ajudar.
            </p>
          </div>

          <Link
            href="/campanhas/nova"
            style={{
              background: "#16a34a",
              color: "white",
              padding: "12px 18px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Criar campanha
          </Link>
        </div>

        {carregando ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>Carregando...</p>
        ) : campanhas.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#64748b", fontSize: "16px" }}>
              Ainda não há campanhas publicadas.
            </p>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              Seja o primeiro a criar uma vaquinha!
            </p>
            <Link
              href="/criar-conta"
              style={{
                display: "inline-block",
                marginTop: "16px",
                color: "#16a34a",
                fontWeight: "bold",
              }}
            >
              Criar minha conta e começar →
            </Link>
          </div>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {campanhas.map((c) => {
              const percentual = Math.min(
                100,
                Math.round((c.current_amount / c.goal_amount) * 100) || 0
              );

              return (
                <Link
                  key={c.id}
                  href={`/campanhas/${c.id}`}
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <h3 style={{ margin: "0 0 10px" }}>{c.title}</h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      margin: "0 0 14px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.description}
                  </p>

                  <div
                    style={{
                      height: "8px",
                      background: "#e2e8f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percentual}%`,
                        background: "#16a34a",
                      }}
                    />
                  </div>

                  <p style={{ margin: 0, fontSize: "14px" }}>
                    <strong>
                      R${" "}
                      {Number(c.current_amount).toLocaleString("pt-BR")}
                    </strong>{" "}
                    de R${" "}
                    {Number(c.goal_amount).toLocaleString("pt-BR")}
                  </p>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
