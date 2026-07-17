@echo off
title DeBloat - Dev Launcher
cd /d "%~dp0"

echo ============================================
echo    Starting DeBloat live window...
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
