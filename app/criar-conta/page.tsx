export default function CriarConta() {
  return (
    <main style={{
      maxWidth: "420px",
      margin: "50px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#172033"
    }}>
      <h1>Criar conta</h1>
      <p>Cadastre-se para começar sua jornada na Vaquinha.</p>

      <form>
        <label htmlFor="nome">Nome completo</label>
        <input
          id="nome"
          type="text"
          placeholder="Seu nome"
          required
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 18px",
            boxSizing: "border-box"
          }}
        />

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

        <label htmlFor="senha">Criar senha</label>
        <input
          id="senha"
          type="password"
          minLength={8}
          placeholder="Mínimo de 8 caracteres"
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
          Criar minha conta
        </button>
      </form>

      <p>Já tem conta? <a href="/entrar">Entrar</a></p>
      <a href="/">Voltar ao início</a>
    </main>
  );
}
