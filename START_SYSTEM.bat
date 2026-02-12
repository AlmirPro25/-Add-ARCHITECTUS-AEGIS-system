@echo off
echo ========================================
echo  ARCHITECTUS AEGIS - System Startup
echo ========================================
echo.

echo [1/3] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm install && npm run dev"
timeout /t 5 /nobreak >nul
cd ..

echo [2/3] Starting Frontend Dashboard...
cd frontend
start "Frontend Dashboard" cmd /k "npm install && npm run dev"
timeout /t 3 /nobreak >nul
cd ..

echo [3/3] System Ready!
echo.
echo ========================================
echo  Services Running:
echo ========================================
echo  Backend:   http://localhost:3000
echo  Dashboard: http://localhost:5173
echo ========================================
echo.
echo Next Steps:
echo 1. Open Android Studio
echo 2. Open project: android-agent
echo 3. Run on emulator or device
echo.
echo Press any key to open Dashboard in browser...
pause >nul
start http://localhost:5173/dashboard
