@echo off
echo ========================================
echo  Setup e Compilacao do APK Android
echo ========================================
echo.

echo [VERIFICACAO] Checando requisitos...
echo.

REM Verificar Java
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Java nao encontrado!
    echo.
    echo Voce precisa instalar o Java JDK 17 ou superior.
    echo.
    echo Opcoes:
    echo 1. Baixar manualmente: https://adoptium.net/temurin/releases/?version=17
    echo 2. Usar winget: winget install EclipseAdoptium.Temurin.17.JDK
    echo 3. Usar chocolatey: choco install temurin17
    echo.
    echo Apos instalar, reinicie o terminal e execute este script novamente.
    echo.
    pause
    exit /b 1
)

echo [OK] Java encontrado!
java -version
echo.

REM Verificar ANDROID_HOME
if not defined ANDROID_HOME (
    echo [AVISO] ANDROID_HOME nao configurado.
    echo.
    echo Opcoes para continuar:
    echo.
    echo 1. INSTALAR ANDROID SDK (Recomendado)
    echo    - Baixe: https://developer.android.com/studio#command-line-tools-only
    echo    - Extraia para: C:\Android\Sdk\cmdline-tools\latest\
    echo    - Configure ANDROID_HOME
    echo.
    echo 2. USAR GITHUB ACTIONS (Sem instalar nada)
    echo    - Faca commit do codigo
    echo    - GitHub compila na nuvem
    echo    - Baixe o APK pronto
    echo.
    echo 3. USAR ANDROID STUDIO (Mais facil)
    echo    - Baixe: https://developer.android.com/studio
    echo    - Abra o projeto android-agent
    echo    - Clique em Run
    echo.
    echo Pressione qualquer tecla para ver o guia completo...
    pause >nul
    start COMPILAR_SEM_ANDROID_STUDIO.md
    exit /b 1
)

echo [OK] ANDROID_HOME configurado: %ANDROID_HOME%
echo.

echo [COMPILACAO] Iniciando build do APK...
echo.

REM Dar permissao de execucao ao gradlew
if not exist gradlew.bat (
    echo [ERRO] gradlew.bat nao encontrado!
    echo Certifique-se de estar na pasta android-agent
    pause
    exit /b 1
)

echo [1/3] Limpando builds anteriores...
call gradlew.bat clean
if errorlevel 1 (
    echo [ERRO] Falha ao limpar!
    pause
    exit /b 1
)

echo.
echo [2/3] Compilando APK Debug...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo [ERRO] Falha na compilacao!
    echo.
    echo Possiveis causas:
    echo - SDK components faltando
    echo - Versao do Java incompativel
    echo - Problemas de rede
    echo.
    echo Execute: gradlew.bat assembleDebug --stacktrace
    echo Para ver o erro detalhado.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando APK gerado...

if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo ========================================
    echo  SUCESSO! APK Compilado!
    echo ========================================
    echo.
    echo Localizacao: app\build\outputs\apk\debug\app-debug.apk
    echo.
    dir "app\build\outputs\apk\debug\app-debug.apk" | find "app-debug.apk"
    echo.
    echo ========================================
    echo  Proximos Passos:
    echo ========================================
    echo.
    echo 1. INSTALAR NO EMULADOR:
    echo    adb install app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo 2. INSTALAR NO DISPOSITIVO:
    echo    - Conecte via USB
    echo    - Ative Depuracao USB
    echo    - Execute: adb install app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo 3. TRANSFERIR MANUALMENTE:
    echo    - Copie o APK para o dispositivo
    echo    - Abra o arquivo no Android
    echo    - Permita instalacao de fontes desconhecidas
    echo    - Instale
    echo.
    echo Abrindo pasta do APK...
    start "" "app\build\outputs\apk\debug"
) else (
    echo [ERRO] APK nao encontrado!
    echo O build pode ter falhado silenciosamente.
    echo.
    echo Tente executar com mais detalhes:
    echo gradlew.bat assembleDebug --info
)

echo.
pause
