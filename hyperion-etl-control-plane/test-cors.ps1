# Test CORS Configuration
Write-Host "Testing CORS Configuration..." -ForegroundColor Cyan
Write-Host ""

# Test OPTIONS preflight request
try {
    $headers = @{
        'Origin' = 'http://localhost:5175'
        'Access-Control-Request-Method' = 'GET'
        'Access-Control-Request-Headers' = 'content-type'
    }
    
    Write-Host "Sending OPTIONS preflight request..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri 'http://localhost:8083/api/pipelines' `
        -Method OPTIONS `
        -Headers $headers `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✓ OPTIONS request successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Headers:" -ForegroundColor Cyan
    $response.Headers.GetEnumerator() | Where-Object { $_.Key -like '*Access-Control*' } | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor White
    }
    
} catch {
    Write-Host "✗ OPTIONS request failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host ""
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        Write-Host "Response Headers:" -ForegroundColor Cyan
        $_.Exception.Response.Headers.GetEnumerator() | ForEach-Object {
            Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test actual GET request
try {
    Write-Host "Sending GET request..." -ForegroundColor Yellow
    $headers = @{
        'Origin' = 'http://localhost:5175'
    }
    
    $response = Invoke-WebRequest -Uri 'http://localhost:8083/api/pipelines' `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✓ GET request successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "CORS Headers:" -ForegroundColor Cyan
    $response.Headers.GetEnumerator() | Where-Object { $_.Key -like '*Access-Control*' } | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor White
    }
    
} catch {
    Write-Host "✗ GET request failed (expected - requires authentication)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
    
    if ($_.Exception.Response) {
        Write-Host ""
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        Write-Host "CORS Headers:" -ForegroundColor Cyan
        $_.Exception.Response.Headers.GetEnumerator() | Where-Object { $_.Key -like '*Access-Control*' } | ForEach-Object {
            Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
