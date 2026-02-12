# 📱 Guia de Instalação e Uso - Aegis Field Agent

## 🔧 Pré-requisitos

1. **Android Studio** (versão Arctic Fox ou superior)
2. **JDK 17** ou superior
3. **Dispositivo Android** ou **Emulador Android** (API 24+)
4. **Backend do sistema** rodando e acessível

## 📦 Instalação

### 1. Abrir o Projeto no Android Studio

```bash
cd architectus-aegis--tactical-monitor/android-agent
```

Abra o Android Studio e selecione "Open an Existing Project", navegue até a pasta `android-agent`.

### 2. Sincronizar Dependências

O Android Studio irá automaticamente detectar o arquivo `build.gradle` e solicitar a sincronização. Clique em "Sync Now".

Se houver problemas, execute manualmente:
- Menu: File → Sync Project with Gradle Files

### 3. Configurar o Emulador ou Dispositivo

#### Opção A: Usar Emulador Android
1. Menu: Tools → Device Manager
2. Criar um novo dispositivo virtual (AVD) com API 24 ou superior
3. Iniciar o emulador

#### Opção B: Usar Dispositivo Físico
1. Ativar "Opções do Desenvolvedor" no dispositivo
2. Ativar "Depuração USB"
3. Conectar via USB ao computador
4. Autorizar a depuração quando solicitado

### 4. Compilar e Instalar

Clique no botão "Run" (▶️) no Android Studio ou use:

```bash
./gradlew installDebug
```

## 🚀 Uso do Aplicativo

### Primeira Execução

1. **Configurar URL do Servidor**
   - Abra o aplicativo
   - No campo "C2 SERVER URL", insira o endereço do backend
   - Para emulador: `http://10.0.2.2:3000` (localhost da máquina host)
   - Para dispositivo físico: `http://SEU_IP:3000`
   - Clique em "SAVE URL"

2. **Registrar Dispositivo**
   - Insira um nome para o dispositivo (ex: "UNIT-ALPHA-01")
   - Clique em "REGISTER DEVICE"
   - Aguarde a confirmação de registro

3. **Conceder Permissões**
   - O aplicativo solicitará várias permissões:
     - Localização (precisa e aproximada)
     - Localização em segundo plano
     - Câmera
     - Microfone
     - Notificações (Android 13+)
   - Conceda todas as permissões para funcionamento completo

4. **Iniciar o Serviço**
   - Após o registro, clique em "START AGENT SERVICE"
   - Uma notificação persistente aparecerá indicando que o serviço está ativo
   - O dispositivo começará a transmitir telemetria para o backend

### Funcionalidades

#### Telemetria Transmitida
- **GPS**: Localização em tempo real (lat/lng, altitude, velocidade, precisão)
- **Bateria**: Nível e status de carregamento
- **Acelerômetro**: Dados de movimento (x, y, z)
- **Giroscópio**: Dados de rotação (x, y, z)
- **Status**: Conexão online/offline

#### Controles Disponíveis
- **START AGENT SERVICE**: Inicia a coleta e transmissão de dados
- **STOP AGENT SERVICE**: Para o serviço em segundo plano
- **CLEAR ALL DATA**: Remove todos os dados salvos e desregistra o dispositivo

## 🔍 Verificação de Funcionamento

### 1. Verificar Logs do Android
No Android Studio, abra o Logcat e filtre por "AgentService":
```
Tag: AgentService
```

Você deve ver mensagens como:
```
Socket connected! Device ID: abc123...
Started GPS updates
Registered sensor listeners
```

### 2. Verificar no Backend
No terminal do backend, você deve ver:
```
Socket Connection: <device-id> [ANDROID]
```

### 3. Verificar no Dashboard
Abra o dashboard web e verifique se o dispositivo aparece na lista de agentes conectados.

## 🐛 Solução de Problemas

### Erro de Conexão Socket.IO

**Problema**: "Socket connect error" nos logs

**Soluções**:
1. Verificar se o backend está rodando
2. Verificar se a URL está correta
3. Para emulador, usar `10.0.2.2` ao invés de `localhost`
4. Verificar firewall/antivírus

### Permissões Negadas

**Problema**: Telemetria não está sendo enviada

**Soluções**:
1. Ir em Configurações → Apps → Aegis Field Agent → Permissões
2. Conceder todas as permissões necessárias
3. Para localização em segundo plano (Android 10+), selecionar "Permitir o tempo todo"

### Serviço Para Sozinho

**Problema**: O serviço é encerrado pelo sistema

**Soluções**:
1. Desativar otimização de bateria para o app:
   - Configurações → Bateria → Otimização de bateria
   - Selecionar "Todos os apps"
   - Encontrar "Aegis Field Agent" e selecionar "Não otimizar"
2. Adicionar o app à lista de apps protegidos (varia por fabricante)

### Erro de Registro

**Problema**: "Registration failed: 500"

**Soluções**:
1. Verificar se o backend está rodando corretamente
2. Verificar logs do backend para erros
3. Verificar se o banco de dados está acessível

## 📱 Testando no Emulador

### Simular Localização GPS
1. No emulador, clique nos "..." (Extended Controls)
2. Vá para "Location"
3. Insira coordenadas manualmente ou use um arquivo GPX
4. Clique em "Send"

### Simular Movimento
1. Use o acelerômetro virtual do emulador
2. Extended Controls → Virtual Sensors
3. Mova o dispositivo virtual para gerar dados de sensores

## 🔐 Considerações de Segurança

- O token JWT é armazenado de forma criptografada usando `EncryptedSharedPreferences`
- Todas as comunicações devem usar HTTPS/WSS em produção
- O aplicativo requer permissões sensíveis - use apenas em ambientes controlados
- Nunca distribua o APK sem consentimento explícito dos usuários

## 📊 Monitoramento

### Verificar Status do Serviço
- A notificação persistente mostra o status atual:
  - "Uplink Active • Transmitting": Conectado e enviando dados
  - "Uplink Severed • Reconnecting...": Desconectado, tentando reconectar
  - "Uplink Error • Retrying...": Erro de conexão

### Dados Transmitidos
O serviço envia telemetria a cada 5 segundos:
- GPS: Quando há mudança de localização
- Bateria: A cada 5 segundos
- Sensores: A cada 5 segundos (se houver mudanças)

## 🏗️ Build de Produção

Para gerar um APK de produção:

```bash
./gradlew assembleRelease
```

O APK será gerado em:
```
app/build/outputs/apk/release/app-release-unsigned.apk
```

Para assinar o APK, você precisará de um keystore. Consulte a documentação oficial do Android.

## 📝 Notas Adicionais

- O aplicativo usa `10.0.2.2` como URL padrão, que mapeia para `localhost` da máquina host no emulador Android
- Para dispositivos físicos na mesma rede, use o IP local da máquina (ex: `192.168.1.100:3000`)
- O serviço continua rodando mesmo quando o app está em segundo plano
- Para parar completamente, use o botão "STOP AGENT SERVICE" ou force stop nas configurações do Android
