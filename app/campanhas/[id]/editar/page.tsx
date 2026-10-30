"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import type { Campaign } from "@/lib/types";

export default function EditarCampanha() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [meta, setMeta] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    async function carregar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/entrar");
        return;
      }

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setMensagem("Campanha não encontrada.");
        setCarregando(false);
        return;
      }

      if (data.user_id !== session.user.id) {
        setMensagem("Você não tem permissão para editar esta campanha.");
        setCarregando(false);
        return;
      }

      const c = data as Campaign;
      setTitulo(c.title);
      setDescricao(c.description);
      setMeta(String(c.goal_amount));
      setCategoria(c.category || "");
      setStatus(c.status);
      setCarregando(false);
    }

    carregar();
  }, [id, router]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setSalvando(true);

    const valorMeta = parseFloat(meta.replace(",", "."));
    if (isNaN(valorMeta) || valorMeta <= 0) {
      setMensagem("Informe uma meta válida.");
      setSalvando(false);
      return;
    }

    const { error } = await supabase
      .from("campaigns")
      .update({
        title: titulo.trim(),
        description: descricao.trim(),
        goal_amount: valorMeta,
        category: categoria || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSalvando(false);

    if (error) {
      setMensagem(error.message);
      return;
    }

    router.push(`/campanhas/${id}`);
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

        <h1 style={{ marginTop: "16px" }}>Editar campanha</h1>

        {mensagem && !titulo ? (
          <p style={{ color: "#b91c1c" }}>{mensagem}</p>
        ) : (
          <form onSubmit={salvar} style={{ marginTop: "24px" }}>
            <label style={labelStyle}>Título *</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              maxLength={120}
              style={inputStyle}
            />

            <label style={labelStyle}>Descrição *</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={6}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <label style={labelStyle}>Meta (R$) *</label>
            <input
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              required
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

            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
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
              }}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>

            {mensagem && (
              <p
                style={{
                  marginTop: "12px",
                  color: "#b91c1c",
                  background: "#fef2f2",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                {mensagem}
              </p>
            )}
          </form>
        )}
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
