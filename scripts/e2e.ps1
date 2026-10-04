# Verificacion end-to-end con vida acotada: levanta el stack, prueba el flujo
# completo a traves del proxy de Angular, y apaga todo antes de devolver.
# No deja watchers colgando.
#
# Este script CREA un pedido real, asi que por defecto corre contra la base
# desechable `allpaca_test` en puertos propios (3100/4300): los datos de demo no
# se tocan. `npm run e2e` prepara esa base antes de invocarlo.
param(
  [int]$ApiPort = 3100,
  [int]$WebPort = 4300,
  [int]$TimeoutSec = 60
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot

$env:API_PORT = "$ApiPort"
$env:WEB_PORT = "$WebPort"
$env:PGDATABASE = if ($env:TEST_PGDATABASE) { $env:TEST_PGDATABASE } else { "allpaca_test" }
$env:API_TARGET = "http://localhost:$ApiPort"

$log = Join-Path $env:TEMP "allpaca-e2e.log"
$err = Join-Path $env:TEMP "allpaca-e2e-err.log"

$results = [System.Collections.ArrayList]::new()
function Check([string]$Name, [bool]$Ok, [string]$Detail = "") {
  [void]$results.Add([pscustomobject]@{ Test = $Name; Ok = $Ok; Detail = $Detail })
}

$proc = $null
try {
  $proc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" `
    -WorkingDirectory $root -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $log -RedirectStandardError $err

  $api = $false; $web = $false
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try { if ((Invoke-WebRequest "http://localhost:$ApiPort/api/health" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) { $api = $true } } catch {}
    try { if ((Invoke-WebRequest "http://localhost:$WebPort" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) { $web = $true } } catch {}
    if ($api -and $web) { break }
    Start-Sleep -Milliseconds 700
  }
  Check "api escucha en :$ApiPort" $api
  Check "web escucha en :$WebPort" $web
  if (-not ($api -and $web)) {
    Get-Content $log -Tail 25 -ErrorAction SilentlyContinue | ForEach-Object { $_ -replace "\x1b\[[0-9;]*m", "" }
    throw "el stack no levanto"
  }

  # --- salud a traves del proxy de Angular (no directo al API) ---
  try {
    $h = Invoke-RestMethod "http://localhost:$WebPort/api/health" -TimeoutSec 5
    Check "proxy Angular -> API" ($h.status -eq "ok") "$($h.service)"
  } catch { Check "proxy Angular -> API" $false $_ }

  # --- login real con las credenciales del seed ---
  $token = $null
  try {
    $body = @{ email = "admin@allpaca.mx"; password = "allpaca123" } | ConvertTo-Json
    $r = Invoke-RestMethod "http://localhost:$WebPort/api/auth/login" -Method Post `
      -ContentType "application/json" -Body $body -TimeoutSec 10
    $token = $r.token
    Check "login admin@allpaca.mx" ([bool]$token) "email=$($r.user.email)"
  } catch { Check "login admin@allpaca.mx" $false $_ }

  # --- catalogo publico ---
  try {
    $p = Invoke-RestMethod "http://localhost:$WebPort/api/products?limit=5" -TimeoutSec 10
    Check "catalogo responde" ($p.products.Count -gt 0) "$($p.products.Count) productos"
  } catch { Check "catalogo responde" $false $_ }

  # --- compra real: el flujo que estaba roto por el placeholder $1/$2 ---
  if ($token) {
    $hdr = @{ Authorization = "Bearer $token" }
    try {
      $me = Invoke-RestMethod "http://localhost:$WebPort/api/auth/me" -Headers $hdr -TimeoutSec 10
      $all = Invoke-RestMethod "http://localhost:$WebPort/api/products" -TimeoutSec 10
      $other = $all.products | Where-Object { $_.seller_id -ne $me.user.id } | Select-Object -First 1
      if ($null -eq $other) {
        Check "compra de producto ajeno" $false "no hay producto de otro vendedor"
      } else {
        $ob = @{ product_id = $other.id } | ConvertTo-Json
        $ord = Invoke-RestMethod "http://localhost:$WebPort/api/orders" -Method Post `
          -Headers $hdr -ContentType "application/json" -Body $ob -TimeoutSec 10
        $listed = Invoke-RestMethod "http://localhost:$WebPort/api/orders" -Headers $hdr -TimeoutSec 10
        $found = $listed.orders | Where-Object { $_.id -eq $ord.order.id }
        Check "compra crea y lista el pedido" ($null -ne $found) "pedido=$($ord.order.code) role=$($ord.order.role)"
      }
    } catch { Check "compra crea y lista el pedido" $false $_ }

    # --- zona protegida sin token ---
    try {
      Invoke-RestMethod "http://localhost:$WebPort/api/orders" -TimeoutSec 10 | Out-Null
      Check "ruta protegida sin token -> 401" $false "respondio 200"
    } catch {
      $code = $_.Exception.Response.StatusCode.value__
      Check "ruta protegida sin token -> 401" ($code -eq 401) "HTTP $code"
    }
  }

  # --- el HTML de Angular se sirve ---
  try {
    $html = (Invoke-WebRequest "http://localhost:$WebPort" -UseBasicParsing -TimeoutSec 5).Content
    Check "Angular sirve el shell HTML" ($html -match "<app-root") ("{0} bytes" -f $html.Length)
  } catch { Check "Angular sirve el shell HTML" $false $_ }

  Write-Host ""
  Write-Host "=== ALLPACA end-to-end ==="
  foreach ($r in $results) {
    $mark = if ($r.Ok) { "OK   " } else { "FALLA" }
    Write-Host ("  {0}  {1}{2}" -f $mark, $r.Test, $(if ($r.Detail) { "  ($($r.Detail))" } else { "" }))
  }
  $failed = @($results | Where-Object { -not $_.Ok }).Count
  Write-Host ""
  Write-Host ("  {0}/{1} correctos" -f ($results.Count - $failed), $results.Count)
  if ($failed -gt 0) { exit 1 }
  # Sin `exit` explicito, el codigo del script lo hereda el ultimo comando
  # nativo del `finally` (taskkill devuelve error si el proceso ya murio), y
  # una suite en verde terminaba reportandose como fallo.
  exit 0
}
catch {
  Write-Host ""
  Write-Warning "Error: $_"
  exit 1
}
finally {
  if ($proc) { & taskkill.exe /PID $proc.Id /T /F 2>$null | Out-Null }
  # NO se hace "Get-Process node | Stop-Process": cuando este script corre bajo
  # `npm run`, el propio npm es un proceso node y matarlo tumbaba al invocador
  # (codigo de salida -1). `taskkill /T` ya se lleva el arbol entero.
}
