export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#172033",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{
        background: "#ffffff",
        padding: "20px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2 style={{ color: "#16a34a", margin: 0 }}>
          💚 Vaquinha
        </h2>
        <a href="/entrar" style={{ color: "#166534" }}>
          Entrar
        </a>
      </header>

      <section style={{
        maxWidth: "850px",
        margin: "60px auto",
        padding: "24px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "38px" }}>
          Juntos, podemos fazer a diferença.
        </h1>

        <p style={{
          fontSize: "18px",
          lineHeight: 1.6,
          color: "#64748b"
        }}>
          Crie sua campanha, conte sua história e receba apoio
          de pessoas que acreditam na sua causa.
        </p>

        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "28px"
        }}>
          <a href="/criar-conta" style={{
            background: "#16a34a",
            color: "#ffffff",
            padding: "14px 22px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold"
          }}>
            Criar minha vaquinha
          </a>

          <a href="/campanhas" style={{
            background: "#ffffff",
            color: "#166534",
            padding: "14px 22px",
            border: "1px solid #16a34a",
            borderRadius: "8px",
            textDecoration: "none"
          }}>
            Ver campanhas
          </a>
        </div>
      </section>

      <footer style={{
        textAlign: "center",
        padding: "24px",
        color: "#64748b"
      }}>
        Vaquinha — solidariedade que transforma vidas.
      </footer>
    </main>
  );
}
