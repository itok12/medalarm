param(
    [string]$ApiBaseUrl = "http://localhost:8080/api",
    [string]$Email,
    [string]$Password,
    [string]$Username = "playreview",
    [string]$Timezone = "Europe/London",
    [string]$OutputPath = "artifacts/app-access.local.txt"
)

if ([string]::IsNullOrWhiteSpace($Email)) {
    throw "Email is required."
}

if ([string]::IsNullOrWhiteSpace($Password)) {
    throw "Password is required."
}

$registerPayload = @{
    username = $Username
    email = $Email
    password = $Password
    timezone = $Timezone
} | ConvertTo-Json -Compress

$loginPayloads = @(
    @{ username = $Email; password = $Password },
    @{ username = $Username; password = $Password }
)

function Invoke-JsonRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Body
    )

    try {
        return Invoke-RestMethod -Method $Method -Uri $Uri -ContentType "application/json" -Body $Body -TimeoutSec 30
    } catch {
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $content = $reader.ReadToEnd()
            throw "HTTP $([int]$_.Exception.Response.StatusCode): $content"
        }
        throw
    }
}

try {
    $auth = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/auth/register" -Body $registerPayload
} catch {
    $auth = $null
    foreach ($payload in $loginPayloads) {
        try {
            $auth = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/auth/login" -Body ($payload | ConvertTo-Json -Compress)
            break
        } catch {
            continue
        }
    }

    if (-not $auth) {
        throw "Review account could not be registered and could not be logged into with the supplied username/email and password."
    }
}

$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory) {
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

@"
Instruction name: MedAlarm reviewer login
Username or email: $Email
Password: $Password

Reviewer notes:
MedAlarm requires an account because medicine schedules, alarms, adherence logs, and caregiver links are tied to an authenticated user profile.

Use the credentials above to sign in.
No 2-step verification is required.
No location restriction is required.
No paid subscription is required.
No action on another device is required.

After login:
1. Open the Today screen.
2. Add a medicine if needed.
3. Generate alarms.
4. Log a dose as Taken, Skipped, or Snoozed.
5. Review adherence history.
"@ | Set-Content -Path $OutputPath

[pscustomobject]@{
    username = $auth.username
    email = $auth.email
    outputPath = (Resolve-Path $OutputPath).Path
}
