"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";

export default function EditarCampanha() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [meta, setMeta] = useState("");
  const [categoria, setCategoria] = useState("outros");
  const [status, setStatus] = useState<"draft" | "paused">("draft");
  const [podeEditar, setPodeEditar] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/entrar"); return; }
        const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
        if (!ativo) return;
        if (error || !data) { setMensagem("Campanha não encontrada."); return; }
        if (data.owner_id !== session.user.id) { setMensagem("Você não tem permissão para editar esta campanha."); return; }
        if (data.status !== "draft" && data.status !== "paused") { setMensagem("Esta campanha não pode ser editada no status atual. Apenas rascunhos e campanhas pausadas podem ser alterados."); return; }
        const c = data as Campaign;
        setTitulo(c.title); setDescricao(c.description); setMeta((Number(c.goal_cents) / 100).toFixed(2).replace(".", ",")); setCategoria(c.category || "outros"); setStatus(c.status as "draft" | "paused"); setPodeEditar(true);
      } catch { if (ativo) setMensagem("Não foi possível carregar a campanha."); }
      finally { if (ativo) setCarregando(false); }
    }
    carregar();
    return () => { ativo = false; };
  }, [id, router]);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMensagem(""); setSalvando(true);
    try {
      const valorMeta = Number(meta.trim().replace(",", "."));
      if (!Number.isFinite(valorMeta) || valorMeta < 1) { setMensagem("A meta mínima é de R$ 1,00."); return; }
      if (titulo.trim().length < 5 || titulo.trim().length > 120) { setMensagem("O título deve ter entre 5 e 120 caracteres."); return; }
      if (descricao.trim().length < 20 || descricao.trim().length > 10000) { setMensagem("A descrição deve ter entre 20 e 10.000 caracteres."); return; }
      const slugBase = titulo.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }
      const { data, error } = await supabase.from("campaigns").update({ title: titulo.trim(), slug: `${slugBase || "campanha"}-${crypto.randomUUID().slice(0, 8)}`, description: descricao.trim(), goal_cents: Math.round(valorMeta * 100), category: categoria, status, updated_at: new Date().toISOString() }).eq("id", id).eq("owner_id", user.id).select("slug").single();
      if (error || !data) { setMensagem("Não foi possível salvar. Verifique se a campanha ainda está como rascunho ou pausada."); return; }
      router.push("/painel");
      router.refresh();
    } catch { setMensagem("Ocorreu um erro ao salvar as alterações."); }
    finally { setSalvando(false); }
  }

  if (carregando) return <div className="page-shell"><Header /><div className="container" style={{ padding: 48, textAlign: "center" }}>Carregando campanha…</div></div>;

  return (
    <div className="page-shell"><Header /><main className="container" style={{ maxWidth: 760, paddingTop: 38, paddingBottom: 72 }}>
      <Link href="/painel" style={{ color: "var(--green-800)", fontSize: 14, textDecoration: "none", fontWeight: 700 }}>← Voltar ao painel</Link>
      <div style={{ marginTop: 22, marginBottom: 26 }}><div className="eyebrow">Organize sua causa</div><h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "12px 0 8px" }}>Editar campanha</h1><p className="muted" style={{ margin: 0 }}>Revise os detalhes antes de enviar sua história para análise.</p></div>
      {!podeEditar ? <div role="alert" className="form-message form-message-error">{mensagem || "Esta campanha não pode ser editada."}</div> : (
        <form onSubmit={salvar} className="card" style={{ padding: "clamp(22px, 5vw, 36px)" }}>
          <label className="form-label" htmlFor="titulo">Título *</label><input id="titulo" className="form-control" value={titulo} onChange={e=>setTitulo(e.target.value)} required minLength={5} maxLength={120}/>
          <label className="form-label" htmlFor="descricao">Descrição *</label><textarea id="descricao" className="form-control" value={descricao} onChange={e=>setDescricao(e.target.value)} required minLength={20} maxLength={10000} rows={7}/>
          <label className="form-label" htmlFor="meta">Meta (R$) *</label><input id="meta" className="form-control" value={meta} onChange={e=>setMeta(e.target.value)} inputMode="decimal" required/>
          <label className="form-label" htmlFor="categoria">Categoria</label><select id="categoria" className="form-control" value={categoria} onChange={e=>setCategoria(e.target.value)}><option value="saude">Saúde</option><option value="educacao">Educação</option><option value="emergencia">Emergência</option><option value="animais">Animais</option><option value="projetos">Projetos sociais</option><option value="outros">Outros</option></select>
          <label className="form-label" htmlFor="status">Status</label><select id="status" className="form-control" value={status} onChange={e=>setStatus(e.target.value as "draft"|"paused")}><option value="draft">Rascunho</option><option value="paused">Pausada</option></select>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>A publicação e a retomada de campanhas ativas dependem das permissões e do fluxo de revisão configurados no sistema.</p>
          <button type="submit" disabled={salvando} className="btn btn-primary form-submit">{salvando ? "Salvando..." : "Salvar alterações"}</button>
          {mensagem && <p role="alert" className="form-message form-message-error" style={{ marginTop: 18 }}>{mensagem}</p>}
        </form>
      )}
    </main></div>
  );
}
