"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { parseBRLToCents, slugify } from "@/lib/validation.mjs";

export default function NovaCampanha() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [meta, setMeta] = useState("");
  const [categoria, setCategoria] = useState("outros");

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ativo) return;
      if (!session) router.replace("/entrar");
      else setCarregando(false);
    }).catch(() => {
      if (ativo) { setMensagem("Não foi possível verificar sua sessão. Entre novamente."); setCarregando(false); }
    });
    return () => { ativo = false; };
  }, [router]);

  async function criar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setSalvando(true);
    try {
      const metaCentavos = parseBRLToCents(meta);
      if (metaCentavos === null) {
        setMensagem("Informe uma meta válida de pelo menos R$ 1,00. Exemplo: 2.500,00.");
        return;
      }
      if (titulo.trim().length < 5 || titulo.trim().length > 120) {
        setMensagem("O título deve ter entre 5 e 120 caracteres.");
        return;
      }
      if (descricao.trim().length < 20 || descricao.trim().length > 10000) {
        setMensagem("Conte sua história em pelo menos 20 caracteres (máximo 10.000).");
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setMensagem("Sua sessão expirou. Entre novamente para criar a campanha.");
        router.replace("/entrar");
        return;
      }

      const slugBase = slugify(titulo);
      const slug = `${slugBase || "campanha"}-${crypto.randomUUID().slice(0, 8)}`;
      const { data, error } = await supabase.from("campaigns").insert({
        owner_id: user.id,
        title: titulo.trim(),
        slug,
        description: descricao.trim(),
        goal_cents: metaCentavos,
        category: categoria,
        status: "draft",
      }).select("id, slug").single();

      if (error) {
        setMensagem(error.message.includes("row-level security") ? "Não foi possível salvar por causa das permissões da conta. Confira as políticas de segurança do banco." : "Não foi possível salvar sua campanha. Revise os dados e tente novamente.");
        return;
      }

      router.push(`/campanhas/${data.slug || data.id}`);
      router.refresh();
    } catch {
      setMensagem("Ocorreu um erro ao criar a campanha. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className="page-shell"><Header /><div className="container" style={{ padding: 48, textAlign: "center" }}>Verificando sua conta…</div></div>;

  return (
    <div className="page-shell">
      <Header />
      <main className="container" style={{ maxWidth: 760, paddingTop: 38, paddingBottom: 72 }}>
        <Link href="/painel" style={{ color: "var(--green-800)", fontSize: 14, textDecoration: "none", fontWeight: 700 }}>← Voltar ao painel</Link>
        <div style={{ marginTop: 22, marginBottom: 26 }}>
          <div className="eyebrow">Vamos começar</div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "12px 0 8px" }}>Conte a história da sua causa.</h1>
          <p className="muted" style={{ lineHeight: 1.7, margin: 0 }}>Preencha os detalhes com clareza. Sua campanha será salva como rascunho para você revisar antes de publicar.</p>
        </div>
        <form onSubmit={criar} className="card" style={{ padding: "clamp(22px, 5vw, 36px)" }}>
          <label className="form-label" htmlFor="titulo">Título da campanha *</label>
          <input id="titulo" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} required minLength={5} maxLength={120} placeholder="Ex.: Ajude a reconstruir nossa casa" />
          <label className="form-label" htmlFor="descricao">Conte sua história *</label>
          <textarea id="descricao" className="form-control" value={descricao} onChange={(e) => setDescricao(e.target.value)} required minLength={20} maxLength={10000} rows={7} placeholder="Explique o que aconteceu, de que forma as doações vão ajudar e por que essa causa é importante." />
          <label className="form-label" htmlFor="meta">Meta de arrecadação (R$) *</label>
          <input id="meta" className="form-control" type="text" inputMode="decimal" value={meta} onChange={(e) => setMeta(e.target.value)} required placeholder="Ex.: 2500,00" />
          <label className="form-label" htmlFor="categoria">Categoria *</label>
          <select id="categoria" className="form-control" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
            <option value="saude">Saúde</option><option value="educacao">Educação</option><option value="emergencia">Emergência</option><option value="animais">Animais</option><option value="projetos">Projetos sociais</option><option value="outros">Outros</option>
          </select>
          <div style={{ padding: 14, borderRadius: 12, background: "var(--green-50)", color: "var(--green-900)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>🔒 Por segurança, novas campanhas começam como rascunho. A publicação deve ocorrer após revisão.</div>
          <button type="submit" disabled={salvando} className="btn btn-primary form-submit">{salvando ? "Salvando campanha..." : "Salvar campanha ↗"}</button>
          {mensagem && <p role="alert" className="form-message form-message-error" style={{ marginTop: 18 }}>{mensagem}</p>}
        </form>
      </main>
    </div>
  );
}
