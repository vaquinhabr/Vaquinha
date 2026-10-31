"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RedefinirSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [sessaoPronta, setSessaoPronta] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!ativo) return;
      setSessaoPronta(true);
      if (error || !data.session) setMensagem("O link de recuperação é inválido ou expirou. Solicite um novo pela tela de login.");
    }, 300);
    return () => { ativo = false; window.clearTimeout(timer); };
  }, []);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setSucesso(false);
    if (senha.length < 8) { setMensagem("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (senha !== confirmacao) { setMensagem("As senhas não são iguais."); return; }
    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setMensagem("Sua sessão de recuperação expirou. Solicite outro link."); return; }
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) { setMensagem(error.message.toLowerCase().includes("password") ? "Escolha uma senha diferente e mais segura." : "Não foi possível atualizar a senha. Solicite um novo link e tente novamente."); return; }
      setSucesso(true);
      setMensagem("Senha atualizada com sucesso. Você já pode entrar com sua nova senha.");
      setSenha("");
      setConfirmacao("");
      window.setTimeout(() => router.replace("/entrar"), 1200);
    } catch {
      setMensagem("Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return <main className="container" style={{ maxWidth: 560, paddingTop: 72, paddingBottom: 72 }}><section className="card form-card"><Link href="/entrar" style={{ color: "var(--green-800)", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>← Voltar ao login</Link><div className="eyebrow" style={{ marginTop: 26 }}>Segurança da conta</div><h1 className="form-title" style={{ marginTop: 14 }}>Crie uma nova senha.</h1><p className="form-intro">Use uma senha única que você não utiliza em outros sites.</p>{sessaoPronta && !mensagem.includes("inválido") && !mensagem.includes("expirou") ? <form onSubmit={salvar}><label className="form-label" htmlFor="nova-senha">Nova senha</label><input className="form-control" id="nova-senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" /><label className="form-label" htmlFor="confirmar-senha">Repita a nova senha</label><input className="form-control" id="confirmar-senha" type="password" value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" /><button className="btn btn-primary form-submit" type="submit" disabled={salvando}>{salvando ? "Atualizando..." : "Atualizar senha"}</button></form> : null}{mensagem && <p role={sucesso ? "status" : "alert"} aria-live="polite" className={`form-message ${sucesso ? "form-message-success" : "form-message-error"}`} style={{ marginTop: 18 }}>{mensagem}</p>}{!sucesso && (mensagem.includes("inválido") || mensagem.includes("expirou")) && <Link href="/entrar" className="btn btn-primary form-submit" style={{ marginTop: 14 }}>Voltar ao login</Link>}</section></main>;
}
