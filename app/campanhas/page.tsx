import Link from "next/link";
import Header from "@/components/Header";

export default function Campanhas() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#172033" }}>
      <Header />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px" }}>Campanhas</h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Conheça as causas e descubra como ajudar.
            </p>
          </div>

          <Link
            href="/campanhas/nova"
            style={{
              background: "#16a34a",
              color: "white",
              padding: "12px 18px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Criar campanha
          </Link>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#64748b", fontSize: "16px" }}>
            Ainda não há campanhas publicadas.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Seja o primeiro a criar uma vaquinha!
          </p>
          <Link
            href="/criar-conta"
            style={{
              display: "inline-block",
              marginTop: "16px",
              color: "#16a34a",
              fontWeight: "bold",
            }}
          >
            Criar minha conta e começar →
          </Link>
        </div>
      </main>
    </div>
  );
}
