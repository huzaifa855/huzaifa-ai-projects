$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "TradingAgents.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "d:\TradingAgents-main\SETUP_AND_RUN.bat"
$Shortcut.WorkingDirectory = "d:\TradingAgents-main"
$Shortcut.Description = "TradingAgents - AI Multi-Agent Financial Trading"
$Shortcut.WindowStyle = 1  # Normal window

$Shortcut.Save()

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Desktop shortcut created!" -ForegroundColor Green
Write-Host "  Look for 'TradingAgents' on your Desktop" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
