import { test, expect } from "@playwright/test";

const fakeUser = {
  id: "b0b0b0b0-b0b0-40b0-80b0-b0b0b0b0b0b0",
  aud: "authenticated",
  role: "authenticated",
  email: "teste@example.com",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { full_name: "Pessoa de Teste", display_name: "Pessoa de Teste" },
  identities: [{ identity_id: "identity-test", id: "teste@example.com", user_id: "b0b0b0b0-b0b0-40b0-80b0-b0b0b0b0b0b0", identity_data: { email: "teste@example.com" }, provider: "email", created_at: new Date().toISOString(), last_sign_in_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

async function mockAuthApi(page) {
  await page.route("**/auth/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/signup")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: fakeUser, session: null }) });
      return;
    }
    if (url.pathname.endsWith("/token") && url.searchParams.get("grant_type") === "password") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "test-access-token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: "test-refresh-token",
          user: fakeUser,
        }),
      });
      return;
    }
    if (url.pathname.endsWith("/recover")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      return;
    }
    if (url.pathname.endsWith("/user")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeUser) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route("**/rest/v1/campaigns**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "content-range": "0-0/0" }, body: "[]" });
  });
}

test("signup validates required data before making a request", async ({ page }) => {
  await mockAuthApi(page);
  await page.goto("/criar-conta");
  await page.getByRole("button", { name: /criar minha conta/i }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/nome|e-mail|senha/i);
});

test("signup success shows email confirmation instructions", async ({ page }) => {
  await mockAuthApi(page);
  await page.goto("/criar-conta");
  await page.getByLabel("Nome completo").fill("Pessoa de Teste");
  await page.getByLabel("E-mail").fill("  TESTE@example.com ");
  await page.getByLabel("Crie uma senha").fill("SenhaSegura123");
  await page.getByRole("button", { name: /criar minha conta/i }).click();
  await expect(page.getByRole("status")).toContainText(/confirmação|caixa de entrada/i);
});

test("login reports invalid credentials clearly", async ({ page }) => {
  await page.route("**/auth/v1/token**", async (route) => {
    await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ code: "invalid_credentials", msg: "Invalid login credentials" }) });
  });
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("teste@example.com");
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: /entrar na minha conta/i }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/e-mail ou senha incorretos/i);
});

test("login success opens the protected panel", async ({ page }) => {
  await mockAuthApi(page);
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("teste@example.com");
  await page.getByLabel("Senha").fill("SenhaSegura123");
  await page.getByRole("button", { name: /entrar na minha conta/i }).click();
  await expect(page).toHaveURL(/\/painel$/);
  await expect(page.getByRole("heading", { name: /olá,/i })).toBeVisible();
});

test("password recovery displays a privacy-preserving confirmation", async ({ page }) => {
  await mockAuthApi(page);
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("teste@example.com");
  await page.getByRole("button", { name: /esqueci minha senha/i }).click();
  await expect(page.getByRole("status")).toContainText(/se existir uma conta/i);
});

test("rate-limited signup exposes a safe retry path", async ({ page }) => {
  await page.route("**/auth/v1/signup**", async (route) => {
    await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ code: "over_email_send_rate_limit", msg: "email rate limit exceeded" }) });
  });
  await page.route("**/auth/v1/resend**", async (route) => {
    await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ code: "over_email_send_rate_limit", msg: "email rate limit exceeded" }) });
  });
  await page.goto("/criar-conta");
  await page.getByLabel("Nome completo").fill("Pessoa de Teste");
  await page.getByLabel("E-mail").fill("teste@example.com");
  await page.getByLabel("Crie uma senha").fill("SenhaSegura123");
  await page.getByRole("button", { name: /criar minha conta/i }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/limite temporário/i);
  await expect(page.getByRole("button", { name: /reenviar e-mail de confirmação/i })).toBeVisible();
  await page.getByRole("button", { name: /reenviar e-mail de confirmação/i }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/limite temporário/i);
});

test("expired signup callbacks route to the confirmation recovery page", async ({ page }) => {
  await page.goto("/?type=signup");
  await expect(page).toHaveURL(/\/auth\/confirm$/);
  await expect(page.locator('p[role="alert"]')).toContainText(/link pode ter expirado|não encontramos uma sessão/i);
});

test("password recovery callbacks route to the reset page", async ({ page }) => {
  await page.goto("/?type=recovery");
  await expect(page).toHaveURL(/\/auth\/reset-password$/);
  await expect(page.locator('p[role="alert"]')).toContainText(/link de recuperação é inválido ou expirou/i);
});

test("signup with email confirmation disabled opens the panel", async ({ page }) => {
  await mockAuthApi(page);
  await page.route("**/auth/v1/signup**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "test-access-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "test-refresh-token",
        user: fakeUser,
      }),
    });
  });
  await page.goto("/criar-conta");
  await page.getByLabel("Nome completo").fill("Pessoa de Teste");
  await page.getByLabel("E-mail").fill("teste@example.com");
  await page.getByLabel("Crie uma senha").fill("SenhaSegura123");
  await page.getByRole("button", { name: /criar minha conta/i }).click();
  await expect(page).toHaveURL(/\\/painel$/);
  await expect(page.getByRole("heading", { name: /olá,/i })).toBeVisible();
});
