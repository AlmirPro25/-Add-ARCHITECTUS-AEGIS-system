# 🚀 Como Rodar o Sistema Completo ARCHITECTUS AEGIS

## 📋 Visão Geral

Este guia mostra como iniciar todos os componentes do sistema:
1. Backend (Node.js + Socket.IO)
2. Frontend Dashboard (React + Vite)
3. Android Agent (Aplicativo móvel)

## ⚡ Início Rápido (3 Terminais)

### Terminal 1: Backend

```bash
cd architectus-aegis--tactical-monitor/backend

# Primeira vez: instalar dependências
npm install

# Configurar banco de dados (primeira vez)
npm run prisma:push

# Iniciar servidor
npm run dev
```

**Aguarde ver**: `✓ Server running on port 3000`

### Terminal 2: Frontend Dashboard

```bash
cd architectus-aegis--tactical-monitor/frontend

# Primeira vez: instalar dependências
npm install

# Iniciar dashboard
npm run dev
```

**Aguarde ver**: `Local: http://localhost:5173/`

### Terminal 3: Android Agent

1. Abra o Android Studio
2. File → Open → `architectus-aegis--tactical-monitor/android-agent`
3. Aguarde sync do Gradle
4. Inicie um emulador (Tools → Device Manager)
5. Clique em Run ▶️

**No app**:
- URL: `http://10.0.2.2:3000`
- Nome: `EMULATOR-01`
- Clique em "REGISTER DEVICE"
- Conceda permissões
- Clique em "START AGENT SERVICE"

## 🎯 Verificação do Sistema

### 1. Backend Funcionando ✅

**Terminal do Backend deve mostrar**:
```
✓ Server running on port 3000
✓ Socket.IO initialized
✓ Database connected
```

**Teste manual**:
```bash
curl http://localhost:3000/api/v1/auth/register-device \
  -H "Content-Type: application/json" \
  -d '{"deviceName":"TEST-DEVICE","deviceType":"GENERIC"}'
```

### 2. Frontend Funcionando ✅

**Abra no navegador**: http://localhost:5173

Você deve ver:
- Dashboard com tema dark tático
- Mapa (pode estar vazio inicialmente)
- Lista de dispositivos (vazia até registrar um agente)

### 3. Android Agent Funcionando ✅

**No Logcat do Android Studio**:
```
AgentService: Socket connected! Device ID: abc123...
AgentService: Started GPS updates
AgentService: Registered sensor listeners
```

**No Terminal do Backend**:
```
Socket Connection: <device-id> [ANDROID]
Telemetry received: GPS
Telemetry received: BATTERY
```

**No Dashboard Web**:
- O dispositivo deve aparecer na lista
- Status: Online (verde)
- Localização deve aparecer no mapa

## 🔄 Fluxo Completo de Dados

```
┌─────────────────┐
│  Android Agent  │
│   (Emulador)    │
└────────┬────────┘
         │ Socket.IO
         │ (telemetry events)
         ▼
┌─────────────────┐
│  Backend API    │
│  (Port 3000)    │
└────────┬────────┘
         │ Socket.IO
         │ (telemetry_update events)
         ▼
┌─────────────────┐
│ Frontend Dash   │
│  (Port 5173)    │
└─────────────────┘
```

## 🧪 Testando o Sistema

### Teste 1: Registro de Dispositivo

1. No Android app, registre um dispositivo
2. Verifique no backend: `Socket Connection: <id> [ANDROID]`
3. Verifique no dashboard: dispositivo aparece na lista

### Teste 2: Telemetria GPS

1. No emulador, abra Extended Controls (...)
2. Vá para "Location"
3. Insira coordenadas (ex: -23.5505, -46.6333)
4. Clique em "Send"
5. Verifique no backend: `Telemetry received: GPS`
6. Verifique no dashboard: marcador aparece no mapa

### Teste 3: Telemetria de Bateria

1. Aguarde 5 segundos
2. Verifique no backend: `Telemetry received: BATTERY`
3. No dashboard, veja o nível de bateria do dispositivo

### Teste 4: Reconexão Automática

1. Pare o backend (Ctrl+C)
2. No Android, veja notificação: "Uplink Severed • Reconnecting..."
3. Reinicie o backend
4. Aguarde alguns segundos
5. Veja notificação: "Uplink Active • Transmitting"

## 🐛 Solução de Problemas

### Backend não inicia

**Erro**: `Error: Cannot find module`
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Erro**: `Prisma Client not generated`
```bash
npm run prisma:generate
npm run prisma:push
```

### Frontend não carrega

**Erro**: `EADDRINUSE: address already in use`
```bash
# Porta 5173 já está em uso
lsof -ti:5173 | xargs kill -9  # Mac/Linux
# Ou mude a porta em vite.config.ts
```

**Erro**: Página em branco
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Android não conecta

**Erro**: "Socket connect error"
- ✅ Use `http://10.0.2.2:3000` no emulador (não localhost)
- ✅ Verifique se o backend está rodando
- ✅ Verifique firewall/antivírus

**Erro**: "Registration failed: 500"
- ✅ Verifique logs do backend
- ✅ Execute `npm run prisma:push` no backend

**Erro**: Permissões negadas
- ✅ Settings → Apps → Aegis Field Agent → Permissions
- ✅ Conceda todas as permissões

### GPS não funciona no emulador

1. Extended Controls (...) → Location
2. Insira coordenadas manualmente
3. Clique em "Send"
4. Ou use um arquivo GPX para simular movimento

## 📊 Monitoramento

### Logs do Backend
```bash
cd backend
npm run dev
# Veja logs em tempo real
```

### Logs do Android
1. Android Studio → Logcat
2. Filtro: `AgentService`
3. Veja eventos de conexão e telemetria

### Dashboard Web
- Abra http://localhost:5173
- Veja dispositivos em tempo real
- Monitore telemetria no console do navegador (F12)

## 🎮 Comandos Úteis

### Backend
```bash
npm run dev          # Modo desenvolvimento
npm run build        # Compilar TypeScript
npm start            # Produção
npm run prisma:push  # Atualizar banco de dados
```

### Frontend
```bash
npm run dev          # Modo desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
```

### Android
```bash
./gradlew assembleDebug        # Build APK debug
./gradlew installDebug         # Instalar no dispositivo
./gradlew clean                # Limpar build
```

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 🎉 Sistema Completo Rodando!

Quando tudo estiver funcionando, você verá:

✅ **Backend**: Logs de conexões e telemetria
✅ **Frontend**: Dashboard com dispositivos online
✅ **Android**: Notificação "Uplink Active • Transmitting"

O sistema ARCHITECTUS AEGIS está operacional! 🚀

## 📚 Próximos Passos

1. Explore o dashboard web
2. Teste diferentes tipos de telemetria
3. Simule movimento GPS no emulador
4. Adicione mais dispositivos
5. Monitore logs em tempo real

## 🆘 Precisa de Ajuda?

- Backend: Veja `backend/README.md`
- Frontend: Veja `frontend/README.md`
- Android: Veja `android-agent/INSTALLATION.md`
- Guia rápido Android: `android-agent/QUICKSTART.md`
