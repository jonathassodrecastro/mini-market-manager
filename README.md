# Mini Market Manager

Sistema de gestão para minimercados — projeto de estudo fullstack com Node.js, Next.js e integração com IA via Claude.

> Este projeto é público e construído de forma incremental. O objetivo é ser funcional e servir como referência de arquitetura fullstack moderna com boas práticas de infra e desenvolvimento.

---

## Visão geral

O Mini Market Manager (M3) nasceu da necessidade de aprender na prática. A ideia é construir um sistema real de gestão de minimercados cobrindo as principais responsabilidades de um produto fullstack: autenticação, cadastros, relatórios, integração com IA e deploy em produção.

---

## Funcionalidades planejadas

- Cadastro e gestão de produtos e categorias
- Controle de estoque com alertas de reposição
- Registro de vendas e geração de relatórios
- Gestão de fornecedores
- Autenticação e controle de acesso por perfil
- Assistente inteligente via Claude para análise de vendas e sugestões

---

## Stack

| Camada         | Tecnologia                     |
| -------------- | ------------------------------ |
| Backend        | Node.js + Express + TypeScript |
| Frontend       | Next.js + TypeScript           |
| Banco de dados | PostgreSQL + Prisma ORM        |
| IA             | Claude API (Anthropic)         |
| Infra          | Docker + Docker Compose        |
| CI/CD          | GitHub Actions                 |
| Pacotes        | pnpm workspaces (monorepo)     |

---

## Estrutura do projeto

Monorepo com dois workspaces principais:

```
mini-market-manager/
├── backend/    # API REST em Node.js + Express
├── frontend/   # Interface em Next.js
└── ...         # Configurações de infra e CI/CD
```

---

## Rodando localmente

> Requisito: Docker e Docker Compose instalados.

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mini-market-manager.git
cd mini-market-manager

# Suba os containers
docker compose up
```

O backend estará disponível em `http://localhost:3001`.

---

## Roadmap

- [x] Setup do monorepo com pnpm workspaces
- [x] Configuração do backend (Express + TypeScript + Prisma)
- [x] Containerização com Docker e Docker Compose
- [x] Pipeline de CI com GitHub Actions
- [ ] Estrutura de pastas e padrões do backend
- [ ] Modelagem do banco de dados
- [ ] API REST completa
- [ ] Setup e estrutura do frontend
- [ ] Autenticação
- [ ] Funcionalidades de gestão
- [ ] Integração com Claude
- [ ] Deploy em produção

---

## Sobre

Projeto desenvolvido como estudo prático de desenvolvimento fullstack moderno. Contribuições e feedbacks são bem-vindos.
