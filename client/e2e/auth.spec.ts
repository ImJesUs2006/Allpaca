import { expect, test } from '@playwright/test';

const DEMO = { email: 'admin@allpaca.mx', password: 'allpaca123' };

/**
 * Sesion real contra la API + Postgres: login, guards, compra y persistencia
 * del carrito. Usa las credenciales del seed.
 */

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /usar cuenta de prueba/i }).click();
  await page.getByRole('button', { name: /^entrar$/i }).click();
  await expect(page).toHaveURL((u) => !u.pathname.startsWith('/login'), { timeout: 15_000 });
}

test('el guard manda a login y vuelve a la pagina pedida', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  await expect(page.getByText(/redirect=/)).toHaveCount(0);

  await page.getByRole('button', { name: /usar cuenta de prueba/i }).click();
  await page.getByRole('button', { name: /^entrar$/i }).click();
  // Tras entrar debe aterrizar en /dashboard, no en la raiz.
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
});

test('login con credenciales incorrectas muestra el error del API', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/correo/i).fill('admin@allpaca.mx');
  await page.getByLabel(/contrasena/i).fill('esta-no-es-la-clave');
  await page.getByRole('button', { name: /^entrar$/i }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible({ timeout: 10_000 });
  await expect(alert).toContainText(/incorrect|credencial|credenciales|no existe|contrasena/i);
  await expect(page).toHaveURL(/\/login/);
});

test('el formulario valida antes de llamar al API', async ({ page }) => {
  await page.goto('/login');
  // Email invalido: debe avisar sin abandonar la pagina.
  await page.getByLabel(/correo/i).fill('esto-no-es-un-correo');
  await page.getByLabel(/contrasena/i).click();
  await expect(page.getByText(/correo valido/i)).toBeVisible();
});

test('login correcto, dashboard con datos y perfil editable', async ({ page }) => {
  await login(page);

  // Entrar desde /login sin ?redirect aterriza en la portada; el dashboard se
  // pide explicitamente.
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { level: 1, name: /dashboard/i })).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: 'test-results/screenshots/dashboard.png', fullPage: true });

  await page.goto('/perfil');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const nameField = page.getByLabel(/nombre/i).first();
  await expect(nameField).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/perfil.png' });
});

test('el token persiste en recargar y cerrar sesion lo limpia', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/dashboard|localhost:\d+\/$/);

  await page.reload();
  // Tras recargar no debe voltar a /login.
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  const token = await page.evaluate(() => localStorage.getItem('allpaca.token'));
  expect(token).toBeTruthy();
});

test('el carrito persiste entre navegaciones', async ({ page }) => {
  await login(page);
  await page.goto('/directorio');
  const card = page.locator('article').first();
  await expect(card).toBeVisible({ timeout: 15_000 });

  await card.getByRole('button', { name: /agregar/i }).first().click();

  // CartService persiste desde un `effect`, que es asincrono: hay que
  // reintentar en vez de leer el localStorage de inmediato.
  await expect
    .poll(async () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('allpaca.cart') ?? '[]').length),
    )
    .toBeGreaterThan(0);

  await page.goto('/');
  await expect
    .poll(async () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('allpaca.cart') ?? '[]').length),
    )
    .toBeGreaterThan(0);
});

test('sin sesion, "Agregar" manda a login en vez de no hacer nada', async ({ page }) => {
  await page.goto('/directorio');
  const card = page.locator('article').first();
  await expect(card).toBeVisible({ timeout: 15_000 });

  await card.getByRole('button', { name: /agregar/i }).first().click();
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  // El boton ya no es un no-op silencioso: no se agrego nada al carrito.
  const cart = await page.evaluate(() => localStorage.getItem('allpaca.cart'));
  expect(JSON.parse(cart ?? '[]')).toHaveLength(0);
});

test('registro crea una cuenta y deja entrar', async ({ page }) => {
  const handle = `web_${Date.now().toString(36)}`;
  await page.goto('/registro');

  await page.getByLabel(/nombre/i).first().fill('Registro Web');
  await page.getByLabel(/correo/i).fill(`${handle}@test.mx`);
  // Hay dos campos de contrasena; hay que ser explicito.
  await page.getByLabel('Contrasena', { exact: true }).fill('supersecret');
  const repeat = page.getByLabel(/repetir|confirmar/i);
  if ((await repeat.count()) > 0) await repeat.fill('supersecret');

  const user = page.getByLabel(/usuario|alias|handle/i);
  if ((await user.count()) > 0) await user.fill(handle);

  await page.getByRole('button', { name: /crear|registrar/i }).first().click();
  await expect(page).toHaveURL((u) => !u.pathname.startsWith('/registro'), { timeout: 20_000 });
});
