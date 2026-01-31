# Test Pipeline Creation
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Pipeline API Testing" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8083/api/pipelines"

# Test 1: Create a new pipeline
Write-Host "1. Creating new pipeline..." -ForegroundColor Yellow
try {
    $pipeline = @{
        domain = "analytics"
        name = "Customer Analytics Pipeline"
        description = "Processes customer data for analytics"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $baseUrl -Method POST `
        -ContentType "application/json" `
        -Body $pipeline `
        -Headers @{ "Origin" = "http://localhost:5175" }
    
    Write-Host "✓ Pipeline created successfully!" -ForegroundColor Green
    Write-Host "  ID: $($response.id)" -ForegroundColor White
    Write-Host "  Name: $($response.name)" -ForegroundColor White
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host ""
    
    $pipelineId = $response.id
    
} catch {
    Write-Host "✗ Failed to create pipeline" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
}

# Test 2: List all pipelines
Write-Host "2. Listing all pipelines..." -ForegroundColor Yellow
try {
    $pipelines = Invoke-RestMethod -Uri $baseUrl -Method GET `
        -Headers @{ "Origin" = "http://localhost:5175" }
    
    Write-Host "✓ Found $($pipelines.Count) pipeline(s)" -ForegroundColor Green
    foreach ($p in $pipelines) {
        Write-Host "  - $($p.name) [$($p.domain)] - Status: $($p.status)" -ForegroundColor White
    }
    Write-Host ""
    
} catch {
    Write-Host "✗ Failed to list pipelines" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
}

# Test 3: Get specific pipeline (if we created one)
if ($pipelineId) {
    Write-Host "3. Getting pipeline by ID..." -ForegroundColor Yellow
    try {
        $pipeline = Invoke-RestMethod -Uri "$baseUrl/$pipelineId" -Method GET `
            -Headers @{ "Origin" = "http://localhost:5175" }
        
        Write-Host "✓ Pipeline retrieved" -ForegroundColor Green
        Write-Host "  ID: $($pipeline.id)" -ForegroundColor White
        Write-Host "  Domain: $($pipeline.domain)" -ForegroundColor White
        Write-Host "  Name: $($pipeline.name)" -ForegroundColor White
        Write-Host "  Description: $($pipeline.description)" -ForegroundColor White
        Write-Host "  Status: $($pipeline.status)" -ForegroundColor White
        Write-Host "  Created: $($pipeline.createdAt)" -ForegroundColor White
        Write-Host ""
        
    } catch {
        Write-Host "✗ Failed to get pipeline" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host ""
    }
}

# Test 4: Create another pipeline
Write-Host "4. Creating second pipeline..." -ForegroundColor Yellow
try {
    $pipeline2 = @{
        domain = "finance"
        name = "Monthly Report Pipeline"
        description = "Generates monthly financial reports"
    } | ConvertTo-Json

    $response2 = Invoke-RestMethod -Uri $baseUrl -Method POST `
        -ContentType "application/json" `
        -Body $pipeline2 `
        -Headers @{ "Origin" = "http://localhost:5175" }
    
    Write-Host "✓ Second pipeline created!" -ForegroundColor Green
    Write-Host "  ID: $($response2.id)" -ForegroundColor White
    Write-Host "  Name: $($response2.name)" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "✗ Failed to create second pipeline" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
}

# Test 5: Filter pipelines by domain
Write-Host "5. Filtering pipelines by domain (analytics)..." -ForegroundColor Yellow
try {
    $filtered = Invoke-RestMethod -Uri "${baseUrl}?domain=analytics" -Method GET `
        -Headers @{ "Origin" = "http://localhost:5175" }
    
    Write-Host "✓ Found $($filtered.Count) pipeline(s) in 'analytics' domain" -ForegroundColor Green
    foreach ($p in $filtered) {
        Write-Host "  - $($p.name)" -ForegroundColor White
    }
    Write-Host ""
    
} catch {
    Write-Host "✗ Failed to filter pipelines" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Testing Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
