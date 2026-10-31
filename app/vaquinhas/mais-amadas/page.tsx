"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

type Heart = { campaign_id: string; user_id: string; created_at: string };
type Item = Campaign & { hearts: number; week: number; day: number };
const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MaisAmadasPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    const [campaignResult, heartResult, sessionResult] = await Promise.all([
      supabase.from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(100),
      supabase.from("campaign_hearts").select("campaign_id,user_id,created_at").order("created_at", { ascending: false }).limit(10000),
      supabase.auth.getSession(),
    ]);
    if (sessionResult.data.session?.user) setUserId(sessionResult.data.session.user.id);
    if (campaignResult.error) {
      setNotice("Não foi possível carregar as campanhas. Tente novamente mais tarde.");
      setLoading(false);
      return;
    }
    const hearts = (heartResult.data ?? []) as Heart[];
    const now = Date.now();
    const week = now - 7 * 86400000;
    const day = now - 86400000;
    const uid = sessionResult.data.session?.user?.id;
    setMine(new Set(hearts.filter(h => h.user_id === uid && uid).map(h => h.campaign_id)));
    setItems(((campaignResult.data ?? []) as Campaign[]).map(c => {
      const related = hearts.filter(h => h.campaign_id === c.id);
      return { ...c, hearts: related.length, week: related.filter(h => Date.parse(h.created_at) >= week).length, day: related.filter(h => Date.parse(h.created_at) >= day).length };
    }));
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);
  const weekly = useMemo(() => [...items].filter(x => x.week > 0).sort((a,b) => b.week-a.week || b.hearts-a.hearts).slice(0,3), [items]);
  const popular = useMemo(() => [...items].sort((a,b) => b.hearts-a.hearts || b.created_at.localeCompare(a.created_at)).slice(0,6), [items]);
  const daily = useMemo(() => [...items].filter(x => x.day > 0).sort((a,b) => b.day-a.day).slice(0,6), [items]);
  const recent = useMemo(() => [...items].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0,6), [items]);

  async function heart(id: string) {
    if (!userId) { router.push("/entrar?redirectTo=%2Fvaquinhas%2Fmais-amadas"); return; }
    setBusy(id); setNotice("");
    const result = mine.has(id)
      ? await supabase.from("campaign_hearts").delete().eq("campaign_id", id).eq("user_id", userId)
      : await supabase.from("campaign_hearts").insert({ campaign_id: id, user_id: userId });
    if (result.error) setNotice("Não foi possível atualizar o coração. Tente novamente.");
    else setMine(old => { const next = new Set(old); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    await load();
    setBusy(null);
  }

  function section(title: string, subtitle: string, data: Item[], ranked = false) {
    return <section key={title} style={{ margin: "0 0 44px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div><div className="eyebrow">VAQUINHAS DA COMUNIDADE</div><h2 style={{ fontSize: "clamp(1.7rem,3vw,2.35rem)", margin: "10px 0 7px" }}>{title}</h2><p className="muted" style={{ margin: 0 }}>{subtitle}</p></div>
        <Link href="/campanhas" style={{ color: "var(--green-800)", fontWeight: 800, textDecoration: "none" }}>Ver todas →</Link>
      </div>
      {!data.length ? <div className="card" style={{ padding: 24, color: "var(--muted)", lineHeight: 1.7 }}>Ainda não há corações registrados neste período. Seja a primeira pessoa a apoiar uma campanha.</div> :
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18 }}>
        {data.map((c, index) => <article key={c.id} className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Link href={`/campanhas/${c.slug || c.id}`} style={{ textDecoration: "none" }}>
            <div style={{ height: 180, background: c.image_url ? `linear-gradient(0deg,rgba(18,60,43,.15),transparent),url("${c.image_url}") center/cover` : "linear-gradient(135deg,#e0f2e5,#f8edda)", display: "grid", placeItems: "center", position: "relative" }}>
              {!c.image_url && <span style={{ fontSize: 52 }}>{c.category === "animais" ? "🐾" : c.category === "saude" ? "💚" : "🤝"}</span>}
              {ranked && <b style={{ position: "absolute", top: 12, left: 12, background: "#fff", borderRadius: 999, padding: "7px 10px", fontSize: 12 }}>#{index + 1} da semana</b>}
            </div>
          </Link>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ color: "var(--green-800)", fontSize: 12, fontWeight: 800 }}>{categoryLabel[c.category] || "Uma causa importante"}</span>
            <Link href={`/campanhas/${c.slug || c.id}`} style={{ textDecoration: "none" }}><h3 style={{ fontSize: 19, lineHeight: 1.35, margin: "8px 0" }}>{c.title}</h3></Link>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.65, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description}</p>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span className="muted">♡ {c.hearts} {c.hearts === 1 ? "coração" : "corações"}</span>
              <button className="btn btn-secondary" type="button" disabled={busy === c.id} onClick={() => void heart(c.id)} style={{ minHeight: 38, padding: "8px 12px", fontSize: 12 }}>{mine.has(c.id) ? "♥ Apoiado" : "♡ Apoiar"}</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 13 }}>Meta: <strong style={{ color: "var(--green-900)" }}>{brl(Number(c.goal_cents))}</strong></div>
          </div>
        </article>)}
      </div>}
    </section>;
  }

  return <div className="page-shell"><Header />
    <main>
      <section style={{ background: "linear-gradient(125deg,#f0f8f2,#fbfcfb 58%,#e2f2e7)", borderBottom: "1px solid var(--line)" }}>
        <div className="container" style={{ paddingTop: "clamp(42px,7vw,82px)", paddingBottom: "clamp(42px,7vw,78px)" }}>
          <div className="eyebrow">A força da comunidade</div>
          <div className="hero-loved">
            <div><h1 style={{ color: "var(--green-950)", fontSize: "clamp(2.5rem,6vw,4.4rem)", lineHeight: 1.04, margin: "18px 0" }}>Conheça as vaquinhas <span style={{ color: "var(--green-700)" }}>mais amadas.</span></h1>
              <p style={{ maxWidth: 660, color: "var(--muted)", fontSize: 17, lineHeight: 1.8, margin: "0 0 26px" }}>Descubra histórias que estão mobilizando pessoas. Envie um coração para mostrar apoio e ajudar cada causa a ganhar visibilidade.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}><Link className="btn btn-primary" href="/campanhas">Encontrar uma causa ↗</Link><Link className="btn btn-secondary" href="/criar-conta">Criar minha vaquinha</Link></div>
            </div><div aria-hidden="true" className="loved-heart">♡</div>
          </div>
        </div>
      </section>
      <div className="container" style={{ paddingTop: 30, paddingBottom: 72 }}>
        {notice && <div role="status" className="form-message form-message-error" style={{ marginBottom: 20 }}>{notice}</div>}
        {loading ? <div className="card" style={{ padding: 48, textAlign: "center" }}>Carregando histórias da comunidade…</div> : items.length === 0 ? <div className="card" style={{ padding: 48, textAlign: "center" }}><div style={{ fontSize: 48 }}>🌱</div><h2>As próximas histórias começam aqui.</h2><p className="muted">Ainda não há campanhas publicadas. Crie a primeira campanha e convide a comunidade.</p><Link className="btn btn-primary" href="/criar-conta">Criar uma vaquinha</Link></div> : <>{section("Da semana", "Campanhas que receberam mais corações nos últimos sete dias.", weekly, true)}{section("Mais corações", "Campanhas que mais mobilizaram apoio desde a publicação.", popular)}{section("Últimas 24 horas", "Causas que receberam corações recentemente.", daily)}{section("Campanhas recentes", "Conheça novas causas que chegaram à comunidade.", recent)}</>}
        <section style={{ background: "var(--green-950)", borderRadius: 24, padding: "clamp(26px,5vw,48px)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div style={{ maxWidth: 680 }}><div style={{ color: "#bce4c8", fontSize: 12, fontWeight: 800 }}>FAÇA PARTE</div><h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.12, margin: "12px 0" }}>Sua história também merece ser conhecida.</h2><p style={{ color: "#d7e8dc", lineHeight: 1.7, margin: 0 }}>Crie uma campanha e permita que outras pessoas encontrem uma forma de ajudar.</p></div>
          <Link href="/criar-conta" className="btn" style={{ background: "#fff", color: "var(--green-950)" }}>Criar vaquinha ↗</Link>
        </section>
      </div>
    </main>
    <style>{`@media(max-width:720px){.hero-loved{grid-template-columns:1fr!important}.loved-heart{display:none!important}}`}</style>
  </div>;
}
