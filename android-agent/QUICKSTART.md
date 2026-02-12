# ⚡ Guia de Início Rápido - Aegis Field Agent

## 🎯 Objetivo
Colocar o aplicativo Android rodando em menos de 10 minutos.

## 📋 Pré-requisitos
- ✅ Android Studio instalado
- ✅ Backend rodando (veja instruções abaixo)
- ✅ Emulador Android ou dispositivo físico

## 🚀 Passo a Passo

### 1️⃣ Iniciar o Backend (Terminal 1)

```bash
cd architectus-aegis--tactical-monitor/backend
npm install
npm run dev
```

Aguarde até ver: `✓ Server running on port 3000`

### 2️⃣ Abrir o Projeto Android

1. Abra o Android Studio
2. File → Open
3. Navegue até `architectus-aegis--tactical-monitor/android-agent`
4. Clique em "OK"
5. Aguarde a sincronização do Gradle (pode levar alguns minutos na primeira vez)

### 3️⃣ Configurar Emulador

Se você não tem um emulador configurado:

1. Tools → Device Manager
2. Clique em "Create Device"
3. Selecione "Pixel 5" (ou qualquer dispositivo)
4. Selecione "API 34" (ou a versão mais recente disponível)
5. Clique em "Finish"
6. Inicie o emulador clicando no ▶️

### 4️⃣ Executar o App

1. Certifique-se de que o emulador está rodando
2. No Android Studio, clique no botão verde ▶️ "Run"
3. Aguarde a instalação e inicialização do app

### 5️⃣ Configurar o App

No aplicativo que abriu no emulador:

1. **URL do Servidor**: Deixe como está (`http://10.0.2.2:3000`)
   - Este endereço especial mapeia para localhost da sua máquina
2. Clique em "SAVE URL"
3. **Nome do Dispositivo**: Digite algo como `EMULATOR-01`
4. Clique em "REGISTER DEVICE"
5. Aguarde a confirmação "Device registered successfully!"

### 6️⃣ Conceder Permissões

O Android vai solicitar várias permissões. Clique em "Allow" para todas:
- ✅ Location (Localização)
- ✅ Camera (Câmera)
- ✅ Microphone (Microfone)
- ✅ Notifications (Notificações) - se Android 13+

### 7️⃣ Iniciar o Serviço

1. Clique em "START AGENT SERVICE"
2. Você verá uma notificação persistente: "Aegis Field Agent - Uplink Active • Transmitting"
3. ✅ Pronto! O agente está transmitindo dados!

## 🔍 Verificar se Está Funcionando

### No Android Studio (Logcat)

1. Abra a aba "Logcat" (parte inferior)
2. No filtro, digite: `AgentService`
3. Você deve ver mensagens como:
```
Socket connected! Device ID: abc123...
Started GPS updates
Registered sensor listeners
```

### No Terminal do Backend

Você deve ver:
```
Socket Connection: <device-id> [ANDROID]
Telemetry received: GPS
Telemetry received: BATTERY
```

### Simular Localização GPS

1. No emulador, clique nos "..." (Extended Controls)
2. Vá para "Location"
3. Insira coordenadas (ex: Lat: -23.5505, Lng: -46.6333 para São Paulo)
4. Clique em "Send"
5. Verifique no backend que a telemetria GPS foi recebida

## 🎉 Sucesso!

Se você viu as mensagens acima, o sistema está funcionando perfeitamente!

## 🐛 Problemas Comuns

### "Socket connect error"
- ✅ Verifique se o backend está rodando
- ✅ Use `http://10.0.2.2:3000` no emulador (não `localhost`)

### "Registration failed: 500"
- ✅ Verifique se o banco de dados está configurado
- ✅ Execute `npm run prisma:push` no backend

### Permissões negadas
- ✅ Vá em Settings → Apps → Aegis Field Agent → Permissions
- ✅ Conceda todas as permissões manualmente

### Serviço para sozinho
- ✅ Settings → Battery → Battery optimization
- ✅ Encontre "Aegis Field Agent" e selecione "Don't optimize"

## 📱 Próximos Passos

1. Abra o Dashboard web em `http://localhost:5173`
2. Veja o dispositivo aparecer na lista
3. Monitore a telemetria em tempo real
4. Experimente parar e iniciar o serviço

## 💡 Dicas

- O serviço continua rodando mesmo se você fechar o app
- Para parar completamente, use "STOP AGENT SERVICE"
- A notificação mostra o status da conexão em tempo real
- Dados são enviados a cada 5 segundos

## 🆘 Precisa de Ajuda?

Consulte o [INSTALLATION.md](./INSTALLATION.md) para informações mais detalhadas.
