# Vaquinha

Plataforma de financiamento coletivo.

## Stack

- Next.js 15 + React 19 + TypeScript
- Supabase (Auth + Database)
- Deploy: Vercel

## Site

https://vaquinha-zeta.vercel.app

## Configuração necessária (uma vez)

### 1. Variáveis na Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. Supabase → Authentication → URL Configuration

- Site URL: `https://vaquinha-zeta.vercel.app`
- Redirect URLs: `https://vaquinha-zeta.vercel.app/**`

### 3. Banco de dados

O arquivo `supabase/schema.sql` documenta o esquema atual e as permissões mínimas esperadas. Em um banco já existente, revise as diferenças antes de executar qualquer SQL.

### 4. Autenticação em produção

- Site URL: `https://vaquinha-zeta.vercel.app`
- Redirect URLs: `https://vaquinha-zeta.vercel.app/**`
- O app usa `/auth/confirm` para confirmar cadastro e `/auth/reset-password` para redefinir senha.
- Configure SMTP próprio no Supabase antes de abrir o cadastro ao público; o envio padrão é limitado e destinado a testes.

## Páginas

- `/` — Início
- `/criar-conta` — Cadastro
- `/entrar` — Login
- `/painel` — Painel do usuário
- `/campanhas` — Listagem
- `/campanhas/nova` — Criar campanha
- `/campanhas/[id]` — Página pública
- `/campanhas/[id]/editar` — Editar campanha

## Qualidade e testes

```bash
npm install
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes de navegador simulam as respostas de autenticação e não criam usuários reais nem enviam e-mails.

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
# preencha as variáveis
npm run dev
```
