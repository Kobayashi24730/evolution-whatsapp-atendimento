# Evolution WhatsApp Atendimento

Central de atendimento via WhatsApp construída com Next.js 15 (App Router), Prisma ORM e integração com a [Evolution API](https://github.com/EvolutionAPI/evolution-api) para envio/recebimento de mensagens do WhatsApp.

## Stack

- **Frontend/Backend:** Next.js 15 (App Router), React 19, TypeScript
- **Autenticação:** NextAuth v4 (Credentials Provider, JWT)
- **Banco de dados:** PostgreSQL via Prisma ORM
- **Rate limiting:** Upstash Redis
- **WhatsApp:** Evolution API v2.3.7 (self-hosted via Docker)
- **UI:** Tailwind CSS 4, shadcn/ui (estilo `radix-nova`), Recharts

## Arquitetura de containers

O projeto roda inteiramente via Docker Compose, com **dois bancos Postgres separados** — ponto crítico de configuração:

| Serviço | Container | Banco | Usado por |
|---|---|---|---|
| `evolution_db` | `evolution_db` | `evolution_automation` | Evolution API (schema interno dela: `Contact`, `Setting`, `Instance`, etc. — 37 tabelas) |
| `evolution_client` | `evolution_client` | `evolution_client` | Seu app Next.js (schema em `prisma/schema.prisma`: `Atendimento`, `Mensagem`, `User`, etc.) |
| `evolution_redis` | `evolution_redis` | — | Cache interno da Evolution API |
| `evolution` | `evolution_api` | — | A própria Evolution API (porta 8080) |
| `nextjs` | `atendimento_next` | — | O app Next.js (porta 3000) |

> ⚠️ **Nunca aponte `DATABASE_URL` (Next.js) e `EVOLUTION_DATABASE_URL` (Evolution API) para o mesmo banco.** Cada um migra seu próprio schema de forma independente; se compartilharem o banco, as migrações colidem e ambos os serviços quebram com erros `P2021` (tabela não existe) ou `P3005` (schema não vazio).

## Variáveis de ambiente

Existem **dois arquivos `.env` distintos**:

- **`.env` na raiz do projeto** (ao lado de `docker-compose.yml`): alimenta a interpolação `${VAR}` usada pelo próprio `docker-compose.yml` (senhas de banco, chave da Evolution API, `DATABASE_URL`, `EVOLUTION_DATABASE_URL`).
- **`client/.env`**: injetado no container do Next.js via `env_file:` — variáveis específicas de runtime da aplicação (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPSTASH_REDIS_REST_URL`/`TOKEN`).

Principais variáveis do `.env` da raiz:

```env
POSTGRES_USER_ADMIN=guilherme_admin
POSTGRES_PASSWORD_ADMIN=<senha>
POSTGRES_USER_CLIENT=guilherme_client
POSTGRES_PASSWORD_CLIENT=<senha>

DATABASE_URL="postgresql://guilherme_client:<senha>@evolution_client:5432/evolution_client"
EVOLUTION_DATABASE_URL="postgresql://guilherme_admin:<senha>@evolution_db:5432/evolution_automation"

EVOLUTION_API_URL=http://evolution_api:8080
EVOLUTION_API_KEY=<chave>
EVOLUTION_INSTANCE_NAME=gui
WEBHOOK_URL=http://atendimento_next:3000/api/webhook

NODE_ENV=development
```

## Subindo o projeto

```powershell
docker compose up -d --remove-orphans
```

Na primeira vez (ou após resetar volumes), sincronize o schema do seu app com o banco `evolution_client`:

```powershell
docker compose exec nextjs npx prisma db push
```

Verifique que os bancos estão corretamente separados:

```powershell
docker compose exec evolution_db psql -U guilherme_admin -d evolution_automation -c "\dt"
docker compose exec evolution_client psql -U guilherme_client -d evolution_client -c "\dt"
```

## Pareando o WhatsApp

1. Acesse o Manager da Evolution API: `http://localhost:8080/manager/login`
2. Informe **Server URL** (`http://localhost:8080`) e a **API Key Global** (`EVOLUTION_API_KEY` do `.env`)
3. Crie/abra a instância `gui` e escaneie o QR Code com o WhatsApp
4. Confirme que o webhook global (`WEBHOOK_GLOBAL_URL`) está apontando para `http://atendimento_next:3000/api/webhook` — **não** configure um webhook separado por instância, para evitar chamadas duplicadas/incorretas

## Troubleshooting rápido

| Sintoma | Causa provável | Solução |
|---|---|---|
| `The table 'public.X' does not exist` (P2021) no Next.js | `db push` não rodou no banco `evolution_client` | `docker compose exec nextjs npx prisma db push` |
| Mesmo erro, mas em tabelas da Evolution (`Contact`, `Setting`) | `EVOLUTION_DATABASE_URL` errada ou banco sujo | Resetar o volume `postgres_data` e deixar a Evolution migrar do zero |
| `Error: P3005 - schema is not empty` | `DATABASE_URL` e `EVOLUTION_DATABASE_URL` apontando pro mesmo banco | Corrigir o `.env`, resetar os dois volumes |
| Variável `not set` ao rodar `docker compose up` | Editando `client/.env` em vez do `.env` da raiz | Confirmar qual `.env` alimenta o compose (ver seção acima) |
| Container atualizado mas variável antiga persiste | Container não recriado | `docker compose up -d --force-recreate <serviço>` |

## Estrutura de pastas (resumo)

```
client/
├── app/
│   ├── api/                # Rotas de API (ver documentação de endpoints)
│   ├── atendimento/        # Central de chats
│   ├── dashboard/          # KPIs e fila de espera
│   ├── procurar/           # Busca de atendimentos
│   ├── login/               # Login/cadastro
│   └── configuracoes/      # Configurações do usuário
├── components/             # Componentes React (atendimento/, dashboard/, ui/)
├── hooks/                  # useAtendimentos, useDashboardStats
├── libs/                   # prisma.ts, auth.js, rate-limit.ts, utils.ts
├── prisma/
│   └── schema.prisma       # Schema do banco do app (evolution_client)
└── middleware.ts           # Auth + rate limiting nas rotas protegidas
```

## Documentação de endpoints

Ver `insomnia-collection.json` — coleção exportável direto para o Insomnia (**Application → Import/Export → Import Data → From File**).