# 🚀 Como Fazer Push para GitHub e Compilar o APK

## ✅ Status Atual

O repositório Git foi inicializado e os arquivos estão sendo adicionados.

## 📝 Passos para Compilar o APK via GitHub Actions

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `architectus-aegis-tactical-monitor` (ou outro nome)
3. Deixe como **Public** (para usar GitHub Actions grátis)
4. **NÃO** marque "Initialize with README"
5. Clique em "Create repository"

### 2. Copiar a URL do Repositório

Após criar, você verá uma URL como:
```
https://github.com/SEU_USUARIO/architectus-aegis-tactical-monitor.git
```

Copie essa URL!

### 3. Executar Comandos no Terminal

Abra o PowerShell na pasta do projeto e execute:

```powershell
# Navegar para a pasta do projeto
cd "C:\Users\almir\Desktop\architectus-aegis--tactical-monitor (1)\architectus-aegis--tactical-monitor"

# Se o commit ainda não foi feito, fazer agora
git add -A
git commit -m "Add ARCHITECTUS AEGIS system with Android app"

# Adicionar o remote (substitua pela SUA URL)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

### 4. Aguardar Compilação

1. Vá para o repositório no GitHub
2. Clique na aba **"Actions"**
3. Você verá o workflow **"Build Android APK"** rodando
4. Aguarde 5-10 minutos
5. Quando terminar (✅ verde), clique no workflow
6. Na seção **"Artifacts"**, clique em **"aegis-field-agent-debug"**
7. Baixe o ZIP
8. Extraia o arquivo `app-debug.apk`

### 5. Instalar o APK no Android

**Via USB (com ADB)**:
```bash
adb install app-debug.apk
```

**Manualmente**:
- Envie o APK para o dispositivo
- Abra o arquivo no Android
- Permita "Instalar de fontes desconhecidas"
- Instale

---

## 🔧 Comandos Completos (Copie e Cole)

```powershell
# 1. Navegar para o projeto
cd "C:\Users\almir\Desktop\architectus-aegis--tactical-monitor (1)\architectus-aegis--tactical-monitor"

# 2. Verificar status
git status

# 3. Se necessário, fazer commit
git add -A
git commit -m "Add ARCHITECTUS AEGIS system"

# 4. Adicionar remote (SUBSTITUA A URL!)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git

# 5. Renomear branch
git branch -M main

# 6. Push
git push -u origin main
```

---

## 🆘 Problemas Comuns

### "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
```

### "failed to push some refs"
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### "Authentication failed"
- Use um Personal Access Token ao invés de senha
- GitHub → Settings → Developer settings → Personal access tokens
- Gere um token com permissão "repo"
- Use o token como senha

---

## ⚡ Alternativa: GitHub Desktop

Se preferir interface gráfica:

1. Baixe: https://desktop.github.com/
2. Instale e faça login
3. File → Add Local Repository
4. Selecione a pasta do projeto
5. Clique em "Publish repository"
6. Aguarde o push
7. Vá para GitHub → Actions

---

## 📊 O Que Acontece Após o Push

1. **GitHub Actions detecta o push**
2. **Inicia o workflow "Build Android APK"**
3. **Instala Java e Android SDK na nuvem**
4. **Compila o APK**
5. **Disponibiliza o APK para download**

**Tempo total**: 5-10 minutos

---

## ✅ Verificar se Funcionou

1. Vá para: https://github.com/SEU_USUARIO/SEU_REPO
2. Clique em "Actions"
3. Veja o workflow rodando (🟡 amarelo) ou concluído (✅ verde)
4. Se verde, baixe o artifact

---

## 🎉 Depois de Baixar o APK

1. Instale no Android
2. Configure:
   - URL: `http://10.0.2.2:3000` (emulador) ou `http://SEU_IP:3000` (dispositivo)
   - Nome: `ANDROID-01`
3. Registre o dispositivo
4. Inicie o serviço
5. Veja no dashboard: http://localhost:5173/dashboard

---

## 📝 Resumo dos Comandos

```powershell
# Criar repo no GitHub primeiro!
# Depois:

cd "C:\Users\almir\Desktop\architectus-aegis--tactical-monitor (1)\architectus-aegis--tactical-monitor"
git add -A
git commit -m "Add ARCHITECTUS AEGIS system"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main

# Ir para GitHub → Actions → Baixar APK
```

---

**Próximo passo**: Criar repositório no GitHub e executar os comandos acima! 🚀
