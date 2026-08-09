# Wabz Foods — pre-push checks (Workflow v1.0)
# Runs before every push via husky. Exit code != 0 aborts the push.
$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Script
  )
  Write-Host ""
  Write-Host "==> $Name"
  & $Script
  if ($LASTEXITCODE -ne 0) {
    Write-Error "$Name failed (exit $LASTEXITCODE)"
    exit $LASTEXITCODE
  }
}

Invoke-Step "test"  { npm test }
Invoke-Step "build" { npm run build }

Write-Host ""
Write-Host "==> Pre-push checks passed."
