// index.js — Enlaces cortos de marca del Concierto Interactivo (2026-08-17).
//
//   https://idoctormusic.com/vota/<alias>       → público: vota la siguiente canción
//   https://idoctormusic.com/en-vivo/<alias>    → como el QR impreso (resuelve el setlist en directo)
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
    target: (id, setlist) => `${CONCERT_BASE}/votar/?banda=${enc(id)}${setlist ? `&setlist=${enc(setlist)}` : ""}`,
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
    target: (id, setlist) => `${CONCERT_BASE}/pantalla/?banda=${enc(id)}${setlist ? `&setlist=${enc(setlist)}` : ""}`,
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
      const target = KINDS[kind].target(r.bandId, band.activeSetlistId);
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
