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

Execute o arquivo `supabase/schema.sql` no SQL Editor do Supabase  
(ou ajuste o código se suas colunas tiverem nomes diferentes).

## Páginas

- `/` — Início
- `/criar-conta` — Cadastro
- `/entrar` — Login
- `/painel` — Painel do usuário
- `/campanhas` — Listagem
- `/campanhas/nova` — Criar campanha
- `/campanhas/[id]` — Página pública
- `/campanhas/[id]/editar` — Editar campanha

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
# preencha as variáveis
npm run dev
```
