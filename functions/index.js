// index.js — Enlaces cortos de marca del Concierto Interactivo (2026-08-17).
//
//   https://idoctormusic.com/vota/<alias>       → público: vota la siguiente canción
//   https://idoctormusic.com/en-vivo/<alias>    → como el QR impreso (la página resuelve sola el setlist en escena)
//   https://idoctormusic.com/pantalla/<alias>   → pantalla de votación para proyectar
//   https://idoctormusic.com/og-card/<tipo>/<alias>.jpg → la tarjeta 1200×630 con el LOGO de la banda
//
// QUÉ HACE: WhatsApp/Telegram/iMessage descargan el HTML sin ejecutar JS para
// pintar la vista previa. Las páginas del concierto (idoctormusicband.web.app)
// son estáticas y el nombre/logo de la banda les llega por JS, así que su
// tarjeta es genérica. Aquí, en cambio, se sirve un HTML ya montado por banda:
// a los ROBOTS de vista previa se les da la página con `og:*` (nombre, logo,
// qué es este enlace); a las PERSONAS se les redirige (302) al enlace largo de
// siempre. Los QR impresos y los enlaces largos NO cambian: esto es una puerta
// adicional, más corta y con identidad.
//
// COSTE: una lectura de Firestore por resolución (doc público
// bands/{id}/publicLive/current), cacheada 60 s en memoria; la tarjeta se
// genera una vez y se cachea 10 min. Nadie se queda "escuchando": es una
// parada de paso. Región europe-west1 (cerca de España).

import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
initializeApp();
const db = getFirestore();

// Tipografía propia (Inter, OFL): el runtime no trae fuentes fiables.
GlobalFonts.registerFromPath(join(here, "assets/InterDisplay-Bold.ttf"), "InterDisplay");
GlobalFonts.registerFromPath(join(here, "assets/Inter-SemiBold.ttf"), "InterSemi");
GlobalFonts.registerFromPath(join(here, "assets/Inter-Regular.ttf"), "InterRegular");

const ALIASES = JSON.parse(readFileSync(join(here, "aliases.json"), "utf8"));
const CONCERT_BASE = "https://idoctormusicband.web.app"; // los enlaces largos de siempre (QR impresos)
const SITE = "https://idoctormusic.com";

const KINDS = {
  vota: {
    kicker: "VOTA LA SIGUIENTE CANCIÓN",
    title: (b) => `${b} · Vota la siguiente canción`,
    headline: "Elige la siguiente canción del concierto",
    desc: "Vota desde tu móvil y mira el recuento en directo. Se abre en el navegador: sin app, sin registro, sin datos personales.",
    target: (id) => `${CONCERT_BASE}/votar/?banda=${enc(id)}`,
    glyph: "♪",
  },
  "en-vivo": {
    kicker: "CONCIERTO INTERACTIVO",
    title: (b) => `${b} · Concierto Interactivo`,
    headline: "Entra y participa en el directo",
    desc: "El público elige canciones y sigue la letra desde el móvil. Se abre en el navegador: sin app, sin registro.",
    target: (id) => `${CONCERT_BASE}/votar/?banda=${enc(id)}`,
    glyph: "♫",
  },
  pantalla: {
    kicker: "PANTALLA DE VOTACIÓN",
    title: (b) => `${b} · Pantalla de votación en directo`,
    headline: "Recuento en directo para la sala",
    desc: "Proyección con el QR y los votos del público en tiempo real.",
    target: (id) => `${CONCERT_BASE}/pantalla/?banda=${enc(id)}`,
    glyph: "▶",
  },
  // ELIGE EL REPERTORIO (08-11-2026): la votación de campaña de la banda,
  // abierta días antes de un concierto y publicada en redes. Un enlace fijo
  // por banda: la página enseña la campaña que esté abierta (o la última).
  elige: {
    kicker: "ELIGE EL REPERTORIO",
    title: (b) => `${b} · Elige el repertorio del próximo concierto`,
    headline: "Vota los temas que quieres oír en el próximo concierto",
    desc: "Elige tus canciones favoritas desde el móvil; las más votadas entran en el repertorio. Sin app, sin registro, sin datos personales.",
    target: (id) => `${CONCERT_BASE}/elige/?banda=${enc(id)}`,
    glyph: "★",
  },
};

const enc = encodeURIComponent;
const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const BOT_RE = /(facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|Slackbot|Discordbot|LinkedInBot|Applebot|Googlebot|bingbot|Pinterest|SkypeUriPreview|Embedly|redditbot|vkShare|Mastodon|Bluesky|Iframely|Snapchat|SkypeUriPreview)/i;

// ---------- datos de la banda (cache 60 s) ----------
const bandCache = new Map(); // bandId → { at, data }
async function loadBand(bandId) {
  const hit = bandCache.get(bandId);
  if (hit && Date.now() - hit.at < 60_000) return hit.data;
  const snap = await db.doc(`bands/${bandId}/publicLive/current`).get();
  const d = snap.exists ? snap.data() : null;
  const data = d
    ? { bandName: d.bandName || "", logoUrl: d.logoUrl || "", activeSetlistId: d.activeSetlistId || "" }
    : null;
  bandCache.set(bandId, { at: Date.now(), data });
  return data;
}

// ALIAS AUTOMÁTICOS (08-11-2026, build 216): además del JSON, la app registra
// el alias de cada banda en `aliases/{slug}` (BandAlias.swift). Se mira el JSON,
// luego Firestore (con caché de un minuto) y, si nada, el bandId tal cual.
const aliasCache = new Map();
async function resolveAlias(alias = "") {
  const a = String(alias).trim().toLowerCase().replace(/\.jpg$/, "");
  if (!a) return null;
  if (ALIASES[a]) return { alias: a, bandId: ALIASES[a] };
  if (/^[a-z0-9]{3,32}$/.test(a)) {
    const hit = aliasCache.get(a);
    let bid = hit && Date.now() - hit.at < 60_000 ? hit.bandId : null;
    if (bid === null) {
      const snap = await db.doc(`aliases/${a}`).get().catch(() => null);
      bid = snap && snap.exists ? String(snap.get("bandId") || "") : "";
      aliasCache.set(a, { at: Date.now(), bandId: bid });
    }
    if (/^[A-Za-z0-9_-]{6,64}$/.test(bid)) return { alias: a, bandId: bid };
  }
  // Sin alias registrado: se acepta el bandId tal cual (para cualquier banda).
  const raw = String(alias).trim().replace(/\.jpg$/, "");
  return /^[A-Za-z0-9_-]{6,64}$/.test(raw) ? { alias: raw, bandId: raw } : null;
}

// ---------- tarjeta OG (cache 10 min) ----------
const cardCache = new Map(); // key → { at, buf }
async function renderCard(kind, band) {
  const key = `${kind}|${band.bandName}|${band.logoUrl}`;
  const hit = cardCache.get(key);
  if (hit && Date.now() - hit.at < 600_000) return hit.buf;

  const W = 1200, H = 630;
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");
  // fondo + resplandores
  ctx.fillStyle = "#070a10"; ctx.fillRect(0, 0, W, H);
  const g1 = ctx.createRadialGradient(W * 0.9, H * 0.15, 20, W * 0.9, H * 0.15, 560);
  g1.addColorStop(0, "rgba(0,229,255,0.28)"); g1.addColorStop(1, "rgba(0,229,255,0)");
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.05, H * 1.05, 20, W * 0.05, H * 1.05, 620);
  g2.addColorStop(0, "rgba(139,92,246,0.35)"); g2.addColorStop(1, "rgba(139,92,246,0)");
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  // ondas
  const colors = ["#00e5ff", "#8b5cf6", "#d946ef"];
  ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = colors[k]; ctx.globalAlpha = 0.9;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = H * 0.8 + Math.sin(x / 95 + k * 1.7) * (14 + 6 * k) + k * 18;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // marca
  ctx.fillStyle = "#00e5ff"; ctx.beginPath(); ctx.arc(78, 70, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#bec4ce"; ctx.font = "600 24px InterSemi";
  ctx.fillText("iDOCTOR MUSICBAND · CONCIERTO INTERACTIVO", 100, 79);

  // logo (derecha) o glifo
  const box = { x: W - 70 - 260, y: 150, s: 260 };
  let logoDrawn = false;
  if (band.logoUrl) {
    try {
      const res = await fetch(band.logoUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const img = await loadImage(Buffer.from(await res.arrayBuffer()));
        ctx.save();
        roundRect(ctx, box.x, box.y, box.s, box.s, 48); ctx.clip();
        // cover
        const r = Math.max(box.s / img.width, box.s / img.height);
        const w = img.width * r, h = img.height * r;
        ctx.drawImage(img, box.x + (box.s - w) / 2, box.y + (box.s - h) / 2, w, h);
        ctx.restore();
        ctx.strokeStyle = "rgba(0,229,255,0.9)"; ctx.lineWidth = 3;
        roundRect(ctx, box.x, box.y, box.s, box.s, 48); ctx.stroke();
        logoDrawn = true;
      }
    } catch { /* sin logo: glifo */ }
  }
  if (!logoDrawn) {
    ctx.fillStyle = "#0e1420"; roundRect(ctx, box.x, box.y, box.s, box.s, 48); ctx.fill();
    ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 3; roundRect(ctx, box.x, box.y, box.s, box.s, 48); ctx.stroke();
    ctx.fillStyle = "#00e5ff"; ctx.font = "700 120px InterDisplay"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(KINDS[kind].glyph, box.x + box.s / 2, box.y + box.s / 2 + 6);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  // textos (izquierda, con ajuste de línea)
  const maxW = box.x - 70 - 40;
  ctx.fillStyle = "#00e5ff"; ctx.font = "700 28px InterDisplay";
  ctx.fillText(KINDS[kind].kicker, 70, 175);
  const name = band.bandName || "Concierto Interactivo";
  let size = 78;
  let lines = wrap(ctx, name, maxW, `700 ${size}px InterDisplay`);
  while (lines.length > 2 && size > 44) { size -= 6; lines = wrap(ctx, name, maxW, `700 ${size}px InterDisplay`); }
  ctx.fillStyle = "#ffffff"; ctx.font = `700 ${size}px InterDisplay`;
  let y = 190 + size;
  for (const l of lines.slice(0, 2)) { ctx.fillText(l, 70, y); y += size * 1.08; }
  ctx.fillStyle = "#e6e9ef"; ctx.font = "600 34px InterSemi";
  for (const l of wrap(ctx, KINDS[kind].headline, maxW, "600 34px InterSemi").slice(0, 2)) { ctx.fillText(l, 70, y + 8); y += 42; }
  ctx.fillStyle = "#7c8799"; ctx.font = "400 24px InterRegular";
  ctx.fillText("Se abre en el navegador · sin app · sin registro", 70, H - 60);

  const buf = await c.encode("jpeg", 84);
  cardCache.set(key, { at: Date.now(), buf });
  return buf;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrap(ctx, text, maxW, font) {
  ctx.font = font;
  const words = String(text).split(/\s+/); const out = []; let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  return out;
}

// ---------- HTML para robots ----------
function previewHtml({ kind, alias, band, target }) {
  const K = KINDS[kind];
  const title = K.title(band.bandName || "Concierto Interactivo");
  const img = `${SITE}/og-card/${kind}/${enc(alias)}.jpg`;
  const self = `${SITE}/${kind}/${enc(alias)}`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(K.desc)}" />
<meta name="robots" content="noindex" />
<link rel="canonical" href="${self}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="iDoctor MusicBand · Concierto Interactivo" />
<meta property="og:locale" content="es_ES" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(K.desc)}" />
<meta property="og:url" content="${self}" />
<meta property="og:image" content="${img}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(K.desc)}" />
<meta name="twitter:image" content="${img}" />
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#070a10;color:#fff;font-family:-apple-system,system-ui,sans-serif;text-align:center;padding:24px}a{color:#00e5ff;font-weight:700}</style>
</head><body><p>${esc(title)}<br /><a href="${esc(target)}">Entrar →</a></p></body></html>`;
}

// ---------- la función ----------
export const shareLink = onRequest(
  { region: "europe-west1", memory: "512MiB", timeoutSeconds: 20, maxInstances: 5, cors: false },
  async (req, res) => {
    try {
      const path = req.path.replace(/\/+$/, "");
      // /og-card/<kind>/<alias>.jpg
      let m = path.match(/^\/og-card\/(vota|en-vivo|pantalla|elige)\/([^/]+?)(?:\.jpg)?$/);
      if (m) {
        const kind = m[1], r = await resolveAlias(m[2]);
        const band = r ? await loadBand(r.bandId) : null;
        const buf = await renderCard(kind, band || { bandName: "", logoUrl: "" });
        res.set("Content-Type", "image/jpeg");
        res.set("Cache-Control", "public, max-age=300, s-maxage=600");
        return res.status(200).send(buf);
      }
      // /<kind>/<alias>
      m = path.match(/^\/(vota|en-vivo|pantalla|elige)\/([^/]+)$/);
      if (!m) return res.status(404).send("Not found");
      const kind = m[1], r = await resolveAlias(m[2]);
      if (!r) return res.status(404).send("Enlace no válido");
      const band = await loadBand(r.bandId);
      if (!band) return res.status(404).send("Banda no encontrada");
      // UN SOLO ENLACE POR BANDA, PARA SIEMPRE (invariante fijado el
      // 28-08-2026): el redirector ya NO añade `setlist` nunca — ni el de la
      // query ni el activo. Las páginas del concierto siguen solas al setlist
      // que esté en escena, y así un enlace corto guardado o impreso no puede
      // quedarse enganchado a la votación vieja de un bolo pasado. Un
      // `?setlist=` heredado de enlaces antiguos se ignora sin romperlos.
      let target = KINDS[kind].target(r.bandId);
      // Votación en la web: cada cajón web tiene su enlace (`?poll=`); sin él,
      // la página enseña la abierta. Solo para /elige: los demás, sin nada.
      if (kind === "elige" && /^[A-Za-z0-9_-]{1,40}$/.test(String(req.query.poll || ""))) target += "&poll=" + enc(String(req.query.poll));
      const ua = req.get("user-agent") || "";
      const wantsPreview = BOT_RE.test(ua) || req.query.preview === "1";
      // NO cachear en la CDN: la misma URL responde distinto a robots (HTML
      // con og:*) y a personas (302). Si la CDN guardara el HTML del robot,
      // las personas verían la página de paso en vez de la redirección.
      res.set("Cache-Control", "private, no-store");
      if (wantsPreview) {
        res.set("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(previewHtml({ kind, alias: r.alias, band, target }));
      }
      return res.redirect(302, target);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error");
    }
  },
);

// ═══════════════════════════════════════════════════════════════════════════
//  FOTOS DEL PÚBLICO EN LA PANTALLA (2026-08-23) — "Sube tu foto y sal en
//  la pantalla", del Concierto Interactivo.
//
//  Una sola función HTTP con varias operaciones (`op`). TODO pasa por aquí
//  con el SDK de administrador: ni la web del público ni la pantalla ni el
//  moderador tocan Firestore/Storage directamente, así que NO hace falta
//  cambiar ninguna regla de seguridad — y si esta función falla, lo único
//  que ocurre es que no aparecen fotos (la votación no se entera: colecciones
//  y código separados).
//
//  Moderación: NADA se proyecta sin aprobar. El moderador usa una CLAVE
//  (variable de entorno FOTOS_KEY, en functions/.env.<proyecto>, fuera de
//  git) que se compara aquí con tiempo constante. Interruptor remoto:
//  `publicLive/current.photosEnabled` (lo leen la web de votar y la pantalla;
//  apagado = el botón y el collage desaparecen al instante).
//
//  Datos: Firestore `bands/{banda}/photos/{device}` (una foto viva por
//  dispositivo; subir otra la sustituye y vuelve a pendiente) y Storage
//  `photos/{banda}/{device}.jpg` (URL con token de descarga, como los logos).
//
//  Operaciones:
//    GET  ?op=approved&banda=…              → público: fotos aprobadas (pantalla)
//    POST {op:"upload", banda, device, image} → público: sube una foto (base64 JPEG)
//    GET  ?op=queue&banda=…&clave=…          → moderador: pendientes + aprobadas
//    POST {op:"approve"|"reject"|"remove", banda, id, clave}
//    POST {op:"toggle", banda, enabled, clave} → interruptor photosEnabled
//    GET  ?op=zip&banda=…&clave=…            → moderador: descarga un ZIP con
//                                              las fotos (aprobadas+pendientes)
//    POST {op:"purge", banda, clave}           → borra todo (fin del bolo)
// ═══════════════════════════════════════════════════════════════════════════
import { getStorage } from "firebase-admin/storage";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

const FOTOS_BUCKET = "idoctormusicband.firebasestorage.app";
const FOTOS_MAX_BYTES = 1.5 * 1024 * 1024;      // tras reducir en el móvil quedan ~150-400 KB
const FOTOS_MIN_INTERVAL_MS = 15_000;           // una subida por dispositivo cada 15 s
const FOTOS_MAX_LIST = 40;
const FOTOS_TTL_MS = 48 * 3600 * 1000;
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;          // banda y device: sin rutas, sin sorpresas

function fotosEq(given, real) {
  if (!real || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(String(real));
  return a.length === b.length && timingSafeEqual(a, b);
}
/// La clave del moderador puede ser la PROPIA de la banda (la genera la app y
/// vive en `bands/{banda}/moderation/current`, legible solo por la banda por
/// las reglas genéricas de subcolecciones) o la MAESTRA (env FOTOS_KEY).
async function fotosKeyOk(banda, given) {
  if (typeof given !== "string" || !given) return false;
  if (fotosEq(given, process.env.FOTOS_KEY || "")) return true;
  try {
    const s = await db.doc(`bands/${banda}/moderation/current`).get();
    return s.exists && fotosEq(given, s.data()?.key || "");
  } catch (_) { return false; }
}
function fotosJson(res, code, obj) {
  res.set("Cache-Control", "no-store");
  res.status(code).json(obj);
}
function fotosDocOut(d) {
  const v = d.data() || {};
  const ts = (t) => (t && typeof t.toMillis === "function") ? t.toMillis() : null;
  return { id: d.id, status: v.status || "pending", url: v.url || null,
           createdAt: ts(v.createdAt), approvedAt: ts(v.approvedAt) };
}
// ── ZIP del recuerdo (01-09-2026) ─────────────────────────────────────────
// POR QUÉ AQUÍ Y NO EN EL NAVEGADOR: la primera versión montaba el zip en la
// página del moderador con fetch() sobre las URLs de Storage… y Firebase
// Storage sirve las fotos SIN cabecera CORS (las <img> se ven porque una
// imagen no la necesita, pero leer sus bytes desde otra web está prohibido).
// Además, en Safari de iPhone una descarga disparada por JavaScript después
// de esperas asíncronas pierde el "gesto del usuario" y se bloquea sin decir
// nada. Haciéndolo aquí, el navegador solo sigue un enlace normal y descarga
// un archivo normal: funciona igual en iPhone, iPad, Mac y Android.
//
// ZIP "store" (sin comprimir: los JPEG ya vienen comprimidos), escrito a mano
// para no meter una dependencia nueva en las funciones del concierto.
const FOTOS_ZIP_MAX_FILES = 100;
const FOTOS_ZIP_MAX_BYTES = 24 * 1024 * 1024;   // holgado bajo el tope de respuesta
const FOTOS_CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function fotosCrc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = FOTOS_CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function fotosZip(files) {           // files: [{ name, data: Buffer }]
  const u16 = (v) => Buffer.from([v & 255, (v >>> 8) & 255]);
  const u32 = (v) => Buffer.from([v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]);
  const local = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const crc = fotosCrc32(f.data), size = f.data.length;
    local.push(u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
               u32(crc), u32(size), u32(size), u16(name.length), u16(0), name, f.data);
    central.push(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
                 u32(crc), u32(size), u32(size), u16(name.length), u16(0), u16(0),
                 u16(0), u16(0), u32(0), u32(offset), name);
    offset += 30 + name.length + size;
  }
  const cdSize = central.reduce((n, b) => n + b.length, 0);
  const eocd = [u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
                u32(cdSize), u32(offset), u16(0)];
  return Buffer.concat([...local, ...central, ...eocd]);
}

const FOTOS_STYLES = ["mosaico", "carrusel", "libre", "auto"];
const FOTOS_MODES = ["una", "varias"];
const FOTOS_MULTI_MAX = 4;                    // fotos vivas por móvil en modo "varias"
const FOTOS_MULTI_RATE_N = 2;                 // subidas permitidas…
const FOTOS_MULTI_RATE_MS = 5 * 60 * 1000;    // …por ventana de 5 minutos
async function fotosState(banda) {
  const s = await db.doc(`bands/${banda}/publicLive/current`).get();
  const d = s.exists ? (s.data() || {}) : {};
  return { enabled: d.photosEnabled === true,
           style: FOTOS_STYLES.includes(d.photosStyle) ? d.photosStyle : "mosaico",
           mode: FOTOS_MODES.includes(d.photosMode) ? d.photosMode : "una",
           // MODERACIÓN APAGADA (07-09-2026): para bolos pequeños entre amigos.
           // Por defecto ENCENDIDA (todo sigue igual que hasta hoy). Apagada,
           // la pantalla enseña también las pendientes: nadie tiene que estar
           // aprobando fotos que no van a dar problema. La subida NO cambia.
           moderation: d.photosModeration !== false };
}
async function fotosEnabled(banda) { return (await fotosState(banda)).enabled; }

export const fotos = onRequest(
  { region: "europe-west1", memory: "256MiB", timeoutSeconds: 30, maxInstances: 10, cors: true },
  async (req, res) => {
    try {
      const q = req.method === "GET" ? req.query : (req.body || {});
      const op = String(q.op || "");
      const banda = String(q.banda || "");
      if (!ID_RE.test(banda)) return fotosJson(res, 400, { error: "banda" });
      const col = db.collection(`bands/${banda}/photos`);
      const bucket = getStorage().bucket(FOTOS_BUCKET);

      // ── Público ──────────────────────────────────────────────────────
      if (op === "approved" && req.method === "GET") {
        const { enabled, style, mode, moderation } = await fotosState(banda);
        if (!enabled) return fotosJson(res, 200, { enabled: false, style, mode, moderation, photos: [] });
        // Sin moderación, las pendientes cuentan como aprobadas para la pantalla.
        const snap = moderation
          ? await col.where("status", "==", "approved").get()
          : await col.where("status", "in", ["approved", "pending"]).get();
        const photos = snap.docs.map(fotosDocOut)
          .sort((a, b) => (b.approvedAt || b.createdAt || 0) - (a.approvedAt || a.createdAt || 0)).slice(0, FOTOS_MAX_LIST);
        return fotosJson(res, 200, { enabled: true, style, mode, moderation, photos });
      }

      if (op === "upload" && req.method === "POST") {
        const device = String(q.device || "");
        if (!ID_RE.test(device)) return fotosJson(res, 400, { error: "device" });
        const st = await fotosState(banda);
        if (!st.enabled) return fotosJson(res, 403, { error: "disabled" });
        // Destino según el MODO que eligió el moderador:
        //  · "una" (por defecto): un doc por móvil (id = huella); subir otra
        //    sustituye la suya. Anti-spam para salas llenas.
        //  · "varias": hasta 4 fotos vivas por móvil (ids huella~1…~4) y como
        //    mucho 2 subidas por móvil cada 5 min. Para bolos con poca gente.
        let targetId = device;
        let prev = await col.doc(device).get();
        if (st.mode === "varias") {
          const mine = (await col.where("device", "==", device).get()).docs.slice();
          if (prev.exists && !mine.some((d) => d.id === device)) mine.push(prev);
          const now = Date.now();
          const recent = mine.filter((d) => { const u = d.data()?.updatedAt?.toMillis?.(); return u && now - u < FOTOS_MULTI_RATE_MS; });
          if (recent.length >= FOTOS_MULTI_RATE_N) return fotosJson(res, 429, { error: "rate" });
          targetId = null;
          for (let k = 1; k <= FOTOS_MULTI_MAX; k++) {
            const id = `${device}~${k}`;
            if (!mine.some((d) => d.id === id)) { targetId = id; break; }
          }
          if (!targetId) {
            // Las 4 llenas: la nueva sustituye a la MÁS ANTIGUA del móvil.
            const oldest = mine.filter((d) => d.id !== device)
              .sort((a, b) => (a.data()?.updatedAt?.toMillis?.() || 0) - (b.data()?.updatedAt?.toMillis?.() || 0))[0];
            targetId = oldest ? oldest.id : `${device}~1`;
          }
          prev = await col.doc(targetId).get();
        } else {
          // Ritmo del modo "una": una subida por dispositivo cada 15 s.
          const prevAt = prev.exists ? prev.data()?.updatedAt?.toMillis?.() : null;
          if (prevAt && Date.now() - prevAt < FOTOS_MIN_INTERVAL_MS) return fotosJson(res, 429, { error: "rate" });
        }
        let b64 = String(q.image || "");
        const comma = b64.indexOf(",");
        if (b64.startsWith("data:") && comma > 0) b64 = b64.slice(comma + 1);
        const buf = Buffer.from(b64, "base64");
        if (buf.length < 1024 || buf.length > FOTOS_MAX_BYTES) return fotosJson(res, 413, { error: "size" });
        if (!(buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)) return fotosJson(res, 415, { error: "jpeg" });
        const path = `photos/${banda}/${targetId}.jpg`;
        const token = randomUUID();
        await bucket.file(path).save(buf, {
          resumable: false,
          metadata: { contentType: "image/jpeg", cacheControl: "public, max-age=31536000, immutable",
                      metadata: { firebaseStorageDownloadTokens: token } },
        });
        const url = `https://firebasestorage.googleapis.com/v0/b/${FOTOS_BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
        await col.doc(targetId).set({
          status: "pending", path, url, device,
          createdAt: prev.exists ? (prev.data()?.createdAt || FieldValue.serverTimestamp()) : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(), approvedAt: null,
          expiresAt: Timestamp.fromMillis(Date.now() + FOTOS_TTL_MS),
        });
        return fotosJson(res, 200, { ok: true });
      }

      // ── Moderador (clave) ────────────────────────────────────────────
      if (!(await fotosKeyOk(banda, String(q.clave || "")))) return fotosJson(res, 401, { error: "clave" });

      // Solo con la clave MAESTRA: leer/crear la clave propia de la banda
      // (para administrar; la app la crea por su cuenta vía Firestore).
      if (op === "bandkey" && req.method === "POST") {
        if (!fotosEq(String(q.clave || ""), process.env.FOTOS_KEY || "")) return fotosJson(res, 401, { error: "clave" });
        const ref = db.doc(`bands/${banda}/moderation/current`);
        const s = await ref.get();
        let key = s.exists ? String(s.data()?.key || "") : "";
        // rotate:true → clave NUEVA aunque exista (revoca los enlaces repartidos).
        if (q.rotate === true || q.rotate === "true") key = "";
        if (!key) {
          const AB = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          key = "FOTOS-" + Array.from({ length: 8 }, () => AB[Math.floor(Math.random() * AB.length)]).join("");
          await ref.set({ key, createdAt: FieldValue.serverTimestamp() }, { merge: true });
        }
        return fotosJson(res, 200, { ok: true, key });
      }

      if (op === "queue" && req.method === "GET") {
        const { enabled, style, mode, moderation } = await fotosState(banda);
        const snap = await col.get();
        const all = snap.docs.map(fotosDocOut);
        const by = (st) => all.filter((p) => p.status === st);
        const newestFirst = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
        return fotosJson(res, 200, {
          enabled, style, mode, moderation,
          pending:  by("pending").sort(newestFirst),
          approved: by("approved").sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0)),
          rejected: by("rejected").length,
        });
      }
      // El RECUERDO de la noche: un zip con las fotos aprobadas y las que
      // quedaron pendientes, en el orden en que se subieron. Las RECHAZADAS
      // no van: el moderador las apartó por algo.
      if (op === "zip" && req.method === "GET") {
        const snap = await col.get();
        const wanted = snap.docs
          .map((d) => ({ v: d.data() || {} }))
          .filter((x) => x.v.path && (x.v.status === "approved" || x.v.status === "pending"))
          .sort((a, b) => {
            const t = (x) => (x.v.createdAt && typeof x.v.createdAt.toMillis === "function")
              ? x.v.createdAt.toMillis() : 0;
            return t(a) - t(b);
          })
          .slice(0, FOTOS_ZIP_MAX_FILES);
        const files = [];
        let total = 0;
        for (const x of wanted) {
          let buf;
          try { [buf] = await bucket.file(x.v.path).download(); }
          catch (_) { continue; }                       // una foto perdida no tumba el zip
          if (total + buf.length > FOTOS_ZIP_MAX_BYTES) break;
          total += buf.length;
          files.push({ name: `foto-${String(files.length + 1).padStart(2, "0")}.jpg`, data: buf });
        }
        if (!files.length) return fotosJson(res, 404, { error: "vacio" });
        const zip = fotosZip(files);
        const fecha = new Date().toISOString().slice(0, 10);
        res.set("Cache-Control", "no-store");
        res.set("Content-Type", "application/zip");
        res.set("Content-Length", String(zip.length));
        res.set("Content-Disposition", `attachment; filename="fotos-bolo-${fecha}.zip"`);
        return res.status(200).send(zip);
      }
      if ((op === "approve" || op === "reject" || op === "remove") && req.method === "POST") {
        const id = String(q.id || "");
        if (!/^[A-Za-z0-9_-]{1,80}(~[1-9])?$/.test(id)) return fotosJson(res, 400, { error: "id" });
        const ref = col.doc(id);
        if (op === "remove") {
          const d = await ref.get();
          if (d.exists && d.data()?.path) await bucket.file(d.data().path).delete({ ignoreNotFound: true });
          await ref.delete();
          return fotosJson(res, 200, { ok: true });
        }
        await ref.set({ status: op === "approve" ? "approved" : "rejected",
                        approvedAt: op === "approve" ? FieldValue.serverTimestamp() : null,
                        moderatedAt: FieldValue.serverTimestamp() }, { merge: true });
        return fotosJson(res, 200, { ok: true });
      }
      if (op === "toggle" && req.method === "POST") {
        const enabled = q.enabled === true || q.enabled === "true" || q.enabled === 1 || q.enabled === "1";
        await db.doc(`bands/${banda}/publicLive/current`).set({ photosEnabled: enabled }, { merge: true });
        return fotosJson(res, 200, { ok: true, enabled });
      }
      if (op === "moderation" && req.method === "POST") {
        const on = !(q.enabled === false || q.enabled === "false" || q.enabled === 0 || q.enabled === "0");
        await db.doc(`bands/${banda}/publicLive/current`).set({ photosModeration: on }, { merge: true });
        return fotosJson(res, 200, { ok: true, moderation: on });
      }
      if (op === "style" && req.method === "POST") {
        const style = String(q.style || "");
        if (!FOTOS_STYLES.includes(style)) return fotosJson(res, 400, { error: "style" });
        await db.doc(`bands/${banda}/publicLive/current`).set({ photosStyle: style }, { merge: true });
        return fotosJson(res, 200, { ok: true, style });
      }
      if (op === "mode" && req.method === "POST") {
        const mode = String(q.mode || "");
        if (!FOTOS_MODES.includes(mode)) return fotosJson(res, 400, { error: "mode" });
        await db.doc(`bands/${banda}/publicLive/current`).set({ photosMode: mode }, { merge: true });
        return fotosJson(res, 200, { ok: true, mode });
      }
      if (op === "purge" && req.method === "POST") {
        const snap = await col.get();
        let n = 0;
        for (const d of snap.docs) {
          const p = d.data()?.path;
          if (p) await bucket.file(p).delete({ ignoreNotFound: true });
          await d.ref.delete(); n++;
        }
        return fotosJson(res, 200, { ok: true, deleted: n });
      }
      return fotosJson(res, 400, { error: "op" });
    } catch (e) {
      console.error("fotos:", e);
      return fotosJson(res, 500, { error: "server" });
    }
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL DEL MÚSICO — enlace «bonito» por banda (07-09-2026)
//
// WhatsApp, Telegram y compañía NO ejecutan la web: leen las etiquetas Open
// Graph fijas de la página. Para que al compartir salga el NOMBRE y el LOGO de
// cada banda, cada banda tiene su enlace: /musicos/b/{bandId}. Esta función
// devuelve una página mínima con las etiquetas rellenas (nombre, logo, texto)
// y redirige al portal de verdad en cuanto la abre una persona. Los robots de
// las redes se quedan con la tarjeta; la gente ni lo nota.
// Público por diseño: solo expone nombre y logo de la banda (lo mismo que ya
// enseña el cartel del QR); nada de canciones ni agenda.
// ═══════════════════════════════════════════════════════════════════════════
const PORTAL_BASE = "https://idoctormusicband.web.app";
const PORTAL_OG = `${PORTAL_BASE}/og/musicos.jpg`;
const escHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ── /api/audio — PUENTE DEL AUDIO PARA CAMBIAR EL TONO (08-09-2026) ───────
//
// EL PORQUÉ: en el jukebox de la web, subir el tono subía también la velocidad
// (playbackRate con preservesPitch=false, el método viejo de la intranet).
// Separarlos exige meter el audio en Web Audio, y el navegador SILENCIA
// cualquier audio de otro sitio que no mande cabeceras CORS. Dropbox no las
// manda (comprobado: el audio suena, pero llega a cero a Web Audio).
//
// Esta función es el puente: descarga el audio de la banda y lo devuelve con
// CORS, respetando el Range para que se pueda ir por la mitad de la canción.
//
// NO ES UN PROXY ABIERTO: no acepta una URL cualquiera, sino la banda y la
// canción; el enlace sale de `bands/{banda}/songs/{cancion}.linkAudio`. Y el
// portal SOLO lo usa cuando el tono está cambiado: con el tono a cero, el
// audio va directo de Dropbox como hasta hoy, sin gastar nada.
// Quién puede pedir el audio de una banda: el dueño (su uid ES el bandId) o un
// miembro con su entrada en `groupAuth` — copia fiel de isOwnerOf/isMemberOf
// de firestore.rules, que es lo que ya decide quién lee `songs/{id}.linkAudio`.
// El admin de plataforma no se contempla aquí a propósito (no usa el jukebox).
// Se recuerda por instancia: el <audio> vuelve a llamar en cada salto (Range)
// y no hace falta releer Firestore cada vez.
const audioAcceso = new Map();
async function audioPuedeLeer(uid, bandId) {
  if (!uid) return false;
  if (uid === bandId) return true;
  const k = uid + "|" + bandId, c = audioAcceso.get(k);
  if (c && Date.now() - c.at < (c.ok ? 5 * 60_000 : 30_000)) return c.ok;
  const ok = (await db.doc(`bands/${bandId}/groupAuth/${uid}`).get()).exists;
  if (audioAcceso.size > 2000) audioAcceso.clear();
  audioAcceso.set(k, { ok, at: Date.now() });
  return ok;
}

export const audio = onRequest(
  { region: "europe-west1", memory: "256MiB", timeoutSeconds: 120, maxInstances: 10, cors: false },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Range");
    res.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges, Content-Type");
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const bandId = String(req.query.b || "").trim();
    const songId = String(req.query.s || "").trim();
    if (!/^[A-Za-z0-9_-]{6,}$/.test(bandId) || !songId || songId.includes("/") || songId.length > 200) {
      res.status(400).send("faltan banda y canción"); return;
    }
    // IDENTIFICACIÓN (24-09-2026). Antes bastaban el id de la banda (va en el
    // QR) y el de una canción (viaja en las votaciones públicas) para llevarse
    // su audio — misteriosa incluida. Ahora hay que ser quien ya puede leer esa
    // canción. El token va en la URL (`t`) porque un <audio> no manda cabeceras.
    const token = String(req.query.t || "");
    if (!token) { res.status(401).send("hay que identificarse"); return; }
    let uid = "";
    try { uid = (await getAuth().verifyIdToken(token)).uid; }
    catch (e) { res.status(401).send("identificación no válida o caducada"); return; }
    try {
      if (!(await audioPuedeLeer(uid, bandId))) { res.status(403).send("sin acceso a esta banda"); return; }
    } catch (e) { console.error("audio acceso:", e); res.status(500).send("error"); return; }
    try {
      const snap = await db.doc(`bands/${bandId}/songs/${songId}`).get();
      if (!snap.exists) { res.status(404).send("canción no encontrada"); return; }
      let url = String(snap.data().linkAudio || "").trim();
      if (!/^https:\/\//i.test(url)) { res.status(404).send("esa canción no tiene audio"); return; }
      // Mismo apaño que el jukebox: el enlace de Dropbox se pide en crudo.
      if (url.includes("dropbox.com")) {
        url = url.match(/dl=[01]/) ? url.replace(/dl=[01]/g, "raw=1")
                                   : (url.includes("raw=1") ? url : url + (url.includes("?") ? "&" : "?") + "raw=1");
      }
      const cabeceras = {};
      if (req.headers.range) cabeceras.Range = req.headers.range;
      const r = await fetch(url, { headers: cabeceras, redirect: "follow" });
      if (!r.ok && r.status !== 206) { res.status(502).send("no se pudo leer el audio"); return; }
      for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
        const v = r.headers.get(h);
        if (v) res.set(h, v);
      }
      if (!r.headers.get("accept-ranges")) res.set("Accept-Ranges", "bytes");
      res.set("Cache-Control", "private, max-age=3600");
      res.status(r.status === 206 ? 206 : 200);
      // Se manda tal cual llega, sin cargarlo entero en memoria.
      const { Readable } = await import("node:stream");
      Readable.fromWeb(r.body).pipe(res);
    } catch (e) {
      console.error("audio:", e);
      res.status(500).send("error");
    }
  }
);

export const portal = onRequest(
  { region: "europe-west1", memory: "256MiB", timeoutSeconds: 15, maxInstances: 5 },
  async (req, res) => {
    try {
      // Acepta /musicos/b/{bandId} (rewrite de hosting) y ?banda={bandId}
      const m = (req.path || "").match(/\/b\/([A-Za-z0-9_-]{6,})/);
      const bandId = m ? m[1] : String(req.query.banda || "");
      let name = "", logo = "";
      if (bandId) {
        const [band, presets] = await Promise.all([
          db.doc(`bands/${bandId}`).get(),
          db.doc(`bands/${bandId}/presets/main`).get(),
        ]);
        if (band.exists) name = band.data().name || "";
        if (presets.exists) logo = presets.data().logoUrl || "";
      }
      const titulo = name ? `${name} · iDoctor MusicBand Web` : "iDoctor MusicBand Web · Portal del músico";
      const descripcion = name
        ? `Portal de ${name}: conciertos, ensayos, setlists, letras con acordes y jukebox de la banda. Entra con tu Google o con tu nombre de músico.`
        : "El portal de tu banda: conciertos, ensayos, setlists, letras con acordes y jukebox, desde cualquier móvil u ordenador.";
      const destino = `${PORTAL_BASE}/musicos/${name ? "?banda=" + encodeURIComponent(name) : ""}`;
      const imagen = logo || PORTAL_OG;
      const url = `${PORTAL_BASE}/musicos/b/${encodeURIComponent(bandId)}`;
      res.set("Cache-Control", "public, max-age=300, s-maxage=600");
      res.status(200).send(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${escHtml(titulo)}</title>
<meta name="description" content="${escHtml(descripcion)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="iDoctor MusicBand Web">
<meta property="og:title" content="${escHtml(titulo)}">
<meta property="og:description" content="${escHtml(descripcion)}">
<meta property="og:url" content="${escHtml(url)}">
<meta property="og:image" content="${escHtml(imagen)}">
${logo ? "" : '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'}
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="${logo ? "summary" : "summary_large_image"}">
<meta name="twitter:title" content="${escHtml(titulo)}">
<meta name="twitter:description" content="${escHtml(descripcion)}">
<meta name="twitter:image" content="${escHtml(imagen)}">
<meta name="theme-color" content="#0a0e14">
<meta http-equiv="refresh" content="0; url=${escHtml(destino)}">
<link rel="canonical" href="${escHtml(destino)}">
<style>body{margin:0;background:#0a0e14;color:#fff;font-family:-apple-system,system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}a{color:#00e5ff}</style>
</head><body><div><p>Abriendo el portal de <b>${escHtml(name || "tu banda")}</b>…</p><p><a href="${escHtml(destino)}">Pulsa aquí si no se abre solo</a></p></div>
<script>location.replace(${JSON.stringify(destino)});</script></body></html>`);
    } catch (e) {
      console.error("portal:", e);
      res.redirect(302, `${PORTAL_BASE}/musicos/`);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
//  DEMO EN VIVO DEL CONCIERTO INTERACTIVO (16-10-2026) — la portada de
//  idoctormusicband.web.app enseña la pantalla de sala de una banda de
//  demostración: quien entra escanea el QR, vota con su móvil y ve su voto
//  aparecer, con reveal, podio y confeti, como en un bolo de verdad.
//
//  · Una sola banda, FIJA aquí (DEMO_BANDA). La función no recibe parámetros:
//    no puede escribir en ninguna otra parte.
//  · Se mueve SOLA mientras alguien mira: la pantalla y la página de votar de
//    la banda demo llaman a /api/demo cada pocos segundos; con nadie mirando no
//    pasa nada (coste cero). Cada llamada avanza la máquina de estados en una
//    TRANSACCIÓN: abrir ronda → añadir público simulado → cerrar con podio →
//    dejar el reveal unos segundos → abrir la siguiente.
//  · El público simulado se dice en la portada («tu voto es real; el resto del
//    público, simulado»): en una demo vacía nadie vería moverse las barras.
//  · Los documentos se escriben con los MISMOS campos que la app
//    (LivePollService.openPoll/closePoll), incluida `candidateSongIds`, que es
//    lo que las reglas miran para aceptar el voto del público.
//  · El título real de la canción misteriosa vive en `_demo/estado`, que el
//    público no puede leer (ninguna regla lo abre); solo se publica si gana.
// ═══════════════════════════════════════════════════════════════════════════
const DEMO_BANDA = "demo-concierto";
const DEMO_SETLIST = "demo";
const DEMO_ABIERTA_MS = 40_000;      // lo que dura cada votación
const DEMO_REVEAL_MS = 15_000;       // podio y confeti antes de la siguiente
const DEMO_BOT_CADA_MS = 2_500;      // ritmo del público simulado
const DEMO_CANCIONES = [
  ["La flaca", "Jarabe de Palo"], ["Sufre mamón", "Hombres G"], ["Rosas", "La Oreja de Van Gogh"],
  ["Entre dos tierras", "Héroes del Silencio"], ["Mediterráneo", "Joan Manuel Serrat"],
  ["Insurrección", "El Último de la Fila"], ["La chica de ayer", "Nacha Pop"],
  ["Lucha de gigantes", "Nacha Pop"], ["Corazón espinado", "Santana y Maná"],
  ["Bailando", "Alaska y los Pegamoides"], ["Devuélveme a mi chica", "Hombres G"],
  ["Chiquilla", "Seguridad Social"], ["Sweet Child O' Mine", "Guns N' Roses"],
  ["Don't Stop Me Now", "Queen"], ["Livin' on a Prayer", "Bon Jovi"], ["Mr. Brightside", "The Killers"],
  ["Dancing Queen", "ABBA"], ["Highway to Hell", "AC/DC"], ["Seven Nation Army", "The White Stripes"],
  ["Twist and Shout", "The Beatles"],
].map(([title, artist], i) => ({ songId: "demo" + String(i + 1).padStart(2, "0"), title, artist }));
const DEMO_PERFIL = {
  bandName: "Banda de demostración",
  activeSetlistId: DEMO_SETLIST,
  logoUrl: "https://idoctormusicband.web.app/musicos/icon-180.png",
  messages: [
    "Esto es una demo: vota lo que quieras, aquí nadie se enfada 😄",
    "Así lo vive tu público en un bolo de verdad 🎤",
    "Tu voto es real; el resto del público, simulado 🤖",
    "Cada ronda dura 40 segundos. ¡Corre!",
    "¿Te lo imaginas con tu banda? iDoctor MusicBand es gratis",
  ],
  photosEnabled: false,
};

function demoRonda() {
  const pool = [...DEMO_CANCIONES];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const elegidas = pool.slice(0, 4);
  // Una ronda de cada tres, más o menos, trae «canción misteriosa».
  const misterio = Math.random() < 0.35 ? elegidas[Math.floor(Math.random() * 4)] : null;
  // Preferencias del público simulado: una favorita clara y el resto repartido.
  const fav = Math.floor(Math.random() * 4);
  const pesos = elegidas.map((_, i) => (i === fav ? 3 : 1) + Math.random() * 1.5);
  return { elegidas, misterio, pesos, objetivo: 9 + Math.floor(Math.random() * 7) };
}
function demoSorteo(pesos) {
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pesos.length; i++) { r -= pesos[i]; if (r <= 0) return i; }
  return pesos.length - 1;
}

// ── LA BANDA DE DEMOSTRACIÓN DENTRO DE LA APP (28-10-2026) ──────────────────
// La app deja «Ver la demo» sin cuenta: entra como ESPECTADOR en esta misma
// banda (DEMO_BANDA) con unas credenciales públicas, por el acceso de músico
// de siempre (`groups/{id}` + `groupAuth`). Aquí se SIEMBRA lo que ve:
//   · el doc de la banda y la ficha del miembro «Invitado» (viewer),
//   · las canciones propias de Juan que él elija (se COPIAN de su banda por
//     el título; nunca se tocan las originales) y la canción de bienvenida de
//     la app (trae sus pistas demo empaquetadas, así el Show suena),
//   · un setlist con ellas, y un ensayo y un concierto en la agenda.
// Se ejecuta con `POST /api/demo?op=seed&clave=…` (DEMO_KEY, en el .env) y es
// idempotente: se puede volver a lanzar cuando Juan termine una canción.
const DEMO_FUENTE = "7sOz3LnqNGOEuLLyDGwMLCprXcy1";       // El Sótano del Doctor (única fuente admitida)
const DEMO_TITULOS = ["Qué más da", "Una semana"];
const DEMO_MIEMBRO = { nombre: "Invitado", clave: "demo" };
const normTitulo = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const slug = s => normTitulo(s).replace(/ /g, "-").slice(0, 40);
// Mismo hash que GroupsManager.hash en la app: SHA-256("iDoctorMusicBand::" + clave).
const hashClaveApp = p => createHash("sha256").update("iDoctorMusicBand::" + p, "utf8").digest("hex");
// Mismo id que GroupsManager.memberDocId(bandName:memberName:) en la app.
const sanitizeApp = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9\-_]/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);

function cancionBienvenida() {
  return {
    id: "cancion-bienvenida-idoctor", title: "Bienvenido a iDoctor MusicBand", artist: "Tutorial de la app",
    keyOriginal: "F#m", keyPlay: "", bpm: 100, meter: 4, subdivision: 1, durationSecs: 39, capo: "2", capoFret: 2,
    guitar: "", liveFlag: "green", tags: "tutorial", songType: "", state: "Activa", readiness: "Lista para directo",
    concertType: "", pollWins: 0, videoSlot: 0, videoEnabled: false, vocal: "", twoColumns: false, columnBreak: 0,
    lyricsFormat: "", lyricsHtml: "", lyricsRight: "", linkAudio: "", linkPdf: "", linkYouTube: "", midiPresetIds: [],
    notesTech: "", externalSource: "demo", externalId: "",
    notesMusic: "Canción de ejemplo con pistas demo sintetizadas (batería, bajo, teclas y click guía). Ábrela en VER EN DIRECTO para probar los gestos que cuenta la letra.",
    chords: "Progresión completa: Em  C  G  D\nCon la cejilla en el 2º traste suena: F#m  D  A  E\n\nEm: 022000    C: x32010    G: 320003    D: xx0232\n\nLos stems demo van a 100 BPM en Fa sostenido menor,\nla misma tonalidad que produce la cejilla.",
    lyrics: [
      "[Intro]", "Em  C  G  D", "",
      "[Estrofa 1]", "Em                          C", "Bienvenido a tu nuevo directo,", "G                        D", "esta guía se lee y se toca.",
      "Em                            C", "Toca el borde derecho y avanzas,", "G                          D", "el izquierdo te lleva atrás.", "",
      "[Preestribillo]", "Em                      C", "Junta dos dedos sobre la letra:", "G                            D", "el tamaño crece y baja contigo.", "",
      "[Estribillo]", "Em                        C", "Doble toque: arranca el autoscroll,", "G                       D", "la canción camina sola.",
      "Em                          C", "Pulsa Pistas y suena la banda:", "G                            D", "mezcla, click y voz de órdenes.", "",
      "[Estrofa 2]", "Em                          C", "La cejilla está en el traste dos,", "G                                D", "por eso ves posturas de Mi menor.",
      "Em                        C", "Con el lápiz haces anotaciones,", "G                              D", "y en el menú eliges tu vista.", "",
      "[Final]", "Em                        C", "Cuando ya no necesites la guía,", "G                    D            Em", "borra esta canción... y a tocar.",
    ].join("\n"),
  };
}

async function demoSeed(titulos) {
  const banda = db.doc(`bands/${DEMO_BANDA}`);
  const ahora = Timestamp.now();
  const informe = { copiadas: [], noEncontradas: [] };
  // 1) El doc de la banda (merge: no pisa lo que ya tenga).
  await banda.set({
    id: DEMO_BANDA, ownerUid: DEMO_BANDA, ownerEmail: "", name: DEMO_PERFIL.bandName, demo: true,
    subscriptionStatus: "lifetime", subscriptionPlan: "lifetime", subscriptionExpiresAt: null, isLifetime: true,
    lastActiveAt: ahora, createdAt: ahora,
  }, { merge: true });
  // 2) La ficha del miembro público (espectador: solo lectura).
  const groupId = sanitizeApp(DEMO_PERFIL.bandName) + "__" + sanitizeApp(DEMO_MIEMBRO.nombre);
  await db.doc(`groups/${groupId}`).set({
    id: groupId, name: DEMO_MIEMBRO.nombre, passwordHash: hashClaveApp(DEMO_MIEMBRO.clave), bandId: DEMO_BANDA,
    ownerEmail: "", createdAt: ahora, role: "", access: "viewer", bandName: DEMO_PERFIL.bandName, memberEmail: "",
  }, { merge: true });
  // 3) Las canciones: las de Juan (copiadas por título) y la de bienvenida.
  const fuente = await db.collection(`bands/${DEMO_FUENTE}/songs`).get();
  const porTitulo = new Map();
  fuente.docs.forEach(d => { const x = d.data(); if (!x.deletedAt) porTitulo.set(normTitulo(x.title), x); });
  const songIds = [];
  for (const t of titulos) {
    const x = porTitulo.get(normTitulo(t));
    if (!x) { informe.noEncontradas.push(t); continue; }
    const id = "demo-" + slug(x.title);
    const copia = { ...x, id, deletedAt: null, pollWins: 0, videoSlot: 0, videoEnabled: false, midiPresetIds: [],
                    annotationData: null, annotationUrl: "", externalSource: "demo", externalId: "", updatedAt: ahora };
    delete copia.annotationData;
    await banda.collection("songs").doc(id).set(copia);
    songIds.push(id); informe.copiadas.push(x.title);
  }
  const bienvenida = cancionBienvenida();
  await banda.collection("songs").doc(bienvenida.id).set({ ...bienvenida, createdAt: ahora, updatedAt: ahora }, { merge: true });
  songIds.push(bienvenida.id);
  // 4) El setlist (mismo id que usa la demo del Concierto Interactivo) y sus filas.
  await banda.collection("setlists").doc(DEMO_SETLIST).set({
    id: DEMO_SETLIST, name: "Setlist de demostración", concertDate: null, notes: "Prueba el Show: letra, autoscroll, pistas y acordes.",
    location: "", bandHelperUrl: "", bandHelperAutoSync: false, externalSource: "demo", externalId: "", isFavorite: true,
    concertType: "", smartFilter: null, pollPoolId: null, hiddenFor: [], createdAt: ahora, updatedAt: ahora,
  }, { merge: true });
  const viejas = await banda.collection("setlist_items").where("setlistId", "==", DEMO_SETLIST).get();
  for (const d of viejas.docs) await d.ref.delete();
  for (let i = 0; i < songIds.length; i++) {
    const id = `demo-item-${i + 1}`;
    await banda.collection("setlist_items").doc(id).set({
      id, setlistId: DEMO_SETLIST, order: i, itemType: "song", songId: songIds[i], note: "", label: "",
      opensVote: false, linkedToNext: false, createdAt: ahora,
    });
  }
  // 5) La agenda: un ensayo la semana que viene y un bolo dentro de tres.
  const dia = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return Timestamp.fromDate(d); };
  await banda.collection("rehearsals").doc("demo-ensayo").set({
    id: "demo-ensayo", date: dia(7), time: "20:00", place: "Local de ensayo", address: "", mapsUrl: "",
    goals: "Repasar el setlist de demostración", notes: "", durationMins: 120, setlistId: DEMO_SETLIST,
    createdAt: ahora, externalSource: "demo", externalId: "", hiddenFor: [], deletedAt: null,
  }, { merge: true });
  await banda.collection("concerts").doc("demo-bolo").set({
    id: "demo-bolo", name: "Concierto de demostración", category: "", venue: "Sala de pruebas", city: "Tu ciudad", address: "", mapsUrl: "",
    date: dia(21), endDate: null, timeStart: "22:00", timeEnd: "", timeArrival: "19:00", timeSetup: "19:30", timeSound: "20:30", timeShow: "22:00",
    promoter: "", cache: "", notes: "Con votación del público (Concierto Interactivo).", status: "Confirmado", setlistId: DEMO_SETLIST,
    checklist: [], createdAt: ahora, externalSource: "demo", externalId: "", hiddenFor: [], deletedAt: null,
  }, { merge: true });
  informe.setlist = songIds.length; informe.miembro = groupId;
  return informe;
}

export const demo = onRequest(
  { region: "europe-west1", memory: "256MiB", timeoutSeconds: 60, maxInstances: 3, cors: false },
  async (req, res) => {
    res.set("Cache-Control", "no-store");
    // Siembra de la banda de demostración (con clave; nunca por GET).
    if (req.method === "POST" && String(req.query.op || "") === "seed") {
      const clave = String(req.query.clave || ""), buena = process.env.DEMO_KEY || "";
      if (!buena || clave.length !== buena.length || !fotosEq(clave, buena)) { res.status(401).json({ error: "clave" }); return; }
      const titulos = String(req.query.titulos || "").split(",").map(s => s.trim()).filter(Boolean);
      try {
        const informe = await demoSeed(titulos.length ? titulos : DEMO_TITULOS);
        res.json({ ok: true, ...informe });
      } catch (e) { console.error("demo seed:", e); res.status(500).json({ error: String(e.message || e) }); }
      return;
    }
    if (req.method !== "GET") { res.status(405).send(""); return; }
    const banda = db.doc(`bands/${DEMO_BANDA}`);
    const perfilRef = banda.collection("publicLive").doc("current");
    const pollRef = banda.collection("setlists").doc(DEMO_SETLIST).collection("livePoll").doc("current");
    const votosCol = banda.collection("setlists").doc(DEMO_SETLIST).collection("livePollVotes");
    const estadoRef = db.doc("_demo/estado");
    try {
      const fuera = await db.runTransaction(async (t) => {
        const [estadoSnap, pollSnap, perfilSnap] = await Promise.all([t.get(estadoRef), t.get(pollRef), t.get(perfilRef)]);
        const e = estadoSnap.exists ? estadoSnap.data() : {};
        const poll = pollSnap.exists ? pollSnap.data() : null;
        const ahora = Date.now();
        const abierta = !!(poll && poll.isOpen && e.pollId === poll.pollId);
        const cierra = e.cierraEn || 0, cerrada = e.cerradaEn || 0;

        // 1) Toca ABRIR: no hay ronda, o el reveal de la anterior ya pasó.
        if (!abierta && (!poll || !e.pollId || ahora - cerrada >= DEMO_REVEAL_MS)) {
          const viejos = await t.get(votosCol.limit(400));
          const r = demoRonda(), pollId = randomUUID();
          viejos.docs.forEach(d => t.delete(d.ref));
          if (!perfilSnap.exists) t.set(perfilRef, { ...DEMO_PERFIL, updatedAt: Timestamp.now() });
          t.set(pollRef, {
            pollId, isOpen: true, bandName: DEMO_PERFIL.bandName,
            candidateSongIds: r.elegidas.map(c => c.songId),
            candidates: r.elegidas.map(c => r.misterio && c.songId === r.misterio.songId
              ? { songId: c.songId, title: "🎁 ???", artist: "", isMystery: true }
              : { ...c, isMystery: false }),
            openedAt: Timestamp.fromMillis(ahora), closesAt: Timestamp.fromMillis(ahora + DEMO_ABIERTA_MS),
            closedAt: null, winnerSongId: null, podium: null, participants: null, overtime: null, topic: null,
            social: { instagram: "", spotify: "", youtube: "", website: "", tiktok: "", facebook: "" },
          });
          t.set(estadoRef, { pollId, cierraEn: ahora + DEMO_ABIERTA_MS, cerradaEn: 0, misterio: r.misterio,
                             pesos: r.pesos, objetivo: r.objetivo, bots: 0, ultimoBot: ahora });
          return { fase: "abierta", queda: DEMO_ABIERTA_MS };
        }

        // 2) Toca CERRAR: se acabó el reloj. Mismo criterio que la app: gana la
        //    más votada y, en empate, la primera de la lista; podio de tres.
        if (abierta && ahora >= cierra) {
          const votos = await t.get(votosCol.where("pollId", "==", e.pollId));
          const cuenta = {};
          votos.docs.forEach(d => { const s = d.data().songId; cuenta[s] = (cuenta[s] || 0) + 1; });
          const cands = poll.candidates || [];
          const total = Object.values(cuenta).reduce((a, b) => a + b, 0);
          const orden = cands.map((c, i) => ({ c, i, v: cuenta[c.songId] || 0 })).sort((a, b) => b.v - a.v || a.i - b.i);
          const ganadora = total ? orden[0].c : null;
          const podium = total ? orden.slice(0, 3).map(({ c, v }) => {
            const revelada = c.isMystery && ganadora && c.songId === ganadora.songId && e.misterio;
            return { songId: c.songId, title: revelada ? e.misterio.title : c.title, artist: revelada ? e.misterio.artist : c.artist,
                     votes: v, pct: Math.floor(v * 100 / total), wasMystery: !!revelada };
          }) : null;
          t.update(pollRef, { isOpen: false, closedAt: Timestamp.fromMillis(ahora), closesAt: null, overtime: null,
                              winnerSongId: ganadora ? ganadora.songId : null, podium, participants: total || null });
          t.update(estadoRef, { cerradaEn: ahora });
          return { fase: "cerrada", queda: DEMO_REVEAL_MS };
        }

        // 3) Abierta y con tiempo: el público simulado vota poco a poco.
        if (abierta && (e.bots || 0) < (e.objetivo || 0) && ahora - (e.ultimoBot || 0) >= DEMO_BOT_CADA_MS) {
          const n = Math.min((e.objetivo || 0) - (e.bots || 0), 1 + (Math.random() < 0.45 ? 1 : 0));
          for (let k = 0; k < n; k++) {
            const idx = demoSorteo(e.pesos || [1, 1, 1, 1]);
            const songId = (poll.candidateSongIds || [])[idx];
            if (!songId) continue;
            t.set(votosCol.doc(`publico${String((e.bots || 0) + k + 1).padStart(2, "0")}_${e.pollId}`),
                  { pollId: e.pollId, songId, votedAt: Timestamp.fromMillis(ahora) });
          }
          t.update(estadoRef, { bots: (e.bots || 0) + n, ultimoBot: ahora });
        }
        return abierta ? { fase: "abierta", queda: Math.max(0, cierra - ahora) }
                       : { fase: "cerrada", queda: Math.max(0, cerrada + DEMO_REVEAL_MS - ahora) };
      });
      res.json(fuera);
    } catch (e) {
      console.error("demo:", e);
      res.status(500).json({ error: "demo" });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────
// COMUNIDAD · BOLETÍN (01-11-2026, plan de visibilidad, punto 3)
// POST /api/comunidad {email, nombre?, lang?, source?} desde la página
// /comunidad. Guarda el alta en `newsletter/{sha256(email)}` con la hora del
// consentimiento (RGPD: quién, cuándo, desde dónde) y, si Brevo está
// configurado (env BREVO_API_KEY + BREVO_LIST_ID), crea el contacto con
// DOBLE confirmación (BREVO_DOI_TEMPLATE_ID + BREVO_DOI_REDIRECT) o, sin
// plantilla, como contacto normal. Sin Brevo el alta queda «pending» y se
// exporta a mano. Nunca devuelve datos de otros; nunca por GET.
const NEWSLETTER_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const comunidad = onRequest(
  { region: "europe-west1", memory: "256MiB", timeoutSeconds: 20, maxInstances: 3, cors: false },
  async (req, res) => {
    res.set("Cache-Control", "no-store");
    if (req.method !== "POST") { res.status(405).send(""); return; }
    const b = (req.body && typeof req.body === "object") ? req.body : {};
    const email = String(b.email || "").trim().toLowerCase();
    if (!NEWSLETTER_EMAIL_RE.test(email) || email.length > 120) { res.status(400).json({ error: "email" }); return; }
    const nombre = String(b.nombre || "").trim().slice(0, 80);
    const lang = String(b.lang || "es").toLowerCase().startsWith("en") ? "en" : "es";
    const source = String(b.source || "web").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "web";
    const id = createHash("sha256").update(email).digest("hex");
    const ref = db.doc(`newsletter/${id}`);
    const now = Timestamp.now();
    try {
      const prev = await ref.get();
      await ref.set({
        email, nombre, lang, source,
        consentAt: now, consentIp: String(req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim().slice(0, 64),
        status: prev.exists ? (prev.data()?.status || "pending") : "pending",
        createdAt: prev.exists ? (prev.data()?.createdAt || now) : now, updatedAt: now,
      }, { merge: true });
    } catch (e) { console.error("comunidad: firestore", e); res.status(500).json({ error: "store" }); return; }

    const apiKey = process.env.BREVO_API_KEY || "", listId = Number(process.env.BREVO_LIST_ID || 0);
    if (apiKey && listId) {
      try {
        const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID || 0);
        const redirect = process.env.BREVO_DOI_REDIRECT || "https://idoctormusicband.web.app/comunidad/?ok=1";
        const attributes = { NOMBRE: nombre, IDIOMA: lang, ORIGEN: source };
        const r = templateId
          ? await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
              method: "POST", headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
              body: JSON.stringify({ email, includeListIds: [listId], templateId, redirectionUrl: redirect, attributes }) })
          : await fetch("https://api.brevo.com/v3/contacts", {
              method: "POST", headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
              body: JSON.stringify({ email, listIds: [listId], updateEnabled: true, attributes }) });
        if (r.ok || r.status === 204 || r.status === 201) {
          await ref.set({ status: templateId ? "doi-sent" : "brevo", brevoAt: Timestamp.now() }, { merge: true });
        } else {
          console.error("comunidad: brevo", r.status, (await r.text()).slice(0, 200));
        }
      } catch (e) { console.error("comunidad: brevo", e); }
    }
    res.json({ ok: true });
  });

// ═══════════════════════════════════════════════════════════════════════════
//  VOTA EL SETLIST DE NAVIDAD (04-11-2026) — votación GLOBAL de campaña.
//
//  Cualquiera, sin cuenta y sin app, elige hasta NAV_MAX_ELEGIDAS canciones de
//  una lista de candidatas; al cerrar, las más votadas son «el setlist de
//  Navidad» que cualquier banda puede importar en iDoctor MusicBand.
//
//  · Va TODO por esta función (admin SDK): las reglas de Firestore no se tocan
//    y `globalPolls/**` no lo puede leer ni escribir nadie desde fuera.
//  · No se pisa con las votaciones de bolo: aquellas viven en
//    `bands/{b}/setlists/{s}/livePoll`, esto en `globalPolls/{poll}`.
//  · Un voto por móvil: el documento es `votos/{sha256(device)}` y se puede
//    cambiar mientras esté abierta. Sin datos personales (ni IP guardada).
//  · El recuento son agregaciones `count()` por canción (array-contains), con
//    caché de unos segundos por instancia: escala a miles sin documento
//    caliente.
//  · Fases por fecha (abre/cierra en el doc de configuración), así no hay que
//    acordarse de abrir ni cerrar.
//
//    GET  /api/navidad?poll=navidad2026[&device=…]   → estado, candidatas, recuento, mis votos
//    POST /api/navidad {op:"votar", poll, device, songs:[ids]}
//    POST /api/navidad {op:"config", poll, clave, abre, cierra, candidatas?, titulo?}  (NAVIDAD_KEY)
//    POST /api/navidad {op:"borrar-votos", poll, clave}   (solo la encuesta de prueba)
// ═══════════════════════════════════════════════════════════════════════════
const NAV_POLLS = new Set(["navidad2026", "prueba"]);      // nada fuera de esta lista
const NAV_MAX_ELEGIDAS = 5;
const NAV_CACHE_MS = 8_000;
const NAV_RATE = new Map();                                 // ip → [instantes] (por instancia)
const NAV_CANDIDATAS = [
  ["Feliz Navidad", "José Feliciano"], ["Un año más", "Mecano"], ["El tamborilero", "Raphael"],
  ["Arre borriquito", "Peret"], ["Mi burrito sabanero", "Tradicional venezolano"], ["Campana sobre campana", "Tradicional"],
  ["Los peces en el río", "Tradicional"], ["La marimorena", "Tradicional"], ["Hacia Belén va una burra", "Tradicional"],
  ["Noche de paz", "Tradicional"], ["Dime niño de quién eres", "Tradicional"], ["Los campanilleros", "Tradicional andaluz"],
  ["Fum, fum, fum", "Tradicional catalán"],
  ["All I Want for Christmas Is You", "Mariah Carey"], ["Last Christmas", "Wham!"], ["Jingle Bell Rock", "Bobby Helms"],
  ["Rockin' Around the Christmas Tree", "Brenda Lee"], ["Santa Claus Is Comin' to Town", "Bruce Springsteen"],
  ["Merry Christmas Everyone", "Shakin' Stevens"], ["Happy Xmas (War Is Over)", "John Lennon & Yoko Ono"],
  ["Driving Home for Christmas", "Chris Rea"], ["Let It Snow! Let It Snow! Let It Snow!", "Dean Martin"],
  ["It's Beginning to Look a Lot Like Christmas", "Michael Bublé"], ["Run Rudolph Run", "Chuck Berry"],
  ["Wonderful Christmastime", "Paul McCartney"], ["Do They Know It's Christmas?", "Band Aid"],
  ["Merry Xmas Everybody", "Slade"], ["Fairytale of New York", "The Pogues & Kirsty MacColl"],
  ["Blue Christmas", "Elvis Presley"], ["White Christmas", "Bing Crosby"],
].map(([title, artist], i) => ({ id: "n" + String(i + 1).padStart(2, "0"), title, artist }));
const navCache = new Map();                                 // poll → {t, data}

function navRateOk(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim() || "?";
  const ahora = Date.now(), win = 60_000;
  const xs = (NAV_RATE.get(ip) || []).filter(t => ahora - t < win);
  if (xs.length >= 30) { NAV_RATE.set(ip, xs); return false; }   // 30 votos/min por IP (un bar entero cabe)
  xs.push(ahora); NAV_RATE.set(ip, xs);
  if (NAV_RATE.size > 5000) NAV_RATE.clear();
  return true;
}
const navMs = t => (t && typeof t.toMillis === "function") ? t.toMillis() : (typeof t === "number" ? t : null);
function navFase(cfg, ahora = Date.now()) {
  const abre = navMs(cfg.abre), cierra = navMs(cfg.cierra);
  if (abre && ahora < abre) return "antes";
  if (cierra && ahora >= cierra) return "cerrada";
  return "abierta";
}

async function navEstado(poll) {
  const c = navCache.get(poll);
  if (c && Date.now() - c.t < NAV_CACHE_MS) return c.data;
  const ref = db.doc(`globalPolls/${poll}`);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const cfg = snap.data();
  const cands = Array.isArray(cfg.candidatas) && cfg.candidatas.length ? cfg.candidatas : NAV_CANDIDATAS;
  const votos = ref.collection("votos");
  const [total, ...cuentas] = await Promise.all([
    votos.count().get().then(s => s.data().count).catch(() => 0),
    ...cands.map(s => votos.where("songs", "array-contains", s.id).count().get().then(x => x.data().count).catch(() => 0)),
  ]);
  const data = {
    poll, titulo: cfg.titulo || "Vota el setlist de Navidad",
    fase: navFase(cfg), abre: navMs(cfg.abre), cierra: navMs(cfg.cierra), max: NAV_MAX_ELEGIDAS,
    votantes: total,
    candidatas: cands.map((s, i) => ({ id: s.id, title: s.title, artist: s.artist || "", votos: cuentas[i] || 0 })),
  };
  navCache.set(poll, { t: Date.now(), data });
  return data;
}

export const navidad = onRequest(
  { region: "europe-west1", memory: "256MiB", timeoutSeconds: 30, maxInstances: 10, cors: false },
  async (req, res) => {
    res.set("Cache-Control", "no-store");
    const b = (req.method === "POST" && req.body && typeof req.body === "object") ? req.body : {};
    const poll = String((req.method === "GET" ? req.query.poll : b.poll) || "navidad2026");
    if (!NAV_POLLS.has(poll)) { res.status(404).json({ error: "poll" }); return; }
    const ref = db.doc(`globalPolls/${poll}`);
    const deviceId = d => /^[A-Za-z0-9_-]{8,80}$/.test(String(d || "")) ? createHash("sha256").update(String(d)).digest("hex") : null;
    try {
      if (req.method === "GET") {
        const est = await navEstado(poll);
        if (!est) { res.status(404).json({ error: "sin-config" }); return; }
        let mios = [];
        const dev = deviceId(req.query.device);
        if (dev) { const v = await ref.collection("votos").doc(dev).get(); mios = v.exists ? (v.data().songs || []) : []; }
        res.json({ ...est, mios });
        return;
      }
      if (req.method !== "POST") { res.status(405).send(""); return; }

      if (b.op === "votar") {
        if (!navRateOk(req)) { res.status(429).json({ error: "despacio" }); return; }
        const dev = deviceId(b.device);
        if (!dev) { res.status(400).json({ error: "device" }); return; }
        const snap = await ref.get();
        if (!snap.exists) { res.status(404).json({ error: "sin-config" }); return; }
        const cfg = snap.data();
        if (navFase(cfg) !== "abierta") { res.status(409).json({ error: "cerrada", fase: navFase(cfg) }); return; }
        const validas = new Set((Array.isArray(cfg.candidatas) && cfg.candidatas.length ? cfg.candidatas : NAV_CANDIDATAS).map(s => s.id));
        const songs = [...new Set((Array.isArray(b.songs) ? b.songs : []).map(String))].filter(id => validas.has(id));
        if (songs.length > NAV_MAX_ELEGIDAS) { res.status(400).json({ error: "demasiadas", max: NAV_MAX_ELEGIDAS }); return; }
        const vref = ref.collection("votos").doc(dev);
        if (!songs.length) await vref.delete();                       // quitar todas = retirar el voto
        else await vref.set({ songs, at: Timestamp.now() });
        navCache.delete(poll);
        res.json({ ok: true, mios: songs });
        return;
      }

      if (b.op === "config" || b.op === "borrar-votos") {
        const clave = String(b.clave || ""), buena = process.env.NAVIDAD_KEY || "";
        if (!buena || !fotosEq(clave, buena)) { res.status(401).json({ error: "clave" }); return; }
        if (b.op === "borrar-votos") {
          if (poll !== "prueba") { res.status(403).json({ error: "solo-prueba" }); return; }
          const vs = await ref.collection("votos").listDocuments();
          for (const d of vs) await d.delete();
          navCache.delete(poll);
          res.json({ ok: true, borrados: vs.length });
          return;
        }
        const fecha = v => { const t = Date.parse(String(v || "")); return Number.isFinite(t) ? Timestamp.fromMillis(t) : null; };
        const cambio = { updatedAt: Timestamp.now() };
        if (b.abre !== undefined) cambio.abre = fecha(b.abre);
        if (b.cierra !== undefined) cambio.cierra = fecha(b.cierra);
        if (typeof b.titulo === "string") cambio.titulo = b.titulo.slice(0, 80);
        const prev = await ref.get();
        if (!prev.exists || b.candidatas === "defecto") cambio.candidatas = NAV_CANDIDATAS;
        await ref.set(cambio, { merge: true });
        navCache.delete(poll);
        res.json({ ok: true, ...(await navEstado(poll)) });
        return;
      }
      res.status(400).json({ error: "op" });
    } catch (e) {
      console.error("navidad:", e);
      res.status(500).json({ error: "interno" });
    }
  });

// ═══════════════════════════════════════════════════════════════════════════
//  ELIGE EL REPERTORIO (08-11-2026; desde la build 216, CAJONES WEB) —
//  votación de CAMPAÑA de una banda. Lo pidió Juan el 05-11: «dejar una
//  votación abierta con unos temas durante 15 días antes de un concierto».
//
//  · La votación ES un cajón de la app (`bands/{banda}/pollPools/{id}` con
//    `web == true`): título público, concierto, abre/cierra, cuántos temas
//    por persona (`webMax`, 1 a 3), recuento visible o al cierre
//    (`webLiveCount`) y las candidatas CONGELADAS (`webCandidates`). Se crea,
//    se cierra y se lee desde la app; aquí ya no hay configuración a mano.
//  · Los votos van a `bands/{banda}/campaigns/{cajón}/votos/{sha256(móvil)}`,
//    un nivel más abajo de lo que las reglas abren a la banda: solo esta
//    función los lee. El RECUENTO agregado queda en `campaigns/{cajón}`
//    ({recuento: {songId: n}, votantes}), que la app sí lee con sus reglas.
//  · Un enlace FIJO por banda (/elige/?banda=… o idoctormusic.com/elige/
//    <alias>): sin `poll`, la página enseña la votación abierta; si hay
//    varias abiertas (hasta 3), la lista para elegir; si ninguna, la próxima
//    programada o la última cerrada hace menos de 30 días. Con `poll`, esa.
//  · Todo por el SDK de administrador: NI una regla de Firestore nueva para
//    el público. Las votaciones de BOLO (/votar, /pantalla) no se tocan.
//
//    GET  /api/elige?banda=…[&poll=…][&device=…]  → estado, perfil, candidatas, recuento, mis votos
//    POST /api/elige {op:"votar", banda, poll, device, songs:[ids]}
//    POST /api/elige {op:"listar", banda, clave}
//    POST /api/elige {op:"borrar-votos", banda, poll, clave}   (pruebas)
// ═══════════════════════════════════════════════════════════════════════════
const ELIGE_CACHE_MS = 8_000;
const ELIGE_DIAS_VISIBLE = 30;
const eligeCache = new Map();                               // `${banda}|${poll}` → {t, data}
const eligeMax = v => { const m = parseInt(v, 10); return m >= 1 && m <= 3 ? m : 3; };
const eligeId = s => /^[A-Za-z0-9_-]{1,40}$/.test(String(s || ""));
const eligeCfg = d => ({ abre: d.webOpens || null, cierra: d.webCloses || null });

function eligeResumen(id, d, ahora = Date.now()) {
  return {
    poll: id,
    titulo: String(d.webTitle || "").trim().slice(0, 80) || "Elige el repertorio",
    concierto: String(d.webConcertName || "").slice(0, 80),
    fase: navFase(eligeCfg(d), ahora), abre: navMs(d.webOpens), cierra: navMs(d.webCloses),
    max: eligeMax(d.webMax), recuento: d.webLiveCount === false ? "cierre" : "directo",
    candidatas: Array.isArray(d.webCandidates) ? d.webCandidates.length : 0,
  };
}

/// Los cajones web de la banda que tienen algo que enseñar, por cierre.
async function eligeCajones(banda) {
  const q = await db.collection(`bands/${banda}/pollPools`).where("web", "==", true).get();
  const ahora = Date.now(), lim = ahora - ELIGE_DIAS_VISIBLE * 86_400_000;
  return q.docs.map(s => ({ id: s.id, d: s.data(), r: eligeResumen(s.id, s.data(), ahora) }))
    .filter(x => x.r.cierra && x.r.candidatas > 0 && (x.r.fase !== "cerrada" || x.r.cierra >= lim))
    .sort((a, b) => a.r.cierra - b.r.cierra);
}

/// Sin `poll`: la abierta; varias abiertas → la lista; si ninguna, la próxima
/// programada; si tampoco, la última cerrada hace poco.
function eligeElegir(lista) {
  const abiertas = lista.filter(x => x.r.fase === "abierta");
  if (abiertas.length === 1) return { una: abiertas[0] };
  if (abiertas.length > 1) return { varias: abiertas };
  const proximas = lista.filter(x => x.r.fase === "antes");
  if (proximas.length) return { una: proximas[0] };
  const cerradas = lista.filter(x => x.r.fase === "cerrada");
  return cerradas.length ? { una: cerradas[cerradas.length - 1] } : null;
}

/// El perfil público de la banda (lo mismo que ve /votar): logo, nombre,
/// mensajes de la sala de espera, redes y el alias del enlace corto.
const ELIGE_REDES = ["instagram", "tiktok", "facebook", "spotify", "youtube", "website"];
async function eligePerfil(banda) {
  const snap = await db.doc(`bands/${banda}/publicLive/current`).get();
  const p = snap.exists ? snap.data() : {};
  const s = p.social && typeof p.social === "object" ? p.social : {};
  const social = Object.fromEntries(ELIGE_REDES.filter(k => typeof s[k] === "string" && s[k].trim()).map(k => [k, s[k].trim().slice(0, 200)]));
  return {
    bandName: String(p.bandName || "").slice(0, 80), logoUrl: typeof p.logoUrl === "string" ? p.logoUrl : "",
    alias: typeof p.alias === "string" ? p.alias : "",
    messages: Array.isArray(p.messages) ? p.messages.filter(m => typeof m === "string" && m.trim()).slice(0, 40) : [],
    social: Object.keys(social).length ? social : null,
  };
}

function eligeEnlace(banda, perfil, poll) {
  const alias = Object.keys(ALIASES).find(a => ALIASES[a] === banda) || perfil.alias || "";
  const base = alias ? `${SITE}/elige/${enc(alias)}` : `${CONCERT_BASE}/elige/?banda=${enc(banda)}`;
  if (!poll) return base;
  return base + (alias ? "?" : "&") + "poll=" + enc(poll);
}

async function eligeEstado(banda, poll) {
  const key = `${banda}|${poll || ""}`;
  const c = eligeCache.get(key);
  if (c && Date.now() - c.t < ELIGE_CACHE_MS) return c.data;
  const perfil = await eligePerfil(banda);
  const comun = { banda, bandName: perfil.bandName, logoUrl: perfil.logoUrl, messages: perfil.messages,
                  social: perfil.social, enlace: eligeEnlace(banda, perfil, "") };
  let una = null, varias = null;
  if (poll) {
    const snap = await db.doc(`bands/${banda}/pollPools/${poll}`).get();
    if (snap.exists && snap.get("web") === true) una = { id: snap.id, d: snap.data(), r: eligeResumen(snap.id, snap.data()) };
  } else {
    const sel = eligeElegir(await eligeCajones(banda));
    if (sel?.una) una = sel.una; else if (sel?.varias) varias = sel.varias;
  }
  let data;
  if (varias) {
    data = { ...comun, varias: varias.map(v => ({ ...v.r, enlace: eligeEnlace(banda, perfil, v.id) })) };
  } else if (una) {
    const cands = Array.isArray(una.d.webCandidates) ? una.d.webCandidates : [];
    const verRecuento = una.r.recuento !== "cierre" || una.r.fase === "cerrada";
    const agg = await db.doc(`bands/${banda}/campaigns/${una.id}`).get();
    const rec = (agg.exists && agg.get("recuento")) || {};
    const votantes = Math.max(0, parseInt(agg.exists ? agg.get("votantes") : 0, 10) || 0);
    data = { ...comun, ...una.r, verRecuento, votantes, enlace: eligeEnlace(banda, perfil, una.id),
      candidatas: cands
        .map(s => ({ id: String(s.id || ""), title: String(s.title || "").slice(0, 80), artist: String(s.artist || "").slice(0, 80),
                     votos: verRecuento ? Math.max(0, parseInt(rec[s.id], 10) || 0) : null }))
        .filter(s => eligeId(s.id) && s.title) };
  } else {
    data = { ...comun, ninguna: true };                     // sin votación: la página sigue con la cara de la banda
  }
  eligeCache.set(key, { t: Date.now(), data });
  return data;
}

export const elige = onRequest(
  { region: "europe-west1", memory: "256MiB", timeoutSeconds: 30, maxInstances: 10, cors: false },
  async (req, res) => {
    res.set("Cache-Control", "no-store");
    const b = (req.method === "POST" && req.body && typeof req.body === "object") ? req.body : {};
    const banda = String((req.method === "GET" ? req.query.banda : b.banda) || "");
    if (!/^[A-Za-z0-9_-]{6,64}$/.test(banda)) { res.status(400).json({ error: "banda" }); return; }
    const poll = String((req.method === "GET" ? req.query.poll : b.poll) || "");
    if (poll && !eligeId(poll)) { res.status(400).json({ error: "poll" }); return; }
    const deviceId = d => /^[A-Za-z0-9_-]{8,80}$/.test(String(d || "")) ? createHash("sha256").update(String(d)).digest("hex") : null;
    const olvidar = p => { eligeCache.delete(`${banda}|`); eligeCache.delete(`${banda}|${p}`); };
    try {
      if (req.method === "GET") {
        const est = await eligeEstado(banda, poll);
        let mios = [];
        const dev = deviceId(req.query.device);
        if (dev && est.poll) {
          const v = await db.doc(`bands/${banda}/campaigns/${est.poll}/votos/${dev}`).get();
          mios = v.exists ? (v.data().songs || []) : [];
        }
        res.json({ ...est, mios });
        return;
      }
      if (req.method !== "POST") { res.status(405).send(""); return; }

      if (b.op === "votar") {
        if (!navRateOk(req)) { res.status(429).json({ error: "despacio" }); return; }
        const dev = deviceId(b.device);
        if (!dev || !poll) { res.status(400).json({ error: "device" }); return; }
        const snap = await db.doc(`bands/${banda}/pollPools/${poll}`).get();
        if (!snap.exists || snap.get("web") !== true) { res.status(404).json({ error: "sin-campana" }); return; }
        const d = snap.data();
        const fase = navFase(eligeCfg(d));
        if (fase !== "abierta") { res.status(409).json({ error: "cerrada", fase }); return; }
        const validas = new Set((Array.isArray(d.webCandidates) ? d.webCandidates : []).map(s => String(s.id || "")));
        const songs = [...new Set((Array.isArray(b.songs) ? b.songs : []).map(String))].filter(id => eligeId(id) && validas.has(id));
        const max = eligeMax(d.webMax);
        if (songs.length > max) { res.status(400).json({ error: "demasiadas", max }); return; }
        // El recuento se lleva al día en una transacción: sin volver a contar
        // nada, exacto aunque dos móviles voten a la vez.
        const agg = db.doc(`bands/${banda}/campaigns/${poll}`);
        const vref = agg.collection("votos").doc(dev);
        await db.runTransaction(async tx => {
          const prev = await tx.get(vref);
          const antes = prev.exists ? (Array.isArray(prev.get("songs")) ? prev.get("songs") : []).map(String) : [];
          const delta = {};
          for (const id of antes) delta[id] = (delta[id] || 0) - 1;
          for (const id of songs) delta[id] = (delta[id] || 0) + 1;
          const recuento = {};
          for (const [id, v] of Object.entries(delta)) if (v) recuento[id] = FieldValue.increment(v);
          const upd = { poolId: poll, updatedAt: Timestamp.now() };
          if (Object.keys(recuento).length) upd.recuento = recuento;
          if (!prev.exists && songs.length) upd.votantes = FieldValue.increment(1);
          if (prev.exists && !songs.length) upd.votantes = FieldValue.increment(-1);
          tx.set(agg, upd, { merge: true });
          if (songs.length) tx.set(vref, { songs, at: Timestamp.now() }); else tx.delete(vref);
        });
        olvidar(poll);
        res.json({ ok: true, mios: songs });
        return;
      }

      if (b.op === "listar" || b.op === "borrar-votos") {
        const clave = String(b.clave || ""), buena = process.env.ELIGE_KEY || process.env.NAVIDAD_KEY || "";
        if (!buena || !fotosEq(clave, buena)) { res.status(401).json({ error: "clave" }); return; }
        if (b.op === "listar") {
          const lista = await eligeCajones(banda);
          res.json({ ok: true, votaciones: lista.map(x => x.r) });
          return;
        }
        if (!poll) { res.status(400).json({ error: "poll" }); return; }
        const agg = db.doc(`bands/${banda}/campaigns/${poll}`);
        const vs = await agg.collection("votos").listDocuments();
        for (const v of vs) await v.delete();
        await agg.delete();
        olvidar(poll);
        res.json({ ok: true, borrados: vs.length });
        return;
      }
      res.status(400).json({ error: "op" });
    } catch (e) {
      console.error("elige:", e);
      res.status(500).json({ error: "interno" });
    }
  });
