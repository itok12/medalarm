param(
    [string]$ApiBaseUrl = "http://localhost:8080/api"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-UniqueValue {
    param([string]$Prefix)
    return "{0}-{1}" -f $Prefix, ([guid]::NewGuid().ToString("N").Substring(0, 8))
}

function Invoke-JsonRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [object]$Body,
        [hashtable]$Headers = @{}
    )

    $params = @{
        Method      = $Method
        Uri         = $Uri
        Headers     = $Headers
        ContentType = "application/json"
    }

    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    return Invoke-RestMethod @params
}

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-AuthHeaders {
    param([string]$Token)
    return @{ Authorization = "Bearer $Token" }
}

$caregiverUsername = New-UniqueValue "caregiver"
$patientUsername = New-UniqueValue "patient"
$password = "Password123!"

Write-Host "Registering caregiver user $caregiverUsername"
$caregiver = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/auth/register" -Body @{
    username = $caregiverUsername
    password = $password
    email    = "$caregiverUsername@example.com"
    timezone = "Europe/London"
}

Write-Host "Creating caregiver medicine"
$medicine = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/medicines" -Headers (Get-AuthHeaders $caregiver.token) -Body @{
    name        = "Vitamin D"
    dosage      = "1000 IU"
    frequency   = "Twice daily"
    startDate   = (Get-Date).ToString("yyyy-MM-dd")
    instructions = "Take with food"
}

Assert-True ($medicine.id -gt 0) "Failed to create caregiver medicine"

Write-Host "Generating automatic alarms"
$generatedAlarms = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/alarms/generate" -Headers (Get-AuthHeaders $caregiver.token) -Body @{
    medicineId = $medicine.id
}

Assert-True ($generatedAlarms.Count -ge 2) "Expected generated alarms for twice-daily medicine"

Write-Host "Creating manual alarm"
$manualAlarm = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/alarms" -Headers (Get-AuthHeaders $caregiver.token) -Body @{
    medicineId = $medicine.id
    alarmTime  = "21:15"
    active     = $true
    repeatDays = @("MONDAY", "WEDNESDAY", "FRIDAY")
}

Assert-True ($manualAlarm.source -eq "MANUAL") "Expected manual alarm source"

Write-Host "Logging a taken dose"
$logEntry = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/logs" -Headers (Get-AuthHeaders $caregiver.token) -Body @{
    alarmId = $manualAlarm.id
    status  = "TAKEN"
}

Assert-True ($logEntry.status -eq "TAKEN") "Expected a TAKEN log entry"

Write-Host "Exporting caregiver CSV"
$csvResponse = Invoke-WebRequest -Method GET -Uri "$ApiBaseUrl/logs/export" -Headers (Get-AuthHeaders $caregiver.token)
Assert-True ($csvResponse.Content -match "Vitamin D") "CSV export did not include the created medicine"

Write-Host "Registering patient user $patientUsername"
$patient = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/auth/register" -Body @{
    username = $patientUsername
    password = $password
    email    = "$patientUsername@example.com"
    timezone = "Europe/London"
}

Write-Host "Creating patient medicine and alarm activity"
$patientMedicine = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/medicines" -Headers (Get-AuthHeaders $patient.token) -Body @{
    name       = "Metformin"
    dosage     = "500mg"
    frequency  = "Once daily"
    startDate  = (Get-Date).ToString("yyyy-MM-dd")
}

$patientAlarms = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/alarms/generate" -Headers (Get-AuthHeaders $patient.token) -Body @{
    medicineId = $patientMedicine.id
}

Assert-True ($patientAlarms.Count -ge 1) "Expected at least one patient alarm"

[void](Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/logs" -Headers (Get-AuthHeaders $patient.token) -Body @{
    alarmId = $patientAlarms[0].id
    status  = "SKIPPED"
})

Write-Host "Linking patient to caregiver"
$relation = Invoke-JsonRequest -Method POST -Uri "$ApiBaseUrl/caregivers/patients" -Headers (Get-AuthHeaders $caregiver.token) -Body @{
    patientUsername = $patientUsername
}

Assert-True ($relation.username -eq $patientUsername) "Failed to link caregiver and patient"

Write-Host "Reading patient logs as caregiver"
$patientLogs = Invoke-RestMethod -Method GET -Uri "$ApiBaseUrl/caregivers/patients/$($patient.userId)/logs" -Headers (Get-AuthHeaders $caregiver.token)
Assert-True ($patientLogs.Count -ge 1) "Expected caregiver to read patient logs"

Write-Host "Verifying caregiver cannot delete patient medicine"
try {
    Invoke-RestMethod -Method DELETE -Uri "$ApiBaseUrl/medicines/$($patientMedicine.id)" -Headers (Get-AuthHeaders $caregiver.token) | Out-Null
    throw "Caregiver unexpectedly deleted patient medicine"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-True ($statusCode -ge 400) "Expected caregiver delete attempt to fail"
}

Write-Host "Smoke test passed." -ForegroundColor Green
