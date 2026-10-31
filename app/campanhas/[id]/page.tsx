"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

const dinheiro = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const campanhaInicialSlug = "reconstrucao-andre-taci-e-familia";
const arrecadacaoInicialCentavos = 831028;

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
  const arrecadadoInicial = campanha.slug === campanhaInicialSlug ? arrecadacaoInicialCentavos : 0;
  const percentual = Math.min(100, Math.round((arrecadadoInicial / Math.max(1, Number(campanha.goal_cents))) * 100));
  const falta = Math.max(0, Number(campanha.goal_cents) - arrecadadoInicial);

  return (
    <div className="page-shell" style={{ background: "#f6f7f8", minHeight: "100vh" }}>
      <Header />
      <main className="container" style={{ maxWidth: 1120, paddingTop: 26, paddingBottom: 72 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <Link href="/campanhas" style={{ color: "#167348", fontSize: 14, textDecoration: "none", fontWeight: 700 }}>← Voltar para campanhas</Link>
          <button type="button" className="btn btn-secondary" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); } catch {} }} style={{ minHeight: 40 }}>Compartilhar ↗</button>
        </div>

        <div className="campaign-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, .85fr)", gap: 24, alignItems: "start" }}>
          <section>
            <article className="card" style={{ overflow: "hidden", background: "#fff", border: "1px solid #e7e9eb", borderRadius: 14 }}>
              <div style={{ height: "clamp(230px, 39vw, 470px)", background: campanha.image_url ? `url("${campanha.image_url}") center/cover no-repeat` : "linear-gradient(135deg, #e1f2e5, #f8edda)", display: "grid", placeItems: "center" }}>
                {!campanha.image_url && <div style={{ textAlign: "center", color: "#35654b", padding: 24 }}><div aria-hidden="true" style={{ fontSize: 72, marginBottom: 8 }}>🏡</div><strong>Foto da campanha</strong><p style={{ margin: "6px 0 0", fontSize: 13 }}>A imagem será exibida aqui quando for vinculada.</p></div>}
              </div>
              <div style={{ padding: "clamp(22px, 4vw, 34px)" }}>
                <span style={{ display: "inline-block", color: "#167348", background: "#e8f5ed", borderRadius: 999, padding: "6px 11px", fontSize: 12, fontWeight: 800 }}>{categoryLabel[campanha.category] || "Emergência"}</span>
                <h1 style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.65rem)", lineHeight: 1.15, letterSpacing: "-.025em", margin: "16px 0 14px", color: "#202a24" }}>{campanha.title}</h1>
                <p style={{ margin: 0, color: "#66716a", fontSize: 14 }}>Uma campanha de solidariedade para ajudar uma família a recomeçar.</p>
                <div style={{ height: 1, background: "#edf0ed", margin: "24px 0" }} />
                <h2 style={{ fontSize: 20, margin: "0 0 14px", color: "#202a24" }}>Sobre a campanha</h2>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.85, color: "#46534b", fontSize: 15 }}>{campanha.description}</div>
                <div style={{ marginTop: 28, borderTop: "1px solid #edf0ed", paddingTop: 20 }}>
                  <strong style={{ color: "#202a24" }}>Ajude compartilhando</strong>
                  <p style={{ color: "#66716a", lineHeight: 1.7, fontSize: 14, margin: "8px 0 14px" }}>Compartilhe esta história para que mais pessoas conheçam a campanha.</p>
                  <button type="button" className="btn btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); } catch {} }} style={{ width: "100%" }}>Copiar link da campanha</button>
                </div>
              </div>
            </article>
          </section>

          <aside style={{ position: "sticky", top: 20 }}>
            <section className="card" style={{ background: "#fff", border: "1px solid #e7e9eb", borderRadius: 14, padding: "26px 24px" }}>
              <div style={{ color: "#66716a", fontSize: 13, fontWeight: 700, marginBottom: 7 }}>Arrecadado na plataforma Vaquinha</div>
              <div style={{ fontSize: "clamp(2rem, 3.3vw, 2.7rem)", fontWeight: 850, letterSpacing: "-.04em", color: "#176c43", lineHeight: 1.1 }}>{dinheiro(arrecadadoInicial)}</div>
              <div style={{ color: "#66716a", fontSize: 14, marginTop: 10 }}>de <strong style={{ color: "#303b34" }}>{dinheiro(Number(campanha.goal_cents))}</strong> da meta</div>
              <div role="progressbar" aria-label="Progresso da arrecadação" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentual} style={{ height: 10, borderRadius: 999, background: "#e9eeeb", overflow: "hidden", margin: "20px 0 10px" }}><div style={{ height: "100%", width: `${percentual}%`, background: "#218653", borderRadius: 999, transition: "width .3s ease" }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, color: "#66716a" }}><span>{percentual}% alcançado</span><span>Faltam {dinheiro(falta)}</span></div>
              <div style={{ borderTop: "1px solid #edf0ed", marginTop: 22, paddingTop: 20 }}>
                {ativa ? <>
                  <strong style={{ color: "#202a24", fontSize: 16 }}>Faça parte dessa corrente de apoio</strong>
                  <p style={{ color: "#66716a", fontSize: 13, lineHeight: 1.65, margin: "8px 0 0" }}>A página está organizada para divulgar a campanha. O pagamento online ainda não foi habilitado nesta plataforma.</p>
                  <button type="button" disabled style={{ width: "100%", marginTop: 16, opacity: .65, cursor: "not-allowed" }} className="btn btn-primary">Doações em breve</button>
                </> : <div className="form-message" style={{ background: "#f7f8f7", color: "var(--muted)" }}>Esta campanha ainda não está publicada. Status: {campanha.status === "draft" ? "rascunho" : campanha.status === "pending_review" ? "em análise" : campanha.status}.</div>}
              </div>
            </section>
            <div style={{ marginTop: 14, color: "#78827b", fontSize: 12, lineHeight: 1.6, padding: "0 5px" }}>Os valores apresentados são os informados para esta campanha na plataforma Vaquinha. A integração de pagamentos ainda está em preparação.</div>
          </aside>
        </div>
      </main>
      <style>{`@media (max-width: 800px) { .campaign-layout { grid-template-columns: 1fr !important; } aside { position: static !important; } }`}</style>
    </div>
  );
}
