# Allpaca — Design Spec

E-commerce + red social de moda circular y streetwear. Estilo **Web Brutalism / Alta Costura**: blanco y negro estricto, bordes gruesos, cero transiciones suaves en tarjetas, tipografía display agresiva. Slogan: "Como nuevo".

Fuente de verdad en el código actual: `src/index.css` (tokens y fuentes) y `src/App.tsx` (clases Tailwind).

## 1. Colores

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--background` | `#ffffff` | `#000000` | Fondo de página |
| `--foreground` | `#000000` | `#ffffff` | Texto |
| `--card` | `#f4f4f5` | `#18181b` | Superficies secundarias |
| `--primary` | `#000000` | `#ffffff` | Botones, bloques invertidos |
| `--primary-foreground` | `#ffffff` | `#000000` | Texto sobre primary |
| `--muted` | `#e4e4e7` | `#27272a` | Fondos atenuados |
| `--muted-foreground` | `#71717a` | `#a1a1aa` | Texto secundario |
| `--border` | `#000000` | `#ffffff` | Todos los bordes |
| `--accent` | `#ffff00` | `#ffff00` | Único color: estado "PENDIENTE" |

Reglas:
- La UI es **solo blanco y negro**. El amarillo `#ffff00` se usa únicamente en badges de estado pendiente.
- La app hoy se renderiza siempre en modo claro (`bg-white text-black`). El tema `.dark` está definido pero no se activa.
- Selección de texto: `selection:bg-black selection:text-white`.
- Overlays: `bg-black/60 backdrop-blur-sm`.

## 2. Tipografía

Importadas desde Google Fonts en `src/index.css`:

| Rol | Fuente | Pesos | Variable / clase |
|---|---|---|---|
| Títulos, logo, precios, botones, nav | **Syne** | 700, 800 | `--font-display` / `font-display` |
| Cuerpo y UI | **Manrope** | 400, 500, 600, 700 | `--font-body` / `font-body` (default del `html`) |
| Slogan "Como nuevo" | **Caveat** | 400, 700 | `--font-signature` / `font-signature` |

Patrones tipográficos:
- Logo: `font-display font-bold text-3xl uppercase tracking-tighter` ("ALLPACA").
- Hero título: `font-display text-[12vw] leading-none uppercase tracking-tighter`.
- Slogan: `font-signature text-6xl sm:text-7xl lg:text-[6rem]`, con animación `pulse-slow`.
- Títulos de sección: `font-display text-4xl sm:text-5xl uppercase`.
- Precio en tarjeta: `font-display text-3xl font-bold`.
- Etiquetas/metadata: `font-body text-xs font-semibold uppercase tracking-wide` (o `tracking-widest` en labels de estadísticas).
- Casi todo el texto de UI va en **MAYÚSCULAS**.

## 3. Bordes, espaciado y forma

- Bordes gruesos como lenguaje principal: `border-4` (tarjetas, botones, secciones, 50 usos), `border-2` (chips, inputs), `border-8` (borde lateral del drawer).
- Divisores de sección: `border-b-4 border-black`; separadores internos punteados: `border-t-4 border-dashed border-current`.
- Esquinas **rectas** (sin radio). Excepción: iconos del header y buscador son `rounded-full`.
- Contenedor máximo: `max-w-[1800px]` (landing), `max-w-7xl` (hero). Padding horizontal: `px-6 sm:px-12 md:px-20`.
- Iconos: **lucide-react**, `strokeWidth` 2.5–3, tamaño 28 en header.

## 4. Imágenes y efecto B/N → color

- Toda foto de prenda: `grayscale group-hover:grayscale-0 transition-none` (cambio instantáneo, sin fundido).
- Miniaturas del carrito: siempre `grayscale`.
- Proporción de imagen de producto: `aspect-[3/4]`, `object-cover`, con borde `border-4`.
- Hero: `src/imports/1015203.jpg`, `object-cover opacity-60 mix-blend-overlay` sobre fondo negro, `h-screen`.
- Fotos de producto: URLs de Unsplash (`?q=80&w=600&auto=format&fit=crop`).

## 5. Componentes

**Header** (fijo, `z-40`, `p-6`)
- Izquierda: logo + nav (`Directorio`, `Comunidades`, `Dashboard`, separador `|`, `Tops`, `Bottoms`, `Accesorios`). Nav oculto bajo `md`.
- Derecha: lupa (abre input desplegable hacia la izquierda, `rounded-full border-2`, animación slide/fade), usuario, carrito.
- En landing: transparente con texto blanco; al hacer scroll > 20px pasa a `bg-white text-black border-b-4`. En el resto de vistas siempre sólido.
- Hover de nav: `hover:underline underline-offset-4 decoration-2`.

**ProductCard** (`min-w-[280px] sm:min-w-[320px] max-w-[320px]`, `snap-start`)
- `border-4 border-black p-2`; en hover **se invierte entero** (`hover:bg-black hover:text-white`) sin transición.
- Contenido: imagen, nombre (`font-display text-xl uppercase truncate`), chips (categoría, talla, condición), ubicación con `MapPin`, línea punteada, vendedor + rating con `Star`, precio.
- Datos: `id, name, price, image, category, size, condition, seller, rating, location, styles[], verified`.

**Carrusel "Recomendados para ti"**
- Scroll horizontal con `snap-x snap-mandatory`, scrollbar oculta (`.hide-scrollbar`).
- Botones laterales cuadrados `w-12 h-12 border-4`, con `ChevronLeft/Right`; hover invertido; desplazan `clientWidth / 2` con scroll suave. Ocultos bajo `sm`.

**Botones**
- Primario sobre blanco: `border-4 border-black bg-white text-black hover:bg-black hover:text-white`.
- Sobre negro: `bg-white text-black hover:bg-black hover:text-white hover:border-white`.
- Texto: `font-display uppercase font-bold`.

**Drawer de carrito**
- `fixed inset-0 z-50`, panel derecho `max-w-md`, `bg-black text-white`, `border-l-8`.
- Cabecera "CARRITO (n)" con botón `X` que rota 90° en hover; ítems con miniatura B/N; total; botón "CHECKOUT" `text-4xl`.

**Newsletter / footer** (solo landing)
- Sección negra "Únete al Movimiento" (`font-display text-5xl sm:text-7xl md:text-9xl`), formulario con `border-4 border-white`.
- Footer: `© año ALLPACA - CIRCULAR STREETWEAR`, `uppercase tracking-widest text-sm`.

**StatCard** (dashboard): `border-4 p-6`; label `text-xs tracking-widest uppercase`, valor `font-display text-4xl md:text-5xl`, hint `opacity-60`.

**StatusBadge**: `border-2 border-black px-3 py-1 text-xs font-bold uppercase`.
- `ENTREGADO` → `bg-black text-white`
- `PENDIENTE` → `bg-[#ffff00] text-black`
- otros → `bg-white text-black`

## 6. Animaciones

| Nombre | Definición | Uso |
|---|---|---|
| `fade-in-up` | opacity 0→1, translateY 20px→0, 1s ease-out | Título del hero |
| `pulse-slow` | opacity 1→0.7→1, 3s infinite | Slogan |
| Transición de color | `transition-colors duration-300` | Header, botones |
| Sin transición | `transition-none` | Tarjetas y grayscale (intencional) |

Estas keyframes están hoy inyectadas con un `<style>` dentro de `App.tsx`; al migrar, moverlas a CSS global.

## 7. Vistas y navegación

Estado `currentView` en `App`:

| Vista | Contenido |
|---|---|
| `landing` | Hero, carrusel de recomendados, newsletter, footer |
| `list` | Directorio: sidebar de filtros + grid de tarjetas |
| `dashboard` | Pestañas: Inventario, Mis Compras, Mis Ventas, Mensajes, Analíticas |
| `communities` | Red de comunidades; detalle de comunidad; modal al unirse |
| `profile` | Perfil unificado (sin distinción comprador/vendedor) |

Filtros del directorio:
- Categorías (pestañas): Todo, Tops, Bottoms, Accesorios. Agrupación: `tops` → Tops + Outerwear; `bottoms` → Bottoms; `accesorios` → Headwear + Accesorios.
- Estilos: Y2K, Avant Garde, Streetwear, Vintage 90s.
- Tallas: XS, S, M, L, XL, XXL, OSFA, 30, 32, 34.

Estado global actual: `currentView`, `listCategory`, `currency`, `isCartOpen`, `isSearchOpen`, `joined[]` (comunidades), `activeCommunity`, `joinToast`.

## 8. Divisas

Lista: USD, ARS, MXN, COP, CLP, PEN, GTQ, SVC, PYG, UYU, BOB, VES, DOP, BZD, HNL, NIO, PAB, CRC.

**Estado actual:** la constante `CURRENCIES` y el estado `currency` existen en `App.tsx`, pero **no hay selector en el header ni conversión de precios**; los precios son strings fijos en USD (`"$45"`). Esto está pendiente de implementar. Requisito original: selector en el header que actualice los precios dinámicamente.

## 9. Notas para migrar a Angular

- Tailwind v4 funciona igual: copiar `src/index.css` tal cual y las clases de utilidad a las plantillas.
- Dividir `App.tsx` (~2100 líneas) en componentes: `Header`, `ProductCard`, `LandingView`, `ListView`, `DashboardView` (+ paneles), `CommunitiesView`, `CommunityDetailView`, `JoinModal`, `ProfileView`, `CartDrawer`.
- Estado → servicios con signals (carrito, divisa, filtros, comunidades unidas).
- `currentView` → Angular Router.
- Datos (`PRODUCTS`, `COMMUNITIES`, `SALES`, `PURCHASES`, `CHATS`, `MONTHLY`, etc.) → archivos `.ts` independientes.
- Iconos: `lucide-angular` en lugar de `lucide-react`.
