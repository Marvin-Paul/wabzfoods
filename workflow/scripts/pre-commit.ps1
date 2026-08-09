# Wabz Foods — pre-commit checks (Workflow v1.0)
# Runs before every commit via husky. Exit code != 0 aborts the commit.
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

Invoke-Step "format"   { npm run format }
Invoke-Step "lint"     { npm run lint }
Invoke-Step "typecheck" { npm run typecheck }
Invoke-Step "test"     { npm test }
Invoke-Step "build"    { npm run build }

if (Get-Command gitleaks -ErrorAction SilentlyContinue) {
  Invoke-Step "gitleaks" { gitleaks protect --staged --config ../workflow/config/gitleaks.toml }
} else {
  Write-Host ""
  Write-Host "==> gitleaks not installed - skipping secret scan (install with: winget install gitleaks)"
}

Write-Host ""
Write-Host "==> Pre-commit checks passed."
