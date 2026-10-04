# Verificacion con vida acotada: levanta el stack, comprueba, y apaga todo
# antes de devolver. Evita que watchers (ng serve / tsx watch) hereden los
# handles de la llamada y la dejen colgada.
param(
  [int]$ApiPort = 3000,
  [int]$WebPort = 4200,
  [int]$TimeoutSec = 60
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
if (-not $root) { $root = "C:\Users\PC-JESUS\OneDrive\Documentos\Academico\Salle\Academico Uni\Quinto\Allpaca" }

$log = Join-Path $env:TEMP "allpaca-smoke.log"
$err = Join-Path $env:TEMP "allpaca-smoke-err.log"

function Stop-Tree([int]$ProcId) {
  if ($ProcId -le 0) { return }
  & taskkill.exe /PID $ProcId /T /F 2>$null | Out-Null
}

$proc = $null
try {
  $proc = Start-Process -FilePath "npm.cmd" `
    -ArgumentList "run", "dev" `
    -WorkingDirectory $root `
    -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $log -RedirectStandardError $err

  $api = $false; $web = $false
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try { if ((Invoke-WebRequest "http://localhost:$ApiPort/api/health" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) { $api = $true } } catch {}
    try { if ((Invoke-WebRequest "http://localhost:$WebPort" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) { $web = $true } } catch {}
    if ($api -and $web) { break }
    Start-Sleep -Milliseconds 700
  }

  $elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)
  Write-Host ""
  Write-Host "=== ALLPACA smoke ($elapsed s) ==="
  Write-Host ("api  :{0,-5} {1}" -f $ApiPort, $(if ($api) { "OK" } else { "CAIDO" }))
  Write-Host ("web  :{0,-5} {1}" -f $WebPort, $(if ($web) { "OK" } else { "CAIDO" }))

  if ($api) {
    try {
      $h = Invoke-RestMethod "http://localhost:$ApiPort/api/health"
      Write-Host ("health: {0} / {1}" -f $h.status, $h.service)
    } catch { Write-Host "health: ERROR $_" }
  }

  if (-not ($api -and $web)) {
    Write-Host ""
    Write-Host "--- log ---"
    Get-Content $log -Tail 25 -ErrorAction SilentlyContinue | ForEach-Object { $_ -replace "\x1b\[[0-9;]*m", "" }
  }

  $fail = -not ($api -and $web)
  if ($fail) { exit 1 }
  # Sin `exit` explicito el codigo lo hereda el ultimo comando nativo del
  # `finally` (taskkill falla si el proceso ya murio) y un smoke en verde se
  # reportaba como fallo.
  exit 0
}
finally {
  Stop-Tree $proc.Id
  # NO se hace "Get-Process node | Stop-Process": cuando este script corre bajo
  # `npm run`, el propio npm es un proceso node y matarlo tumbaba al invocador
  # (codigo de salida -1). `taskkill /T` ya se lleva el arbol entero.
  Write-Host "`nstack detenido."
}
