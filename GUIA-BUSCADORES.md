# Guía: poner idoctormusic.com en los buscadores (Google + Bing)

Tiempo total: ~15 minutos hoy + 5 minutos mañana. Todo necesita TU cuenta de
Google (seguramente jagomezc@gmail.com), así que no puedo hacerlo yo.

**Estado verificado a 22/08/2026:**
- ✅ Propiedad de Google **verificada el 13/07/2026** (el archivo
  `googled8cdd20de6965ba5.html` está en el repo y sirviendo el token).
- ❓ Sitemap enviado: desconocido — el paso 2 lo comprueba.
- ❌ Bing / DuckDuckGo: sin hacer (no hay rastro).
- ⚠️ Ni la búsqueda de marca saca el sitio todavía (índice de EE. UU.).

> Regla de esta guía: cada paso empieza por "cómo saber si ya está hecho".
> Si lo está, saltas al siguiente. Nada se rompe por repetirla.

---

## PARTE 1 · Google Search Console (~10 min)

### Paso 1 — Entrar y localizar la propiedad
1. Abre **https://search.google.com/search-console** con tu cuenta de Google.
2. Arriba a la izquierda hay un desplegable de propiedades. Busca
   **idoctormusic.com** (puede aparecer como "https://idoctormusic.com/").

- **Si aparece** → verificada (es lo esperado, del 13 de julio). Sigue al paso 2.
- **Si NO aparece** → "Añadir propiedad" → tipo **Prefijo de URL** →
  `https://idoctormusic.com/` → método "Etiqueta HTML / archivo HTML".
  El archivo ya está publicado en tu web, así que verificará al instante.

> No borres nunca `public/googled8cdd20de6965ba5.html` del repo: Google
> re-comprueba la verificación de vez en cuando.

### Paso 2 — Enviar el sitemap (el paso que probablemente falta)
1. Menú izquierdo → **Sitemaps**.
2. Mira la tabla "Sitemaps enviados":
   - **Si ya está** `sitemap.xml` con estado "Correcto" → hecho, salta al paso 3.
   - **Si está vacía** → en la caja "Añadir sitemap" escribe: `sitemap.xml`
     → **Enviar**. Debe quedar "Correcto · 20 URLs descubiertas" (puede tardar
     unas horas en procesarse).

### Paso 3 — Pedir indexación de las páginas clave
Google tiene una cuota de ~10 peticiones al día, así que va en dos tandas.

**Cómo se hace (igual para cada URL):**
1. Pega la URL en la **barra de inspección** de arriba del todo.
2. Espera el resultado → botón **"Solicitar indexación"** → confirmar.
   (Tarda ~1 min por URL; es normal.)

**Hoy (las 6 que más venden):**
```
https://idoctormusic.com/
https://idoctormusic.com/en/
https://idoctormusic.com/apps/musicband/
https://idoctormusic.com/apps/livestems/
https://idoctormusic.com/apps/beatbuddy-assistant/
https://idoctormusic.com/apps/tuner/
```

**Mañana (el resto):**
```
https://idoctormusic.com/apps/metronome/
https://idoctormusic.com/apps/capo/
https://idoctormusic.com/apps/vocal-warmup/
https://idoctormusic.com/en/apps/musicband/
https://idoctormusic.com/en/apps/livestems/
https://idoctormusic.com/en/apps/tuner/
```

### Paso 4 — Qué mirar dentro de 1–2 semanas
- **Indexación → Páginas**: cuántas de las 20 están "Indexadas". Objetivo: la
  mayoría en 2–4 semanas.
- **Rendimiento**: con qué búsquedas apareces y en qué posición. Aquí verás
  llegar primero la marca y luego los nichos (bandurria, beatbuddy, stems…).

---

## PARTE 2 · Bing Webmaster Tools (~5 min, y vale por tres buscadores)

Bing alimenta también **DuckDuckGo** y el buscador de **Copilot/Windows**. Y
tiene un truco: importa todo desde Google en dos clics.

1. Abre **https://www.bing.com/webmasters** → "Empezar" → inicia sesión
   (puedes usar la misma cuenta de Google).
2. Te ofrecerá **"Importar desde Google Search Console"** → acéptalo →
   selecciona la propiedad `idoctormusic.com` → Importar.
   Esto trae la verificación Y el sitemap: no hay que tocar DNS ni subir nada.
3. Comprueba en **Sitemaps** que `sitemap.xml` aparece; si no, envíalo igual
   que en Google (caja "Enviar sitemap" → `https://idoctormusic.com/sitemap.xml`).

---

## PARTE 3 · El primer enlace externo fácil: AlternativeTo (~10 min)

Los buscadores posicionan lo que otros enlazan. Este es el alta autoservicio
que puedes hacer hoy sin esperar a nadie:

1. Crea cuenta en **https://alternativeto.net**.
2. "Add an app" → añade **iDoctor MusicBand** con la URL
   `https://idoctormusic.com/en/apps/musicband/` (la ficha en inglés: es un
   sitio internacional).
3. En "alternative to", márcala como alternativa a **BandHelper**,
   **Setlist Helper** y **OnSong**.
4. Repite si quieres con Live Stems (alternativa a **Show Cue System /
   Playback**) y TunerPro (alternativa a **GuitarTuna**).

Es tráfico de gente que busca exactamente "alternativa a BandHelper" — y un
enlace permanente hacia tu dominio.

---

## Expectativas honestas

| Cuándo | Qué debería pasar |
|---|---|
| 1–2 semanas | El sitio aparece buscando **"iDoctor Music Tools"** |
| 3–6 semanas | Empiezan los nichos: "afinador bandurria", "asistente beatbuddy", "stems directo iPad" |
| 2–3 meses | Con los enlaces del kit de prensa: subida general |
| Nunca | "música", "afinador" a secas — y no pasa nada: ese tráfico no convierte |

Lo que acelera todo esto no es tocar más la web: son los **enlaces** (kit de
prensa, foros, fabricantes) y, en la App Store, las **valoraciones**.

## Recordatorio pendiente (no bloquea, pero está abierto)
- El registro **`www`** en Cloudflare sigue sin crear (CNAME `www` →
  `idoctormusic.com`, nube naranja + regla de redirección 301).
