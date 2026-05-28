# iDoctor Music Tools

Landing page premium para el portfolio iOS iDoctor Music Tools.

## Desarrollo

No abras `index.html` directamente con `file://`. Es una app React/Vite y necesita servidor local.

```bash
npm install
npm run dev
```

Después abre la URL que muestre Vite, normalmente:

```text
http://127.0.0.1:5173/
```

## Producción

```bash
npm run build
```

## GitHub Pages

El proyecto incluye `.github/workflows/deploy.yml`. Al subirlo a un repositorio con rama `main`, GitHub Actions construye `dist/` y lo publica en GitHub Pages.

Si usas la URL gratuita de GitHub Pages, por ejemplo `usuario.github.io/nombre-del-repo`, deja `VITE_BASE` como está.

Las imágenes de `public/assets` y `public/screenshots` ya se resuelven con la ruta base de Vite, así que funcionan tanto en GitHub Pages como en un dominio propio.

Si conectas un dominio propio, cambia en `.github/workflows/deploy.yml`:

```yaml
VITE_BASE: /
```

Después configura el dominio en GitHub: `Settings > Pages > Custom domain`.
