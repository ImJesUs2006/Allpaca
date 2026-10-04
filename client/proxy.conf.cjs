/**
 * Proxy de dev: el cliente siempre habla `/api` en su propio origen y Angular
 * reenvia al backend. Eso evita CORS en el navegador.
 *
 * `API_TARGET` permite apuntar a otro backend sin tocar el archivo: los tests de
 * Playwright levantan el API en el puerto 3100 (con la base de pruebas) para no
 * escribir en los datos de demo.
 */
const target = process.env.API_TARGET || 'http://localhost:3000';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
};
