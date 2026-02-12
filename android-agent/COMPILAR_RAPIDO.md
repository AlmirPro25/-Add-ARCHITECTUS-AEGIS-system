# ⚡ Compilar APK - Guia Rápido

## 🎯 Você Tem 3 Opções Simples

---

## Opção 1: GitHub Actions (MAIS FÁCIL - Sem instalar nada!)

### Passo 1: Criar arquivo de workflow

Crie o arquivo: `.github/workflows/build-apk.yml`

```yaml
name: Build APK

on:
  push:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup JDK
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Build APK
      run: |
        cd android-agent
        chmod +x gradlew
        ./gradlew assembleDebug
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug-apk
        path: android-agent/app/build/outputs/apk/debug/app-debug.apk
```

### Passo 2: Fazer commit

```bash
git add .
git commit -m "Add build workflow"
git push
```

### Passo 3: Baixar APK

1. Vá para GitHub → Actions
2. Clique no workflow que rodou
3. Baixe o artifact "app-debug-apk"
4. Extraia o ZIP
5. Instale o APK no Android

**Tempo**: 5-10 minutos (primeira vez)

---

## Opção 2: Instalar Java + Android SDK (Para compilar localmente)

### Passo 1: Instalar Java 17

**Usando winget (Windows 10/11)**:
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```

**Ou baixar manualmente**:
- https://adoptium.net/temurin/releases/?version=17
- Baixe o instalador Windows x64
- Execute e instale
- Reinicie o terminal

### Passo 2: Baixar Android Command Line Tools

1. Acesse: https://developer.android.com/studio#command-line-tools-only
2. Baixe: "Command line tools only" para Windows
3. Extraia para: `C:\Android\Sdk\cmdline-tools\latest\`

### Passo 3: Configurar Variáveis de Ambiente

```powershell
# PowerShell como Administrador
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")
$path = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$path;C:\Android\Sdk\cmdline-tools\latest\bin;C:\Android\Sdk\platform-tools", "User")
```

Reinicie o terminal!

### Passo 4: Instalar Componentes Android

```powershell
# Aceitar licenças
sdkmanager --licenses

# Instalar componentes necessários
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Passo 5: Compilar

```powershell
cd android-agent
.\gradlew.bat assembleDebug
```

APK gerado em: `app\build\outputs\apk\debug\app-debug.apk`

**Tempo**: 30-40 minutos (setup) + 5 minutos (compilação)

---

## Opção 3: Android Studio (MAIS COMPLETO)

### Passo 1: Baixar Android Studio

https://developer.android.com/studio

### Passo 2: Instalar

- Execute o instalador
- Aceite as configurações padrão
- Aguarde download dos componentes (~3GB)

### Passo 3: Abrir Projeto

1. File → Open
2. Selecione a pasta `android-agent`
3. Aguarde sync do Gradle (5-10 min primeira vez)

### Passo 4: Compilar

- Build → Build Bundle(s) / APK(s) → Build APK(s)
- Aguarde a compilação
- Clique em "locate" quando terminar

**Tempo**: 1-2 horas (instalação) + 5 minutos (compilação)

---

## 🎯 Qual Escolher?

| Opção | Tempo | Dificuldade | Quando Usar |
|-------|-------|-------------|-------------|
| GitHub Actions | 10 min | ⭐ Fácil | Compilar uma vez, sem instalar nada |
| Command Line | 40 min | ⭐⭐ Médio | Desenvolvimento contínuo |
| Android Studio | 2h | ⭐⭐⭐ Fácil | Desenvolvimento profissional |

**Minha recomendação**: 
- **Testar agora**: Use GitHub Actions (Opção 1)
- **Desenvolver**: Use Android Studio (Opção 3)

---

## 📱 Instalar o APK no Android

### No Emulador (Android Studio)
```bash
adb install app-debug.apk
```

### No Dispositivo Físico

**Via USB**:
1. Conecte o dispositivo via USB
2. Ative "Depuração USB" nas Opções do Desenvolvedor
3. Execute: `adb install app-debug.apk`

**Manualmente**:
1. Copie o APK para o dispositivo (email, Drive, etc)
2. Abra o arquivo no Android
3. Permita "Instalar de fontes desconhecidas"
4. Instale

---

## 🆘 Problemas?

### "Java não encontrado"
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
# Reinicie o terminal
```

### "ANDROID_HOME not set"
Use a Opção 1 (GitHub Actions) - não precisa de SDK local

### "Gradle build failed"
```powershell
cd android-agent
.\gradlew.bat clean
.\gradlew.bat assembleDebug --stacktrace
```

### "Sem espaço em disco"
- Android SDK precisa de ~8GB
- Use GitHub Actions se não tiver espaço

---

## ✅ Verificar se Funcionou

Após instalar o APK:

1. Abra o app "Aegis Field Agent"
2. Configure:
   - URL: `http://SEU_IP:3000`
   - Nome: `ANDROID-01`
3. Clique em "REGISTER DEVICE"
4. Conceda permissões
5. Clique em "START AGENT SERVICE"
6. Veja no dashboard: dispositivo online!

---

**Recomendação Final**: Use GitHub Actions (Opção 1) para compilar agora sem instalar nada. É a forma mais rápida!
