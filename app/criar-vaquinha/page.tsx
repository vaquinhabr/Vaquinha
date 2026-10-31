"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { parseBRLToCents, slugify } from "@/lib/validation.mjs";

const categorias = [
  { value: "saude", label: "Saúde", icon: "♡", desc: "Tratamentos, exames e cuidados" },
  { value: "emergencia", label: "Emergência", icon: "🤝", desc: "Imprevistos e recomeços" },
  { value: "animais", label: "Animais", icon: "🐾", desc: "Pets, resgate e proteção" },
  { value: "educacao", label: "Educação", icon: "📚", desc: "Estudos e oportunidades" },
  { value: "projetos", label: "Projetos sociais", icon: "🌱", desc: "Uma comunidade melhor" },
  { value: "outros", label: "Outros", icon: "♡", desc: "Outras causas importantes" },
];

export default function CriarVaquinhaPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [step, setStep] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [meta, setMeta] = useState("");
  const [categoria, setCategoria] = useState("emergencia");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ativo) return;
      if (!session) router.replace("/entrar?redirectTo=%2Fcriar-vaquinha");
      else setUserId(session.user.id);
    }).catch(() => { if (ativo) setErro("Não foi possível verificar sua sessão. Entre novamente."); });
    return () => { ativo = false; };
  }, [router]);

  async function publicar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    if (!userId) { setErro("Entre na sua conta para continuar."); return; }
    const cents = parseBRLToCents(meta);
    if (cents === null || cents < 100) { setErro("Informe uma meta válida de pelo menos R$ 1,00."); setStep(1); return; }
    if (titulo.trim().length < 5 || titulo.trim().length > 120) { setErro("O título precisa ter entre 5 e 120 caracteres."); setStep(1); return; }
    if (descricao.trim().length < 20 || descricao.trim().length > 10000) { setErro("Conte sua história com pelo menos 20 caracteres."); setStep(2); return; }
    if (imagem.trim() && !/^https:\/\//i.test(imagem.trim())) { setErro("A imagem precisa usar um endereço https:// válido."); setStep(2); return; }
    setSalvando(true);
    try {
      const slug = `${slugify(titulo) || "campanha"}-${crypto.randomUUID().slice(0, 8)}`;
      const { data, error } = await supabase.from("campaigns").insert({
        owner_id: userId, title: titulo.trim(), slug, description: descricao.trim(),
        goal_cents: cents, category: categoria, image_url: imagem.trim() || null, status: "draft",
      }).select("id,slug").single();
      if (error) throw error;
      router.push(`/campanhas/${data.slug || data.id}`);
      router.refresh();
    } catch {
      setErro("Não foi possível salvar sua vaquinha. Confira os dados e tente novamente.");
    } finally { setSalvando(false); }
  }

  return <div className="page-shell create-fund-page">
    <Header />
    <main className="create-fund-wrap">
      <div className="create-fund-intro">
        <Link href="/" className="create-back">← Voltar para o início</Link>
        <span className="create-kicker">SUA HISTÓRIA PODE MOBILIZAR PESSOAS</span>
        <h1>Vamos criar sua <span>vaquinha?</span></h1>
        <p>Você não precisa fazer tudo sozinho. Conte sua história, defina sua meta e dê o primeiro passo para reunir apoio.</p>
        <div className="create-benefits"><span>✓ Grátis para começar</span><span>✓ Você acompanha sua campanha</span><span>✓ Compartilhe com quem quiser</span></div>
      </div>

      <div className="create-layout">
        <section className="create-form-panel">
          <div className="create-progress">
            <div className={step === 1 ? "create-step active" : "create-step done"}><b>{step > 1 ? "✓" : "1"}</b><span>Sobre a vaquinha</span></div>
            <i className={step > 1 ? "filled" : ""} />
            <div className={step === 2 ? "create-step active" : "create-step"}><b>2</b><span>Sua história</span></div>
          </div>
          <form onSubmit={publicar}>
            {step === 1 ? <div className="create-fields">
              <div className="create-section-title"><h2>O que você precisa?</h2><p>Comece com as informações principais da sua campanha.</p></div>
              <label className="create-label" htmlFor="titulo">Dê um nome para sua vaquinha <em>*</em><input id="titulo" value={titulo} onChange={e=>setTitulo(e.target.value)} required minLength={5} maxLength={120} placeholder="Ex.: Ajude a reconstruir nossa casa" /></label>
              <label className="create-label" htmlFor="meta">De quanto você precisa? <em>*</em><div className="create-money-input"><span>R$</span><input id="meta" value={meta} onChange={e=>setMeta(e.target.value)} required inputMode="decimal" placeholder="5.000,00" /></div><small>Defina uma meta realista para sua causa.</small></label>
              <fieldset className="create-category-field"><legend>Qual é a causa da sua vaquinha? <em>*</em></legend><div className="create-category-grid">{categorias.map(c=><button type="button" key={c.value} onClick={()=>setCategoria(c.value)} className={categoria===c.value?"create-category selected":"create-category"}><span>{c.icon}</span><strong>{c.label}</strong><small>{c.desc}</small></button>)}</div></fieldset>
              <button type="button" className="create-primary" onClick={()=>{ if(titulo.trim().length<5){setErro("Escreva um título com pelo menos 5 caracteres.");return;} if(parseBRLToCents(meta)===null){setErro("Informe uma meta válida, por exemplo 5.000,00.");return;} setErro("");setStep(2);window.scrollTo({top:0,behavior:"smooth"}); }}>Continuar <span>→</span></button>
            </div> : <div className="create-fields">
              <div className="create-section-title"><h2>Conte sua história</h2><p>Explique o que aconteceu e como o apoio fará diferença.</p></div>
              <label className="create-label" htmlFor="descricao">Sua história <em>*</em><textarea id="descricao" value={descricao} onChange={e=>setDescricao(e.target.value)} required minLength={20} maxLength={10000} rows={8} placeholder="Conte sua história com suas palavras. Explique por que precisa de ajuda e como o dinheiro será usado."/><small>{descricao.length}/10.000 caracteres · Seja sincero e específico.</small></label>
              <label className="create-label" htmlFor="imagem">Link da foto de capa (opcional)<input id="imagem" value={imagem} onChange={e=>setImagem(e.target.value)} type="url" placeholder="https://..." /><small>Use um endereço público de imagem. Você poderá adicionar ou trocar a foto depois.</small></label>
              <div className="create-review"><span>♡</span><div><strong>Quase lá!</strong><p>Sua vaquinha será salva como rascunho para você revisar. Ela não ficará pública automaticamente.</p></div></div>
              <div className="create-form-actions"><button type="button" className="create-secondary" onClick={()=>{setStep(1);setErro("");}}>← Voltar</button><button type="submit" className="create-primary" disabled={salvando}>{salvando?"Salvando...":"Salvar minha vaquinha ↗"}</button></div>
            </div>}
            {erro && <p className="create-error" role="alert">{erro}</p>}
          </form>
        </section>
        <aside className="create-aside">
          <div className="create-aside-illustration"><div className="create-aside-heart">♡</div><span>JUNTOS, FAZEMOS A DIFERENÇA</span><h3>Uma história pode mudar tudo.</h3><p>Quando você compartilha sua causa, dá às pessoas a chance de fazer parte dela.</p></div>
          <div className="create-aside-info"><span className="create-shield">✓</span><div><strong>Você está no controle</strong><p>Revise os detalhes antes de divulgar sua campanha.</p></div></div>
          <div className="create-aside-info"><span className="create-shield">♡</span><div><strong>Transparência importa</strong><p>Explique como pretende usar os recursos e mantenha sua história atualizada.</p></div></div>
        </aside>
      </div>
      <p className="create-legal">Ao continuar, você confirma que as informações fornecidas são verdadeiras e que usará a plataforma de forma responsável.</p>
    </main>
    <style>{`
      .create-fund-page{background:#f6f8f6;min-height:100vh}.create-fund-wrap{max-width:1160px;margin:0 auto;padding:48px 24px 80px}.create-fund-intro{max-width:790px;margin-bottom:34px}.create-back{display:inline-block;color:#26774c;text-decoration:none;font-weight:700;font-size:13px;margin-bottom:30px}.create-kicker{display:block;color:#26774c;font-size:11px;font-weight:900;letter-spacing:.14em}.create-fund-intro h1{font-size:clamp(2.3rem,5vw,3.6rem);letter-spacing:-.055em;line-height:1.04;color:#173b29;margin:12px 0}.create-fund-intro h1 span{color:#278451}.create-fund-intro>p{font-size:16px;line-height:1.75;color:#68776d;max-width:680px;margin:0}.create-benefits{display:flex;gap:18px;flex-wrap:wrap;margin-top:20px;color:#3c7651;font-size:12px;font-weight:700}.create-layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(270px,.8fr);gap:24px;align-items:start}.create-form-panel{background:#fff;border:1px solid #e3eae4;border-radius:22px;padding:clamp(22px,4vw,40px);box-shadow:0 16px 45px #183d2b08}.create-progress{display:flex;align-items:center;gap:12px;margin-bottom:34px}.create-progress>i{height:2px;background:#e5ece6;flex:1;max-width:90px}.create-progress>i.filled{background:#2a8654}.create-step{display:flex;align-items:center;gap:9px;color:#8b978d;font-size:12px;font-weight:700;white-space:nowrap}.create-step b{width:31px;height:31px;display:grid;place-items:center;border-radius:50%;background:#edf1ed;color:#68766c}.create-step.active{color:#1f7548}.create-step.active b,.create-step.done b{background:#dff1e4;color:#1e7547}.create-section-title h2{font-size:24px;letter-spacing:-.035em;color:#193b29;margin:0 0 7px}.create-section-title p{font-size:13px;line-height:1.6;color:#758178;margin:0 0 27px}.create-label{display:block;font-size:13px;font-weight:800;color:#293d30;margin-bottom:23px}.create-label em,.create-category-field em{color:#23814d;font-style:normal}.create-label input,.create-label textarea{display:block;width:100%;box-sizing:border-box;margin-top:9px;border:1px solid #dce5dd;border-radius:11px;background:#fff;padding:14px 15px;font:inherit;font-size:14px;font-weight:400;color:#24382a;outline:none;transition:border-color .15s,box-shadow .15s}.create-label input:focus,.create-label textarea:focus{border-color:#45a36b;box-shadow:0 0 0 3px #2e96531a}.create-label input::placeholder,.create-label textarea::placeholder{color:#a2aaa3}.create-label textarea{resize:vertical;line-height:1.65}.create-label small{display:block;margin-top:8px;color:#8a958b;font-size:11px;font-weight:400;line-height:1.5}.create-money-input{display:flex;align-items:center;margin-top:9px;border:1px solid #dce5dd;border-radius:11px;overflow:hidden}.create-money-input:focus-within{border-color:#45a36b;box-shadow:0 0 0 3px #2e96531a}.create-money-input span{padding:0 0 0 15px;color:#317b4d;font-weight:800}.create-label .create-money-input input{border:0;box-shadow:none;margin:0}.create-category-field{border:0;padding:0;margin:0 0 25px;min-width:0}.create-category-field legend{font-size:13px;font-weight:800;color:#293d30;margin-bottom:13px}.create-category-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.create-category{display:grid;grid-template-columns:38px 1fr;grid-template-rows:auto auto;align-items:center;column-gap:10px;text-align:left;background:white;border:1px solid #e0e8e1;border-radius:12px;padding:12px;cursor:pointer;color:#24382a}.create-category>span{grid-row:1/3;width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#edf6ef;font-size:20px;color:#26774c}.create-category strong{font-size:12px}.create-category small{font-size:10px;color:#7b877d;line-height:1.4;margin-top:4px}.create-category.selected{border-color:#2f985b;background:#f4fbf5;box-shadow:0 0 0 2px #2f985b16}.create-primary{display:flex;justify-content:center;align-items:center;gap:12px;width:100%;border:0;border-radius:12px;background:#21804d;color:#fff;padding:16px 20px;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 8px 18px #21804d20}.create-primary:hover{background:#176d40}.create-primary:disabled{opacity:.6;cursor:wait}.create-form-actions{display:flex;gap:12px;align-items:center}.create-form-actions .create-primary{flex:1}.create-secondary{border:1px solid #dce5dd;background:white;color:#356348;padding:15px 18px;border-radius:12px;font-weight:800;cursor:pointer}.create-review{display:flex;gap:13px;padding:16px;border-radius:12px;background:#f0f7f1;margin-bottom:22px}.create-review>span{font-size:23px;color:#25804d}.create-review strong{font-size:13px;color:#245b39}.create-review p{font-size:12px;line-height:1.6;color:#69796d;margin:5px 0 0}.create-error{padding:13px 15px;background:#fff0ef;border:1px solid #ffd7d3;border-radius:10px;color:#a52e25;font-size:13px;line-height:1.5}.create-aside{display:grid;gap:14px}.create-aside-illustration{background:linear-gradient(145deg,#dcefe0,#f7edda);border:1px solid #e0e9df;border-radius:20px;padding:28px;min-height:245px}.create-aside-heart{height:108px;display:grid;place-items:center;font-size:100px;color:#278451;line-height:1}.create-aside-illustration>span{font-size:9px;letter-spacing:.12em;font-weight:900;color:#33784c}.create-aside-illustration h3{font-size:22px;line-height:1.2;letter-spacing:-.03em;color:#193b29;margin:9px 0}.create-aside-illustration p{font-size:12px;line-height:1.7;color:#647468;margin:0}.create-aside-info{display:flex;gap:13px;align-items:flex-start;background:#fff;border:1px solid #e4eae4;border-radius:15px;padding:17px}.create-shield{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;background:#e9f5eb;border-radius:11px;color:#28794b;font-weight:900}.create-aside-info strong{font-size:12px;color:#24432e}.create-aside-info p{font-size:11px;line-height:1.6;color:#758178;margin:5px 0 0}.create-legal{text-align:center;color:#8a958c;font-size:11px;line-height:1.6;margin:22px auto 0;max-width:780px}
      @media(max-width:800px){.create-layout{grid-template-columns:1fr}.create-aside{grid-template-columns:1fr 1fr}.create-aside-illustration{grid-column:1/-1}.create-fund-wrap{padding-top:30px}}
      @media(max-width:520px){.create-benefits{display:grid;gap:9px}.create-progress{gap:7px}.create-step{font-size:10px;gap:6px}.create-step b{width:27px;height:27px}.create-category-grid{grid-template-columns:1fr}.create-aside{grid-template-columns:1fr}.create-aside-illustration{grid-column:auto}.create-form-actions{align-items:stretch;flex-direction:column-reverse}.create-form-actions button{width:100%}}
    `}</style>
  </div>;
}
