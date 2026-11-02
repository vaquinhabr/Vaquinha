 "use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type Campaign = { id: string; title: string; status: string; slug?: string };
type PaymentResult = { donation_id: string; status: string; payment: Record<string, unknown> };

function findPixValues(input: unknown): { qr: string; copyPaste: string; expires: string } {
  const root = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
  const pix = data.pix && typeof data.pix === "object" ? data.pix as Record<string, unknown> : {};
  const qr = String(data.qr_code_image ?? data.qr_code_url ?? data.qrcode_url ?? pix.qr_code_image ?? pix.qr_code_url ?? "");
  const copyPaste = String(data.pix_copy_paste ?? data.copy_paste ?? data.br_code ?? data.qr_code ?? data.emv ?? pix.copy_paste ?? pix.qr_code ?? "");
  const expires = String(data.expires_at ?? data.expiration_date ?? pix.expires_at ?? "");
  return { qr, copyPaste, expires };
}

export default function DoarCampanhaPage() {
  const params = useParams();
  const routeId = decodeURIComponent(params.id as string);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState("25,00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      let query = supabase.from("campaigns").select("id,title,status,slug").eq("id", routeId);
      let { data } = await query.maybeSingle();
      if (!data) {
        const bySlug = await supabase.from("campaigns").select("id,title,status,slug").eq("slug", routeId).maybeSingle();
        data = bySlug.data;
      }
      if (active && data) setCampaign(data as Campaign);
      if (active && !data) setError("Não encontramos esta campanha.");
    }
    if (routeId) void load();
    return () => { active = false; };
  }, [routeId]);

  async function createPix(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!campaign) return;
    const normalized = amount.trim().includes(",") ? amount.trim().replace(/\./g, "").replace(",", ".") : amount.trim();
    const value = Number(normalized);
    if (!Number.isFinite(value) || value < 1 || value > 1000000) {
      setError("Informe um valor entre R$ 1,00 e R$ 1.000.000,00.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/payments/eleva/pix", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id, amount_cents: Math.round(value * 100),
          payer_name: name, payer_email: email, payer_cpf: cpf, payer_phone: phone,
          is_anonymous: anonymous,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a cobrança Pix.");
      setResult(data as PaymentResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a cobrança Pix.");
    } finally { setLoading(false); }
  }

  const pix = result ? findPixValues(result.payment) : null;
  return <div className="page-shell" style={{ minHeight: "100vh", background: "#f6f8f6" }}>
    <Header />
    <main className="container" style={{ maxWidth: 720, padding: "40px 20px 72px" }}>
      <Link href={campaign ? "/campanhas/" + (campaign.slug || campaign.id) : "/campanhas"} style={{ color: "#26774c", fontWeight: 700, textDecoration: "none" }}>← Voltar para a campanha</Link>
      <section className="card" style={{ marginTop: 18, padding: "clamp(22px, 4vw, 36px)", background: "#fff" }}>
        <span className="eyebrow">DOAÇÃO SEGURA VIA PIX</span>
        <h1 style={{ margin: "10px 0", color: "#173b2a" }}>{campaign ? campaign.title : "Contribuir com a campanha"}</h1>
        {!result ? <>
          <p className="muted" style={{ lineHeight: 1.7 }}>Escolha o valor e informe seus dados para gerar uma cobrança Pix. A doação será contabilizada somente após a confirmação do pagamento.</p>
          <form onSubmit={createPix} style={{ display: "grid", gap: 14 }}>
            <label style={labelStyle}>Valor da doação (R$)<input required value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="25,00" style={inputStyle}/></label>
            <label style={labelStyle}>Nome completo<input required minLength={2} maxLength={120} value={name} onChange={e => setName(e.target.value)} style={inputStyle}/></label>
            <label style={labelStyle}>E-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}/></label>
            <label style={labelStyle}>CPF ou CNPJ<input required value={cpf} onChange={e => setCpf(e.target.value)} inputMode="numeric" maxLength={18} placeholder="Somente para identificação do pagamento" style={inputStyle}/></label>
            <label style={labelStyle}>Telefone (opcional)<input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" style={inputStyle}/></label>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13 }}><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}/> Exibir minha doação como anônima</label>
            {error && <p role="alert" style={errorStyle}>{error}</p>}
            <button className="btn btn-primary" disabled={loading || !campaign || campaign.status !== "active"} style={{ width: "100%" }}>{loading ? "Gerando Pix…" : "Gerar cobrança Pix"}</button>
            {campaign?.status !== "active" && <p role="status" className="muted">Esta campanha não está ativa para receber doações.</p>}
          </form>
        </> : <div style={{ display: "grid", gap: 16 }}>
          <div role="status" style={{ padding: 14, background: "#fff8e5", color: "#805b13", borderRadius: 12 }}>Pagamento pendente. Esta doação será confirmada automaticamente quando a Eleva Payments notificar o sistema.</div>
          {pix?.qr && <div style={{ textAlign: "center" }}><img src={pix.qr.startsWith("data:") || pix.qr.startsWith("https://") ? pix.qr : "data:image/png;base64," + pix.qr} alt="QR Code Pix para pagamento" style={{ maxWidth: 260, width: "100%", margin: "0 auto" }}/></div>}
          {pix?.copyPaste && <label style={labelStyle}>Pix copia e cola<textarea readOnly value={pix.copyPaste} rows={4} style={inputStyle}/><button type="button" className="btn btn-secondary" onClick={() => void navigator.clipboard.writeText(pix.copyPaste)} style={{ marginTop: 8 }}>Copiar código Pix</button></label>}
          {!pix?.qr && !pix?.copyPaste && <p className="muted">A cobrança foi criada. A resposta do gateway não trouxe campos de QR Code reconhecidos pela interface. ID da doação: {result.donation_id}</p>}
          {pix?.expires && <p className="muted">Expira em: {pix.expires}</p>}
          <button type="button" className="btn btn-secondary" onClick={() => { setResult(null); setError(""); }}>Voltar</button>
        </div>}
      </section>
    </main>
  </div>;
}

const labelStyle: React.CSSProperties = { display: "grid", gap: 7, color: "#24432e", fontSize: 13, fontWeight: 700 };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #d8e2d9", borderRadius: 9, padding: "11px 12px", background: "#fff", color: "#173b2a", font: "inherit" };
const errorStyle: React.CSSProperties = { padding: 12, background: "#fff0ee", color: "#9b2c20", borderRadius: 9, fontSize: 13 };
