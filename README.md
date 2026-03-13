# NoAlvo Platform

Plataforma oficial do canal NoAlvo em `canalnoalvo.com`, construída com Next.js App Router + TypeScript + Tailwind + Prisma + PostgreSQL.

## Entregas atuais (base funcional)
- Arquitetura completa documentada por fases (1 a 10).
- Estrutura full-stack com frontend público + painel admin + APIs.
- Prisma schema robusto cobrindo vídeos, lives, CMS, eventos, tickets, doações, transcrições privadas, painel profético, notificações, auditoria e configurações.
- Integrações base com YouTube, Stripe, Resend e WhatsApp Cloud API.
- Pipeline inicial de jobs e filas (BullMQ + Redis).
- Auth segura com NextAuth (credenciais) + RBAC + proteção de rotas admin.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + componentes estilo shadcn
- PostgreSQL + Prisma
- NextAuth
- BullMQ + Redis
- Resend
- Stripe

## Setup
1. Copie `.env.example` para `.env`.
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run prisma:seed`
6. `npm run dev`

Credencial seed inicial:
- `admin@canalnoalvo.com`
- senha: `ChangeMe123!` (trocar imediatamente)

## Deploy
- Vercel para app web.
- Banco PostgreSQL gerenciado.
- Redis gerenciado para filas.
- Worker dedicado para BullMQ.

## Segurança
- Validação com Zod.
- Separação público/privado por middleware e RBAC.
- Webhooks com verificação de assinatura/token.
- Trilha de auditoria prevista no schema.

Leia `docs/architecture.md` para detalhamento completo.
