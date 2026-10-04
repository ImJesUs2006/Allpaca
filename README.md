# ALLPACA

Mercado de ropa vintage y streetwear. Web brutalism: monocromo, bordes gruesos,
acento amarillo reservado para estado `PENDIENTE`.

La identidad visual y las reglas de producto están en [`DESIGN.md`](./DESIGN.md) —
esa es la fuente de verdad, no el prototipo React de `src/`.

## Estructura

| Ruta      | Qué es                                                        |
| --------- | ------------------------------------------------------------- |
| `client/` | App Angular 21 + Tailwind v4. Puerto `4200`.                  |
| `server/` | API Express 5 + PostgreSQL. Puerto `3000`.                    |
| `src/`    | Prototipo React original. Se conserva como referencia visual. |

## Requisitos

- Node `>= 22` (probado en `v24.14.0`)
- PostgreSQL 18 corriendo (`Get-Service postgresql-x64-18`)
- npm (no se usa pnpm en este proyecto)

## Puesta en marcha

### 1. Base de datos

Una sola vez. Necesitas la contraseña del superusuario de Postgres
(`postgres`). No se puede recuperar: `pg_hba.conf` exige `scram-sha-256`, que
guarda un hash con sal.

Si no conoces la contraseña, restablécela. Abre **PowerShell como
Administrador** (click derecho > Ejecutar como administrador) y:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\reset-pg-password.ps1 -Password "tu_password_nueva"
```

El script copia `pg_hba.conf`, pone `trust` solo para `127.0.0.1`/`::1`
(dejando `scram-sha-256` intacto para el resto), cambia la contraseña, y
restaura el archivo original incluso si algo falla.

Después, con la contraseña ya conocida:

```powershell
Copy-Item server\.env.example server\.env   # edita PGPASSWORD
npm run db:setup                            # crea rol + base, esquema y seeds
```

### 2. API

```powershell
npm run dev:api             # http://localhost:3000
```

Comprobación rápida:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

### 3. App

```powershell
npm run dev:web              # http://localhost:4200
```

`client/proxy.conf.json` redirige `/api` a `http://localhost:3000`, así que
con ambos procesos arriba no hace falta configurar nada más.

## Credenciales demo

| Email                 | Contrasena     |
| --------------------- | -------------- |
| `admin@allpaca.mx`    | `allpaca123`   |

Son datos de prueba locales. Cambialas antes de desplegar.

## Scripts

Raiz:

```powershell
npm run dev          # API + Angular a la vez
npm run build        # build de produccion del cliente
npm test             # tests del server
npm run smoke        # levanta el stack, comprueba ambos puertos y lo apaga
npm run e2e          # flujo HTTP completo (login, compra) y lo apaga
npm run typecheck    # typecheck de ambos
npm run db:setup     # crea la base y aplica el seed
npm run db:reset     # TRUNCA la base y la vuelve a sembrar (borra todo)
```

`npm run smoke` y `npm run e2e` dejan el stack en 0 procesos al terminar. Úsalos
para verificar en vez de dejar `npm run dev` colgando en otra ventana.

## Tests

```powershell
npm test           # server: 38 casos (schemas, env, health, CORS, pedidos, HTTP)
npm run test:client # cliente: 23 casos (CurrencyService, CartService)
npm run test:web    # navegador: 30 casos en Edge, desktop + mobile
```

### Los tests no tocan tus datos de demo

Los tests registran usuarios, crean productos y generan pedidos. Para que eso no
contamine la base de desarrollo, corren contra una base **desechable**:

| script | base | puertos |
| --- | --- | --- |
| `npm test` | `allpaca_test` | — |
| `npm run test:web` | `allpaca_test` | API 3100, web 4300 |
| `npm run e2e` | `allpaca_test` | API 3100, web 4300 |

`npm run db:test` recrea `allpaca_test` desde cero (drop + migrate + seed) antes
de cada corrida, asi que los tests siempre empiezan con los mismos fixtures. Se
ejecuta automaticamente al correr los tests; también puedes lanzarla sola.

Notas:

- Playwright usa puertos propios y `reuseExistingServer: false` a proposito: si
  reutilizara un `npm run dev` abierto, los tests escribirian en tus datos de
  demo. Si 3100/4300 estan ocupados, falla claro en vez de contaminar.
- El proxy de dev respeta `API_TARGET` (ver `client/proxy.conf.cjs`), que es lo
  que permite apuntar Angular al API de pruebas.
- Si ya se corrieron tests contra la base de demo, `npm run db:reset` la devuelve
  al estado de seed puro. Ojo: **borra todo**.
- Postgres debe estar arriba. Si no lo esta, los tests de DB se omiten solos con
  un aviso y la parte unitaria sigue siendo util.

`npm run test:web` levanta el API y el cliente por su cuenta y los apaga al
terminar, asi que no hace falta `npm run dev` abierto. Usa el Edge instalado en
el sistema (`channel: 'msedge'`) porque la descarga de Chromium falla por
timeout de red en esta maquina.

Las capturas quedan en `client/test-results/screenshots/`.

Detalle de cobertura:

- `server/test` — validacion Zod, arranque de `env.ts` (incluido el guard de
  CORS en produccion), health, 404, pedidos contra Postgres real y el flujo
  HTTP completo (login, compra, comunidades).
- `client/src/**/*.spec.ts` — servicios con signals, incluida la persistencia en
  `localStorage` y el formato por divisa.
- `client/e2e` — Playwright: que el hero cargue de verdad, que la fuente Syne
  este aplicada, que no haya errores de consola, login/guards, persistencia del
  token y del carrito, menu movil y filtro por categoria.

## Nota sobre las capturas

La suite verifica DOM, estilos computados y errores de consola, pero **no juzga
el diseno**. Eso hay que mirarlo a ojo en `test-results/screenshots/`.
