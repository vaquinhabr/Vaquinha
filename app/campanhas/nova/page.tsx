"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

export default function NovaCampanha() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [meta, setMeta] = useState("");
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    async function verificar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/entrar");
        return;
      }

      setUser(session.user);
      setCarregando(false);
    }

    verificar();
  }, [router]);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setSalvando(true);

    try {
      const valorMeta = parseFloat(meta.replace(",", "."));

      if (isNaN(valorMeta) || valorMeta <= 0) {
        setMensagem("Informe uma meta válida maior que zero.");
        setSalvando(false);
        return;
      }

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          title: titulo.trim(),
          description: descricao.trim(),
          goal_amount: valorMeta,
          current_amount: 0,
          category: categoria || null,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        setMensagem(error.message);
        setSalvando(false);
        return;
      }

      router.push(`/campanhas/${data.id}`);
    } catch (err) {
      setMensagem("Erro ao criar campanha. Tente novamente.");
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Carregando...</div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Header />

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px" }}>
        <Link
          href="/painel"
          style={{ color: "#64748b", fontSize: "14px", textDecoration: "none" }}
        >
          ← Voltar ao painel
        </Link>

        <h1 style={{ marginTop: "16px" }}>Criar nova campanha</h1>
        <p style={{ color: "#64748b" }}>
          Conte sua história e defina a meta de arrecadação.
        </p>

        <form onSubmit={criar} style={{ marginTop: "24px" }}>
          <label style={labelStyle}>Título da campanha *</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            maxLength={120}
            placeholder="Ex: Ajude com o tratamento do meu filho"
            style={inputStyle}
          />

          <label style={labelStyle}>Descrição / História *</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            rows={6}
            placeholder="Conte com detalhes o motivo da sua vaquinha..."
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <label style={labelStyle}>Meta de arrecadação (R$) *</label>
          <input
            type="text"
            inputMode="decimal"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            required
            placeholder="Ex: 5000"
            style={inputStyle}
          />

          <label style={labelStyle}>Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecione</option>
            <option value="saude">Saúde</option>
            <option value="educacao">Educação</option>
            <option value="emergencia">Emergência</option>
            <option value="animais">Animais</option>
            <option value="projetos">Projetos sociais</option>
            <option value="outros">Outros</option>
          </select>

          <button
            type="submit"
            disabled={salvando}
            style={{
              ...inputStyle,
              background: "#16a34a",
              color: "white",
              border: 0,
              fontWeight: "bold",
              cursor: salvando ? "not-allowed" : "pointer",
              opacity: salvando ? 0.7 : 1,
              marginTop: "8px",
            }}
          >
            {salvando ? "Publicando..." : "Publicar campanha"}
          </button>

          {mensagem && (
            <p
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#fef2f2",
                color: "#b91c1c",
                borderRadius: "8px",
              }}
            >
              {mensagem}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 600,
  fontSize: "14px",
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginBottom: "18px",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  font: "inherit",
};
