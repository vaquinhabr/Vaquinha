"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import AuthRedirectHandler from "@/components/AuthRedirectHandler";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/lib/types";
import { categoryLabel } from "@/lib/types";

const money = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const categories = [
  { name: "Saúde", icon: "♡", query: "saude" },
  { name: "Animais", icon: "🐾", query: "animais" },
  { name: "Emergência", icon: "🤝", query: "emergencia" },
  { name: "Educação", icon: "📚", query: "educacao" },
  { name: "Moradia", icon: "⌂", query: "moradia" },
  { name: "Esporte", icon: "⚽", query: "esporte" },
];

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase.from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => { if (alive) { setCampaigns((data ?? []) as Campaign[]); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const featured = campaigns.slice(0, 3);
  return <div className="page-shell">
    <AuthRedirectHandler />
    <Header />
    <main>
      <section className="vak-hero">
        <div className="container vak-hero-inner">
          <div className="vak-hero-copy">
            <span className="vak-kicker">A solidariedade transforma vidas</span>
            <h1>Quando tudo parece difícil, <span>ninguém precisa enfrentar sozinho.</span></h1>
            <p>Crie sua vaquinha, conte sua história e encontre pessoas dispostas a ajudar. Uma rede de apoio pode mudar tudo.</p>
            <div className="vak-actions"><Link href="/criar-vaquinha" className="btn btn-primary">Fazer uma vaquinha ↗</Link><Link href="/campanhas" className="btn btn-secondary">Quero ajudar</Link></div>
            <form action="/campanhas" method="get" className="vak-search" role="search"><span aria-hidden="true">⌕</span><input name="q" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Busque pelo nome de uma vaquinha" aria-label="Buscar campanhas"/><button type="submit">Buscar</button></form>
            <div className="vak-trust"><span>✓</span> Histórias reais. Comunidade solidária. Apoio que aproxima.</div>
          </div>
          <div className="vak-hero-art" aria-label="Ilustração de solidariedade">
            <div className="vak-art-circle"><span>♡</span></div>
            <div className="vak-art-card"><div className="vak-art-photo">🤲</div><span className="vak-art-label">JUNTOS FAZEMOS A DIFERENÇA</span><h3>Uma ajuda pode mudar uma história.</h3><p>Encontre uma causa e faça parte dessa corrente.</p><Link href="/vaquinhas/mais-amadas">Conheça as mais amadas →</Link></div>
            <div className="vak-floating vak-float-one">💚 Cada gesto conta</div><div className="vak-floating vak-float-two">✦ Esperança compartilhada</div>
          </div>
        </div>
      </section>

      <section className="vak-section">
        <div className="container"><div className="vak-section-head"><div><span className="vak-kicker">Encontre sua causa</span><h2>Como você quer fazer a diferença?</h2><p>Explore campanhas por categoria e descubra histórias que precisam da sua atenção.</p></div><Link href="/campanhas">Ver todas as vaquinhas →</Link></div>
          <div className="vak-categories">{categories.map(c=><Link key={c.name} href={`/campanhas?category=${c.query}`} className="vak-category"><span>{c.icon}</span><strong>{c.name}</strong><small>Ver campanhas →</small></Link>)}</div>
        </div>
      </section>

      <section className="vak-section vak-section-muted">
        <div className="container"><div className="vak-section-head"><div><span className="vak-kicker">Histórias que mobilizam</span><h2>Vaquinhas que precisam de você</h2><p>Conheça as campanhas publicadas pela comunidade e ajude a compartilhar.</p></div><Link href="/campanhas">Explorar todas →</Link></div>
          {loading ? <div className="vak-empty">Carregando campanhas…</div> : featured.length === 0 ? <div className="vak-empty"><span>♡</span><h3>Uma nova história pode começar aqui.</h3><p>As campanhas publicadas aparecerão nesta área.</p><Link href="/criar-vaquinha" className="btn btn-primary">Criar a primeira vaquinha</Link></div> :
          <div className="vak-campaign-grid">{featured.map(c=><Link href={`/campanhas/${c.slug || c.id}`} key={c.id} className="vak-campaign">
            <div className="vak-campaign-image" style={c.image_url?{backgroundImage:`linear-gradient(0deg,rgba(12,44,29,.15),transparent),url("${c.image_url}")`}:{}}>{!c.image_url&&<span>{c.category==="animais"?"🐾":c.category==="saude"?"💚":"🤝"}</span>}</div>
            <div className="vak-campaign-body"><small>{categoryLabel[c.category]||"Comunidade"}</small><h3>{c.title}</h3><p>{c.description}</p><div className="vak-goal"><span>Meta da campanha</span><strong>{money(Number(c.goal_cents))}</strong></div><span className="vak-card-link">Conhecer campanha ↗</span></div>
          </Link>)}</div>}
        </div>
      </section>

      <section className="vak-section"><div className="container vak-how"><div><span className="vak-kicker">É fácil começar</span><h2>Uma ideia, uma história, uma rede inteira de apoio.</h2><p>Você não precisa resolver tudo sozinho. Comece contando sua história e convide outras pessoas a fazer parte.</p><Link href="/criar-vaquinha" className="btn btn-primary">Começar agora ↗</Link></div><div className="vak-steps"><article><b>01</b><div><h3>Conte sua história</h3><p>Explique sua causa e como a arrecadação pode ajudar.</p></div></article><article><b>02</b><div><h3>Compartilhe sua vaquinha</h3><p>Convide amigos, familiares e sua comunidade.</p></div></article><article><b>03</b><div><h3>Acompanhe sua campanha</h3><p>Organize sua página e mantenha as pessoas informadas.</p></div></article></div></div></section>

      <section className="vak-bottom-cta"><div className="container"><div><span>VOCÊ PODE SER O COMEÇO</span><h2>Uma pequena atitude pode abrir um novo caminho.</h2><p>Crie uma campanha ou encontre uma causa para apoiar hoje.</p></div><div className="vak-actions"><Link href="/criar-vaquinha" className="btn vak-white-btn">Criar vaquinha</Link><Link href="/vaquinhas/mais-amadas" className="btn vak-outline-btn">Ver mais amadas</Link></div></div></section>
    </main>
    <footer className="vak-footer"><div className="container"><Link href="/" className="vak-footer-logo">Vaquinha<span>.</span></Link><div><Link href="/campanhas">Explorar campanhas</Link><Link href="/vaquinhas/mais-amadas">Mais amadas</Link><Link href="/entrar">Entrar</Link></div><p>Uma rede de apoio para causas que importam.</p></div></footer>
    <style>{`
      .vak-hero{background:linear-gradient(112deg,#f3f8f2 0%,#fff 56%,#e5f2e8 100%);overflow:hidden;border-bottom:1px solid var(--line)}
      .vak-hero-inner{display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:42px;padding-top:64px;padding-bottom:68px}
      .vak-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#26774c}
      .vak-hero h1{font-size:clamp(2.7rem,5.2vw,4.5rem);line-height:1.02;letter-spacing:-.055em;color:#153e2b;margin:20px 0}
      .vak-hero h1 span{color:#2b8655}.vak-hero-copy>p{font-size:17px;line-height:1.8;color:#65736a;max-width:590px;margin:0 0 26px}
      .vak-actions{display:flex;gap:12px;flex-wrap:wrap}.vak-search{display:flex;align-items:center;gap:10px;background:white;border:1px solid #dce7de;border-radius:14px;padding:6px;margin-top:25px;max-width:570px;box-shadow:0 12px 30px #123c2b0d}
      .vak-search>span{font-size:27px;color:#2c8050;padding-left:10px}.vak-search input{min-width:0;flex:1;border:0;outline:0;padding:12px 2px;font:inherit}.vak-search button{border:0;border-radius:10px;background:#1e7046;color:white;font-weight:800;padding:13px 18px;cursor:pointer}
      .vak-trust{margin-top:20px;font-size:12px;color:#637268;display:flex;align-items:center;gap:9px}.vak-trust span{display:grid;place-items:center;background:#d9eddf;color:#1f7648;width:24px;height:24px;border-radius:50%;font-weight:900}
      .vak-hero-art{position:relative;min-height:440px;display:grid;place-items:center}.vak-art-circle{position:absolute;width:370px;height:370px;border-radius:48% 52% 59% 41%;background:linear-gradient(140deg,#d7ecd9,#b5d9bf);transform:rotate(-8deg)}.vak-art-circle span{position:absolute;font-size:180px;color:#2c8050;right:25px;top:15px;opacity:.25}
      .vak-art-card{z-index:1;position:relative;background:white;padding:18px;border-radius:22px;width:min(100%,330px);box-shadow:0 25px 65px #123c2b1b;transform:rotate(2deg)}.vak-art-photo{height:175px;border-radius:15px;background:linear-gradient(135deg,#f6d8ac,#e5efdf);display:grid;place-items:center;font-size:90px}.vak-art-label{display:block;color:#2a7c4e;font-size:9px;font-weight:900;letter-spacing:.1em;margin-top:18px}.vak-art-card h3{font-size:22px;line-height:1.2;margin:8px 0}.vak-art-card p{font-size:13px;color:#69776d;line-height:1.6}.vak-art-card>a{font-size:12px;font-weight:800;color:#26774c;text-decoration:none}
      .vak-floating{position:absolute;z-index:2;background:#fff;padding:13px 16px;border-radius:13px;box-shadow:0 12px 32px #123c2b15;font-size:12px;font-weight:800;color:#1c5e3a}.vak-float-one{left:0;bottom:58px}.vak-float-two{right:-4px;top:54px}
      .vak-section{padding:66px 0}.vak-section-muted{background:#f7faf7}.vak-section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:27px}.vak-section-head h2,.vak-how h2{font-size:clamp(1.9rem,3.5vw,2.8rem);letter-spacing:-.04em;line-height:1.12;margin:10px 0}.vak-section-head p,.vak-how>div>p{color:#65736a;line-height:1.7;margin:0;max-width:650px}.vak-section-head>a{white-space:nowrap;color:#26774c;font-size:13px;font-weight:800;text-decoration:none}
      .vak-categories{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:13px}.vak-category{border:1px solid #e3eae4;background:white;border-radius:17px;padding:19px 15px;text-decoration:none;color:#1b2e22;display:flex;flex-direction:column;gap:10px;transition:transform .18s,border-color .18s}.vak-category:hover,.vak-campaign:hover{transform:translateY(-3px);border-color:#a9cfb4}.vak-category>span{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:#eaf5ed;color:#26774c;font-size:23px}.vak-category strong{font-size:14px}.vak-category small{font-size:11px;color:#6c7b70}
      .vak-campaign-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.vak-campaign{background:white;border:1px solid #e4ebe5;border-radius:18px;overflow:hidden;text-decoration:none;color:#1c2c21;transition:transform .18s,border-color .18s;display:flex;flex-direction:column}.vak-campaign-image{height:205px;background:linear-gradient(135deg,#dcefe0,#f6e8d5);background-position:center;background-size:cover;display:grid;place-items:center;font-size:58px}.vak-campaign-body{padding:20px;display:flex;flex-direction:column;flex:1}.vak-campaign-body>small{font-size:11px;color:#26774c;font-weight:800}.vak-campaign-body h3{font-size:19px;line-height:1.35;margin:9px 0}.vak-campaign-body>p{font-size:13px;line-height:1.65;color:#6b786e;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:64px}.vak-goal{display:flex;justify-content:space-between;gap:8px;border-top:1px solid #edf1ed;padding-top:15px;margin-top:auto;font-size:11px;color:#68766c}.vak-goal strong{font-size:13px;color:#1d6d43}.vak-card-link{margin-top:17px;font-size:12px;color:#26774c;font-weight:800}
      .vak-empty{text-align:center;background:white;border:1px dashed #cbdccf;border-radius:18px;padding:38px;color:#65736a}.vak-empty>span{font-size:45px;color:#26774c}.vak-empty h3{color:#1d3827}.vak-empty p{font-size:13px;margin-bottom:20px}
      .vak-how{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.vak-how>div>p{margin:15px 0 23px}.vak-steps{display:grid;gap:12px}.vak-steps article{display:flex;gap:17px;align-items:flex-start;background:white;border:1px solid #e4ebe5;border-radius:16px;padding:20px}.vak-steps b{font-size:13px;color:#28794c;background:#e8f4eb;border-radius:10px;padding:10px}.vak-steps h3{margin:0 0 6px;font-size:16px}.vak-steps p{margin:0;color:#68766c;font-size:13px;line-height:1.6}
      .vak-bottom-cta{background:#153e2b;padding:48px 0;color:white}.vak-bottom-cta>.container{display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap}.vak-bottom-cta>div>div>span{font-size:11px;letter-spacing:.12em;color:#b9dfc2;font-weight:900}.vak-bottom-cta h2{font-size:clamp(1.9rem,3.7vw,2.8rem);line-height:1.1;max-width:660px;margin:12px 0}.vak-bottom-cta p{color:#d4e4d8;font-size:14px}.vak-white-btn{background:white;color:#153e2b}.vak-outline-btn{border:1px solid #b4d6bd;color:white;background:transparent}
      .vak-footer{padding:28px 0;border-top:1px solid var(--line);background:#fff}.vak-footer>.container{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}.vak-footer-logo{font-size:22px;font-weight:900;color:#153e2b;text-decoration:none}.vak-footer-logo span{color:#2b8655}.vak-footer>.container>div{display:flex;gap:18px;flex-wrap:wrap}.vak-footer a:not(.vak-footer-logo){font-size:12px;color:#536358;text-decoration:none}.vak-footer p{font-size:12px;color:#7a867d;margin:0}
      @media(max-width:900px){.vak-hero-inner{grid-template-columns:1fr;gap:10px}.vak-hero-art{min-height:390px}.vak-categories{grid-template-columns:repeat(3,minmax(0,1fr))}.vak-how{grid-template-columns:1fr;gap:30px}.vak-floating.vak-float-two{right:3%}}
      @media(max-width:600px){.vak-hero-inner{padding-top:42px;padding-bottom:38px}.vak-hero-art{min-height:360px}.vak-art-circle{width:290px;height:290px}.vak-art-card{width:min(90%,320px)}.vak-floating{font-size:10px;padding:10px}.vak-float-one{left:-4px;bottom:25px}.vak-section{padding:45px 0}.vak-section-head{align-items:flex-start;flex-direction:column;gap:12px}.vak-categories{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.vak-category{padding:15px 12px}.vak-campaign-grid{grid-template-columns:1fr}.vak-campaign-image{height:220px}.vak-footer>.container{align-items:flex-start;flex-direction:column}}
    `}</style>
  </div>;
}
