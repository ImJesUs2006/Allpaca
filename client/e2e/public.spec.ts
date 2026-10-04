import { expect, test } from '@playwright/test';

/**
 * Vistas publicas: verifican que el DOM se pinta de verdad y que Tailwind se
 * aplico (clases presentes + estilos computados, no solo el HTML shell).
 */

test('la landing pinta el hero y carga la imagen', async ({ page }) => {
  const failures: string[] = [];
  page.on('requestfailed', (r) => failures.push(r.url()));

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const hero = page.locator('img').first();
  await expect(hero).toBeVisible();

  // La imagen debe cargar de verdad (naturalWidth > 0), no solo estar en el DOM.
  await expect
    .poll(async () => hero.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
      timeout: 15_000,
    })
    .toBe(true);

  // Tailwind aplicado: el body debe tener fondo, no ser texto plano sin estilos.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');

  await page.screenshot({ path: 'test-results/screenshots/landing.png', fullPage: false });
  expect(failures.filter((u) => u.includes('localhost'))).toHaveLength(0);
});

test('la tipografia de display del proyecto esta cargada', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const font = await page
    .getByRole('heading', { level: 1 })
    .evaluate((el) => getComputedStyle(el).fontFamily);
  // DESIGN.md: la cabecera usa Syne. Si caiera a serif/sans por defecto,
  // la migracion de tokens estaria rota.
  expect(font.toLowerCase()).toContain('syne');
});

test('el directorio carga productos del API', async ({ page }) => {
  await page.goto('/directorio');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Los productos vienen de Postgres; sin datos el API devolveria 0.
  const cards = page.locator('article, [data-testid="product-card"]');
  await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: 'test-results/screenshots/directorio.png' });
});

test('el filtro por categoria de la cabecera cambia el listado', async ({ page }, testInfo) => {
  await page.goto('/directorio');
  await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 });

  // En movil la navegacion colapsa tras el boton "Menu", asi que el link de
  // categoria no existe hasta abrirlo. Ese caso tiene su propio test.
  const navLink = page.getByRole('link', { name: /^tops$/i }).first();
  test.skip(testInfo.project.name === 'mobile', 'el nav colapsa en movil; ver test del menu');
  await expect(navLink).toBeVisible();

  await navLink.click();
  await expect(page).toHaveURL(/category=tops/i);
  await expect(page.locator('article').first()).toBeVisible();
});

test('el filtro por categoria funciona por URL', async ({ page }) => {
  await page.goto('/directorio?category=Bottoms');
  await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 });
  const cards = await page.locator('article').allInnerTexts();
  expect(cards.length).toBeGreaterThan(0);
  // `innerText` ya sale en mayusculas por el `uppercase` de las tarjetas.
  for (const text of cards) expect(text).toMatch(/bottoms/i);
});

test('el menu movil abre la navegacion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'solo aplica a movil');

  await page.goto('/directorio');
  const menu = page.getByRole('button', { name: /menu/i });
  await expect(menu).toBeVisible();

  // Antes de abrir, el link de Directorio no esta en el arbol accesible.
  await expect(page.getByRole('link', { name: /^comunidades$/i })).toHaveCount(0);

  await menu.click();
  await expect(page.getByRole('link', { name: /^comunidades$/i })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/menu-movil.png' });
});

test('las comunidades cargan desde la base de datos', async ({ page }) => {
  await page.goto('/comunidades');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Los nombres accesibles de las tarjetas son el nombre de la comunidad, no
  // la palabra "comunidad", asi que se comprueban las URLs de detalle.
  const cards = page.locator('a[href^="/comunidades/"]');
  await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  expect(await cards.count()).toBeGreaterThanOrEqual(4);

  await page.screenshot({ path: 'test-results/screenshots/comunidades.png' });
});

test('no hay errores de consola en las vistas publicas', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));

  for (const path of ['/', '/directorio', '/comunidades', '/login', '/registro']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle').catch(() => {});
  }
  expect(errors).toEqual([]);
});
