const campanhas = [
  {
    titulo: "Ajude uma família",
    descricao: "Uma campanha para apoiar quem precisa de ajuda neste momento.",
    meta: 5000,
    arrecadado: 1250
  },
  {
    titulo: "Tratamento de saúde",
    descricao: "Contribua para ajudar com despesas de tratamento.",
    meta: 10000,
    arrecadado: 3200
  },
  {
    titulo: "Realize um sonho",
    descricao: "Toda contribuição pode fazer a diferença.",
    meta: 3000,
    arrecadado: 750
  }
];

export default function Campanhas() {
  return (
    <main style={{
      minHeight: "100vh",
      padding: "24px",
      background: "#f8fafc",
      color: "#172033",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <h1 style={{ color: "#16a34a" }}>💚 Vaquinha</h1>
        <a href="/" style={{ color: "#166534" }}>Início</a>
      </header>

      <h2>Campanhas</h2>
      <p>Conheça as causas e descubra como ajudar.</p>

      <a href="/criar-conta" style={{
        display: "inline-block",
        background: "#16a34a",
        color: "white",
        padding: "12px 18px",
        borderRadius: "8px",
        textDecoration: "none"
      }}>
        Criar minha vaquinha
      </a>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "18px",
        marginTop: "28px"
      }}>
        {campanhas.map((campanha) => (
          <article key={campanha.titulo} style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3>{campanha.titulo}</h3>
            <p>{campanha.descricao}</p>

            <div style={{
              height: "8px",
              background: "#e2e8f0",
              borderRadius: "8px",
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: `${Math.min(
                  100,
                  (campanha.arrecadado / campanha.meta) * 100
                )}%`,
                background: "#16a34a"
              }} />
            </div>

            <p>
              <strong>
                R$ {campanha.arrecadado.toLocaleString("pt-BR")}
              </strong>
              {" "}arrecadados de R${" "}
              {campanha.meta.toLocaleString("pt-BR")}
            </p>

            <a href="/entrar" style={{ color: "#166534" }}>
              Quero ajudar
            </a>
          </article>
        ))}
      </section>

      <p style={{
        marginTop: "32px",
        color: "#64748b",
        fontSize: "13px"
      }}>
        Os exemplos exibidos são demonstrativos, não são campanhas reais.
      </p>
    </main>
  );
}
