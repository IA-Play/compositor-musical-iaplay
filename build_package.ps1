# build_package.ps1
# Automates the packaging of the IAPLAY Studio Landing Page for Hostinger deployment.

$distDir = Join-Path -Path $PSScriptRoot -ChildPath "dist"

Write-Output "Preparing clean landing page distribution..."

# Clean dist folder
if (Test-Path $distDir) {
    Remove-Item -Path "$distDir\*" -Recurse -Force -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

# Copy Landing Page as root index.html
Copy-Item -Path (Join-Path -Path $PSScriptRoot -ChildPath "index.html") -Destination (Join-Path -Path $distDir -ChildPath "index.html") -Force

# Copy Screenshots gallery folder
$screenshotsSrc = Join-Path -Path $PSScriptRoot -ChildPath "public\screenshots"
$screenshotsDst = Join-Path -Path $distDir -ChildPath "screenshots"
if (Test-Path $screenshotsSrc) {
    Copy-Item -Path $screenshotsSrc -Destination $screenshotsDst -Recurse -Force
}

# Copy SEO & Apache config
$seoFiles = @("robots.txt", "sitemap.xml", ".htaccess")
foreach ($f in $seoFiles) {
    $src = Join-Path -Path $PSScriptRoot -ChildPath "public\$f"
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path -Path $distDir -ChildPath $f) -Force
    }
}

# Compress to iaplay_deploy.zip
$zipPath = Join-Path -Path $PSScriptRoot -ChildPath "iaplay_deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Write-Output "Compressing landing page to $zipPath..."
Compress-Archive -Path "$distDir\*" -DestinationPath $zipPath -Force

Write-Output "✅ Package generated successfully at: $zipPath"
