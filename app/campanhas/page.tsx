"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

const dinheiro = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Campanhas() {
  const [campanhas, setCampanhas] = useState<Campaign[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const { data, error } = await supabase.from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(50);
        if (!ativo) return;
        if (error) setErro("Não foi possível carregar as campanhas agora. Tente novamente em instantes.");
        else setCampanhas((data ?? []) as Campaign[]);
      } catch {
        if (ativo) setErro("Não foi possível conectar ao serviço de campanhas.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, []);

  return (
    <div className="page-shell">
      <Header />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 18, marginBottom: 34 }}>
          <div>
            <div className="eyebrow">Descubra histórias</div>
            <h1 style={{ margin: "12px 0 8px", fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>Campanhas que aproximam.</h1>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>Conheça causas reais e encontre uma forma de fazer parte delas.</p>
          </div>
          <Link href="/campanhas/nova" className="btn btn-primary">Criar campanha ↗</Link>
        </div>

        {carregando ? <div className="card" style={{ padding: 42, textAlign: "center", color: "var(--muted)" }}>Carregando campanhas…</div> :
          erro ? <div className="form-message form-message-error" role="alert">{erro}</div> :
          campanhas.length === 0 ? (
            <div className="card" style={{ padding: "clamp(30px, 6vw, 64px) 24px", textAlign: "center" }}>
              <div aria-hidden="true" style={{ fontSize: 54, marginBottom: 16 }}>🌱</div>
              <h2 style={{ margin: "0 0 10px" }}>Toda grande mudança começa com uma história.</h2>
              <p className="muted" style={{ maxWidth: 500, margin: "0 auto 22px", lineHeight: 1.7 }}>Ainda não há campanhas publicadas. Você pode ser a primeira pessoa a compartilhar uma causa por aqui.</p>
              <Link href="/criar-conta" className="btn btn-primary">Começar minha vaquinha</Link>
            </div>
          ) : (
            <section aria-label="Campanhas ativas" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))", gap: 20 }}>
              {campanhas.map((c) => (
                <Link key={c.id} href={`/campanhas/${c.slug || c.id}`} className="card" style={{ overflow: "hidden", display: "block", textDecoration: "none" }}>
                  <div style={{ height: 174, background: c.image_url ? `linear-gradient(0deg, rgba(18,60,43,.16), rgba(18,60,43,0)), url("${c.image_url}") center/cover` : "linear-gradient(135deg, #e1f2e5, #f8edda)", display: "grid", placeItems: "center" }}>
                    {!c.image_url && <span aria-hidden="true" style={{ fontSize: 54 }}>{c.category === "animais" ? "🐾" : c.category === "saude" ? "💚" : c.category === "educacao" ? "📚" : "🤝"}</span>}
                  </div>
                  <div style={{ padding: 22 }}>
                    <span style={{ color: "var(--green-800)", fontSize: 12, fontWeight: 700 }}>{categoryLabel[c.category] || "Uma causa importante"}</span>
                    <h2 style={{ fontSize: 20, lineHeight: 1.35, margin: "9px 0" }}>{c.title}</h2>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, margin: "0 0 18px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description}</p>
                    <div style={{ height: 7, background: "#edf1ed", borderRadius: 999, overflow: "hidden" }}><div style={{ height: "100%", width: "0%", background: "var(--green-600)" }} /></div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 11, fontSize: 12, color: "var(--muted)" }}><span>Meta da campanha</span><strong style={{ color: "var(--green-900)" }}>{dinheiro(Number(c.goal_cents))}</strong></div>
                    <span style={{ display: "inline-block", marginTop: 18, color: "var(--green-800)", fontSize: 14, fontWeight: 700 }}>Conhecer a história →</span>
                  </div>
                </Link>
              ))}
            </section>
          )}
      </main>
    </div>
  );
}
