"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function CriarConta() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { full_name: nome },
      },
    });

    setCarregando(false);

    if (error) {
      setMensagem(error.message);
      return;
    }

    setMensagem(
      "Cadastro realizado! Confira seu e-mail para confirmar sua conta."
    );
  }

  return (
    <main style={{
      maxWidth: "420px",
      margin: "50px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#172033"
    }}>
      <h1>Criar conta</h1>
      <p>Cadastre-se para começar sua jornada.</p>

      <form onSubmit={cadastrar}>
        <label>Nome completo</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Seu nome"
          style={estilo}
        />

        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
          style={estilo}
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          minLength={8}
          placeholder="Mínimo de 8 caracteres"
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
            fontWeight: "bold"
          }}
        >
          {carregando ? "Cadastrando..." : "Criar minha conta"}
        </button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <p>Já tem conta? <Link href="/entrar">Entrar</Link></p>
      <Link href="/">Voltar ao início</Link>
    </main>
  );
}

const estilo: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "8px 0 18px",
  boxSizing: "border-box",
  borderRadius: "8px",
};
