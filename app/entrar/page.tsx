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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setMensagem(traduzirErro(error.message));
        setCarregando(false);
        return;
      }

      if (data.session) {
        router.push("/painel");
        router.refresh();
      }
    } catch (err) {
      setMensagem("Erro inesperado. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "420px",
        margin: "50px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      <h1 style={{ color: "#16a34a" }}>Entrar na Vaquinha</h1>
      <p>Acesse sua conta para acompanhar suas campanhas.</p>

      <form onSubmit={entrar}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
          style={estilo}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha"
          required
          autoComplete="current-password"
          style={estilo}
        />

        <button
          type="submit"
          disabled={carregando}
          style={{
            ...estilo,
            background: "#16a34a",
            color: "white",
            border: 0,
            fontWeight: "bold",
            cursor: carregando ? "not-allowed" : "pointer",
            opacity: carregando ? 0.7 : 1,
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {mensagem && (
        <p
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {mensagem}
        </p>
      )}

      <p style={{ marginTop: "24px" }}>
        Ainda não tem conta?{" "}
        <Link href="/criar-conta" style={{ color: "#16a34a" }}>
          Criar conta
        </Link>
      </p>
      <Link href="/" style={{ color: "#64748b", fontSize: "14px" }}>
        Voltar ao início
      </Link>
    </main>
  );
}

function traduzirErro(msg: string): string {
  const mapa: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar.",
    "Invalid path specified in request URL.":
      "Erro de configuração do Supabase. Verifique as variáveis de ambiente.",
  };
  return mapa[msg] || msg;
}

const estilo: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "8px 0 18px",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};
