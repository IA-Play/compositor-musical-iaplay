# NoAlvo Platform – Fase 1 (Arquitetura e Estratégia)

## 1) Riscos técnicos reais
- **Limites de quota YouTube Data API**: sincronização intensa pode consumir quota diária rapidamente.
- **PubSubHubbub do YouTube não cobre tudo**: mudanças de metadado/estado podem não ser instantâneas; fallback agendado obrigatório.
- **WhatsApp Cloud API exige templates aprovados**: envios proativos só com templates homologados.
- **Stripe webhooks fora de ordem**: necessário idempotência por `event.id` e reconciliação.
- **Transcrição indisponível**: vídeos sem legenda oficial exigem fallback ASR com custo e latência.
- **Volume de busca em transcrições**: precisa índice textual e estratégia de paginação.

## 2) Limitações oficiais das integrações
- **YouTube**: sem webhook completo para todos os metadados; usa PubSub para novos uploads + polling.
- **Resend**: qualidade de envio depende de SPF/DKIM/DMARC e aquecimento de domínio.
- **WhatsApp**: janelas de conversa e política de template impactam automações.
- **Stripe**: cobrança recorrente e compliance exigem fluxo oficial (nada de hacks).

## 3) Estratégia de webhook
- `/api/webhooks/youtube`: assinatura de novos conteúdos (PubSub callback).
- `/api/webhooks/stripe`: eventos de pagamento, assinatura, reembolso, chargeback.
- `/api/webhooks/whatsapp`: status de entrega e falha de mensagens.
- Cada evento webhook gera registro e job assíncrono; sem processamento pesado inline.

## 4) Estratégia de jobs agendados
- YouTube sync incremental (a cada 10-15 min).
- Refresh de lives próximas/ao vivo (a cada 2-5 min).
- Reprocessamento de falhas de notificação (backoff exponencial).
- Consolidação de analytics diária.

## 5) Estratégia de filas
- BullMQ + Redis com filas separadas:
  - `youtube-sync`
  - `transcript-ingestion`
  - `notifications`
  - `whatsapp`
  - `analytics`
- Retry com limite por tipo de job.
- Dead-letter lógica por status em banco + auditoria.

## 6) Estratégia de fallback
- Sem push do YouTube -> polling agendado.
- Falha WhatsApp -> fallback e-mail se preferência permitir.
- Falha transcrição oficial -> ASR pipeline técnico estruturado.
- Falha Stripe webhook -> job de reconciliação via API.

## 7) Recursos que exigem credenciais
- `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_SECRET`.
- `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`.
- `RESEND_API_KEY`.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- `WHATSAPP_*` (Cloud API Meta).

## 8) Público vs privado
- **Público**: home, vídeos, lives, matérias, novidades, eventos, ofertas, busca global.
- **Privado**: admin, transcrições, painel profético, logs, usuários, configurações.

## 9) Proteção extra obrigatória
- Módulo de transcrições privadas.
- Notas internas e marcações proféticas.
- Gestão de usuários e permissões.
- Logs de auditoria.

## 10) Modelagem de dados
Implementada em `prisma/schema.prisma` com entidades para:
- Usuários, papéis, auditoria.
- Vídeos/lives + metadados + transcrições + segmentos + notas + marcas proféticas.
- CMS (posts, categorias, tags).
- Inscritos e preferências.
- Notificações, jobs e status.
- Eventos, tipos de ingresso, pedidos, participantes.
- Campanhas/doações/atualizações/recorrência (base).
- Destaques e settings.

## Roadmap Fases 2–10
A base de código inclui rotas, serviços e APIs iniciais para expandir:
- Fase 2: autenticação/autorização/layout/admin base ✅
- Fase 3: ingestão YouTube inicial + rota sync ✅ (evoluir para classificação avançada/live detection)
- Fase 4: CMS base no schema + páginas prontas para CRUD
- Fase 5/6: notificações e WhatsApp via filas (estrutura pronta)
- Fase 7/8: eventos/tickets/doações (APIs checkout iniciadas)
- Fase 9: busca privada em transcrição (endpoint admin inicial)
- Fase 10: analytics, hardening, testes e observabilidade contínua
