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
- Schema em `backend/prisma/schema.prisma`
- Comandos úteis:
  ```bash
  pnpm db:migrate    # aplica migrations
  pnpm db:generate   # gera o Prisma Client
  pnpm db:studio     # abre o Prisma Studio (GUI)
  ```

### Modelagem

| Entidade | Delete | Motivo |
|---|---|---|
| `User` | Soft | Histórico de ações |
| `Category` | Hard | Dado simples, sem impacto histórico |
| `Supplier` | Soft | Pode ser reativado |
| `Product` | Soft | Vendas antigas referenciam o produto |
| `Sale` / `SaleItem` | Nunca | Dado financeiro — apenas cancelamento via status |

**Relações:**
- `User` → `Sale` (1:N)
- `Category` → `Product` (1:N)
- `Supplier` → `Product` (1:N, opcional)
- `Sale` → `SaleItem` (1:N)
- `Product` → `SaleItem` (1:N)

**Decisões técnicas:**
- Valores monetários usam `Decimal` (não `Float`) para evitar erros de arredondamento
- `SaleItem` armazena `unitPrice` no momento da venda — protege o histórico de alterações futuras no preço do produto
- `SaleItem.subtotal` é persistido no banco (quantity × unitPrice) para facilitar relatórios sem recalcular
- `Product.minStock` é a base para alertas de reposição
- `Sale.status` usa enum `COMPLETED | CANCELLED`

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
- Estratégia de deleção mista: soft delete onde há impacto histórico, hard delete onde o dado é simples e isolado

---

## Testes

**Regra:** nenhum código vai para a `main` sem testes.

- Framework: **Vitest**
- Cobertura: **@vitest/coverage-v8**
- Localização: co-localizados com o código (`*.test.ts` ao lado do arquivo testado)

**Tipos de teste:**
- **Unitário** — lógica isolada de services e utils, sem dependências externas
- **Integração** — rotas + banco de dados

**Comandos:**
```bash
pnpm test              # roda todos os testes uma vez
pnpm test:watch        # modo watch (desenvolvimento)
pnpm test:coverage     # roda com relatório de cobertura
```

---

## Estrutura do backend

```
backend/src/
├── index.ts                        # entrypoint — apenas inicializa o servidor
├── app.ts                          # configuração do Express (middlewares, rotas, health check)
├── config/
│   └── database.ts                 # Prisma Client singleton
├── modules/                        # organizado por domínio
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── suppliers/
│   └── sales/
├── middlewares/
│   └── error.middleware.ts         # captura todos os erros lançados nas rotas
└── shared/
    └── errors/
        └── AppError.ts             # classe de erro customizada com statusCode
```

### Convenção dos módulos

Cada módulo terá:

| Arquivo | Responsabilidade |
|---|---|
| `*.routes.ts` | Define as rotas e conecta ao controller |
| `*.controller.ts` | Recebe a requisição, chama o service, retorna a resposta |
| `*.service.ts` | Contém a lógica de negócio e acesso ao banco via Prisma |
| `*.service.test.ts` | Testes unitários do service |

### Separação `index.ts` × `app.ts`

`index.ts` apenas chama `.listen()`. `app.ts` configura toda a aplicação.
Isso permite importar o `app` nos testes de integração sem subir um servidor real.

### AppError

Erros esperados (validação, not found, unauthorized) devem ser lançados como `AppError`:
```typescript
throw new AppError('Produto não encontrado', 404);
```
O `error.middleware.ts` captura e responde com o status correto. Erros não tratados retornam 500.
