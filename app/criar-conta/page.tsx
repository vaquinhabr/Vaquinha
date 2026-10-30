"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CriarConta() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setSucesso(false);
    setCarregando(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: { data: { full_name: nome.trim(), display_name: nome.trim() } },
      });

      if (error) {
        setMensagem(traduzirErro(error.message));
        return;
      }

      setSucesso(true);
      setMensagem("Cadastro iniciado! Se a confirmação por e-mail estiver ativa, confira sua caixa de entrada para ativar a conta.");
      setNome("");
      setEmail("");
      setSenha("");
    } catch {
      setMensagem("Não foi possível concluir o cadastro agora. Confira a conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 1, paddingBottom: 48 }}>
      <div className="card form-card">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--green-800)", fontWeight: 700, fontSize: 14, marginBottom: 26 }}>← Voltar ao início</Link>
        <div className="eyebrow">Sua história começa aqui</div>
        <h1 className="form-title" style={{ marginTop: 14 }}>Crie sua conta.</h1>
        <p className="form-intro">Prepare o primeiro passo para reunir pessoas em torno da sua causa.</p>

        <form onSubmit={cadastrar}>
          <label className="form-label" htmlFor="nome">Nome completo</label>
          <input className="form-control" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} maxLength={100} placeholder="Como podemos te chamar?" autoComplete="name" />

          <label className="form-label" htmlFor="email">E-mail</label>
          <input className="form-control" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} placeholder="voce@exemplo.com.br" autoComplete="email" />

          <label className="form-label" htmlFor="senha">Crie uma senha</label>
          <input className="form-control" id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} maxLength={72} placeholder="Pelo menos 8 caracteres" autoComplete="new-password" />

          <button className="btn btn-primary form-submit" type="submit" disabled={carregando}>{carregando ? "Criando sua conta..." : "Criar minha conta ↗"}</button>
        </form>

        {mensagem && <p role="status" aria-live="polite" className={`form-message ${sucesso ? "form-message-success" : "form-message-error"}`} style={{ marginTop: 18 }}>{mensagem}</p>}
        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: 14, color: "var(--muted)" }}>Já tem uma conta? <Link href="/entrar" style={{ color: "var(--green-800)", fontWeight: 700 }}>Entrar</Link></p>
        <p style={{ margin: "22px 0 0", textAlign: "center", color: "#8a968e", fontSize: 12, lineHeight: 1.6 }}>Cuide bem dos seus dados e nunca compartilhe sua senha.</p>
      </div>
    </main>
  );
}

function traduzirErro(msg: string): string {
  const mapa: Record<string, string> = {
    "User already registered": "Este e-mail já está cadastrado. Tente entrar na sua conta.",
    "Password should be at least 6 characters": "A senha precisa ter pelo menos 8 caracteres.",
    "Invalid path specified in request URL.": "A configuração do Supabase está incorreta. Verifique a URL e a chave pública configuradas na Vercel.",
    "Unable to validate email address: invalid format": "Confira se o e-mail foi digitado corretamente.",
    "Signup is disabled": "O cadastro está temporariamente desativado. Tente novamente mais tarde.",
  };
  return mapa[msg] || "Não foi possível criar a conta. Verifique os dados e tente novamente.";
}
