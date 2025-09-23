<#
Windows setup script for medical-union-front
Usage (PowerShell):
  1) Open PowerShell as normal user (not necessarily admin)
  2) Run: .\scripts\setup-windows.ps1

What this script does:
  - Checks Node.js and npm availability
  - Runs `npm install` (or `npm ci` if package-lock exists)
  - Optionally installs json-server locally if missing
  - Creates an example .env.local if not present
  - Prints commands to start dev server and mock server

This script is intentionally conservative: it does not start background processes automatically.
#>

function Assert-CommandExists($cmd) {
    return ($null -ne (Get-Command $cmd -ErrorAction SilentlyContinue))
}

Write-Host "--- medical-union-front Windows setup ---" -ForegroundColor Cyan

# 1) Check Node.js
if (-not (Assert-CommandExists 'node')) {
    Write-Host "Node.js not found in PATH. Please install Node.js (16+/18+/or recommended LTS) from https://nodejs.org/zh-cn/" -ForegroundColor Red
    exit 1
}

# 2) Check npm
if (-not (Assert-CommandExists 'npm')) {
    Write-Host "npm not found in PATH. Ensure Node.js installation provides npm." -ForegroundColor Red
    exit 1
}

Write-Host "Node version: $(node --version)" -ForegroundColor Green
Write-Host "npm version: $(npm --version)" -ForegroundColor Green

# 3) Install dependencies
if (Test-Path "package-lock.json") {
    Write-Host "package-lock.json found — running 'npm ci' for deterministic install..." -ForegroundColor Yellow
    npm ci
} else {
    Write-Host "Running 'npm install'..." -ForegroundColor Yellow
    npm install
}

# 4) Ensure json-server is available (devDependency already present, ensure local binary)
$localJsonServer = Join-Path -Path (Get-Location) -ChildPath "node_modules\.bin\json-server.cmd"
if (-not (Test-Path $localJsonServer)) {
    Write-Host "json-server local binary not found. Installing globally as fallback..." -ForegroundColor Yellow
    npm install -g json-server
} else {
    Write-Host "json-server local binary found." -ForegroundColor Green
}

# 5) Create example .env.local if not present
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating example .env.local..." -ForegroundColor Yellow
    @"
# local environment overrides for medical-union-front
VITE_API_BASE_URL=http://localhost:4000
# set other variables here as needed
"@ | Out-File -FilePath $envFile -Encoding utf8
} else {
    Write-Host ".env.local already exists — skipping creation." -ForegroundColor Green
}

Write-Host "\nSetup finished. Next steps:\n" -ForegroundColor Cyan
Write-Host "1) Start mock server (in a separate terminal):" -ForegroundColor White
Write-Host "   npm run mock" -ForegroundColor Yellow
Write-Host "   (or: npx json-server --watch mock/db.json --routes mock/routes.json --port 4000)" -ForegroundColor Yellow
Write-Host "\n2) Start dev server (in a separate terminal):" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host "\nIf you want to open both in one terminal, you can use Ampersand to run in background (PowerShell):" -ForegroundColor White
Write-Host "   Start-Process -NoNewWindow -FilePath 'cmd' -ArgumentList '/c npm run mock'" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow

Write-Host "\nNotes:" -ForegroundColor Cyan
Write-Host "- The project uses Vite; dev server default port is defined by Vite (usually 5173). Your workspace used 8091 in testing — use the port configured in your environment or dev server output." -ForegroundColor White
Write-Host "- If your team prefers one-command dev start, consider adding a cross-platform runner (concurrently) or an npm script combining mock+dev." -ForegroundColor White

Write-Host "--- done ---" -ForegroundColor Green
