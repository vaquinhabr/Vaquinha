import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#172033" }}>
      <Header />

      <section
        style={{
          maxWidth: "850px",
          margin: "60px auto",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "38px", lineHeight: 1.2, marginBottom: "16px" }}>
          Juntos, podemos fazer a diferença.
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#64748b",
            maxWidth: "600px",
            margin: "0 auto 28px",
          }}
        >
          Crie sua campanha, conte sua história e receba apoio de pessoas que
          acreditam na sua causa.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/criar-conta"
            style={{
              background: "#16a34a",
              color: "#ffffff",
              padding: "14px 22px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Criar minha vaquinha
          </Link>

          <Link
            href="/campanhas"
            style={{
              background: "#ffffff",
              color: "#166534",
              padding: "14px 22px",
              border: "1px solid #16a34a",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Ver campanhas
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto 60px",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        <[
          {
            titulo: "Crie em minutos",
            texto: "Monte sua campanha de forma simples e comece a arrecadar.",
          },
          {
            titulo: "Compartilhe facilmente",
            texto: "Divulgue nas redes e alcance mais pessoas que querem ajudar.",
          },
          {
            titulo: "Receba com segurança",
            texto: "Acompanhe as doações e solicite saques de forma transparente.",
          },
        ].map((item) => (
          <div
            key={item.titulo}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#16a34a" }}>{item.titulo}</h3>
            <p style={{ color: "#64748b", marginBottom: 0 }}>{item.texto}</p>
          </div>
        ))}
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          color: "#64748b",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        Vaquinha — solidariedade que transforma vidas.
      </footer>
    </div>
  );
}
