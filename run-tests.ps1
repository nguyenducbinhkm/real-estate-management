# Chay toan bo 4 bo test cua RealEstateHub:
#   1. Unit test        (tests/RealEstateHub.UnitTests)        - khong can database
#   2. Integration test (tests/RealEstateHub.IntegrationTests) - tu dung database RealEstateHubDb_IntegrationTests
#   3. API test         (tests/RealEstateHub.ApiTests)         - tu dung database RealEstateHubDb_ApiTests
#   4. Frontend test    (frontend, Vitest)                     - khong can backend
# Can: .NET 8 SDK, Node.js, PostgreSQL dang chay. Chuoi ket noi lay tu bien moi truong REALESTATEHUB_TEST_DB
# hoac tu src/RealEstateHub.API/appsettings.Development.json. Database that (RealEstateHubDb) khong bi dung toi.
#
# Cach dung:  .\run-tests.ps1               (chay ca 4 bo)
#             .\run-tests.ps1 -Only unit    (unit | integration | api | frontend)
param(
    [ValidateSet('all', 'unit', 'integration', 'api', 'frontend')]
    [string]$Only = 'all'
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$results = [ordered]@{}

function Invoke-Suite([string]$name, [scriptblock]$command) {
    Write-Host ""
    Write-Host "==================== $name ====================" -ForegroundColor Cyan
    $watch = [Diagnostics.Stopwatch]::StartNew()
    & $command
    $ok = ($LASTEXITCODE -eq 0)
    $results[$name] = "{0}  ({1:N0}s)" -f ($(if ($ok) { 'PASS' } else { 'FAIL' })), $watch.Elapsed.TotalSeconds
}

Push-Location $root
try {
    if ($Only -in 'all', 'unit')        { Invoke-Suite 'Unit test'        { dotnet test tests/RealEstateHub.UnitTests --nologo } }
    if ($Only -in 'all', 'integration') { Invoke-Suite 'Integration test' { dotnet test tests/RealEstateHub.IntegrationTests --nologo } }
    if ($Only -in 'all', 'api')         { Invoke-Suite 'API test'         { dotnet test tests/RealEstateHub.ApiTests --nologo } }
    if ($Only -in 'all', 'frontend') {
        Invoke-Suite 'Frontend test' {
            if (-not (Test-Path frontend/node_modules)) { npm --prefix frontend ci }
            npm --prefix frontend test
        }
    }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "==================== KET QUA ====================" -ForegroundColor Cyan
$failed = $false
foreach ($entry in $results.GetEnumerator()) {
    $color = if ($entry.Value.StartsWith('PASS')) { 'Green' } else { $failed = $true; 'Red' }
    Write-Host ("{0,-18} {1}" -f $entry.Key, $entry.Value) -ForegroundColor $color
}
if ($failed) { exit 1 } else { exit 0 }
