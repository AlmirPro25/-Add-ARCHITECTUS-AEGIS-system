# 🔨 Compilar APK sem Android Studio

## Opção 1: Instalar Android SDK Command Line Tools (Recomendado)

### 1. Baixar Command Line Tools

Acesse: https://developer.android.com/studio#command-line-tools-only

Ou baixe diretamente:
- Windows: https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip

### 2. Extrair e Configurar

```powershell
# Criar pasta para o SDK
mkdir C:\Android\Sdk
mkdir C:\Android\Sdk\cmdline-tools

# Extrair o ZIP baixado para:
# C:\Android\Sdk\cmdline-tools\latest\

# A estrutura deve ficar:
# C:\Android\Sdk\
#   └── cmdline-tools\
#       └── latest\
#           ├── bin\
#           ├── lib\
#           └── ...
```

### 3. Configurar Variáveis de Ambiente

```powershell
# Adicionar ao PATH (PowerShell como Admin)
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Android\Sdk\cmdline-tools\latest\bin;C:\Android\Sdk\platform-tools", "User")

# Reiniciar o terminal
```

### 4. Instalar Componentes Necessários

```powershell
# Aceitar licenças
sdkmanager --licenses

# Instalar componentes
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 5. Compilar o APK

```powershell
cd android-agent
.\gradlew.bat assembleDebug
```

O APK será gerado em:
```
app\build\outputs\apk\debug\app-debug.apk
```

---

## Opção 2: Usar GitHub Actions (Online - Sem instalar nada)

### 1. Criar arquivo de workflow

Crie: `.github/workflows/build-android.yml`

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Grant execute permission for gradlew
      run: chmod +x android-agent/gradlew
    
    - name: Build with Gradle
      run: |
        cd android-agent
        ./gradlew assembleDebug
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android-agent/app/build/outputs/apk/debug/app-debug.apk
```

### 2. Fazer commit e push

```bash
git add .
git commit -m "Add Android build workflow"
git push
```

### 3. Baixar o APK

- Vá para GitHub → Actions
- Clique no workflow "Build Android APK"
- Baixe o artifact "app-debug"

---

## Opção 3: Usar Docker (Multiplataforma)

### 1. Criar Dockerfile

Crie: `android-agent/Dockerfile.build`

```dockerfile
FROM openjdk:17-jdk-slim

# Instalar dependências
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Baixar e instalar Android SDK
ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip -q commandlinetools-linux-*_latest.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm commandlinetools-linux-*_latest.zip

ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

# Aceitar licenças e instalar componentes
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

WORKDIR /app
COPY . .

# Compilar
RUN ./gradlew assembleDebug

# O APK estará em: /app/app/build/outputs/apk/debug/app-debug.apk
```

### 2. Compilar com Docker

```bash
cd android-agent
docker build -f Dockerfile.build -t aegis-android-builder .
docker create --name aegis-build aegis-android-builder
docker cp aegis-build:/app/app/build/outputs/apk/debug/app-debug.apk ./app-debug.apk
docker rm aegis-build
```

---

## Opção 4: Usar Serviço Online (Mais Rápido)

### AppCenter (Microsoft)
1. Criar conta: https://appcenter.ms
2. Criar novo app Android
3. Conectar repositório GitHub
4. Configurar build automático
5. Baixar APK gerado

### Bitrise
1. Criar conta: https://www.bitrise.io
2. Adicionar app Android
3. Configurar workflow
4. Build automático
5. Baixar APK

---

## Opção 5: Compilar no WSL (Windows Subsystem for Linux)

### 1. Instalar WSL

```powershell
wsl --install
```

### 2. No WSL, instalar dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Java
sudo apt install openjdk-17-jdk -y

# Baixar Android SDK
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-*_latest.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest

# Configurar variáveis
echo 'export ANDROID_HOME=~/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Instalar componentes
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 3. Compilar

```bash
cd /mnt/c/Users/SEU_USUARIO/Desktop/architectus-aegis--tactical-monitor/android-agent
chmod +x gradlew
./gradlew assembleDebug
```

---

## ⚡ Solução Mais Rápida (Recomendada)

Se você quer compilar AGORA sem instalar nada:

### Use o Appetize.io (Emulador Online)

1. Acesse: https://appetize.io
2. Faça upload do código-fonte (ZIP)
3. Ele compila e roda online
4. Você pode testar sem instalar nada

### Ou use o Replit

1. Acesse: https://replit.com
2. Crie novo Repl → Import from GitHub
3. Cole o repositório
4. Configure para Android
5. Compila e gera APK online

---

## 🎯 Minha Recomendação

**Para testar rápido**: Use GitHub Actions (Opção 2)
- Não precisa instalar nada
- Compila na nuvem
- Baixa o APK pronto

**Para desenvolvimento**: Instale Command Line Tools (Opção 1)
- Mais controle
- Compila localmente
- Mais rápido após setup inicial

**Para CI/CD**: Use Docker (Opção 3)
- Reproduzível
- Funciona em qualquer lugar
- Ideal para automação

---

## 📝 Notas Importantes

### Requisitos Mínimos
- Java JDK 17 ou superior
- 8GB de espaço em disco (para SDK completo)
- Conexão com internet (primeira compilação)

### Tempo de Compilação
- Primeira vez: 5-10 minutos (baixa dependências)
- Compilações seguintes: 1-2 minutos

### Tamanho do APK
- Debug: ~15-20 MB
- Release (otimizado): ~8-12 MB

---

## 🆘 Problemas Comuns

### "ANDROID_HOME not set"
```powershell
# Configurar manualmente
$env:ANDROID_HOME = "C:\Android\Sdk"
```

### "SDK location not found"
Criar arquivo `local.properties`:
```
sdk.dir=C\:\\Android\\Sdk
```

### "Gradle build failed"
```powershell
# Limpar e tentar novamente
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

### "Java version incompatible"
```powershell
# Verificar versão do Java
java -version

# Deve ser 17 ou superior
# Baixar em: https://adoptium.net/
```

---

## ✅ Verificar Instalação

```powershell
# Verificar Java
java -version

# Verificar Gradle
cd android-agent
.\gradlew.bat --version

# Verificar Android SDK (se instalado)
sdkmanager --list
```

---

Escolha a opção que melhor se adequa à sua situação e siga os passos!
