$nodeDir = "C:\Users\hkpro\AppData\Local\OpenAI\Codex\runtimes\cua_node\440c4f095d41ea30\bin"
$env:PATH = "$nodeDir;$env:PATH"
Set-Location "C:\Users\hkpro\OneDrive\Desktop\Uzie-Portfolio"

Write-Host "Deploying to public domain uzie-portfolio-2026.surge.sh..."
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "$nodeDir\npx.cmd"
$psi.Arguments = "-y surge . uzie-portfolio-2026.surge.sh"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true

$proc = [System.Diagnostics.Process]::Start($psi)
Start-Sleep -Seconds 4
$proc.StandardInput.WriteLine("whyuzi9988@gmail.com")
Start-Sleep -Seconds 2
$proc.StandardInput.WriteLine("UziePass2026!")
Start-Sleep -Seconds 2
$proc.StandardInput.WriteLine("UziePass2026!")

$output = $proc.StandardOutput.ReadToEnd()
Write-Host $output
$proc.WaitForExit()
