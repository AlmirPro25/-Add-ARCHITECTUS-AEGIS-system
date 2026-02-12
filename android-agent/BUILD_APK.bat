@echo off
echo ========================================
echo  Building Aegis Field Agent APK
echo ========================================
echo.

echo Checking for Android SDK...
if not defined ANDROID_HOME (
    echo ERROR: ANDROID_HOME is not set!
    echo Please set ANDROID_HOME to your Android SDK location.
    echo Example: C:\Users\YourUser\AppData\Local\Android\Sdk
    echo.
    pause
    exit /b 1
)

echo Android SDK found at: %ANDROID_HOME%
echo.

echo [1/3] Cleaning previous builds...
call gradlew.bat clean
if errorlevel 1 (
    echo ERROR: Clean failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Building Debug APK...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Build Complete!
echo.
echo ========================================
echo  APK Location:
echo ========================================
echo  app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.

if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo APK Size:
    dir "app\build\outputs\apk\debug\app-debug.apk" | find "app-debug.apk"
    echo.
    echo Opening APK location...
    start "" "app\build\outputs\apk\debug"
) else (
    echo WARNING: APK file not found at expected location!
)

echo.
echo Press any key to exit...
pause >nul
