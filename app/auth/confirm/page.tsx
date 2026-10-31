"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConfirmarEmail() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState("Confirmando seu acesso…");
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    const timer = window.setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!ativo) return;
        if (error) throw error;
        if (data.session) {
          setMensagem("E-mail confirmado. Estamos levando você ao painel.");
          window.setTimeout(() => router.replace("/painel"), 700);
        } else {
          setErro(true);
          setMensagem("Não encontramos uma sessão confirmada. O link pode ter expirado ou já ter sido usado.");
        }
      } catch {
        if (ativo) {
          setErro(true);
          setMensagem("Não foi possível confirmar o acesso. Solicite um novo e-mail de confirmação e tente novamente.");
        }
      }
    }, 300);
    return () => { ativo = false; window.clearTimeout(timer); };
  }, [router]);

  return <main className="container" style={{ maxWidth: 560, paddingTop: 72, paddingBottom: 72 }}><section className="card form-card"><div className="eyebrow">Confirmação de e-mail</div><h1 className="form-title" style={{ marginTop: 14 }}>{erro ? "Vamos tentar de novo." : "Quase lá."}</h1><p role={erro ? "alert" : "status"} aria-live="polite" className={`form-message ${erro ? "form-message-error" : "form-message-success"}`}>{mensagem}</p>{erro && <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}><Link href="/criar-conta" className="btn btn-primary">Voltar ao cadastro</Link><Link href="/entrar" className="btn btn-secondary">Entrar</Link></div>}</section></main>;
}
