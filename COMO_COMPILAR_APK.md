# 📱 Como Compilar o APK Android

## 🚀 Opção Mais Rápida: GitHub Actions (SEM INSTALAR NADA!)

### ✅ Vantagens
- Não precisa instalar Java, Android SDK ou Android Studio
- Compila na nuvem do GitHub (grátis)
- Baixa o APK pronto em 5-10 minutos

### 📝 Passos

#### 1. Fazer commit do código (se ainda não fez)

```bash
git add .
git commit -m "Add Android app"
git push
```

#### 2. Aguardar a compilação

- Vá para o repositório no GitHub
- Clique na aba "Actions"
- Veja o workflow "Build Android APK" rodando
- Aguarde ~5-10 minutos

#### 3. Baixar o APK

- Quando o workflow terminar (✅ verde)
- Clique no workflow
- Na seção "Artifacts", clique em "aegis-field-agent-debug"
- Baixe o ZIP
- Extraia o arquivo `app-debug.apk`

#### 4. Instalar no Android

**Opção A: Via USB (com ADB)**
```bash
adb install app-debug.apk
```

**Opção B: Manualmente**
- Envie o APK para o dispositivo (email, Drive, WhatsApp)
- Abra o arquivo no Android
- Permita "Instalar de fontes desconhecidas"
- Instale

---

## 💻 Opção Local: Compilar no seu PC

### Pré-requisitos

1. **Java JDK 17**
   ```powershell
   # Instalar via winget
   winget install EclipseAdoptium.Temurin.17.JDK
   
   # Ou baixar de: https://adoptium.net/temurin/releases/?version=17
   ```

2. **Android SDK Command Line Tools**
   - Baixar: https://developer.android.com/studio#command-line-tools-only
   - Extrair para: `C:\Android\Sdk\cmdline-tools\latest\`

3. **Configurar Variáveis de Ambiente**
   ```powershell
   # PowerShell como Admin
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")
   $path = [Environment]::GetEnvironmentVariable("Path", "User")
   [Environment]::SetEnvironmentVariable("Path", "$path;C:\Android\Sdk\cmdline-tools\latest\bin", "User")
   ```
   
   Reinicie o terminal!

4. **Instalar Componentes Android**
   ```powershell
   sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

### Compilar

```powershell
cd android-agent
.\gradlew.bat assembleDebug
```

APK gerado em: `app\build\outputs\apk\debug\app-debug.apk`

---

## 🎨 Opção Completa: Android Studio

### 1. Baixar e Instalar

https://developer.android.com/studio

### 2. Abrir Projeto

- File → Open
- Selecione: `android-agent`
- Aguarde sync do Gradle

### 3. Compilar

- Build → Build Bundle(s) / APK(s) → Build APK(s)
- Ou clique no botão Run ▶️

---

## 📊 Comparação das Opções

| Método | Tempo Setup | Tempo Build | Espaço Disco | Dificuldade |
|--------|-------------|-------------|--------------|-------------|
| **GitHub Actions** | 0 min | 5-10 min | 0 MB | ⭐ Fácil |
| **Command Line** | 30-40 min | 2-5 min | ~3 GB | ⭐⭐ Médio |
| **Android Studio** | 1-2 horas | 2-5 min | ~8 GB | ⭐ Fácil |

---

## 🎯 Minha Recomendação

### Para Testar Agora
✅ **Use GitHub Actions** - Mais rápido, sem instalar nada

### Para Desenvolvimento Contínuo
✅ **Use Android Studio** - Melhor experiência, debugging, etc

### Para CI/CD
✅ **Use GitHub Actions** - Automático a cada commit

---

## 📱 Após Compilar

### 1. Instalar o APK

**No Emulador**:
```bash
adb install app-debug.apk
```

**No Dispositivo**:
- Ative "Depuração USB" nas Opções do Desenvolvedor
- Conecte via USB
- Execute: `adb install app-debug.apk`

### 2. Configurar o App

1. Abra "Aegis Field Agent"
2. Configure:
   - **URL do Servidor**: 
     - Emulador: `http://10.0.2.2:3000`
     - Dispositivo: `http://SEU_IP_LOCAL:3000`
   - **Nome**: `ANDROID-01`
3. Clique em "REGISTER DEVICE"
4. Conceda todas as permissões
5. Clique em "START AGENT SERVICE"

### 3. Verificar no Dashboard

- Abra: http://localhost:5173/dashboard
- O dispositivo deve aparecer online
- Veja a localização no mapa
- Telemetria em tempo real

---

## 🆘 Problemas Comuns

### "Java não encontrado"
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```
Reinicie o terminal!

### "ANDROID_HOME not set"
Use GitHub Actions - não precisa configurar nada

### "Gradle build failed"
```powershell
cd android-agent
.\gradlew.bat clean
.\gradlew.bat assembleDebug --stacktrace
```

### "APK não instala"
- Ative "Instalar de fontes desconhecidas"
- Settings → Security → Unknown sources

### "App não conecta ao backend"
- **Emulador**: Use `http://10.0.2.2:3000`
- **Dispositivo**: Use o IP da sua máquina (ex: `http://192.168.1.100:3000`)
- Verifique se o backend está rodando

---

## ✅ Checklist de Sucesso

- [ ] APK compilado
- [ ] APK instalado no Android
- [ ] App aberto e configurado
- [ ] Dispositivo registrado
- [ ] Serviço iniciado
- [ ] Permissões concedidas
- [ ] Dispositivo aparece no dashboard
- [ ] Telemetria sendo recebida

---

## 📚 Documentação Adicional

- `COMPILAR_RAPIDO.md` - Guia resumido
- `COMPILAR_SEM_ANDROID_STUDIO.md` - Todas as opções detalhadas
- `SETUP_E_COMPILAR.bat` - Script automatizado
- `QUICKSTART.md` - Guia de uso do app

---

**Recomendação**: Comece com GitHub Actions. É a forma mais rápida de ter o APK pronto sem instalar nada!

Se você já fez commit do código, o workflow já deve estar rodando. Vá para GitHub → Actions e veja!
