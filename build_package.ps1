# build_package.ps1
# Automates the build and zipping of iaplay for Hostinger deployment.

# 1. Run Vite build to generate up-to-date dist files
Write-Output "Running npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Vite build failed!"
    exit 1
}

# 2. Compress the dist folder directly to ZIP
$zipPath = Join-Path -Path $PSScriptRoot -ChildPath "iaplay_deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}
Write-Output "Compressing dist folder to $zipPath..."
Compress-Archive -Path (Join-Path -Path $PSScriptRoot -ChildPath "dist\*") -DestinationPath $zipPath -Force

Write-Output "✅ Package generated successfully at: $zipPath"
