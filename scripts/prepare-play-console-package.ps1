param(
    [string]$VersionName = "1.0.0",
    [string]$VersionCode = "1",
    [string]$Locale = "en-GB",
    [string]$OutputRoot = "artifacts/play-console-package"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidRoot = Join-Path $repoRoot "frontend/android"
$bundlePath = Join-Path $androidRoot "app/build/outputs/bundle/release/app-release.aab"
$apkPath = Join-Path $androidRoot "app/build/outputs/apk/release/app-release.apk"
$metadataRoot = Join-Path $repoRoot "docs/play-console"

if (!(Test-Path $bundlePath)) {
    throw "Signed AAB not found at $bundlePath"
}

if (!(Test-Path $apkPath)) {
    throw "Signed APK not found at $apkPath"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageDir = Join-Path $repoRoot "$OutputRoot/medalarm-android-$VersionName-$timestamp"
$metadataOut = Join-Path $packageDir "metadata"
$artifactsOut = Join-Path $packageDir "artifacts"

New-Item -ItemType Directory -Force -Path $metadataOut | Out-Null
New-Item -ItemType Directory -Force -Path $artifactsOut | Out-Null

Copy-Item $bundlePath (Join-Path $artifactsOut "app-release.aab") -Force
Copy-Item $apkPath (Join-Path $artifactsOut "app-release.apk") -Force
Copy-Item (Join-Path $metadataRoot "README.md") (Join-Path $metadataOut "README.md") -Force
Copy-Item (Join-Path $metadataRoot "app-content.md") (Join-Path $metadataOut "app-content.md") -Force
Copy-Item (Join-Path $metadataRoot "testing-plan.md") (Join-Path $metadataOut "testing-plan.md") -Force
Copy-Item (Join-Path $repoRoot "docs/PLAY_CONSOLE_SUBMISSION.md") (Join-Path $packageDir "PLAY_CONSOLE_SUBMISSION.md") -Force
Copy-Item (Join-Path $repoRoot "docs/PLAY_DATA_SAFETY_WORKSHEET.md") (Join-Path $packageDir "PLAY_DATA_SAFETY_WORKSHEET.md") -Force
Copy-Item (Join-Path $repoRoot "docs/STORE_SUBMISSION_PACK.md") (Join-Path $packageDir "STORE_SUBMISSION_PACK.md") -Force

$localeSource = Join-Path $metadataRoot $Locale
if (Test-Path $localeSource) {
    Copy-Item $localeSource (Join-Path $metadataOut $Locale) -Recurse -Force
}

$bundleHash = (Get-FileHash $bundlePath -Algorithm SHA256).Hash
$apkHash = (Get-FileHash $apkPath -Algorithm SHA256).Hash

$manifest = @"
MedAlarm Play Console Package
Generated: $(Get-Date -Format o)
Version Name: $VersionName
Version Code: $VersionCode
Locale: $Locale

Artifacts
- app-release.aab
  SHA256: $bundleHash
- app-release.apk
  SHA256: $apkHash

Live URLs
- Privacy policy: https://medalarm.app/privacy-policy.html
- Support: https://medalarm.app/support.html
- Marketing: https://medalarm.app/
- Support email: support@medalarm.app
"@

Set-Content -Path (Join-Path $packageDir "MANIFEST.txt") -Value $manifest -NoNewline

Write-Output "Play Console package created:"
Write-Output $packageDir
