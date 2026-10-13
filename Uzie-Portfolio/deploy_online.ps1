$nodeDir = "C:\Users\hkpro\AppData\Local\OpenAI\Codex\runtimes\cua_node\440c4f095d41ea30\bin"
$env:PATH = "$nodeDir;$env:PATH"
Set-Location "C:\Users\hkpro\OneDrive\Desktop\Uzie-Portfolio"

Write-Host "Deploying to permanent web hosting..."
& "$nodeDir\npx.cmd" -y surge . uzie-portfolio-2026.surge.sh --token "a85c490e54bf485e94b2fa1411ebcd67"
