// build-redirect-site.mjs — Genera en dist/ un sitio de SOLO REDIRECCIÓN para
// GitHub Pages (idoctor2000.github.io/iDoctorMusicTools/).
//
// PORQUÉ: desde el 16-08-2026 la web vive en https://idoctormusic.com (Firebase
// Hosting). Dejar la copia vieja en GitHub Pages con su propio canonical era
// tener DOS webs idénticas repartiéndose la autoridad en Google. GitHub Pages
// no permite redirecciones 301 de servidor, así que cada URL antigua pasa a
// ser una página mínima con:
//   · <link rel="canonical"> al destino nuevo   → Google traspasa la señal
//   · <meta http-equiv="refresh" content="0;url=…"> → redirección inmediata
//   · location.replace() en JS                  → por si el meta tarda
//   · <noscript> con enlace                     → siempre hay salida
//
// Lo ejecuta el workflow de GitHub Actions (npm run build:redirect) en cada
// push a main. Cubre la home, cada /apps/<slug>/ y Privacy.txt.

import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { apps } from "../src/data/apps.js";

const NEW_SITE = (process.env.REDIRECT_TARGET || "https://idoctormusic.com").replace(/\/+$/, "");
const distDir = resolve("dist");

const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");

function redirectHtml(target, label) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(label)} — iDoctor Music Tools</title>
    <link rel="canonical" href="${target}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)});</script>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif;background:#030712;color:#f8fafc;text-align:center;padding:24px}a{color:#22d3ee}</style>
  </head>
  <body>
    <main>
      <p>iDoctor Music Tools se ha mudado a <a href="${target}">${target}</a>.</p>
      <noscript><p><a href="${target}">Continuar →</a></p></noscript>
    </main>
  </body>
</html>
`;
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

async function write(path, content) {
  const target = resolve(distDir, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

const pages = [
  ["index.html", `${NEW_SITE}/`, "iDoctor Music Tools"],
  ["404.html", `${NEW_SITE}/`, "iDoctor Music Tools"],
  ...apps.map((app) => [`apps/${app.slug}/index.html`, `${NEW_SITE}/apps/${app.slug}/`, app.name]),
  ["Privacy.txt", null, null], // se sustituye por HTML de redirección abajo
];
for (const [path, target, label] of pages) {
  if (!target) continue;
  await write(path, redirectHtml(target, label));
}
// Privacy.txt / Privacy_EN.txt: son (o han podido ser) la URL de política de
// privacidad declarada en App Store Connect. Un revisor que la abra tiene que
// ver la política ENTERA, no un "se ha movido": se copian tal cual, con una
// primera línea que apunta a la versión HTML del dominio nuevo.
for (const [file, htmlPath] of [["Privacy.txt", "privacidad/"], ["Privacy_EN.txt", "en/privacy/"]]) {
  if (!existsSync(resolve(file))) continue;
  const body = await readFile(resolve(file), "utf8");
  await write(file, `${NEW_SITE}/${htmlPath}\n\n${body}`);
}
await write(".nojekyll", "");
// Sin bloquear el rastreo: Google tiene que LEER estas páginas para ver la
// redirección (meta refresh 0 = redirect) y el canonical, y traspasar señal.
await write("robots.txt", `User-agent: *\nAllow: /\n`);

console.log(`Sitio de redirección generado en dist/ → ${NEW_SITE} (${pages.length - 1} páginas + Privacy.txt)`);
