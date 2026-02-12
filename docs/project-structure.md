
# M.T.D. Project Structure
**Architect:** ARCHITECTUS AEGIS

A estrutura foi projetada para separação clara entre a interface de controle (C2) e a lógica de servidor, mantendo a simplicidade para implantação rápida.

```
/tactical-monitoring-system
│
├── docs/                     # Documentação de Arquitetura e API
│   ├── architecture.json
│   ├── openapi.yaml
│   └── phase-instructions.md
│   └── project-structure.md
│
├── prisma/                   # Camada de Dados (ORM)
│   ├── schema.prisma
│   └── tactical_db.sqlite    # (Gerado automaticamente)
│
├── public/                   # Arquivos estáticos servidos pelo backend
│   └── uploads/              # Mídia capturada pelos agentes (snapshots)
│
├── backend/                  # Backend (Node.js/Express)
│   ├── src/
│   │   ├── controllers/      # Lógica de endpoints (HTTP/REST)
│   │   ├── services/         # Lógica de negócio (Auth, Telemetry, OSINT)
│   │   ├── middleware/       # Middlewares (Auth, Validation)
│   │   ├── models/           # Schemas de validação (Zod)
│   │   ├── routes/           # Definição de rotas HTTP
│   │   ├── utils/            # Utilitários (Logger, JWT)
│   │   ├── prisma.ts         # Instância do Prisma Client
│   │   ├── socket.ts         # Lógica do Socket.io (WebSockets & WebRTC Signaling)
│   │   ├── app.ts            # Configuração do Express
│   │   └── server.ts         # Ponto de entrada do servidor
│   ├── package.json          # Dependências do backend
│   └── tsconfig.json         # Configuração TypeScript
│
├── frontend/                 # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação (Dashboard, AgentDevice)
│   │   ├── services/         # Clientes de API (HTTP, Socket.io)
│   │   ├── stores/           # Gerenciamento de estado (Zustand)
│   │   ├── hooks/            # Hooks customizados
│   │   ├── lib/              # Utilitários de cliente (Axios)
│   │   ├── types/            # Tipos específicos do frontend (re-exporta de shared)
│   │   ├── App.tsx           # Componente principal do React
│   │   ├── main.tsx          # Ponto de entrada do React
│   │   └── index.css         # Estilos globais (Tailwind)
│   ├── public/               # Assets públicos (imagens, ícones)
│   ├── package.json          # Dependências do frontend
│   ├── tsconfig.json         # Configuração TypeScript
│   ├── vite.config.ts        # Configuração do Vite
│   └── tailwind.config.js    # Configuração do Tailwind CSS
│
├── shared/                   # Tipos e Schemas compartilhados (Backend/Frontend)
│   └── types/                # Definições de tipos e Zod Schemas
│
├── android-agent/            # Esqueleto/Conceito de Aplicativo Android Nativo (NOVO)
│   ├── README.md             # Guia de arquitetura e integração
│   ├── src/                  # Estrutura conceptual de código-fonte Kotlin/Java
│
├── docker/                   # Configuração Docker para Backend e Frontend
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── .github/                  # Workflows de CI/CD (GitHub Actions)
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── tests/                    # Testes (e2e com Playwright)
│   └── e2e/
│       └── tactical.spec.ts
│
├── .env.example              # Exemplo de variáveis de ambiente
├── DEPLOYMENT.md             # Guia de implantação do sistema
├── README.md                 # Visão geral do projeto
└── docker-compose.yml        # Orquestração Docker para desenvolvimento
└── docker-compose.prod.yml   # Orquestração Docker para produção
```
