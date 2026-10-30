"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

const dinheiro = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CampanhaDetalhe() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);
  const [campanha, setCampanha] = useState<Campaign | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        let data: Campaign | null = null;
        const bySlug = await supabase.from("campaigns").select("*").eq("slug", id).maybeSingle();
        if (bySlug.data) data = bySlug.data as Campaign;
        if (!data && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
          const byId = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
          if (byId.data) data = byId.data as Campaign;
        }
        if (!ativo) return;
        if (!data) setErro("Campanha não encontrada ou ainda não disponível publicamente.");
        else setCampanha(data);
      } catch {
        if (ativo) setErro("Não foi possível carregar esta campanha agora.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    if (id) carregar();
    return () => { ativo = false; };
  }, [id]);

  if (carregando) return <div className="page-shell"><Header /><div className="container" style={{ padding: 48, textAlign: "center" }}>Carregando campanha…</div></div>;

  if (erro || !campanha) return <div className="page-shell"><Header /><main className="container" style={{ padding: "70px 20px", textAlign: "center" }}><div aria-hidden="true" style={{ fontSize: 48 }}>🌱</div><h1>Não encontramos essa campanha.</h1><p className="muted">{erro || "Tente novamente."}</p><Link href="/campanhas" className="btn btn-primary" style={{ marginTop: 12 }}>Explorar campanhas</Link></main></div>;

  const ativa = campanha.status === "active";

  return (
    <div className="page-shell">
      <Header />
      <main className="container" style={{ maxWidth: 900, paddingTop: 32, paddingBottom: 72 }}>
        <Link href="/campanhas" style={{ color: "var(--green-800)", fontSize: 14, textDecoration: "none", fontWeight: 700 }}>← Todas as campanhas</Link>
        <article className="card" style={{ overflow: "hidden", marginTop: 20 }}>
          <div style={{ height: "clamp(190px, 32vw, 330px)", background: campanha.image_url ? `linear-gradient(0deg, rgba(18,60,43,.08), transparent), url("${campanha.image_url}") center/cover` : "linear-gradient(135deg, #e1f2e5, #f8edda)", display: "grid", placeItems: "center" }}>
            {!campanha.image_url && <span aria-hidden="true" style={{ fontSize: 78 }}>{campanha.category === "animais" ? "🐾" : campanha.category === "saude" ? "💚" : "🤝"}</span>}
          </div>
          <div style={{ padding: "clamp(24px, 5vw, 42px)" }}>
            <span className="eyebrow">{categoryLabel[campanha.category] || "Uma causa importante"}</span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.12, margin: "16px 0 20px" }}>{campanha.title}</h1>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "var(--muted)", fontSize: 13, marginTop: 10 }}><span>Meta da campanha</span><strong style={{ color: "var(--green-900)", fontSize: 16 }}>{dinheiro(Number(campanha.goal_cents))}</strong></div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.85, color: "#3f5147", margin: "28px 0 32px" }}>{campanha.description}</div>
            {ativa ? (
              <div style={{ borderRadius: 14, padding: 18, background: "var(--green-50)", border: "1px solid #dcefe1" }}>
                <strong style={{ color: "var(--green-900)" }}>Quer apoiar esta causa?</strong>
                <p style={{ margin: "7px 0 0", color: "var(--muted)", lineHeight: 1.6, fontSize: 14 }}>Estamos preparando o fluxo de doações com pagamento seguro. No momento, esta página não recebe pagamentos; não envie dinheiro por fora usando dados que não foram verificados.</p>
              </div>
            ) : (
              <div className="form-message" style={{ background: "#f7f8f7", color: "var(--muted)" }}>Esta campanha ainda não está publicada. O status atual é: {campanha.status === "draft" ? "rascunho" : campanha.status === "pending_review" ? "em análise" : campanha.status}.</div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
