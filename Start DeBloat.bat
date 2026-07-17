@echo off
title DeBloat - Dev Launcher

REM --- Self-elevate to Administrator so tweaks can actually apply ---
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo Requesting Administrator privileges...
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo ============================================
echo    Starting DeBloat live window (Admin)...
echo ============================================
echo.
echo Keep THIS window open while you work.
echo Closing the app window will stop the dev server.
echo.

if not exist "node_modules" (
    echo First run detected - installing dependencies...
    call npm install
    node ".\node_modules\electron\install.js"
)

call npm run dev

echo.
echo App closed. Press any key to exit.
pause >nul
