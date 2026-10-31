"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/validation.mjs";

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"erro" | "info">("erro");
  const [carregando, setCarregando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setTipoMensagem("erro");
    setCarregando(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password: senha });
      if (error) {
        setMensagem(traduzirErro(error.message, error.status));
        return;
      }
      if (data.session) {
        const requested = new URLSearchParams(window.location.search).get("redirectTo");
        const destino = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/painel";
        router.replace(destino);
        router.refresh();
      } else {
        setMensagem("Não foi possível iniciar sua sessão. Tente novamente.");
      }
    } catch (err) {
      setMensagem(traduzirErro(err instanceof Error ? err.message : ""));
    } finally {
      setCarregando(false);
    }
  }

  async function recuperarSenha() {
    const emailNormalizado = normalizeEmail(email);
    if (!emailNormalizado) {
      setMensagem("Digite seu e-mail no campo acima e depois clique em “Esqueci minha senha”.");
      setTipoMensagem("info");
      return;
    }
    setMensagem("");
    setRecuperando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailNormalizado, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setMensagem(traduzirErro(error.message, error.status));
        return;
      }
      setTipoMensagem("info");
      setMensagem("Se existir uma conta para esse e-mail, você receberá instruções de recuperação. Confira a caixa de entrada e a pasta de spam.");
    } catch (err) {
      setMensagem(traduzirErro(err instanceof Error ? err.message : ""));
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 1, paddingBottom: 48 }}>
      <div className="card form-card">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--green-800)", fontWeight: 700, fontSize: 14, marginBottom: 26 }}>← Voltar ao início</Link>
        <div className="eyebrow">Bom ter você de volta</div>
        <h1 className="form-title" style={{ marginTop: 14 }}>Entre na sua conta.</h1>
        <p className="form-intro">Acompanhe suas campanhas e continue construindo sua história.</p>
        <form onSubmit={entrar}>
          <label className="form-label" htmlFor="email">E-mail</label>
          <input className="form-control" id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com.br" required autoComplete="email" autoCapitalize="none" spellCheck={false} />
          <label className="form-label" htmlFor="senha">Senha</label>
          <input className="form-control" id="senha" name="password" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" required autoComplete="current-password" />
          <button className="btn btn-primary form-submit" type="submit" disabled={carregando || recuperando}>{carregando ? "Entrando..." : "Entrar na minha conta ↗"}</button>
        </form>
        <button type="button" onClick={recuperarSenha} disabled={carregando || recuperando} style={{ display: "block", margin: "14px auto 0", border: 0, background: "transparent", color: "var(--green-800)", cursor: carregando || recuperando ? "wait" : "pointer", fontWeight: 700, fontSize: 14 }}>{recuperando ? "Enviando instruções..." : "Esqueci minha senha"}</button>
        {mensagem && <p role={tipoMensagem === "info" ? "status" : "alert"} aria-live="polite" className={`form-message ${tipoMensagem === "info" ? "form-message-success" : "form-message-error"}`} style={{ marginTop: 18 }}>{mensagem}</p>}
        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: 14, color: "var(--muted)" }}>Ainda não tem conta? <Link href="/criar-conta" style={{ color: "var(--green-800)", fontWeight: 700 }}>Criar conta</Link></p>
      </div>
    </main>
  );
}

function traduzirErro(msg: string, status?: number): string {
  const texto = msg.toLowerCase();
  if (status === 429 || texto.includes("rate limit") || texto.includes("too many requests") || texto.includes("over_email_send_rate_limit")) {
    return "O serviço de autenticação atingiu um limite temporário. Aguarde antes de tentar novamente.";
  }
  if (texto.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (texto.includes("email not confirmed")) return "Seu e-mail ainda não foi confirmado. Confira a caixa de entrada e o spam.";
  if (texto.includes("invalid path specified in request url")) return "A configuração do Supabase está incorreta. A URL e a chave pública precisam ser verificadas.";
  if (texto.includes("invalid api key")) return "A chave pública do Supabase não foi aceita. A configuração precisa ser verificada.";
  if (texto.includes("signup is disabled")) return "O cadastro está temporariamente desativado.";
  if (texto.includes("redirect") && texto.includes("not allowed")) return "O endereço de recuperação ainda não está autorizado no Supabase. Revise a lista de Redirect URLs.";
  if (texto.includes("fetch") || texto.includes("network")) return "Não foi possível conectar ao serviço. Confira sua conexão e tente novamente.";
  return "Não foi possível concluir a solicitação. Confira os dados e tente novamente mais tarde.";
}
