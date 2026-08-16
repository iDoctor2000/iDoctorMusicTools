// qa-screenshots.mjs — Capturas de control de calidad de la web con el Chrome
// del sistema (puppeteer-core, sin descargar navegadores).
//
//   node scripts/qa-screenshots.mjs [baseUrl] [outDir]
//
// Hace scroll por cada sección (para que las animaciones "whileInView"
// disparen) y guarda una captura por sección en escritorio y móvil, más las
// páginas estáticas (app, privacidad, soporte). Sirve para revisar un canal
// de vista previa de Firebase o la web local antes de desplegar.

import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const base = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/+$/, "");
const out = resolve(process.argv[3] || "qa-shots");
await mkdir(out, { recursive: true });

const chromePaths = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];
const executablePath = chromePaths.find((p) => existsSync(p));
if (!executablePath) throw new Error("No encuentro Chrome/Brave/Chromium en /Applications");

const browser = await puppeteer.launch({ executablePath, headless: "new", args: ["--hide-scrollbars"] });

async function shotSections(path, viewport, tag) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`${base}${path}`, { waitUntil: "networkidle0", timeout: 60000 });
  const handles = await page.$$("main > section, footer");
  for (const [i, handle] of handles.entries()) {
    const id = (await handle.evaluate((el) => el.id)) || `section-${i}`;
    await handle.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await new Promise((r) => setTimeout(r, 900)); // animaciones de entrada
    await page.screenshot({ path: resolve(out, `${tag}-${String(i).padStart(2, "0")}-${id}.png`) });
  }
  await page.close();
}

async function shotPage(path, viewport, name) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`${base}${path}`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  await page.close();
}

const desktop = { width: 1440, height: 900, deviceScaleFactor: 1 };
const mobile = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true };

await shotSections("/", desktop, "es-desk");
await shotSections("/", mobile, "es-mob");
await shotSections("/en/", desktop, "en-desk");
await shotPage("/apps/tuner/", desktop, "page-app-tuner-es");
await shotPage("/en/apps/livestems/", mobile, "page-app-livestems-en-mob");
await shotPage("/soporte/", desktop, "page-soporte");
await shotPage("/en/privacy/", desktop, "page-privacy-en");

await browser.close();
console.log(`Capturas en ${out}`);
