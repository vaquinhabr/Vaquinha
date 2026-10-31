"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { normalizeEmail, validateSignup } from "@/lib/validation.mjs";

export default function CriarConta() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [emailPendente, setEmailPendente] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setSucesso(false);
    setEmailPendente(false);

    const validationError = validateSignup({ name: nome, email, password: senha });
    if (validationError) {
      setMensagem(validationError);
      return;
    }

    setCarregando(true);
    const emailNormalizado = normalizeEmail(email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailNormalizado,
        password: senha,
        options: {
          data: { full_name: nome.trim(), display_name: nome.trim() },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        const lower = error.message.toLowerCase();
        setMensagem(traduzirErro(error.message, error.status));
        setEmailPendente(error.status === 429 || lower.includes("rate limit") || lower.includes("over_email_send_rate_limit"));
        return;
      }

      // Supabase obfuscates existing addresses in some auth configurations.
      if (data.user && data.user.identities?.length === 0) {
        setMensagem("Este e-mail pode já ter uma conta ou um cadastro pendente. Tente entrar, recuperar a senha ou solicitar a confirmação abaixo.");
        setEmailPendente(true);
        return;
      }

      setEmailPendente(!data.session);
      setSucesso(true);
      setMensagem(data.session
        ? "Sua conta foi criada e você já está conectado."
        : "Recebemos seu cadastro. Confira sua caixa de entrada e o spam para confirmar o e-mail. Não precisa preencher o formulário novamente.");
      setSenha("");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setMensagem(traduzirErro(detail));
    } finally {
      setCarregando(false);
    }
  }

  async function reenviarConfirmacao() {
    const emailNormalizado = normalizeEmail(email);
    if (!emailNormalizado) {
      setMensagem("Informe o e-mail usado no cadastro.");
      return;
    }
    setMensagem("");
    setSucesso(false);
    setReenviando(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailNormalizado,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setMensagem(traduzirErro(error.message, error.status));
        return;
      }
      setSucesso(true);
      setMensagem("Se houver um cadastro pendente para esse e-mail, enviaremos uma mensagem de confirmação. Confira também o spam.");
    } catch (err) {
      setMensagem(traduzirErro(err instanceof Error ? err.message : ""));
    } finally {
      setReenviando(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 1, paddingBottom: 48 }}>
      <div className="card form-card">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--green-800)", fontWeight: 700, fontSize: 14, marginBottom: 26 }}>← Voltar ao início</Link>
        <div className="eyebrow">Sua história começa aqui</div>
        <h1 className="form-title" style={{ marginTop: 14 }}>Crie sua conta.</h1>
        <p className="form-intro">Prepare o primeiro passo para reunir pessoas em torno da sua causa.</p>

        <form onSubmit={cadastrar} noValidate>
          <label className="form-label" htmlFor="nome">Nome completo</label>
          <input className="form-control" id="nome" name="name" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} maxLength={100} placeholder="Como podemos te chamar?" autoComplete="name" />

          <label className="form-label" htmlFor="email">E-mail</label>
          <input className="form-control" id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} placeholder="voce@exemplo.com.br" autoComplete="email" autoCapitalize="none" spellCheck={false} />

          <label className="form-label" htmlFor="senha">Crie uma senha</label>
          <input className="form-control" id="senha" name="password" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} maxLength={72} placeholder="Pelo menos 8 caracteres" autoComplete="new-password" />

          <button className="btn btn-primary form-submit" type="submit" disabled={carregando || reenviando}>{carregando ? "Criando sua conta..." : "Criar minha conta ↗"}</button>
        </form>

        {mensagem && <p role={sucesso ? "status" : "alert"} aria-live="polite" className={`form-message ${sucesso ? "form-message-success" : "form-message-error"}`} style={{ marginTop: 18 }}>{mensagem}</p>}
        {emailPendente && <button type="button" className="btn btn-secondary form-submit" onClick={reenviarConfirmacao} disabled={reenviando || carregando} style={{ marginTop: 10 }}>{reenviando ? "Enviando..." : "Reenviar e-mail de confirmação"}</button>}
        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: 14, color: "var(--muted)" }}>Já tem uma conta? <Link href="/entrar" style={{ color: "var(--green-800)", fontWeight: 700 }}>Entrar</Link></p>
        <p style={{ margin: "22px 0 0", textAlign: "center", color: "#8a968e", fontSize: 12, lineHeight: 1.6 }}>Cuide bem dos seus dados e nunca compartilhe sua senha.</p>
      </div>
    </main>
  );
}

function traduzirErro(msg: string, status?: number): string {
  const texto = msg.toLowerCase();
  if (status === 429 || texto.includes("rate limit") || texto.includes("too many requests") || texto.includes("over_email_send_rate_limit")) {
    return "O serviço de e-mail atingiu um limite temporário de envios. Aguarde antes de tentar novamente e evite repetir várias vezes. Para uso normal, o serviço de e-mail precisa ser configurado para produção.";
  }
  if (texto.includes("already registered") || texto.includes("user already registered")) {
    return "Este e-mail pode já ter uma conta. Tente entrar ou use a recuperação de senha.";
  }
  if (texto.includes("password") && (texto.includes("at least") || texto.includes("weak"))) {
    return "Escolha uma senha mais forte, com pelo menos 8 caracteres.";
  }
  if (texto.includes("invalid path specified in request url")) {
    return "A configuração do Supabase está incorreta. A URL e a chave pública configuradas precisam ser verificadas.";
  }
  if (texto.includes("invalid api key")) {
    return "A chave pública do Supabase não foi aceita. A configuração precisa ser verificada.";
  }
  if (texto.includes("invalid email") || texto.includes("unable to validate email address")) {
    return "Confira se o e-mail foi digitado corretamente.";
  }
  if (texto.includes("signup is disabled")) {
    return "O cadastro está desativado nas configurações de autenticação.";
  }
  if (texto.includes("redirect") && texto.includes("not allowed")) {
    return "O endereço de confirmação ainda não está autorizado no Supabase. Revise a lista de Redirect URLs.";
  }
  if (texto.includes("fetch") || texto.includes("network")) {
    return "Não foi possível conectar ao serviço de cadastro. Confira sua conexão e tente novamente.";
  }
  return "Não foi possível concluir o cadastro. Confira os dados e tente novamente mais tarde.";
}
