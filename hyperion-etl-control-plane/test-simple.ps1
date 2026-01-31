Write-Host "Pipeline API Test" -ForegroundColor Cyan
Write-Host ""

$url = "http://localhost:8083/api/pipelines"

# Create pipeline
Write-Host "Creating pipeline..." -ForegroundColor Yellow
$body = '{"domain":"analytics","name":"Test Pipeline","description":"Testing"}'
try {
    $result = Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json" -Body $body
    Write-Host "Success! Created pipeline: $($result.id)" -ForegroundColor Green
    Write-Host "Name: $($result.name)" -ForegroundColor White
    Write-Host "Status: $($result.status)" -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""

# List pipelines  
Write-Host "Listing pipelines..." -ForegroundColor Yellow
try {
    $list = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "Found $($list.Count) pipelines" -ForegroundColor Green
    foreach ($p in $list) {
        Write-Host "  - $($p.name) [$($p.domain)] - $($p.status)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
