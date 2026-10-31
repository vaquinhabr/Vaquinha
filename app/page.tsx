import Link from "next/link";
import Header from "@/components/Header";
import AuthRedirectHandler from "@/components/AuthRedirectHandler";

const passos = [
  { numero: "01", titulo: "Conte sua história", texto: "Explique o que aconteceu, por que essa causa importa e como o dinheiro vai ajudar." },
  { numero: "02", titulo: "Compartilhe com o mundo", texto: "Envie sua página para amigos, família e pessoas que podem fazer parte dessa mudança." },
  { numero: "03", titulo: "Acompanhe cada passo", texto: "Tenha sua campanha organizada e acompanhe as próximas etapas da arrecadação." },
];

const causas = [
  { emoji: "💚", titulo: "Saúde e bem-estar", texto: "Tratamentos, cuidados e recuperação" },
  { emoji: "🐾", titulo: "Causa animal", texto: "Resgate, tratamento e acolhimento" },
  { emoji: "🏡", titulo: "Recomeços", texto: "Imprevistos, moradia e reconstrução" },
  { emoji: "📚", titulo: "Educação e projetos", texto: "Estudos, sonhos e iniciativas sociais" },
];

export default function Home() {
  return (
    <div className="page-shell">
      <AuthRedirectHandler />
      <Header />
      <main>
        <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(125deg, #f0f8f2 0%, #f8faf8 58%, #e4f3e9 100%)" }}>
          <div aria-hidden="true" style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "rgba(177,222,191,.25)", right: "-100px", top: "-160px", filter: "blur(2px)" }} />
          <div className="container" style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(300px, .9fr)", alignItems: "center", gap: 44, paddingTop: 74, paddingBottom: 82 }}>
            <div>
              <div className="eyebrow">Uma rede de apoio começa aqui</div>
              <h1 style={{ fontSize: "clamp(2.8rem, 5.6vw, 4.7rem)", lineHeight: 1.02, margin: "20px 0 22px", maxWidth: 680, color: "var(--green-950)" }}>
                Quando a gente se une, <span style={{ color: "var(--green-700)" }}>a esperança cresce.</span>
              </h1>
              <p style={{ maxWidth: 560, margin: "0 0 30px", color: "var(--muted)", fontSize: "clamp(1.05rem, 1.7vw, 1.2rem)", lineHeight: 1.75 }}>
                Transforme sua história em uma causa. Crie sua vaquinha, compartilhe com quem se importa e dê o primeiro passo para fazer acontecer.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link href="/criar-conta" className="btn btn-primary">Criar minha vaquinha <span aria-hidden="true">↗</span></Link>
                <Link href="/campanhas" className="btn btn-secondary">Conhecer campanhas</Link>
              </div>
              <form action="/campanhas" method="get" role="search" aria-label="Buscar campanhas" style={{ display: "flex", gap: 8, maxWidth: 560, marginTop: 24, padding: 7, background: "#fff", border: "1px solid #dce9df", borderRadius: 16, boxShadow: "0 10px 28px rgba(18,60,43,.07)" }}>
                <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 42, color: "var(--green-700)", fontSize: 22 }}>⌕</span>
                <input name="q" type="search" placeholder="Busque por uma causa ou campanha" aria-label="Nome da causa ou campanha" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "var(--ink)", padding: "10px 2px" }} />
                <button type="submit" className="btn btn-primary" style={{ minHeight: 44, padding: "10px 18px" }}>Buscar</button>
              </form>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, color: "var(--muted)", fontSize: 13 }}>
                <span aria-hidden="true" style={{ display: "flex" }}><span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", background: "#d8efdf", border: "2px solid #f0f8f2" }}>💚</span><span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", background: "#fce9c8", border: "2px solid #f0f8f2", marginLeft: -8 }}>🤝</span><span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", border: "2px solid #f0f8f2", marginLeft: -8 }}>✨</span></span>
                <span>Pequenos gestos podem mudar grandes histórias.</span>
              </div>
            </div>

            <div aria-label="Ilustração de apoio e solidariedade" style={{ position: "relative", minHeight: 390, display: "grid", placeItems: "center" }}>
              <div style={{ position: "absolute", inset: "8% 4% 5% 8%", borderRadius: "44% 56% 56% 44% / 44% 43% 57% 56%", background: "linear-gradient(145deg, #d8efdf, #b9dfc6)", transform: "rotate(-5deg)" }} />
              <div className="card" style={{ position: "relative", width: "min(100%, 370px)", padding: 24, borderRadius: 24, transform: "rotate(2deg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <span style={{ padding: "7px 11px", borderRadius: 999, background: "var(--green-50)", color: "var(--green-800)", fontSize: 12, fontWeight: 700 }}>UMA CAUSA, MUITAS MÃOS</span>
                  <span style={{ fontSize: 24 }} aria-hidden="true">♡</span>
                </div>
                <div style={{ height: 170, borderRadius: 18, background: "linear-gradient(135deg, #f7d9aa, #f5c4a9 45%, #d7ead8)", display: "grid", placeItems: "center", overflow: "hidden", position: "relative" }}>
                  <div aria-hidden="true" style={{ fontSize: 94, filter: "drop-shadow(0 8px 6px rgba(40,70,48,.12))" }}>🤲</div>
                  <span style={{ position: "absolute", top: 18, right: 20, fontSize: 26 }}>✦</span>
                  <span style={{ position: "absolute", bottom: 16, left: 22, fontSize: 22 }}>♡</span>
                </div>
                <h3 style={{ fontSize: 21, margin: "20px 0 8px" }}>Toda ajuda conta.</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: "0 0 18px", fontSize: 14 }}>Sua rede pode ser o começo de uma grande transformação.</p>
                <div style={{ height: 8, background: "#e9eee9", borderRadius: 999, overflow: "hidden" }}><div style={{ width: "68%", height: "100%", background: "var(--green-600)", borderRadius: 999 }} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, color: "var(--muted)", fontSize: 12 }}><span>Um passo de cada vez</span><span style={{ color: "var(--green-800)", fontWeight: 700 }}>Juntos 💚</span></div>
              </div>
              <div className="card" style={{ position: "absolute", left: 0, bottom: 24, padding: "12px 16px", borderRadius: 14, fontWeight: 700, color: "var(--green-900)", fontSize: 13 }}>✦ Solidariedade que aproxima</div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "#fff" }}>
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Toda causa tem seu lugar</span>
              <h2>O que você quer transformar hoje?</h2>
              <p>Uma campanha pode ajudar a tirar um plano do papel, superar um momento difícil ou reunir pessoas por algo maior.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {causas.map((causa) => (
                <Link key={causa.titulo} href="/campanhas" className="card" style={{ display: "block", padding: 22, textDecoration: "none" }}>
                  <span style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 15, background: "var(--green-50)", fontSize: 25 }}>{causa.emoji}</span>
                  <h3 style={{ margin: "18px 0 7px", fontSize: 18 }}>{causa.titulo}</h3>
                  <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6, fontSize: 14 }}>{causa.texto}</p>
                  <span style={{ display: "inline-block", marginTop: 16, color: "var(--green-800)", fontWeight: 700, fontSize: 13 }}>Explorar causas →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "var(--green-50)" }}>
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Simples de começar</span>
              <h2>Seu próximo passo pode começar agora.</h2>
              <p>Organize sua campanha em etapas claras e convide outras pessoas a fazer parte da sua história.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              {passos.map((passo) => (
                <article key={passo.numero} style={{ padding: 26, background: "#fff", border: "1px solid var(--line)", borderRadius: 18 }}>
                  <span style={{ color: "var(--green-700)", fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 800 }}>{passo.numero} / 03</span>
                  <h3 style={{ fontSize: 21, margin: "17px 0 10px" }}>{passo.titulo}</h3>
                  <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.75 }}>{passo.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, .7fr)", gap: 36, alignItems: "center", background: "var(--green-950)", borderRadius: 28, padding: "clamp(28px, 5vw, 58px)", color: "#fff", overflow: "hidden", position: "relative" }}>
              <div>
                <span style={{ color: "#a9dfbc", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>Você não precisa fazer tudo sozinho</span>
                <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.08, margin: "15px 0" }}>Uma história compartilhada pode abrir novos caminhos.</h2>
                <p style={{ color: "#d1e4d8", lineHeight: 1.7, maxWidth: 580, margin: "0 0 25px" }}>Comece contando sua causa. O primeiro passo é criar uma página clara, humana e fácil de compartilhar.</p>
                <Link href="/criar-conta" className="btn" style={{ background: "#fff", color: "var(--green-950)" }}>Começar minha campanha ↗</Link>
              </div>
              <div aria-hidden="true" style={{ display: "grid", placeItems: "center", minHeight: 180, fontSize: "clamp(6rem, 13vw, 10rem)", color: "#b6e5c4" }}>♡</div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: "#fff", borderTop: "1px solid var(--line)", padding: "28px 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ color: "var(--green-950)", fontFamily: "Manrope, sans-serif", fontSize: 20, fontWeight: 800, textDecoration: "none" }}>Vaquinha<span style={{ color: "var(--green-700)" }}>.</span></Link>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>Conexões que ajudam causas a crescer.</p>
          <div style={{ display: "flex", gap: 18, fontSize: 13 }}><Link href="/campanhas">Campanhas</Link><Link href="/entrar">Entrar</Link><Link href="/criar-conta">Criar conta</Link></div>
        </div>
      </footer>
      <style>{`@media (max-width: 800px) { .container > div[style*="grid-template-columns: minmax(0, 1.1fr)"] { grid-template-columns: 1fr !important; } .container > div[style*="grid-template-columns: minmax(0, 1fr) minmax(260px, .7fr)"] { grid-template-columns: 1fr !important; } } @media (max-width: 600px) { .container > div[aria-label="Ilustração de apoio e solidariedade"] { min-height: 340px !important; } }`}</style>
    </div>
  );
}
