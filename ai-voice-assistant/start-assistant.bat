@echo off
title Luccy AI - Windows PC Voice Assistant
color 0b

echo ======================================================================
echo           LUCCY AI - WINDOWS PC VOICE ASSISTANT
echo           Built with Gemini AI ^& Windows OS Bridge
echo ======================================================================
echo.

:: Detect Python or Node
set ENGINE=none

where python >nul 2>nul
if %errorlevel% equ 0 (
    set ENGINE=python
) else (
    where node >nul 2>nul
    if %errorlevel% equ 0 (
        set ENGINE=node
    )
)

if "%ENGINE%"=="none" (
    echo [WARNING] Neither Python nor Node.js was found in your PATH.
    echo Please install Python (https://www.python.org/) or Node.js (https://nodejs.org/)
    echo to enable PC system automation.
    pause
)

if "%ENGINE%"=="python" (
    echo [1/2] Starting Luccy PC OS Bridge via Python (Port 3001)...
    start "Luccy AI OS Bridge" /min cmd /c "python server.py"
) else if "%ENGINE%"=="node" (
    echo [1/2] Starting Luccy PC OS Bridge via Node (Port 3001)...
    start "Luccy AI OS Bridge" /min cmd /c "npx tsx server.ts"
)

:: Check if npm is available for Vite dev server, otherwise launch standalone browser
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo [2/2] Starting Luccy AI Frontend (Port 3000)...
    start "Luccy AI UI" /min cmd /c "npm run dev"
    timeout /t 3 /nobreak >nul
    start http://localhost:3000
) else (
    echo [2/2] Launching Assistant on http://localhost:3001 ...
    timeout /t 2 /nobreak >nul
    start http://localhost:3001
)

echo.
echo ======================================================================
echo  Luccy AI Voice Assistant is now RUNNING!
echo.
echo  Voice Commands you can try:
echo   - "Write quotes in Notepad" / "Notepad mein quotes likho"
echo   - "Open Chrome" / "Open VS Code" / "Open Calculator"
echo   - "Call +923001234567" / "Ali ko call lagao"
echo   - "Volume up" / "Volume down" / "Mute"
echo   - "Shutdown PC" / "Restart PC" / "Lock PC"
echo.
echo  (Keep this window open while using the assistant)
echo ======================================================================
echo.
pause
