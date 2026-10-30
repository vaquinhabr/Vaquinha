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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            full_name: nome.trim(),
          },
        },
      });

      setCarregando(false);

      if (error) {
        setMensagem(traduzirErro(error.message));
        return;
      }

      setSucesso(true);
      setMensagem(
        "Cadastro realizado! Verifique seu e-mail para confirmar a conta."
      );
      setNome("");
      setEmail("");
      setSenha("");
    } catch (err) {
      setCarregando(false);
      setMensagem("Erro inesperado. Tente novamente.");
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
      <h1 style={{ color: "#16a34a" }}>Criar conta</h1>
      <p>Cadastre-se para começar sua jornada.</p>

      <form onSubmit={cadastrar}>
        <label htmlFor="nome">Nome completo</label>
        <input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Seu nome"
          autoComplete="name"
          style={estilo}
        />

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
          autoComplete="email"
          style={estilo}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          minLength={8}
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
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
          {carregando ? "Cadastrando..." : "Criar minha conta"}
        </button>
      </form>

      {mensagem && (
        <p
          style={{
            marginTop: "16px",
            padding: "12px",
            background: sucesso ? "#f0fdf4" : "#fef2f2",
            color: sucesso ? "#166534" : "#b91c1c",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {mensagem}
        </p>
      )}

      <p style={{ marginTop: "24px" }}>
        Já tem conta?{" "}
        <Link href="/entrar" style={{ color: "#16a34a" }}>
          Entrar
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
    "User already registered": "Este e-mail já está cadastrado.",
    "Password should be at least 6 characters":
      "A senha deve ter pelo menos 6 caracteres.",
    "Invalid path specified in request URL.":
      "Erro de configuração do Supabase. Verifique as variáveis de ambiente na Vercel.",
    "Unable to validate email address: invalid format":
      "Formato de e-mail inválido.",
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
