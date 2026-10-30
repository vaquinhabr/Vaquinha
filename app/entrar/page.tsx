"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) {
        setMensagem(traduzirErro(error.message));
        return;
      }
      if (data.session) {
        router.replace("/painel");
        router.refresh();
      } else {
        setMensagem("Não foi possível iniciar sua sessão. Tente novamente.");
      }
    } catch {
      setMensagem("Não foi possível entrar agora. Confira a conexão e tente novamente.");
    } finally {
      setCarregando(false);
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
          <input className="form-control" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com.br" required autoComplete="email" />
          <label className="form-label" htmlFor="senha">Senha</label>
          <input className="form-control" id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" required autoComplete="current-password" />
          <button className="btn btn-primary form-submit" type="submit" disabled={carregando}>{carregando ? "Entrando..." : "Entrar na minha conta ↗"}</button>
        </form>
        {mensagem && <p role="alert" className="form-message form-message-error" style={{ marginTop: 18 }}>{mensagem}</p>}
        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: 14, color: "var(--muted)" }}>Ainda não tem conta? <Link href="/criar-conta" style={{ color: "var(--green-800)", fontWeight: 700 }}>Criar conta</Link></p>
      </div>
    </main>
  );
}

function traduzirErro(msg: string): string {
  const mapa: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar.",
    "Invalid path specified in request URL.": "A configuração do Supabase está incorreta. Verifique as variáveis configuradas na Vercel.",
    "Invalid API key": "A chave pública do Supabase configurada na Vercel não é válida.",
    "Email rate limit exceeded": "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.",
  };
  return mapa[msg] || "Não foi possível entrar. Confira os dados e tente novamente.";
}
