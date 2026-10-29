export default function Entrar() {
  return (
    <main style={{
      maxWidth: "420px",
      margin: "60px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#172033"
    }}>
      <h1>Entrar na Vaquinha</h1>
      <p>Acesse sua conta para acompanhar suas campanhas.</p>

      <form>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          required
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 18px",
            boxSizing: "border-box"
          }}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          placeholder="Sua senha"
          required
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 18px",
            boxSizing: "border-box"
          }}
        />

        <button type="submit" style={{
          width: "100%",
          padding: "14px",
          background: "#16a34a",
          color: "white",
          border: 0,
          borderRadius: "8px"
        }}>
          Entrar
        </button>
      </form>

      <p>
        Ainda não tem conta? <a href="/criar-conta">Criar conta</a>
      </p>
      <a href="/">Voltar ao início</a>
    </main>
  );
}
