// fetch-store-meta.mjs — Sincroniza la web con la VERDAD de la App Store.
//
// Consulta la API pública de iTunes para cada app con `appleId` en
// src/data/apps.js y escribe:
//   · src/data/store-meta.json  → precio, valoraciones, versión, fechas, URLs
//   · public/screenshots/<slug>-N.png → capturas OFICIALES (las de la ficha)
//   · public/icons/<slug>.png         → icono real de la app (512 px)
//
// PORQUÉ: la web decía "Próximamente" de apps que llevaban semanas a la venta
// y mostraba capturas generadas por script (círculos abstractos). Con esto,
// `npm run store` deja los datos alineados con la tienda en 10 segundos y no
// vuelve a haber una ficha mintiendo. Ejecutar antes de cada deploy
// (`npm run deploy` ya lo hace).
//
// Sin red (o si Apple no responde) el script NO borra nada: conserva el JSON y
// las capturas anteriores y avisa. La web sigue construyéndose.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { apps } from "../src/data/apps.js";

const COUNTRY = "es";
// WebP servido por los propios servidores de Apple: ~50 KB por captura frente a
// ~1 MB del PNG. mzstatic reescala manteniendo la proporción.
const SHOT_SIZE = "640x1386bb.webp";
const IPAD_SIZE = "1200x1600bb.webp";
const OG_SIZE = "1200x1200bb.jpg"; // JPG para og:image (WhatsApp/Twitter no tragan WebP siempre)
const MAX_SHOTS = 4;

const metaPath = resolve("src/data/store-meta.json");
const shotsDir = resolve("public/screenshots");
const iconsDir = resolve("public/icons");

const previous = existsSync(metaPath) ? JSON.parse(await readFile(metaPath, "utf8")) : {};

const withId = apps.filter((a) => a.appleId);
if (!withId.length) {
  console.log("fetch-store-meta: ninguna app con appleId; nada que hacer.");
  process.exit(0);
}

async function lookup(ids) {
  const url = `https://itunes.apple.com/lookup?id=${ids.join(",")}&country=${COUNTRY}`;
  const res = await fetch(url, { headers: { "user-agent": "idoctormusic-web/1.0" } });
  if (!res.ok) throw new Error(`iTunes lookup HTTP ${res.status}`);
  return (await res.json()).results || [];
}

/** Cambia el sufijo de tamaño de una URL de mzstatic. */
const resize = (url, size) => url.replace(/\/[^/]+$/, `/${size}`);

async function download(url, target) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`);
  await writeFile(target, Buffer.from(await res.arrayBuffer()));
}

let results;
try {
  results = await lookup(withId.map((a) => a.appleId));
} catch (err) {
  console.warn(`fetch-store-meta: sin acceso a la App Store (${err.message}). Se conservan los datos anteriores.`);
  process.exit(0);
}

await mkdir(shotsDir, { recursive: true });
await mkdir(iconsDir, { recursive: true });

const meta = { ...previous };
const bySlug = Object.fromEntries(withId.map((a) => [String(a.appleId), a.slug]));

for (const r of results) {
  const slug = bySlug[String(r.trackId)];
  if (!slug) continue;

  // La API no respeta el orden de la ficha; los nombres de archivo subidos a
  // App Store Connect llevan prefijo numérico ("01_directo…"), así que se
  // ordena por él para que la primera captura sea la portada real.
  const orderKey = (u) => {
    const m = u.match(/\/(\d{1,2})[_-][^/]*\/[^/]+$/);
    return m ? Number(m[1]) : 99;
  };
  const sortShots = (list) => [...(list || [])].sort((a, b) => orderKey(a) - orderKey(b));
  const shots = sortShots(r.screenshotUrls).slice(0, MAX_SHOTS);
  const ipad = sortShots(r.ipadScreenshotUrls).slice(0, 2);
  const localShots = [];
  for (const [i, u] of shots.entries()) {
    const file = `${slug}-${i + 1}.webp`;
    try {
      await download(resize(u, SHOT_SIZE), resolve(shotsDir, file));
      localShots.push(`/screenshots/${file}`);
    } catch (err) {
      console.warn(`  ! captura ${file}: ${err.message}`);
    }
  }
  // Primera captura también en JPG (para og:image de la página de la app).
  let ogImage = previous[slug]?.ogImage || null;
  if (shots[0]) {
    const file = `${slug}-og.jpg`;
    try {
      await download(resize(shots[0], OG_SIZE), resolve(shotsDir, file));
      ogImage = `/screenshots/${file}`;
    } catch (err) {
      console.warn(`  ! og ${file}: ${err.message}`);
    }
  }
  const localIpad = [];
  for (const [i, u] of ipad.entries()) {
    const file = `${slug}-ipad-${i + 1}.webp`;
    try {
      await download(resize(u, IPAD_SIZE), resolve(shotsDir, file));
      localIpad.push(`/screenshots/${file}`);
    } catch (err) {
      console.warn(`  ! captura iPad ${file}: ${err.message}`);
    }
  }
  let icon = null;
  if (r.artworkUrl512) {
    try {
      await download(r.artworkUrl512, resolve(iconsDir, `${slug}.png`));
      icon = `/icons/${slug}.png`;
    } catch (err) {
      console.warn(`  ! icono ${slug}: ${err.message}`);
    }
  }

  meta[slug] = {
    appleId: r.trackId,
    bundleId: r.bundleId,
    storeName: r.trackName,
    // Sin país en la ruta: Apple redirige a la tienda del visitante.
    url: `https://apps.apple.com/app/id${r.trackId}`,
    reviewUrl: `https://apps.apple.com/app/id${r.trackId}?action=write-review`,
    developerUrl: r.artistViewUrl ? r.artistViewUrl.replace(/\?.*$/, "").replace(`/${COUNTRY}/`, "/") : null,
    price: r.price,
    currency: r.currency,
    formattedPrice: r.formattedPrice,
    rating: r.averageUserRating || 0,
    ratingCount: r.userRatingCount || 0,
    version: r.version,
    minimumOsVersion: r.minimumOsVersion,
    releaseDate: (r.releaseDate || "").slice(0, 10),
    currentVersionReleaseDate: (r.currentVersionReleaseDate || "").slice(0, 10),
    languages: r.languageCodesISO2A || [],
    fileSizeBytes: Number(r.fileSizeBytes) || null,
    screenshots: localShots.length ? localShots : previous[slug]?.screenshots || [],
    ipadScreenshots: localIpad.length ? localIpad : previous[slug]?.ipadScreenshots || [],
    ogImage,
    icon: icon || previous[slug]?.icon || null,
    fetchedAt: new Date().toISOString().slice(0, 10),
  };
  console.log(
    `✓ ${slug}: ${r.trackName} v${r.version} · ${r.formattedPrice} · ${localShots.length} capturas · rating ${r.averageUserRating || 0} (${r.userRatingCount || 0})`,
  );
}

const missing = withId.filter((a) => !results.some((r) => String(r.trackId) === String(a.appleId)));
for (const a of missing) console.warn(`  ! ${a.slug}: appleId ${a.appleId} no aparece en la App Store (${COUNTRY})`);

// AVISO DE APPS OLVIDADAS (16-08-2026): la web decía "Próximamente" de
// iDoctor Vocal WarmUp, publicada desde mayo, porque nadie le puso `appleId`.
// La lista autoritativa es la ficha del DESARROLLADOR (el buscador de la App
// Store es difuso y no la devolvía). Desde aquí se comprueba en cada `npm run
// store` y se avisa de cualquier app publicada que falte en apps.js.
const DEVELOPER_ID = 1617442259; // Juan Gomez Company
try {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${DEVELOPER_ID}&entity=software&limit=100&country=${COUNTRY}`);
  const all = (await res.json()).results.filter((r) => r.wrapperType === "software");
  const known = new Set(apps.map((a) => String(a.appleId)));
  const unknown = all.filter((r) => !known.has(String(r.trackId)) && /^iDoctor/i.test(r.trackName));
  if (unknown.length) {
    console.warn("\n  ⚠ Apps publicadas en la App Store que NO están en src/data/apps.js:");
    for (const r of unknown) console.warn(`    · ${r.trackName} — appleId ${r.trackId} (${r.formattedPrice})`);
    console.warn("    Añádelas (o su `appleId`) para que la web no las dé por inexistentes.\n");
  }
} catch {
  console.warn("  (no se pudo comprobar la ficha del desarrollador)");
}

await writeFile(metaPath, JSON.stringify(meta, null, 2) + "\n");
// Copia como módulo ES: la importan a la vez Vite (navegador) y Node
// (postbuild-seo) sin depender de import attributes para JSON.
await writeFile(
  resolve("src/data/store-meta.js"),
  `// GENERADO por scripts/fetch-store-meta.mjs — no editar a mano. Ejecuta \`npm run store\`.\nexport default ${JSON.stringify(meta, null, 2)};\n`,
);
console.log(`store-meta.json / store-meta.js actualizados (${Object.keys(meta).length} apps).`);
