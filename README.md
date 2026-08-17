# iDoctor Music Tools — web pública

Escaparate del portfolio iOS **iDoctor Music Tools**, publicado en **https://idoctormusic.com**
(Firebase Hosting, sitio `idoctormusic` del proyecto `idoctormusicband`). Bilingüe: `/` (es) y `/en/`.

## Cómo funciona

- **React + Vite + Tailwind** para la home (una SPA), con textos de interfaz en `src/i18n/index.js`.
- **`src/data/apps.js`** — contenido en español y fuente de verdad (slugs, iconos, orden, `appleId`).
- **`src/data/apps.en.js`** — textos en inglés (lo que falte cae al español).
- **`src/data/store-meta.js`** — datos REALES de la App Store (precio, valoraciones, capturas oficiales,
  icono). Lo genera `npm run store` (`scripts/fetch-store-meta.mjs`). No editar a mano.
- **`src/data/catalog.js`** — fusiona los tres; lo usan la web y el generador SEO. Regla: si la app tiene
  ficha en la tienda, se muestra "Disponible" y enlazada, diga lo que diga `status`.
- **`scripts/postbuild-seo.mjs`** — tras el build de Vite genera todo lo indexable: home es/en con
  cabecera SEO y contenido HTML real, una página estática por app y por idioma (`/apps/<slug>/`,
  `/en/apps/<slug>/`) con precio, valoraciones, capturas y JSON-LD `SoftwareApplication`,
  `/privacidad/`, `/soporte/` (+ `/en/privacy/`, `/en/support/`), `sitemap.xml` con hreflang, `robots.txt`,
  `llms.txt` y la clave IndexNow.

## Desarrollo

```bash
npm install
npm run dev          # http://127.0.0.1:5173/
```

## Publicar (Firebase Hosting → idoctormusic.com)

```bash
npm run deploy       # = npm run store + build:site + firebase deploy --only hosting:tools
```

Solo toca el sitio `idoctormusic`; el sitio `idoctormusicband` (Concierto Interactivo, manuales) no se ve afectado.

Vista previa temporal sin tocar producción:

```bash
npm run build:site && firebase hosting:channel:deploy preview --only tools --expires 2h
```

Capturas de control de calidad (usa el Chrome del sistema):

```bash
npx vite preview --port 4173 &   # o cualquier URL
node scripts/qa-screenshots.mjs http://127.0.0.1:4173 qa-shots
```

## GitHub Pages (solo redirección)

`idoctor2000.github.io/iDoctorMusicTools/` ya no sirve la web: el workflow `.github/workflows/deploy.yml`
publica un sitio de redirección (`scripts/build-redirect-site.mjs`) que manda cada URL antigua a su
equivalente en `idoctormusic.com` con canonical + meta refresh + JS. `Privacy.txt` se mantiene íntegro allí
por si alguna ficha de App Store Connect aún lo enlaza.

## Cuando salga una app nueva

1. Añádela en `src/data/apps.js` (y sus textos en `src/data/apps.en.js`).
2. Cuando esté publicada, pon su `appleId` y ejecuta `npm run store` — precio, capturas e icono se descargan solos.
3. `npm run deploy`.

## Enlaces cortos de marca del Concierto Interactivo (`functions/`)

Una Cloud Function (`shareLink`, europe-west1) sirve `idoctormusic.com/vota/<alias>`, `/en-vivo/<alias>`,
`/pantalla/<alias>` y la tarjeta `/og-card/<tipo>/<alias>.jpg`. A los robots de vista previa (WhatsApp,
Telegram, iMessage…) les da HTML con `og:*` (nombre y logo de la banda, leídos de
`bands/{id}/publicLive/current`); a las personas las redirige (302) al enlace largo de siempre en
`idoctormusicband.web.app`. **Los QR impresos y los enlaces largos no cambian**: esto es una puerta más.
Alias → bandId en `functions/aliases.json` (provisional; sin alias se acepta el bandId).

```bash
firebase deploy --only functions:links        # solo la función
npm run deploy                                # hosting (incluye las rewrites)
```
