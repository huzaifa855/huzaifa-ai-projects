$zipPath = "C:\Users\hkpro\OneDrive\Desktop\Uzie-Portfolio.zip"
$bytes = [System.IO.File]::ReadAllBytes($zipPath)

Write-Host "Uploading portfolio to Netlify cloud..."
$res = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites" -Method Post -ContentType "application/zip" -Body $bytes

Write-Host "DEPLOYED_URL:" $res.ssl_url
Write-Host "DEPLOYED_SITE:" $res.url
