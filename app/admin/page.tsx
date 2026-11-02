"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminUser = {
  id: string; email: string; name: string; created_at: string;
  email_confirmed_at: string | null; last_sign_in_at: string | null; banned_until: string | null;
};
type Payment = {
  id: string; campaign_id: string; campaign_title: string; donor_display_name: string | null;
  amount_cents: number; currency: string; status: string; provider: string | null;
  provider_payment_id: string | null; paid_at: string | null; created_at: string;
};
type Campaign = {
  id: string; title: string; description: string; user_id: string; owner_name: string;
  status: "draft" | "pending_review" | "active" | "paused" | "completed" | "rejected";
  goal_amount: number; current_amount: number; created_at: string; image_url: string | null;
};

const statusLabels: Record<Campaign["status"], string> = {
  draft: "Rascunho", pending_review: "Aguardando análise", active: "Ativa", paused: "Pausada", completed: "Concluída", rejected: "Rejeitada",
};
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
const date = (value: string | null) => value ? new Date(value).toLocaleDateString("pt-BR") : "—";

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "campaigns" | "payments">("users");
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGoal, setEditGoal] = useState("0");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
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
      const [u, c, p] = await Promise.all([callAdmin("listUsers"), callAdmin("listCampaigns"), callAdmin("listPayments")]);
      setUsers(u.users ?? []); setCampaigns(c.campaigns ?? []); setPayments(p.payments ?? []); setAuthorized(true);
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

  function editCampaign(c: Campaign) {
    setEditing(c); setEditTitle(c.title); setEditDescription(c.description ?? "");
    setEditGoal(String(c.goal_amount ?? 0)); setEditImageUrl(c.image_url ?? "");
    setError(""); setMessage("");
  }

  async function saveCampaignEdit() {
    if (!editing) return;
    const goal = Number(editGoal);
    if (editTitle.trim().length < 5 || editTitle.trim().length > 120) { setError("O título deve ter entre 5 e 120 caracteres."); return; }
    if (editDescription.trim().length < 20 || editDescription.trim().length > 10000) { setError("A descrição deve ter entre 20 e 10.000 caracteres."); return; }
    if (!Number.isFinite(goal) || goal < 1) { setError("Informe uma meta válida maior que zero."); return; }
    if (editImageUrl.trim()) { try { const url = new URL(editImageUrl.trim()); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); } catch { setError("Informe um link válido de imagem começando com https:// ou http://."); return; } }
    setSavingEdit(true); setError(""); setMessage("");
    try {
      await callAdmin("updateCampaign", { id: editing.id, title: editTitle.trim(), description: editDescription.trim(), goal_amount: goal, image_url: editImageUrl.trim() || null });
      setMessage("Campanha atualizada com sucesso."); setEditing(null); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível atualizar a campanha."); }
    finally { setSavingEdit(false); }
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
              <button onClick={() => setTab("payments")} style={tabStyle(tab === "payments")}>Pagamentos</button>
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
          ) : tab === "campaigns" ? (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Campanha</th><th style={thStyle}>Responsável</th><th style={thStyle}>Meta</th><th style={thStyle}>Arrecadado</th><th style={thStyle}>Status</th><th style={thStyle}>Ações</th></tr></thead>
                <tbody>{visibleCampaigns.map(c => <tr key={c.id}>
                  <td style={tdStyle}><strong>{c.title}</strong><small style={smallStyle}>{c.id}</small></td>
                  <td style={tdStyle}>{c.owner_name || c.user_id}</td>
                  <td style={tdStyle}>{money(c.goal_amount)}</td><td style={tdStyle}>{money(c.current_amount)}</td>
                  <td style={tdStyle}><select value={c.status} disabled={busy === c.id} onChange={e => void perform(c.id, "updateCampaign", { id: c.id, status: e.target.value }, "Alterar o status desta campanha?")} style={inputStyle}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                  <td style={tdStyle}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button disabled={busy === c.id} onClick={() => editCampaign(c)} style={buttonStyle}>Editar campanha</button>
                    <button disabled={busy === c.id} onClick={() => void perform(c.id, "deleteCampaign", { id: c.id }, "Excluir esta campanha permanentemente? Esta ação não pode ser desfeita.")} style={{ ...buttonStyle, color: "#a52a2a", borderColor: "#f0c8c5" }}>Excluir</button>
                  </div></td>
                </tr>)}</tbody>
              </table>
              {!visibleCampaigns.length && <p>Nenhuma campanha encontrada.</p>}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
                <Stat label="Doações confirmadas" value={money(payments.filter(p => p.status === "paid").reduce((sum, p) => sum + Number(p.amount_cents || 0), 0) / 100)} />
                <Stat label="Pendentes" value={String(payments.filter(p => p.status === "pending").length)} />
                <Stat label="Falhas / estornos" value={String(payments.filter(p => ["failed", "refunded", "cancelled"].includes(p.status)).length)} />
              </div>
              <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Data</th><th style={thStyle}>Doador</th><th style={thStyle}>Campanha</th><th style={thStyle}>Valor</th><th style={thStyle}>Status</th><th style={thStyle}>Gateway / transação</th></tr></thead>
                <tbody>{payments.filter(p => (p.campaign_title + " " + (p.donor_display_name || "") + " " + p.status + " " + (p.provider_payment_id || "")).toLowerCase().includes(query.toLowerCase())).map(p => (
                  <tr key={p.id}>
                    <td style={tdStyle}>{date(p.created_at)}</td>
                    <td style={tdStyle}>{p.donor_display_name || "Doador"}</td>
                    <td style={tdStyle}>{p.campaign_title}</td>
                    <td style={tdStyle}>{money(Number(p.amount_cents || 0) / 100)}</td>
                    <td style={tdStyle}>{p.status === "paid" ? "Confirmado" : p.status === "pending" ? "Pendente" : p.status === "refunded" ? "Estornado" : p.status === "cancelled" ? "Cancelado" : "Falhou"}</td>
                    <td style={tdStyle}><strong>{p.provider || "—"}</strong><small style={smallStyle}>{p.provider_payment_id || p.id}</small></td>
                  </tr>
                ))}</tbody>
              </table>
              {!payments.length && <p>Nenhum pagamento registrado ainda.</p>}
            </div>
          )}
          <p style={{ margin: "18px 0 0", color: "#718075", fontSize: 12 }}>Listagem limitada aos primeiros 1.000 usuários e 500 campanhas. A autorização é verificada no servidor em cada ação.</p>
          {editing && <div role="dialog" aria-modal="true" aria-labelledby="edit-campaign-heading" style={modalBackdropStyle}>
            <section style={modalStyle}>
              <h2 id="edit-campaign-heading" style={{ marginTop: 0 }}>Editar campanha</h2>
              <label style={labelStyle}>Título<input value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={120} style={inputStyle}/></label>
              <label style={labelStyle}>Descrição<textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={6} maxLength={10000} style={{ ...inputStyle, resize: "vertical" }}/></label>
              <label style={labelStyle}>Meta de arrecadação (R$)<input type="number" min="1" step="0.01" value={editGoal} onChange={e => setEditGoal(e.target.value)} style={inputStyle}/></label>
              <label style={labelStyle}>Foto da campanha — URL da imagem<input type="url" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} placeholder="https://..." style={inputStyle}/></label>
              {editImageUrl && <img src={editImageUrl} alt="Prévia da campanha" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10, marginTop: 8 }} onError={e => { e.currentTarget.style.display = "none"; }} />}
              <p style={{ color: "#617267", fontSize: 12 }}>Cole o link público da foto. O arquivo precisa estar hospedado em um endereço acessível pela internet.</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
                <button disabled={savingEdit} onClick={() => setEditing(null)} style={buttonStyle}>Cancelar</button>
                <button disabled={savingEdit} onClick={() => void saveCampaignEdit()} style={{ ...buttonStyle, background: "#267247", color: "#fff" }}>{savingEdit ? "Salvando…" : "Salvar alterações"}</button>
              </div>
            </section>
          </div>}
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

const labelStyle: React.CSSProperties = { display: "grid", gap: 7, marginTop: 14, fontSize: 13, fontWeight: 700 };
const modalBackdropStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(8,25,14,.55)", zIndex: 1000, display: "grid", placeItems: "center", padding: 16 };
const modalStyle: React.CSSProperties = { width: "min(100%, 640px)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 70px rgba(0,0,0,.25)" };
