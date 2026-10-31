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
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBusca(params.get("q") ?? "");
    const categoriaInicial = params.get("category") ?? "todas";
    if (["saude","educacao","emergencia","animais","projetos","outros"].includes(categoriaInicial)) setCategoria(categoriaInicial);
  }, []);

  const campanhasFiltradas = campanhas.filter((campanha) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const correspondeBusca = !termo || [campanha.title, campanha.description, campanha.slug]
      .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo));
    const correspondeCategoria = categoria === "todas" || campanha.category === categoria;
    return correspondeBusca && correspondeCategoria;
  });

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
          <Link href="/criar-vaquinha" className="btn btn-primary">Criar campanha ↗</Link>
        </div>

        <section aria-label="Filtros de campanhas" className="card" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(190px, 240px)", gap: 12, padding: 16, marginBottom: 28 }}>
          <label>
            <span className="form-label">Buscar campanha</span>
            <input className="form-control" type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Digite o nome ou uma palavra-chave" style={{ marginBottom: 0 }} />
          </label>
          <label>
            <span className="form-label">Categoria</span>
            <select className="form-control" value={categoria} onChange={(event) => setCategoria(event.target.value)} style={{ marginBottom: 0 }}>
              <option value="todas">Todas as categorias</option>
              {Object.entries(categoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </section>

        {carregando ? <div className="card" style={{ padding: 42, textAlign: "center", color: "var(--muted)" }}>Carregando campanhas…</div> :
          erro ? <div className="form-message form-message-error" role="alert">{erro}</div> :
          campanhas.length === 0 ? (
            <div className="card" style={{ padding: "clamp(30px, 6vw, 64px) 24px", textAlign: "center" }}>
              <div aria-hidden="true" style={{ fontSize: 54, marginBottom: 16 }}>🌱</div>
              <h2 style={{ margin: "0 0 10px" }}>Toda grande mudança começa com uma história.</h2>
              <p className="muted" style={{ maxWidth: 500, margin: "0 auto 22px", lineHeight: 1.7 }}>Ainda não há campanhas publicadas. Você pode ser a primeira pessoa a compartilhar uma causa por aqui.</p>
              <Link href="/criar-vaquinha" className="btn btn-primary">Começar minha vaquinha</Link>
            </div>
          ) : campanhasFiltradas.length === 0 ? (
            <div className="card" style={{ padding: "44px 24px", textAlign: "center" }}>
              <div aria-hidden="true" style={{ fontSize: 42, marginBottom: 12 }}>🔎</div>
              <h2 style={{ margin: "0 0 8px" }}>Nenhuma campanha encontrada</h2>
              <p className="muted" style={{ margin: "0 0 18px" }}>Tente outro termo ou escolha uma categoria diferente.</p>
              <button type="button" className="btn btn-secondary" onClick={() => { setBusca(""); setCategoria("todas"); }}>Limpar filtros</button>
            </div>
          ) : (
            <section aria-label="Campanhas ativas" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))", gap: 20 }}>
              {campanhasFiltradas.map((c) => (
                <Link key={c.id} href={`/campanhas/${c.slug || c.id}`} className="card" style={{ overflow: "hidden", display: "block", textDecoration: "none" }}>
                  <div style={{ height: 174, background: c.image_url ? `linear-gradient(0deg, rgba(18,60,43,.16), rgba(18,60,43,0)), url("${c.image_url}") center/cover` : "linear-gradient(135deg, #e1f2e5, #f8edda)", display: "grid", placeItems: "center" }}>
                    {!c.image_url && <span aria-hidden="true" style={{ fontSize: 54 }}>{c.category === "animais" ? "🐾" : c.category === "saude" ? "💚" : c.category === "educacao" ? "📚" : "🤝"}</span>}
                  </div>
                  <div style={{ padding: 22 }}>
                    <span style={{ color: "var(--green-800)", fontSize: 12, fontWeight: 700 }}>{categoryLabel[c.category] || "Uma causa importante"}</span>
                    <h2 style={{ fontSize: 20, lineHeight: 1.35, margin: "9px 0" }}>{c.title}</h2>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, margin: "0 0 18px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, fontSize: 12, color: "var(--muted)" }}><span>Meta da campanha</span><strong style={{ color: "var(--green-900)" }}>{dinheiro(Number(c.goal_cents))}</strong></div>
                    <span style={{ display: "inline-block", marginTop: 18, color: "var(--green-800)", fontSize: 14, fontWeight: 700 }}>Conhecer a história →</span>
                  </div>
                </Link>
              ))}
            </section>
          )}
        <style>{`@media (max-width: 640px) { section[aria-label="Filtros de campanhas"] { grid-template-columns: 1fr !important; } }`}</style>
      </main>
    </div>
  );
}
