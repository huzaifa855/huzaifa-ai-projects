@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
title TradingAgents - AI Multi-Agent Trading Framework
color 0A
cls

SET PYTHON=C:\Users\hkpro\AppData\Local\Programs\Python\Python313\python.exe
SET PROJECT_DIR=%~dp0
SET PROJECT_DIR=%PROJECT_DIR:~0,-1%

cd /d "%PROJECT_DIR%"

echo.
echo  ============================================================
echo    TRADINGAGENTS - AI Multi-Agent Trading Framework
echo    All Markets: Stocks + Gold + Silver + Forex + Crypto
echo  ============================================================
echo.

:: Verify packages
"%PYTHON%" -c "from tradingagents.graph.trading_graph import TradingAgentsGraph" >nul 2>&1
if errorlevel 1 (
    echo  [INSTALL] Installing packages... please wait a few minutes.
    echo.
    "%PYTHON%" -m pip install -e "%PROJECT_DIR%" -q
    if errorlevel 1 (
        echo.
        echo  [ERROR] Installation failed!
        echo  Try right-click this file ^> Run as Administrator
        echo.
        pause
        exit /b 1
    )
    echo  [OK] Packages installed!
    echo.
) else (
    echo  [OK] System packages and AI models ready.
)

:: Run
echo.
echo  ============================================================
echo   ENTER YOUR ASSET / TICKER WHEN PROMPTED:
echo   - Stocks:      AAPL    NVDA    TSLA    MSFT    AMZN
echo   - Commodities: GOLD    SILVER  XAU/USD XAG/USD OIL
echo   - Forex:       EUR/USD GBP/USD USD/JPY USD/CAD EUR/GBP
echo   - Crypto:      BTC     ETH     SOL     BTC-USD
echo  ============================================================
echo.

set PYTHONPATH=%PROJECT_DIR%
"%PYTHON%" -m cli.main

echo.
if errorlevel 1 (
    echo  [!] Something went wrong - see error above
) else (
    echo  [OK] Analysis complete!
    echo  Results saved on your Desktop: C:\Users\hkpro\OneDrive\Desktop\TradingResults\
)
echo.
pause
