<#
  Reset de la contrasena del superusuario de PostgreSQL en Windows.

  USO (PowerShell COMO ADMINISTRADOR):
      powershell -NoProfile -ExecutionPolicy Bypass -File scripts\reset-pg-password.ps1 -Password "tu_password"

  Que hace y por que:
    1. Guarda una copia de pg_hba.conf.
    2. Pone `trust` SOLO para 127.0.0.1 y ::1, dejando scram-sha-256 intacto
       para cualquier otra conexion. Asi la ventana sin autenticacion es minima.
    3. Reinicia el servicio (necesario para que se relea pg_hba.conf).
    4. Cambia la contrasena con psql.
    5. RESTAURA pg_hba.conf y reinicia otra vez, incluso si algo fallo.

  Importante: el paso 4 necesita la contrasena nueva en la linea de comandos,
  donde queda visible en el historial de Powershell. Si prefieres evitarlo, usa
  $env:PGPASSWORD o edita a mano; el resto del script es igual.
#>
param(
  [Parameter(Mandatory = $true)][string]$Password,
  [string]$DataDir = "C:\Program Files\PostgreSQL\18\data",
  [string]$Service = "postgresql-x64-18"
)

$ErrorActionPreference = "Stop"

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal -ArgumentList $identity
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "Este script necesita PowerShell como Administrador (click derecho > Ejecutar como administrador)."
  exit 1
}

$hba = Join-Path $DataDir "pg_hba.conf"
$backup = Join-Path $DataDir "pg_hba.conf.allpaca-backup"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $hba)) { Write-Error "No se encontro $hba"; exit 1 }
if (-not (Test-Path $psql)) { Write-Error "No se encontro $psql"; exit 1 }

$original = Get-Content -LiteralPath $hba

function Restart-Pg {
  Write-Host "Reiniciando $Service ..."
  Restart-Service -Name $Service -Force
  # El servicio arranca el postmaster; damos margen a que abra el socket.
  for ($i = 0; $i -lt 30; $i++) {
    if ((Get-Service $Service).Status -eq "Running") { Start-Sleep -Milliseconds 500; return }
    Start-Sleep -Milliseconds 500
  }
  Write-Warning "El servicio no marco Running, pero continuan."
}

try {
  Write-Host "1/5 Copia de seguridad -> $backup"
  Set-Content -LiteralPath $backup -Value $original -Encoding UTF8

  Write-Host "2/5 Poniendo trust solo para 127.0.0.1 y ::1"
  $patched = $original | ForEach-Object {
    if ($_ -match '^\s*host\s+all\s+all\s+(127\.0\.0\.1/32|::1/128)\s+') {
      ($_ -replace 'scram-sha-256', 'trust')
    } else { $_ }
  }
  Set-Content -LiteralPath $hba -Value $patched -Encoding UTF8

  Write-Host "3/5 Reiniciando para releer pg_hba.conf"
  Restart-Pg

  Write-Host "4/5 Cambiando la contrasena de postgres"
  $env:PGPASSWORD = ""
  & $psql -U postgres -h 127.0.0.1 -d postgres -v ON_ERROR_STOP=1 `
    -c "ALTER USER postgres WITH PASSWORD '$Password';"
  if ($LASTEXITCODE -ne 0) { throw "psql devolvio $LASTEXITCODE" }
}
catch {
  Write-Host ""
  Write-Warning "Fallo en el paso: $_"
  Write-Host "Restaurando pg_hba.conf de todos modos."
}
finally {
  Write-Host "5/5 Restaurando pg_hba.conf original"
  Set-Content -LiteralPath $hba -Value $original -Encoding UTF8
  Restart-Pg
  Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Listo. Verifica con:"
Write-Host '  psql -U postgres -h 127.0.0.1 -c "SELECT version();"'
Write-Host "Copia guardada en $backup (puedes borrarla)."
