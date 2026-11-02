"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminUser = {
  id: string; email: string; name: string; created_at: string;
  email_confirmed_at: string | null; last_sign_in_at: string | null; banned_until: string | null;
};
type Campaign = {
  id: string; title: string; description: string; user_id: string; owner_name: string;
  status: "draft" | "pending_review" | "active" | "paused" | "completed" | "rejected";
  goal_amount: number; current_amount: number; created_at: string;
};

const statusLabels: Record<Campaign["status"], string> = {
  draft: "Rascunho", pending_review: "Aguardando análise", active: "Ativa", paused: "Pausada", completed: "Concluída", rejected: "Rejeitada",
};
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
const date = (value: string | null) => value ? new Date(value).toLocaleDateString("pt-BR") : "—";

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "campaigns">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const callAdmin = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-api", { body: { action, ...payload } });
    if (error) {
      let detail = error.message || "Falha ao acessar o painel administrativo.";
      try { const ctx = (error as { context?: unknown }).context; if (ctx instanceof Response) { const payload = await ctx.clone().json(); if (payload?.error) detail = payload.error; } } catch { /* response may not contain JSON */ }
      throw new Error(detail);
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [u, c] = await Promise.all([callAdmin("listUsers"), callAdmin("listCampaigns")]);
      setUsers(u.users ?? []); setCampaigns(c.campaigns ?? []); setAuthorized(true);
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Não foi possível carregar o painel.";
      setError(detail);
      if (detail.toLowerCase().includes("acesso restrito") || detail.toLowerCase().includes("sessão necessária") || detail.toLowerCase().includes("sessão inválida")) setAuthorized(false);
    } finally { setLoading(false); }
  }, [callAdmin]);

  useEffect(() => { void refresh(); }, [refresh]);

  const visibleUsers = useMemo(() => users.filter((u) =>
    (u.email + " " + u.name).toLowerCase().includes(query.toLowerCase())), [users, query]);
  const visibleCampaigns = useMemo(() => campaigns.filter((c) =>
    (c.title + " " + c.owner_name + " " + c.user_id).toLowerCase().includes(query.toLowerCase())), [campaigns, query]);

  async function perform(key: string, action: string, payload: Record<string, unknown>, confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return;
    setBusy(key); setMessage(""); setError("");
    try {
      await callAdmin(action, payload);
      setMessage("Alteração realizada com sucesso.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível realizar a alteração.");
    } finally { setBusy(""); }
  }

  async function editCampaign(c: Campaign) {
    const title = window.prompt("Título da campanha:", c.title);
    if (title === null) return;
    const trimmed = title.trim();
    if (trimmed.length < 3) { setError("O título precisa ter pelo menos 3 caracteres."); return; }
    await perform(c.id, "updateCampaign", { id: c.id, title: trimmed });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/entrar";
  }

  if (authorized === false) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f7f4", padding: 24, color: "#173b2a" }}><section style={{ maxWidth: 460, background: "#fff", border: "1px solid #e2e9e3", borderRadius: 18, padding: 28, textAlign: "center" }}><h1 style={{ marginTop: 0 }}>Área restrita</h1><p>Esta área está disponível somente para a conta administradora autorizada.</p><p style={{ color: "#718075", fontSize: 13 }}>{error}</p><Link href="/entrar" style={{ color: "#267247", fontWeight: 700 }}>Entrar com outra conta</Link><span> · </span><Link href="/" style={{ color: "#267247", fontWeight: 700 }}>Voltar ao início</Link></section></main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f4f7f4", color: "#173b2a", padding: "28px 18px 60px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
          <div>
            <Link href="/" style={{ color: "#267247", textDecoration: "none", fontWeight: 700 }}>← Vaquinha</Link>
            <p style={{ margin: "16px 0 5px", fontSize: 12, fontWeight: 800, letterSpacing: 2, color: "#267247" }}>ÁREA RESTRITA</p>
            <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)" }}>Painel administrativo</h1>
            <p style={{ margin: "8px 0 0", color: "#617267" }}>Gerencie contas e campanhas em um só lugar.</p>
          </div>
          <button onClick={signOut} style={buttonStyle}>Sair da conta</button>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 22 }}>
          <Stat label="Usuários" value={users.length.toLocaleString("pt-BR")} />
          <Stat label="Campanhas" value={campaigns.length.toLocaleString("pt-BR")} />
          <Stat label="Campanhas ativas" value={campaigns.filter(c => c.status === "active").length.toLocaleString("pt-BR")} />
          <Stat label="Contas bloqueadas" value={users.filter(u => u.banned_until && new Date(u.banned_until) > new Date()).length.toLocaleString("pt-BR")} />
        </section>

        <section style={{ background: "#fff", border: "1px solid #e2e9e3", borderRadius: 18, padding: 20, boxShadow: "0 8px 28px rgba(25,65,38,.05)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setTab("users")} style={tabStyle(tab === "users")}>Usuários</button>
              <button onClick={() => setTab("campaigns")} style={tabStyle(tab === "campaigns")}>Campanhas</button>
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar..." aria-label="Buscar usuários ou campanhas" style={{ ...inputStyle, maxWidth: 340 }} />
          </div>

          {message && <p role="status" style={noticeStyle}>{message}</p>}
          {error && <p role="alert" style={{ ...noticeStyle, background: "#fff0ee", color: "#9b2c20" }}>{error}</p>}
          {loading ? <p>Carregando dados administrativos…</p> : tab === "users" ? (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Usuário</th><th style={thStyle}>Cadastro</th><th style={thStyle}>Último acesso</th><th style={thStyle}>E-mail</th><th style={thStyle}>Ações</th></tr></thead>
                <tbody>{visibleUsers.map(u => {
                  const banned = !!u.banned_until && new Date(u.banned_until) > new Date();
                  return <tr key={u.id}>
                    <td style={tdStyle}><strong>{u.name || "Sem nome"}</strong><small style={smallStyle}>{u.email}</small></td>
                    <td style={tdStyle}>{date(u.created_at)}</td>
                    <td style={tdStyle}>{date(u.last_sign_in_at)}</td>
                    <td style={tdStyle}>{u.email_confirmed_at ? "Confirmado" : "Pendente"}</td>
                    <td style={tdStyle}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button disabled={busy === u.id} onClick={() => void perform(u.id, banned ? "unbanUser" : "banUser", { id: u.id }, banned ? "Desbloquear esta conta?" : "Bloquear esta conta? O usuário não poderá entrar.")} style={buttonStyle}>{banned ? "Desbloquear" : "Bloquear"}</button>
                      <button disabled={busy === u.id} onClick={() => void perform(u.id, "deleteUser", { id: u.id }, "Excluir permanentemente esta conta? As campanhas relacionadas podem ser removidas por cascata. Esta ação não pode ser desfeita.")} style={{ ...buttonStyle, color: "#a52a2a", borderColor: "#f0c8c5" }}>Excluir</button>
                    </div></td>
                  </tr>;
                })}</tbody>
              </table>
              {!visibleUsers.length && <p>Nenhum usuário encontrado.</p>}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Campanha</th><th style={thStyle}>Responsável</th><th style={thStyle}>Meta</th><th style={thStyle}>Arrecadado</th><th style={thStyle}>Status</th><th style={thStyle}>Ações</th></tr></thead>
                <tbody>{visibleCampaigns.map(c => <tr key={c.id}>
                  <td style={tdStyle}><strong>{c.title}</strong><small style={smallStyle}>{c.id}</small></td>
                  <td style={tdStyle}>{c.owner_name || c.user_id}</td>
                  <td style={tdStyle}>{money(c.goal_amount)}</td><td style={tdStyle}>{money(c.current_amount)}</td>
                  <td style={tdStyle}><select value={c.status} disabled={busy === c.id} onChange={e => void perform(c.id, "updateCampaign", { id: c.id, status: e.target.value }, "Alterar o status desta campanha?")} style={inputStyle}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                  <td style={tdStyle}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button disabled={busy === c.id} onClick={() => void editCampaign(c)} style={buttonStyle}>Editar título</button>
                    <button disabled={busy === c.id} onClick={() => void perform(c.id, "deleteCampaign", { id: c.id }, "Excluir esta campanha permanentemente? Esta ação não pode ser desfeita.")} style={{ ...buttonStyle, color: "#a52a2a", borderColor: "#f0c8c5" }}>Excluir</button>
                  </div></td>
                </tr>)}</tbody>
              </table>
              {!visibleCampaigns.length && <p>Nenhuma campanha encontrada.</p>}
            </div>
          )}
          <p style={{ margin: "18px 0 0", color: "#718075", fontSize: 12 }}>Listagem limitada aos primeiros 1.000 usuários e 500 campanhas. A autorização é verificada no servidor em cada ação.</p>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div style={{ padding: 20, background: "#fff", border: "1px solid #e2e9e3", borderRadius: 16 }}><p style={{ margin: 0, color: "#6c7c70", fontSize: 13 }}>{label}</p><strong style={{ display: "block", fontSize: 30, marginTop: 8 }}>{value}</strong></div>;
}
const buttonStyle: React.CSSProperties = { border: "1px solid #d9e4da", background: "#fff", color: "#225c39", padding: "9px 12px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 12 };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #d8e2d9", borderRadius: 9, padding: "10px 12px", background: "#fff", color: "#173b2a" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 10px", color: "#6a7c6e", borderBottom: "1px solid #e4ebe4", whiteSpace: "nowrap" };
const tdStyle: React.CSSProperties = { padding: "14px 10px", borderBottom: "1px solid #edf1ed", verticalAlign: "top" };
const smallStyle: React.CSSProperties = { display: "block", marginTop: 4, color: "#758379", fontSize: 11, overflowWrap: "anywhere" };
const noticeStyle: React.CSSProperties = { padding: 12, background: "#e9f7ed", color: "#225c39", borderRadius: 9 };
const tabStyle = (active: boolean): React.CSSProperties => ({ border: active ? "1px solid #267247" : "1px solid #d9e4da", background: active ? "#267247" : "#fff", color: active ? "#fff" : "#225c39", padding: "10px 14px", borderRadius: 10, fontWeight: 700, cursor: "pointer" });
