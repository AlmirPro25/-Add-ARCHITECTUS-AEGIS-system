
# PHASE 2: EXECUTION PROTOCOL

**ATENÇÃO OPERADOR:** Você está autorizado a iniciar a FASE 2 (Codificação). Siga estas diretrizes estritas para a implementação do código.

## 1. Backend (Node.js)
- Implementar `server.ts` usando **Express** e **Socket.io**.
- O servidor deve servir os arquivos estáticos da pasta `public` (frontend build) e `uploads` (mídia de agentes).
- **WebSockets:** Criar namespaces ou salas para:
  - `mission-control`: Sala para o Dashboard (recebe dados e WebRTC signaling).
  - `field-agent`: Sala para os dispositivos (envia dados e WebRTC signaling).
- **WebRTC Signaling:** Implementar troca de SDP Offers/Answers e ICE Candidates via Socket.io entre agentes e o dashboard.
- **OSINT:** Criar um endpoint `/api/v1/osint/search` que simula a integração com fontes de dados abertas, retornando dados estruturados. A simulação deve ser dinâmica e realista, não apenas mock estático.
- **Persistência:** Utilizar SQLite (via Prisma ORM) para todos os dados, incluindo logs, telemetria e metadados de mídia.

## 2. Frontend (Dashboard & Agent)
- **Dashboard (Mission Control):**
  - Desenvolvido em **React + TypeScript** com **TailwindCSS**.
  - Exibir mapa (Leaflet.js) com a localização dos agentes.
  - Feed de logs em tempo real via Socket.io.
  - Interface para iniciar/visualizar feeds WebRTC (câmera, microfone, tela) de agentes selecionados.
  - Componente para realizar buscas OSINT.
  - Estética "Cyberpunk / Military HUD". Cores: Preto (#000), Verde Terminal (#00ff41), Vermelho Alerta (#ff003c).
  - A autenticação do Dashboard será via um token pre-existente para um "Mission Control Device", eliminando a necessidade de um login/senha para a demo, mas mantendo o contexto de um operador C2.
- **Agente (WEB_AGENT - Simulação via Browser):**
  - Implementar coleta de dados `navigator.geolocation.watchPosition()`, `navigator.mediaDevices.getUserMedia()`, `window.addEventListener('deviceorientation')` (se aplicável para Web).
  - Envio de telemetria e WebRTC streams para o backend.
  - Interface de controle simples para ativar/desativar sensores e streams.
- **Agente (ANDROID_AGENT - Esqueleto Conceitual/Blueprint):**
  - Fornecer uma estrutura conceitual (`android-agent/`) que detalhe como um aplicativo Android nativo se integraria, incluindo permissões, coleta de sensores, WebRTC e comunicação com o backend. Esta é uma implementação de *blueprint detalhado*, não um APK completo, mas removerá explicitamente a "simulação" ou "placeholder" nos comentários para as partes que são puramente conceituais, substituindo-as por guias de implementação concretas.

## 3. Segurança
- NUNCA exponha chaves privadas.
- O Agente deve solicitar permissão explícita ao usuário antes de iniciar a transmissão (Compliance Ético).
- Utilizar JWT para autenticação em endpoints REST e Handshake para WebSockets.
- Configurar CORS e Helmet no backend.

**STATUS:** ARQUITETURA APROVADA. AGUARDANDO CODIFICAÇÃO.
