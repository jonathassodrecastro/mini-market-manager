# mini-market-manager

Fullstack monorepo para gerenciamento de minimercados.

## Stack

- **Backend:** Node.js + Express + TypeScript + Prisma
- **Frontend:** Next.js (a criar)
- **Banco de dados:** PostgreSQL
- **Gerenciador de pacotes:** pnpm (workspaces)
- **Containerização:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

---

## Infra e containerização

### Dockerfile (multi-stage)

O backend usa multi-stage build com 4 stages:

| Stage | Finalidade |
|---|---|
| `base` | Imagem base compartilhada (Node 22 Alpine + pnpm) |
| `development` | Instala devDependencies, roda com `tsx watch` (hot-reload) |
| `builder` | Compila TypeScript → `/dist` (stage descartado após build) |
| `production` | Copia `/dist` + deps de prod apenas. Roda como `USER node` (não-root) |

### Docker Compose

- **`docker-compose.yml`** — desenvolvimento local
  - Volume monta `./backend:/app` para hot-reload
  - PostgreSQL com healthcheck; backend sobe só após banco estar pronto
  - Variáveis de ambiente hard-coded (seguro em dev)

- **`docker-compose.prod.yml`** — produção
  - Variáveis sensíveis via `.env` (nunca hard-coded)
  - `restart: unless-stopped` em todos os serviços
  - Porta do banco não exposta externamente

### Variáveis de ambiente

Em desenvolvimento, definidas diretamente no `docker-compose.yml`.
Em produção, devem vir de um arquivo `.env` na raiz (não versionado) ou de secrets do ambiente de deploy.

Variáveis necessárias em produção:
```
DATABASE_URL=postgresql://user:password@db:5432/dbname
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

---

## CI/CD

### GitHub Actions (`ci.yml`)

Dispara em push ou PR para `main`.
Etapas atuais:
1. Checkout do código
2. Setup do Docker Buildx
3. Build da imagem de produção do backend (com cache via GitHub Actions Cache)

A expandir futuramente: testes, push para registry, deploy automático.

---

## Banco de dados

- ORM: **Prisma**
- Banco: **PostgreSQL 16**
- Conexão via variável `DATABASE_URL`
- Comandos úteis:
  ```bash
  pnpm db:migrate    # aplica migrations
  pnpm db:generate   # gera o Prisma Client
  pnpm db:studio     # abre o Prisma Studio (GUI)
  ```

---

## Branches

| Branch | Finalidade |
|---|---|
| `main` | Código estável, protegida |
| `infra/containerization` | Setup de Docker e CI/CD |

Convenção de nomes: `tipo/descricao` (ex: `feat/`, `fix/`, `infra/`, `chore/`)

---

## Decisões de arquitetura

- Monorepo com pnpm workspaces para compartilhar tipos e scripts entre backend e frontend no futuro
- Alpine como base das imagens Docker para reduzir tamanho e superfície de ataque
- Stage `builder` separado no Dockerfile para que código-fonte TypeScript não entre na imagem de produção
