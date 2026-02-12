# ARCHITECTUS AEGIS - Sistema de Monitoramento Tático em Tempo Real

## 📋 O Que É Este Sistema?

O ARCHITECTUS AEGIS é um sistema completo de monitoramento e rastreamento de dispositivos móveis em tempo real, desenvolvido com foco em segurança e telemetria avançada. Pense nele como um "centro de comando" que monitora agentes em campo.

## 🎯 Funcionalidades Principais

### 1. Rastreamento GPS em Tempo Real
- Localização precisa de dispositivos Android
- Visualização em mapa interativo (Leaflet)
- Atualização automática a cada 5 segundos
- Histórico de movimentação

### 2. Telemetria Completa do Dispositivo
- **Bateria**: Nível, temperatura, status de carregamento
- **Localização**: Latitude, longitude, altitude, velocidade
- **Sensores**: Acelerômetro (X, Y, Z) e Giroscópio (X, Y, Z)
- **Conectividade**: Status de rede e conexão
- **Timestamp**: Data/hora de cada atualização

### 3. Comunicação em Tempo Real
- WebSocket (Socket.IO) para comunicação bidirecional
- Notificações instantâneas de eventos
- Status online/offline dos dispositivos
- Latência mínima (< 100ms)

### 4. OSINT (Open Source Intelligence)
- Busca de informações públicas sobre alvos
- Integração com APIs de inteligência
- Análise de dados abertos
- Relatórios de exposição

### 5. Dashboard Web Tático
- Interface militar/tática estilizada
- Visualização de múltiplos dispositivos
- Gráficos e métricas em tempo real
- Logs de missão e eventos

### 6. App Android Nativo
- Serviço em segundo plano (Foreground Service)
- Coleta automática de telemetria
- Notificação persistente
- Baixo consumo de bateria
- Criptografia de dados

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    ARCHITECTUS AEGIS                     │
└─────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   ANDROID    │◄───────►│   BACKEND    │◄───────►│   FRONTEND   │
│     APP      │ Socket  │   Node.js    │  HTTP   │   React +    │
│   (Kotlin)   │  .IO    │  + Prisma    │  WS     │    Vite      │
└──────────────┘         └──────────────┘         └──────────────┘
      │                         │                         │
      │                         │                         │
      ▼                         ▼                         ▼
  Sensores                  SQLite DB              Leaflet Map
  GPS, Bateria              Dispositivos           Dashboard UI
  Acelerômetro              Telemetria             OSINT Panel
  Giroscópio                Logs                   Device List
```

## 🔧 Tecnologias Utilizadas

### Backend (Node.js + TypeScript)
- **Express**: Framework web
- **Socket.IO**: WebSocket em tempo real
- **Prisma**: ORM para banco de dados
- **SQLite**: Banco de dados leve
- **JWT**: Autenticação de dispositivos
- **Zod**: Validação de dados

### Frontend (React + TypeScript)
- **React 18**: Framework UI
- **Vite**: Build tool rápido
- **Leaflet**: Mapas interativos
- **Socket.IO Client**: Comunicação real-time
- **TailwindCSS**: Estilização
- **Recharts**: Gráficos

### Android (Kotlin)
- **Kotlin**: Linguagem nativa
- **Foreground Service**: Serviço persistente
- **Socket.IO Android**: Cliente WebSocket
- **Location Services**: GPS
- **Sensor Manager**: Acelerômetro/Giroscópio
- **Battery Manager**: Monitoramento de bateria
- **SharedPreferences**: Armazenamento local criptografado

## 📱 Como Funciona o Fluxo de Dados

### 1. Registro do Dispositivo
```
Android App → Backend (POST /api/devices/register)
Backend → Gera device_id único
Backend → Salva no banco de dados
Backend → Retorna device_id para o app
App → Armazena device_id localmente
```

### 2. Conexão WebSocket
```
Android App → Conecta via Socket.IO
Backend → Autentica device_id
Backend → Adiciona à sala do dispositivo
Frontend → Recebe notificação de novo dispositivo
```

### 3. Envio de Telemetria
```
Android App (a cada 5s):
  ├─ Coleta GPS (latitude, longitude, altitude, velocidade)
  ├─ Coleta Bateria (nível, temperatura, status)
  ├─ Coleta Sensores (acelerômetro, giroscópio)
  └─ Envia via Socket.IO → Backend

Backend:
  ├─ Valida dados
  ├─ Salva no banco de dados
  └─ Broadcast para Frontend

Frontend:
  ├─ Recebe telemetria
  ├─ Atualiza mapa (marcador GPS)
  ├─ Atualiza painel de telemetria
  └─ Atualiza gráficos
```

## 🎨 Interface do Sistema

### Dashboard Web
```
┌─────────────────────────────────────────────────────────┐
│  ARCHITECTUS AEGIS - TACTICAL MONITOR                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │   DEVICES    │  │   TACTICAL MAP  │  │ TELEMETRY  │ │
│  │              │  │                 │  │            │ │
│  │ • ANDROID-01 │  │   [MAPA GPS]    │  │ Battery:   │ │
│  │   ONLINE     │  │                 │  │   85%      │ │
│  │   85% 🔋     │  │   📍 Marcador   │  │            │ │
│  │              │  │                 │  │ Speed:     │ │
│  │ • ANDROID-02 │  │                 │  │   12 km/h  │ │
│  │   OFFLINE    │  │                 │  │            │ │
│  │              │  │                 │  │ Altitude:  │ │
│  └──────────────┘  └─────────────────┘  │   150m     │ │
│                                          └────────────┘ │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MISSION LOGS / OSINT SEARCH                     │  │
│  │  [2025-02-12 17:38] Device ANDROID-01 connected  │  │
│  │  [2025-02-12 17:39] Telemetry received           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### App Android
```
┌─────────────────────────────┐
│  AEGIS FIELD AGENT          │
├─────────────────────────────┤
│                             │
│  Server URL:                │
│  ┌─────────────────────┐   │
│  │ http://10.0.2.2:3000│   │
│  └─────────────────────┘   │
│                             │
│  Device Name:               │
│  ┌─────────────────────┐   │
│  │ ANDROID-01          │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  REGISTER DEVICE    │   │
│  └─────────────────────┘   │
│                             │
│  Status: AUTHENTICATED ✓    │
│                             │
│  ┌─────────────────────┐   │
│  │ START AGENT SERVICE │   │
│  └─────────────────────┘   │
│                             │
│  🔋 Battery: 85%            │
│  📍 GPS: Active             │
│  📡 Connected               │
│                             │
└─────────────────────────────┘
```

## 🔐 Segurança

### Autenticação
- JWT tokens para dispositivos
- Device ID único e criptografado
- Validação de origem das requisições

### Criptografia
- Dados sensíveis criptografados no app
- HTTPS/WSS em produção
- Tokens com expiração

### Permissões Android
- Localização (GPS)
- Executar em segundo plano
- Ignorar otimização de bateria
- Acesso a sensores

## 📊 Casos de Uso

### 1. Rastreamento de Frota
- Monitorar veículos em tempo real
- Otimizar rotas
- Alertas de desvio de rota

### 2. Segurança Pessoal
- Rastreamento de familiares
- Botão de pânico
- Histórico de localização

### 3. Logística
- Rastreamento de entregas
- Monitoramento de entregadores
- Métricas de performance

### 4. Pesquisa de Campo
- Coleta de dados geográficos
- Monitoramento ambiental
- Estudos de mobilidade

### 5. Operações Táticas
- Coordenação de equipes
- Monitoramento de agentes
- Inteligência em tempo real

## 📈 Métricas e Performance

### Latência
- WebSocket: < 100ms
- GPS Update: 5 segundos
- Telemetria: Tempo real

### Consumo de Bateria
- Serviço otimizado
- GPS em modo balanceado
- Sensores com throttling

### Escalabilidade
- Suporta múltiplos dispositivos
- WebSocket com rooms
- Banco de dados otimizado

## 🚀 Diferenciais

1. **Tempo Real**: Telemetria instantânea via WebSocket
2. **Completo**: Backend + Frontend + Android nativo
3. **Moderno**: Stack tecnológico atual (2025)
4. **Seguro**: Autenticação e criptografia
5. **Escalável**: Arquitetura preparada para crescimento
6. **Open Source**: Código disponível no GitHub
7. **CI/CD**: GitHub Actions para build automático
8. **Documentação**: Completa e em português

## 🎓 Aprendizados Técnicos

Este projeto demonstra conhecimento em:

- **Full Stack Development**: Backend, Frontend e Mobile
- **Real-Time Systems**: WebSocket, Socket.IO
- **Mobile Development**: Android nativo em Kotlin
- **DevOps**: Docker, GitHub Actions, CI/CD
- **Database**: Prisma ORM, SQLite
- **TypeScript**: Tipagem forte em todo o projeto
- **React**: Hooks, Context, State Management
- **APIs RESTful**: Design e implementação
- **Geolocalização**: GPS, mapas, coordenadas
- **Sensores**: Acelerômetro, giroscópio, bateria

## 📦 Estrutura do Projeto

```
architectus-aegis--tactical-monitor/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── services/          # Serviços
│   │   ├── middleware/        # Autenticação, validação
│   │   ├── models/            # Schemas Prisma
│   │   └── routes/            # Rotas da API
│   ├── prisma/                # Banco de dados
│   └── package.json
│
├── frontend/                   # Dashboard React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API client
│   └── package.json
│
├── android-agent/              # App Android
│   ├── app/
│   │   └── src/main/
│   │       ├── java/          # Código Kotlin
│   │       └── res/           # Recursos (layouts, etc)
│   └── build.gradle
│
├── .github/
│   └── workflows/             # GitHub Actions
│       └── build-android-apk.yml
│
└── docker/                     # Dockerfiles (opcional)
```

## 🔄 Fluxo de Desenvolvimento

1. **Backend**: API REST + WebSocket
2. **Frontend**: Dashboard com mapa e telemetria
3. **Android**: App nativo com serviço em background
4. **Integração**: Conectar todos os componentes
5. **Testes**: Validar funcionamento end-to-end
6. **Deploy**: GitHub Actions para build automático

## 💡 Possíveis Expansões

### Curto Prazo
- [ ] Notificações push
- [ ] Geofencing (alertas de área)
- [ ] Histórico de rotas
- [ ] Exportação de dados (CSV, JSON)

### Médio Prazo
- [ ] App iOS (Swift)
- [ ] Análise preditiva (ML)
- [ ] Integração com mais APIs OSINT
- [ ] Dashboard mobile responsivo

### Longo Prazo
- [ ] Reconhecimento facial (WebRTC)
- [ ] Análise de comportamento
- [ ] Integração com drones
- [ ] Sistema de alertas inteligentes

## 📝 Resumo Executivo

O ARCHITECTUS AEGIS é um sistema profissional de monitoramento tático que combina:

- ✅ **Backend robusto** em Node.js com WebSocket
- ✅ **Frontend moderno** em React com mapas interativos
- ✅ **App Android nativo** em Kotlin com telemetria completa
- ✅ **Comunicação em tempo real** via Socket.IO
- ✅ **Banco de dados** SQLite com Prisma ORM
- ✅ **CI/CD** automatizado com GitHub Actions
- ✅ **Documentação completa** em português
- ✅ **Código limpo** e bem estruturado

**Total**: ~3000 linhas de código, 3 aplicações integradas, 1 sistema completo.

---

## 🔗 Links Importantes

- **Repositório**: https://github.com/AlmirPro25/-Add-ARCHITECTUS-AEGIS-system
- **GitHub Actions**: https://github.com/AlmirPro25/-Add-ARCHITECTUS-AEGIS-system/actions
- **Dashboard Local**: http://localhost:5173/dashboard
- **Backend Local**: http://localhost:3000

---

**Desenvolvido com foco em qualidade, segurança e performance.** 🚀
