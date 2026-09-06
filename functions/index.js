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

function resolveAlias(alias = "") {
  const a = String(alias).trim().toLowerCase().replace(/\.jpg$/, "");
  if (!a) return null;
  if (ALIASES[a]) return { alias: a, bandId: ALIASES[a] };
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
      let m = path.match(/^\/og-card\/(vota|en-vivo|pantalla)\/([^/]+?)(?:\.jpg)?$/);
      if (m) {
        const kind = m[1], r = resolveAlias(m[2]);
        const band = r ? await loadBand(r.bandId) : null;
        const buf = await renderCard(kind, band || { bandName: "", logoUrl: "" });
        res.set("Content-Type", "image/jpeg");
        res.set("Cache-Control", "public, max-age=300, s-maxage=600");
        return res.status(200).send(buf);
      }
      // /<kind>/<alias>
      m = path.match(/^\/(vota|en-vivo|pantalla)\/([^/]+)$/);
      if (!m) return res.status(404).send("Not found");
      const kind = m[1], r = resolveAlias(m[2]);
      if (!r) return res.status(404).send("Enlace no válido");
      const band = await loadBand(r.bandId);
      if (!band) return res.status(404).send("Banda no encontrada");
      // UN SOLO ENLACE POR BANDA, PARA SIEMPRE (invariante fijado el
      // 28-08-2026): el redirector ya NO añade `setlist` nunca — ni el de la
      // query ni el activo. Las páginas del concierto siguen solas al setlist
      // que esté en escena, y así un enlace corto guardado o impreso no puede
      // quedarse enganchado a la votación vieja de un bolo pasado. Un
      // `?setlist=` heredado de enlaces antiguos se ignora sin romperlos.
      const target = KINDS[kind].target(r.bandId);
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
import { randomUUID, timingSafeEqual } from "node:crypto";

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
           mode: FOTOS_MODES.includes(d.photosMode) ? d.photosMode : "una" };
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
        const { enabled, style, mode } = await fotosState(banda);
        if (!enabled) return fotosJson(res, 200, { enabled: false, style, mode, photos: [] });
        const snap = await col.where("status", "==", "approved").get();
        const photos = snap.docs.map(fotosDocOut)
          .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0)).slice(0, FOTOS_MAX_LIST);
        return fotosJson(res, 200, { enabled: true, style, mode, photos });
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
        const { enabled, style, mode } = await fotosState(banda);
        const snap = await col.get();
        const all = snap.docs.map(fotosDocOut);
        const by = (st) => all.filter((p) => p.status === st);
        const newestFirst = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
        return fotosJson(res, 200, {
          enabled, style, mode,
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
