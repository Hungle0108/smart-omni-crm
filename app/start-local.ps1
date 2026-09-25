$ErrorActionPreference = 'Stop'
$crmRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $crmRoot
$crmPort = if ($env:PORT) { $env:PORT } else { '3000' }
$crmUrl = "http://127.0.0.1:$crmPort"
try {
    $crmHealth = Invoke-RestMethod -Uri "$crmUrl/health" -TimeoutSec 2
    if ($crmHealth.app -eq 'Smart Omni CRM') {
        Start-Process $crmUrl
        Write-Host "CRM dang chay tai $crmUrl"
        exit 0
    }
} catch { }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Chua tim thay Node.js. Hay cai Node.js 24 va mo lai.'
    exit 1
}
$crmMajor = & node -p 'parseInt(process.versions.node)'
if ([int]$crmMajor -lt 24) {
    Write-Host 'Ban thu can Node.js 24 tro len.'
    exit 1
}
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules/jszip/package.json')) -or -not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules/xml-js/package.json'))) {
    Write-Host 'Dang cai thu vien doc mau Word theo danh sach da khoa phien ban...'
    & npm.cmd ci --prefix $PSScriptRoot --ignore-scripts
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Chua cai duoc thu vien. Kiem tra ket noi Internet va thu lai.'
        exit 1
    }
}
Write-Host ''
Write-Host "Smart Omni CRM - Mo trinh duyet tai $crmUrl"
Write-Host 'Giu cua so nay khi su dung. Bam Ctrl+C de dung.'
Write-Host 'Du lieu duoc giu lai sau khi tat va mo lai.'
Write-Host ''
& node (Join-Path $PSScriptRoot 'server.js')
exit $LASTEXITCODE
