$nodeDir = "C:\Users\hkpro\AppData\Local\OpenAI\Codex\runtimes\cua_node\440c4f095d41ea30\bin"
$env:PATH = "$nodeDir;$env:PATH"
Set-Location "C:\Users\hkpro\OneDrive\Desktop\Uzie-Portfolio"

Write-Host "Creating shareable public link..."
& "$nodeDir\npx.cmd" -y localtunnel --port 5500
