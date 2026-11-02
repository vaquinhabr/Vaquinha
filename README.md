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
- Redirect URLs: inclua `https://vaquinha-zeta.vercel.app/**` se for usar callbacks diretos por caminho.
- O fluxo atual retorna primeiro ao Site URL do Supabase e, depois de processar os tokens, encaminha para `/auth/confirm` ou `/auth/reset-password`.
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

## Eleva Payments (Pix)

A integração de pagamentos fica no servidor. Configure estas variáveis no ambiente **Production** e **Preview** da Vercel:

- `ELEVA_API_TOKEN`: token secreto da Eleva (não usar prefixo `NEXT_PUBLIC_`).
- `ELEVA_CLIENT_ID`: Client ID da credencial da Eleva.
- `ELEVA_WEBHOOK_URL`: URL pública `https://SEU-DOMINIO/api/webhooks/eleva`.
- `SUPABASE_SERVICE_ROLE_KEY`: chave de serviço do Supabase, somente no servidor.

Antes de habilitar doações reais:

1. Revise e aplique `supabase/migrations/20261101_eleva_payments.sql` no banco correto.
2. Publique a Edge Function atualizada do painel: `supabase functions deploy admin-api`.
3. Configure a URL de webhook na credencial ou no painel da Eleva para apontar para `ELEVA_WEBHOOK_URL`.
4. Confira os nomes exatos dos campos de QR Code e Pix copia e cola na resposta real de `POST /payments/pix` e valide o formato de assinatura com um evento de teste da Eleva.
5. Faça uma cobrança de baixo valor em ambiente de teste, confirme que o webhook muda a doação para paga e que o painel contabiliza o valor apenas uma vez.

O site só deve considerar a doação arrecadada após um evento válido `deposit.completed`. Nunca compartilhe nem registre tokens secretos em arquivos versionados.

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
