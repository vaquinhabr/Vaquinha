"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";
import { campaignStatusLabel, categoryLabel } from "@/lib/types";

const dinheiro = (centavos: number) => (Number(centavos) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Painel() {
  const router = useRouter();
  const [user, setUser] = useState<{id:string; email?:string; user_metadata?:Record<string, unknown>} | null>(null);
  const [campanhas, setCampanhas] = useState<Campaign[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [criadaAgora, setCriadaAgora] = useState(false);

  useEffect(() => {
    setCriadaAgora(new URLSearchParams(window.location.search).get("created") === "1");
    let ativo = true;
    async function carregar() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/entrar"); return; }
        if (!ativo) return;
        setUser(session.user);
        const { data, error } = await supabase.from("campaigns").select("*").eq("owner_id", session.user.id).order("created_at", { ascending: false });
        if (!ativo) return;
        if (error) setErro("Não foi possível carregar suas campanhas. Tente novamente.");
        else setCampanhas((data ?? []) as Campaign[]);
      } catch {
        if (ativo) setErro("Não foi possível conectar ao painel.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/entrar");
      else setUser(session.user);
    });
    return () => { ativo = false; subscription.unsubscribe(); };
  }, [router]);

  async function enviarParaAnalise(c: Campaign) {
    if (!user) return;
    setErro("");
    const { data, error } = await supabase.from("campaigns").update({ status: "pending_review" }).eq("id", c.id).eq("owner_id", user.id).in("status", ["draft", "paused"]).select("id").maybeSingle();
    if (error || !data) { setErro("Não foi possível enviar a campanha para análise. Atualize a página e tente novamente."); return; }
    setCampanhas(old => old.map(item => item.id === c.id ? { ...item, status: "pending_review" } : item));
  }

  if (carregando) return <div className="page-shell"><Header /><div className="container" style={{ padding: 48, textAlign: "center" }}>Carregando seu painel…</div></div>;

  const nome = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "por aqui";

  return (
    <div className="page-shell">
      <Header />
      <main className="container" style={{ paddingTop: 42, paddingBottom: 72 }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginBottom: 30 }}>
          <div><div className="eyebrow">Seu espaço</div><h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "12px 0 8px" }}>Olá, {String(nome)}.</h1><p className="muted" style={{ margin: 0 }}>Acompanhe suas histórias e organize suas campanhas.</p></div>
          <Link href="/criar-vaquinha" className="btn btn-primary">+ Criar campanha</Link>
        </div>
        <section className="card" style={{ padding: "clamp(20px, 4vw, 30px)" }}>
          {criadaAgora && <p role="status" aria-live="polite" className="form-message form-message-success" style={{marginBottom:20}}>Sua vaquinha foi salva como rascunho. Revise os detalhes antes de publicar.</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 22 }}><h2 style={{ margin: 0, fontSize: 22 }}>Minhas campanhas</h2><span style={{ color: "var(--muted)", fontSize: 13 }}>{campanhas.length} {campanhas.length === 1 ? "campanha" : "campanhas"}</span></div>
          {erro && <p role="alert" className="form-message form-message-error">{erro}</p>}
          {!erro && campanhas.length === 0 ? <div style={{ textAlign: "center", padding: "32px 12px" }}><div aria-hidden="true" style={{ fontSize: 44 }}>🌱</div><h3 style={{ margin: "12px 0 8px" }}>Sua primeira história começa aqui.</h3><p className="muted" style={{ lineHeight: 1.7 }}>Crie uma campanha para compartilhar sua causa com outras pessoas.</p><Link href="/criar-vaquinha" className="btn btn-primary" style={{ marginTop: 8 }}>Criar minha primeira campanha</Link></div> :
            <div style={{ display: "grid", gap: 12 }}>{campanhas.map(c => (
              <article key={c.id} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><strong style={{ fontSize: 16 }}>{c.title}</strong><span style={{ background: c.status === "active" ? "var(--green-50)" : "#f3f5f3", color: c.status === "active" ? "var(--green-800)" : "var(--muted)", borderRadius: 999, padding: "4px 9px", fontSize: 11, fontWeight: 700 }}>{campaignStatusLabel[c.status]}</span></div>
                  <p className="muted" style={{ margin: "7px 0 0", fontSize: 13 }}>{categoryLabel[c.category] || "Outra causa"} · Meta de {dinheiro(c.goal_cents)}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {c.status === "active" && <Link href={`/campanhas/${c.slug || c.id}`} className="btn btn-secondary" style={{ minHeight: 38, padding: "8px 13px", fontSize: 13 }}>Ver página</Link>}
                  {(c.status === "draft" || c.status === "paused") && <><Link href={`/criar-vaquinha?editar=${c.id}`} className="btn btn-secondary" style={{ minHeight: 38, padding: "8px 13px", fontSize: 13 }}>Editar rascunho</Link><button type="button" onClick={() => void enviarParaAnalise(c)} className="btn btn-primary" style={{ minHeight: 38, padding: "8px 13px", fontSize: 13 }}>Enviar para análise</button></>}
                </div>
              </article>
            ))}</div>}
        </section>
        <section className="card" style={{ marginTop: 18, padding: 24 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 19 }}>Dados da conta</h2><p className="muted" style={{ margin: 0, fontSize: 14 }}>E-mail: {user?.email || "—"}</p>
        </section>
      </main>
    </div>
  );
}
