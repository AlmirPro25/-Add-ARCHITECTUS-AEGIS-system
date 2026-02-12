
# 🛡️ ARCHITECTUS AEGIS: TACTICAL DEVICE MONITORING (M.T.D.)

> **System Status:** `OPERATIONAL`
> **Version:** `2.0.4-RELEASE`
> **Classification:** `RESTRICTED`

O **M.T.D.** é uma plataforma de consciência situacional de espectro total, projetada para monitoramento em tempo real de ativos distribuídos. Combina telemetria de sensores móveis, geolocalização de precisão, streaming de mídia ao vivo e logging de eventos críticos em uma interface de comando unificada. Incorpora também capacidades de Open Source Intelligence (OSINT) para aprofundar a inteligência de alvos.

## 📸 Capacidades do Sistema

*   **Rastreamento GPS em Tempo Real:** Visualização de ativos em mapa vetorial com atualização via WebSockets (<200ms).
*   **Telemetria de Sensores:** Monitoramento de bateria, conectividade, CPU, memória, orientação do dispositivo (Web) e status de hardware.
*   **Streaming de Mídia ao Vivo (WebRTC):** Captura e transmissão em tempo real de vídeo (câmera), áudio (microfone) e tela (navegador/dispositivo) de agentes para o dashboard.
*   **Captura de Snapshots:** Upload de imagens, áudios ou vídeos sob demanda.
*   **Open Source Intelligence (OSINT):** Ferramenta integrada para buscar e correlacionar informações públicas sobre alvos na internet. A funcionalidade é projetada para integração com APIs reais, com dados simulados dinamicamente para a demonstração.
*   **Dashboard Tático:** Interface "Glass Cockpit" desenvolvida em React/Tailwind para controle e visualização unificados, com autenticação de operador de Comando e Controle pré-configurada.
*   **Agente de Campo (Web-based):** Simulação de um aplicativo espião que coleta e transmite dados via navegador, com capacidades de streaming WebRTC e controle de sensores.
*   **Agente de Campo (Android - COMPLETO E FUNCIONAL):** Aplicativo Android nativo totalmente implementado em Kotlin, com registro automático, telemetria em tempo real (GPS, bateria, sensores), Socket.IO, armazenamento seguro e Foreground Service. Pronto para uso em desenvolvimento e testes.
*   **Resiliência de Rede:** Protocolos de reconexão automática e buffer de dados.
*   **Arquitetura Dockerizada:** Pronto para deploy em qualquer nuvem.

## 🏗️ Arquitetura Técnica

| Componente       | Tecnologia                                  | Função                                                               |
| :--------------- | :------------------------------------------ | :------------------------------------------------------------------- |
| **Backend**      | Node.js, Express.js, Socket.io, Prisma ORM  | API REST (Auth, Dispositivos, OSINT), WebSockets (Telemetria, WebRTC Signaling), Persistência de Dados (SQLite) |
| **Frontend**     | React, Vite, TypeScript, TailwindCSS, Zustand, Leaflet.js | Dashboard de Controle (UI Operador), Interface de Agente (Simulação Web), Visualização de Dados e Streams |
| **Dados**        | SQLite (Desenvolvimento/Pequenas Implantações), Prisma ORM | Modelagem e Acesso a Dados (Dispositivos, Telemetria, Logs, Mídia) |
| **Tempo Real**   | Socket.io, WebRTC (Signaling)               | Comunicação Bidirecional, Negociação de Conexões P2P para Mídia |
| **Containers**   | Docker, Docker Compose                      | Empacotamento, Orquestração e Implantação de Serviços               |
| **CI/CD**        | GitHub Actions                              | Automação de Testes e Deployment                                     |
| **Compartilhado**| Zod, TypeScript                             | Validação e Definição de Tipos Compartilhados entre Frontend e Backend |
| **Agente Nativo (Android)** | Kotlin, Socket.IO, FusedLocationProvider, CameraX, WebRTC SDK | Coleta de Sensores Nativos, GPS, Bateria, Telemetria em Tempo Real, Foreground Service |

## ⚙️ Como Executar o Projeto

### Pré-requisitos
*   Docker e Docker Compose (v2) instalados
*   Node.js (v18+) e npm (para desenvolvimento local sem Docker)

### 1. Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto (mesmo nível do `docker-compose.yml`):
```bash
cp .env.example .env
# Edite .env e preencha JWT_SECRET com uma string longa e aleatória.
# Por exemplo: openssl rand -base64 32
# FRONTEND_URL=http://localhost:80 (para docker-compose.prod.yml)
```

### 2. Execução em Modo de Desenvolvimento (com Docker Compose)
```bash
docker-compose up -d --build
```
Isso irá:
*   Construir as imagens do backend e frontend.
*   Iniciar o backend na porta `3000` (API REST e WebSockets).
*   Iniciar o frontend (Vite dev server) na porta `5173`.
*   O frontend se conectará automaticamente ao backend via proxy configurado no `vite.config.ts`.

Acesse:
*   **Dashboard (Mission Control):** `http://localhost:5173/dashboard`
*   **Agente de Campo (Simulação Web):** `http://localhost:5173/agent`
*   **API Backend:** `http://localhost:3000/api/v1` (direto, ou via proxy do frontend em `/api/v1`)

### 3. Execução em Modo de Produção (com Docker Compose)
Para um deployment otimizado:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
Isso irá:
*   Construir as imagens de produção (backend otimizado e frontend servido por Nginx).
*   O Nginx do frontend atuará como proxy reverso para o backend.
*   **Dashboard e API estarão acessíveis na porta `80` (HTTP).**

Acesse:
*   **Dashboard (Mission Control):** `http://localhost/dashboard`
*   **Agente de Campo (Simulação Web):** `http://localhost/agent`

## 📡 Como Usar o Sistema

### Opção 1: Agente Web (Simulação no Navegador)

1.  **Iniciar o Agente:**
    *   Navegue para `http://localhost:5173/agent` (dev) ou `http://localhost/agent` (prod).
    *   Clique em "Establish Identity" para registrar o agente e obter um token.
    *   Clique em "Activate Tracker" para iniciar a transmissão de telemetria e ficar pronto para streaming de mídia.
    *   Permita o acesso à geolocalização, câmera, microfone e tela quando solicitado pelo navegador.

2.  **Monitorar no Dashboard:**
    *   Navegue para `http://localhost:5173/dashboard` (dev) ou `http://localhost/dashboard` (prod).
    *   Você verá o agente aparecer na lista de "Active Field Assets".
    *   Clique em um agente na lista ou no mapa para selecioná-lo.
    *   **Streaming de Mídia:** Na lista de dispositivos, clique no ícone <span style="color:#0ea5e9;">📹</span> ao lado do agente para solicitar um stream de vídeo, áudio e tela. O agente web pedirá permissão ao usuário.
    *   **Logs:** A seção "Mission Logs" exibirá eventos em tempo real.
    *   **OSINT:** Na aba de OSINT, você pode pesquisar informações sobre alvos, com resultados dinamicamente gerados para a demonstração.

### Opção 2: Agente Android (Aplicativo Nativo)

1.  **Instalar o App:**
    *   Abra o projeto `android-agent/` no Android Studio
    *   Execute no emulador ou dispositivo físico
    *   Consulte [android-agent/QUICKSTART.md](android-agent/QUICKSTART.md) para guia rápido

2.  **Configurar e Iniciar:**
    *   Configure a URL do servidor: `http://10.0.2.2:3000` (emulador) ou `http://SEU_IP:3000` (dispositivo)
    *   Registre o dispositivo com um nome (ex: "UNIT-ALPHA-01")
    *   Conceda todas as permissões solicitadas
    *   Clique em "START AGENT SERVICE"

3.  **Monitorar no Dashboard:**
    *   O dispositivo Android aparecerá na lista com tipo "ANDROID"
    *   Telemetria GPS, bateria e sensores será transmitida automaticamente
    *   Veja a localização em tempo real no mapa

**📱 Documentação Completa do Android:**
- [QUICKSTART.md](android-agent/QUICKSTART.md) - Guia de início rápido (10 min)
- [INSTALLATION.md](android-agent/INSTALLATION.md) - Instalação detalhada
- [README.md](android-agent/README.md) - Documentação técnica completa
- [ANDROID_APP_SUMMARY.md](ANDROID_APP_SUMMARY.md) - Resumo do que foi implementado
- [RUN_COMPLETE_SYSTEM.md](RUN_COMPLETE_SYSTEM.md) - Como rodar o sistema completo

## ⚠️ Considerações Importantes

*   **Aplicativo Android Nativo:** O diretório `android-agent/` contém um **aplicativo Android totalmente funcional** implementado em Kotlin. Ele está pronto para uso em desenvolvimento e testes, com telemetria completa (GPS, bateria, sensores), Socket.IO e armazenamento seguro. Funcionalidades avançadas como WebRTC para streaming de câmera/tela estão preparadas mas não implementadas nesta versão.
*   **Segurança:** A `JWT_SECRET` **DEVE** ser alterada em produção. O CORS está aberto para `*` em dev, mas `FRONTEND_URL` deve ser especificado em produção.
*   **WebRTC:** Para conectividade P2P em redes complexas (NATs, firewalls), um servidor STUN/TURN (como `coturn`) é essencial. O código atual usa o STUN público do Google.
*   **OSINT:** A funcionalidade OSINT no backend é uma **simulação dinâmica e realista** que retorna dados gerados com base na query. Ela demonstra a *interface* e a *estrutura de dados* de um sistema OSINT real, mas não se conecta a fontes de dados externas por conta de chaves de API, rate limits e considerações legais/éticas.
*   **Autenticação do Dashboard:** O dashboard auto-registra um dispositivo do tipo `MISSION_CONTROL` para simplificar a demonstração, simulando um acesso pré-configurado para o operador. Para múltiplos usuários ou gerenciamento de privilégios, um sistema de login/senha dedicado seria implementado.

## 📄 Licença
[MIT License](LICENSE) (Ou a licença de sua escolha)
