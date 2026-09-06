// postbuild-seo.mjs — Convierte el `dist/` de Vite (una SPA) en un sitio que
// los buscadores pueden leer entero, en dos idiomas.
//
//   /                 home ES  (index.html de Vite + head SEO + fallback HTML)
//   /en/              home EN  (misma SPA; <html lang="en"> → el bundle cambia)
//   /apps/<slug>/     página estática por app (ES) — capturas, precio, JSON-LD
//   /en/apps/<slug>/  ídem EN
//   /privacidad/ /soporte/  y  /en/privacy/ /en/support/
//   sitemap.xml (con hreflang), robots.txt, llms.txt, clave IndexNow, 404.html
//
// PORQUÉ así y no con un router: la web es una landing; lo que trae tráfico
// nuevo son URLs indexables por app y por idioma con contenido real en el
// HTML (no solo tras ejecutar JS). Todo sale de src/data/catalog.js — la
// misma verdad que pinta React — así que la web y lo que ve Google nunca
// discrepan. Datos de la tienda (precio, valoraciones, capturas) vía
// `npm run store` (src/data/store-meta.js).

import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { BRAND_SLOGAN } from "../src/data/apps.js";
import {
  LANGS,
  getApps,
  getAudiences,
  getEcosystemPoints,
  getRoadmap,
  langPrefix,
  localPath,
  APP_STORE_DEVELOPER_URL,
} from "../src/data/catalog.js";
import { stringsFor } from "../src/i18n/index.js";

const siteUrl = (process.env.VITE_SITE_URL || "https://idoctormusic.com").replace(/\/+$/, "");
const distDir = resolve("dist");
const today = new Date().toISOString().slice(0, 10);
const indexNowKey = "8f3c9b6c0f2a4f0f9d4f2a2dbf49d701";
const SUPPORT_EMAIL = "soporte@idoctormusic.com";
const HERO_BG = "assets/galactic-command-center.webp";

// ---------- textos de cabecera por idioma ----------
const META = {
  es: {
    title: "Apps iOS para músicos: afinador, metrónomo, cejilla y directo | iDoctor Music Tools",
    description:
      "Apps iOS para músicos hechas por músicos: afinador cromático, metrónomo profesional, calculadora de cejilla, asistente BeatBuddy, setlists con Concierto Interactivo y stems multipista para directo. iPhone e iPad.",
    ogTitle: `iDoctor Music Tools | ${BRAND_SLOGAN}`,
    ogImage: "assets/og-image.jpg",
    locale: "es_ES",
    keywords: [
      "apps iOS para músicos",
      "afinador cromático iPhone",
      "metrónomo profesional iPhone",
      "calculadora de cejilla guitarra",
      "transportar canciones con cejilla",
      "BeatBuddy 2 patrones",
      "asistente BeatBuddy",
      "backing tracks iPad directo",
      "stems multipista en directo",
      "click a los in-ears",
      "setlists para bandas",
      "concierto interactivo votación público",
      "iDoctor Music Tools",
    ],
    seoIntro: "Apps iOS para músicos, cantantes, bandas y creadores",
    seoText:
      "Una constelación de herramientas para afinar, medir, transportar, organizar el repertorio, preparar ensayos, tocar con BeatBuddy y controlar stems en directo con click a los in-ears.",
    appsHeading: "Aplicaciones del portfolio",
    forHeading: "Para quién es",
    roadmapHeading: "Roadmap",
    buy: "Descargar en App Store",
    soon: "Próximamente en App Store",
    pending: "Enlace de App Store en preparación",
    audienceLabel: "Dirigido a",
    priceLabel: "Precio",
    ratingLabel: "Valoración",
    privacySlug: "privacidad/",
    supportSlug: "soporte/",
    privacyFile: "Privacy.txt",
    onStore: "En la App Store",
    onWay: "En camino",
    developerLink: "Todas las apps de iDoctor Music Tools en la App Store",
  },
  en: {
    title: "iOS apps for musicians: tuner, metronome, capo & live stems | iDoctor Music Tools",
    description:
      "iOS apps for musicians, made by musicians: chromatic tuner, pro metronome, capo calculator, BeatBuddy pattern assistant, setlists with Interactive Concert and multitrack stems for live shows. iPhone & iPad.",
    ogTitle: "iDoctor Music Tools | Your musical Doctor",
    ogImage: "assets/og-image-en.jpg",
    locale: "en_US",
    keywords: [
      "iOS apps for musicians",
      "chromatic tuner iPhone",
      "professional metronome iPhone",
      "capo calculator guitar",
      "transpose songs with capo",
      "BeatBuddy 2 patterns",
      "BeatBuddy pattern finder",
      "backing tracks iPad live",
      "multitrack stems live performance",
      "click track to in-ears",
      "setlist app for bands",
      "interactive concert audience vote",
      "iDoctor Music Tools",
    ],
    seoIntro: "iOS apps for musicians, singers, bands and creators",
    seoText:
      "A constellation of tools to tune, keep time, transpose, organise your repertoire, prepare rehearsals, play with BeatBuddy and run live stems with click to the in-ears.",
    appsHeading: "Apps in the portfolio",
    forHeading: "Who it's for",
    roadmapHeading: "Roadmap",
    buy: "Get it on the App Store",
    soon: "Coming soon to the App Store",
    pending: "App Store link coming soon",
    audienceLabel: "Made for",
    priceLabel: "Price",
    ratingLabel: "Rating",
    privacySlug: "privacy/",
    supportSlug: "support/",
    privacyFile: "Privacy_EN.txt",
    onStore: "On the App Store",
    onWay: "On the way",
    developerLink: "All iDoctor Music Tools apps on the App Store",
  },
};

// ---------- utilidades ----------
const esc = (v = "") =>
  String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const abs = (path = "") => `${siteUrl}/${String(path).replace(/^\/+/, "")}`;
// Rutas internas (imágenes, enlaces entre páginas): relativas a la raíz, así
// funcionan igual en el dominio, en idoctormusic.web.app y en canales preview.
const rel = (path = "") => `/${String(path).replace(/^\/+/, "")}`;
const truncate = (text, max = 156) => {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
};
const homeUrl = (lang) => abs(langPrefix(lang));
const privacyUrl = (lang) => abs(localPath(lang, META[lang].privacySlug));
const supportUrl = (lang) => abs(localPath(lang, META[lang].supportSlug));

async function write(path, content) {
  const target = resolve(distDir, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

/** <link rel=alternate hreflang> para una página que existe en ambos idiomas. */
function hreflangLinks(urlByLang) {
  return [
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlByLang[l]}" />`),
    `<link rel="alternate" hreflang="x-default" href="${urlByLang.es}" />`,
  ].join("\n    ");
}

// ---------- JSON-LD ----------
const orgId = `${siteUrl}/#organization`;
const websiteId = (lang) => `${homeUrl(lang)}#website`;

function softwareJsonLd(app, lang) {
  const url = abs(app.pagePath);
  const node = {
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: app.name,
    alternateName: app.displayName,
    description: app.description,
    applicationCategory: "MusicApplication",
    applicationSubCategory: "Music",
    operatingSystem: app.minimumOsVersion ? `iOS ${app.minimumOsVersion} or later, iPadOS` : "iOS, iPadOS",
    url,
    inLanguage: lang,
    image: app.ogImage ? abs(app.ogImage) : undefined,
    screenshot: app.screenshots.map((s) => abs(s)),
    author: { "@id": orgId },
    publisher: { "@id": orgId },
    audience: { "@type": "Audience", audienceType: app.audience },
    featureList: app.features,
    ...(app.version ? { softwareVersion: app.version } : {}),
    ...(app.releaseDate ? { datePublished: app.releaseDate } : {}),
    ...(app.updatedDate ? { dateModified: app.updatedDate } : {}),
    ...(app.appStoreUrl ? { installUrl: app.appStoreUrl, downloadUrl: app.appStoreUrl, sameAs: [app.appStoreUrl] } : {}),
  };
  if (app.available && app.price !== null && app.currency) {
    node.offers = {
      "@type": "Offer",
      price: app.price,
      priceCurrency: app.currency,
      availability: "https://schema.org/InStock",
      url: app.appStoreUrl || url,
      seller: { "@id": orgId },
    };
  } else {
    node.offers = { "@type": "Offer", availability: "https://schema.org/PreOrder", url };
  }
  if (app.ratingCount > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(app.rating.toFixed(1)),
      ratingCount: app.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return node;
}

function homeGraph(lang, apps) {
  const m = META[lang];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "iDoctor Music Tools",
        legalName: "Juan A. Gómez Company",
        url: `${siteUrl}/`,
        slogan: BRAND_SLOGAN,
        logo: abs("favicon.svg"),
        email: SUPPORT_EMAIL,
        sameAs: [APP_STORE_DEVELOPER_URL, ...apps.filter((a) => a.appStoreUrl).map((a) => a.appStoreUrl)],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SUPPORT_EMAIL,
          availableLanguage: ["es", "en"],
          url: supportUrl(lang),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId(lang),
        name: "iDoctor Music Tools",
        alternateName: BRAND_SLOGAN,
        url: homeUrl(lang),
        inLanguage: lang,
        description: m.description,
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": `${homeUrl(lang)}#webpage`,
        url: homeUrl(lang),
        name: m.title,
        isPartOf: { "@id": websiteId(lang) },
        about: apps.map((app) => ({ "@id": `${abs(app.pagePath)}#software` })),
        inLanguage: lang,
        description: m.description,
        primaryImageOfPage: abs(m.ogImage),
      },
      {
        "@type": "ItemList",
        "@id": `${homeUrl(lang)}#app-list`,
        name: lang === "en" ? "iDoctor Music Tools app portfolio" : "Portfolio de aplicaciones iDoctor Music Tools",
        numberOfItems: apps.length,
        itemListElement: apps.map((app, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: abs(app.pagePath),
          item: { "@id": `${abs(app.pagePath)}#software` },
        })),
      },
      ...apps.map((app) => softwareJsonLd(app, lang)),
    ],
  };
}

// ---------- HOME (por idioma) ----------
function homeHead(lang, apps) {
  const m = META[lang];
  const urls = Object.fromEntries(LANGS.map((l) => [l, homeUrl(l)]));
  return `
    <title>${esc(m.title)}</title>
    <meta name="description" content="${esc(m.description)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="author" content="iDoctor Music Tools" />
    <meta name="application-name" content="iDoctor Music Tools" />
    <meta name="keywords" content="${esc(m.keywords.join(", "))}" />
    <link rel="canonical" href="${homeUrl(lang)}" />
    ${hreflangLinks(urls)}
    <link rel="sitemap" type="application/xml" href="${abs("sitemap.xml")}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${m.locale}" />
    <meta property="og:locale:alternate" content="${lang === "en" ? "es_ES" : "en_US"}" />
    <meta property="og:site_name" content="iDoctor Music Tools" />
    <meta property="og:title" content="${esc(m.ogTitle)}" />
    <meta property="og:description" content="${esc(m.description)}" />
    <meta property="og:url" content="${homeUrl(lang)}" />
    <meta property="og:image" content="${abs(m.ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="iDoctor Music Tools" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(m.ogTitle)}" />
    <meta name="twitter:description" content="${esc(m.description)}" />
    <meta name="twitter:image" content="${abs(m.ogImage)}" />
    <script type="application/ld+json">${JSON.stringify(homeGraph(lang, apps))}</script>`;
}

/** Contenido HTML real dentro de #root: lo que lee un rastreador sin ejecutar JS
 *  (React lo sustituye al hidratar). */
function homeFallback(lang, apps) {
  const m = META[lang];
  const t = stringsFor(lang);
  return `
<section class="seo-fallback" aria-label="iDoctor Music Tools">
  <h1>iDoctor Music Tools: ${esc(t.slogan)}</h1>
  <p>${esc(m.description)}</p>
  <h2>${esc(m.seoIntro)}</h2>
  <p>${esc(m.seoText)}</p>
  <ul>
    ${getEcosystemPoints(lang).map((p) => `<li>${esc(p)}</li>`).join("\n    ")}
  </ul>
  <h2>${esc(m.appsHeading)}</h2>
  ${apps
    .map(
      (app) => `
  <article>
    <h3><a href="${rel(app.pagePath)}">${esc(app.displayName)}</a></h3>
    <p><strong>${esc(app.statusLabel)}${app.formattedPrice ? ` · ${esc(app.formattedPrice)}` : ""}.</strong> ${esc(app.tagline)}</p>
    <p>${esc(app.description)}</p>
    <p><strong>${esc(m.audienceLabel)}:</strong> ${esc(app.audience)}</p>
    ${
      app.appStoreUrl
        ? `<p><a href="${esc(app.appStoreUrl)}" rel="noopener">${esc(m.buy)}: ${esc(app.name)}</a></p>`
        : `<p>${esc(app.available ? m.pending : m.soon)}</p>`
    }
  </article>`,
    )
    .join("\n")}
  <p><a href="${APP_STORE_DEVELOPER_URL}" rel="noopener">${esc(m.developerLink)}</a></p>
  <h2>${esc(m.forHeading)}</h2>
  <ul>
    ${getAudiences(lang).map((a) => `<li><strong>${esc(a.label)}:</strong> ${esc(a.text)}</li>`).join("\n    ")}
  </ul>
  <h2>${esc(m.roadmapHeading)}</h2>
  <p>${getRoadmap(lang).map((r) => `${esc(r.label)} (${r.done ? esc(m.onStore) : esc(m.onWay)})`).join(" · ")}</p>
  <p><a href="${localPath(lang, META[lang].privacySlug)}">${esc(t.footer.links.privacy)}</a> · <a href="${localPath(lang, META[lang].supportSlug)}">${esc(t.footer.links.support)}</a></p>
</section>`;
}

// ---------- página estática compartida (app / privacidad / soporte) ----------
const PAGE_CSS = `
:root{color-scheme:dark;font-family:Inter,system-ui,-apple-system,sans-serif;background:#030712;color:#f8fafc}
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(circle at 20% 10%,rgba(34,211,238,.18),transparent 34%),radial-gradient(circle at 80% 20%,rgba(139,92,246,.16),transparent 34%),#030712}
main{max-width:1040px;margin:0 auto;padding:40px 20px 72px}
a{color:#22d3ee}
.top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:28px}
.back{display:inline-flex;text-decoration:none;font-weight:600}
.lang a{display:inline-block;padding:6px 12px;border:1px solid rgba(34,211,238,.35);border-radius:999px;text-decoration:none;font-size:12px;font-weight:800;text-transform:uppercase;margin-left:6px}
.lang a[aria-current]{background:#22d3ee;color:#020617}
.status{display:inline-block;border:1px solid rgba(34,211,238,.35);border-radius:999px;padding:6px 12px;color:#22d3ee;background:rgba(34,211,238,.1);font-weight:800;font-size:12px;text-transform:uppercase}
.status.soon{border-color:rgba(217,70,239,.4);color:#e879f9;background:rgba(217,70,239,.1)}
.head{display:flex;gap:20px;align-items:center;margin-top:16px}
.head img{width:96px;height:96px;border-radius:24px;box-shadow:0 0 34px rgba(34,211,238,.28)}
h1{font-size:clamp(36px,7vw,72px);line-height:.98;margin:8px 0 12px} h2{margin-top:36px;font-size:24px}
p,li{color:#cbd5e1;line-height:1.75;font-size:17px}
.tagline{color:#22d3ee;font-size:22px;font-weight:800;margin:0 0 6px}
.meta{display:flex;flex-wrap:wrap;gap:10px 22px;margin:14px 0 0;padding:0;list-style:none;font-size:14px}
.meta li{color:#94a3b8;font-size:14px}.meta b{color:#f8fafc}
.stars{color:#fbbf24}
.panel{border:1px solid rgba(34,211,238,.22);background:rgba(255,255,255,.045);border-radius:14px;padding:22px 24px;margin-top:26px}
.panel h2{margin-top:0}
.cta{display:inline-flex;align-items:center;gap:8px;margin:18px 12px 0 0;border-radius:999px;padding:14px 22px;background:#22d3ee;color:#020617;text-decoration:none;font-weight:900}
.cta.ghost{background:transparent;color:#22d3ee;border:1px solid rgba(34,211,238,.45)}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-top:14px}
.shots img{width:100%;height:auto;border-radius:18px;border:1px solid rgba(34,211,238,.24);box-shadow:0 0 30px rgba(34,211,238,.18)}
.also{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-top:14px}
.also a{display:flex;gap:12px;align-items:center;padding:12px 14px;border:1px solid rgba(255,255,255,.1);border-radius:12px;text-decoration:none;color:#f8fafc;background:rgba(255,255,255,.03)}
.also img{width:44px;height:44px;border-radius:12px}
.also small{display:block;color:#94a3b8;font-size:12px}
footer{margin-top:48px;color:#64748b;font-size:14px}
ul.features{columns:2;column-gap:28px;padding-left:20px}@media(max-width:640px){ul.features{columns:1}}
.privacy h2{font-size:20px}.privacy p{white-space:pre-line}
`.trim();

function pageShell({ lang, title, description, canonical, urls, ogImage, ogType = "article", jsonLd, body }) {
  const m = META[lang];
  const t = stringsFor(lang);
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="theme-color" content="#030712" />
    <link rel="canonical" href="${canonical}" />
    ${hreflangLinks(urls)}
    <link rel="icon" type="image/svg+xml" href="${abs("favicon.svg")}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:locale" content="${m.locale}" />
    <meta property="og:site_name" content="iDoctor Music Tools" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${abs(ogImage || m.ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${abs(ogImage || m.ogImage)}" />
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
    <style>${PAGE_CSS}</style>
  </head>
  <body>
    <main>
      <div class="top">
        <a class="back" href="${langPrefix(lang)}">${esc(t.pages.back)}</a>
        <nav class="lang" aria-label="${esc(t.header.langLabel)}">
          ${LANGS.map((l) => `<a href="${urls[l].replace(siteUrl, "")}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
        </nav>
      </div>
${body}
      <footer>© ${new Date().getFullYear()} iDoctor Music Tools · <a href="${localPath(lang, META[lang].privacySlug)}">${esc(t.footer.links.privacy)}</a> · <a href="${localPath(lang, META[lang].supportSlug)}">${esc(t.footer.links.support)}</a></footer>
    </main>
  </body>
</html>`;
}

// ---------- página de app ----------
/**
 * Bloque de SUSCRIPCIÓN de una app (planes, condiciones, EULA y privacidad).
 * Debe decir lo mismo que la ficha de la App Store: es lo que exige la guía
 * 3.1.2 de Apple y lo que el usuario necesita leer antes de suscribirse.
 * Sale de `subscription` en src/data/apps.js (traducido en apps.en.js).
 */
function subscriptionSection(app, lang, t) {
  const s = app.subscription;
  if (!s) return "";
  return `
      <section class="panel" id="suscripcion">
        <h2>${esc(t.apps.subscriptionTitle)}</h2>
        <p>${esc(s.intro)}</p>
        <h3>${esc(t.apps.subscriptionPlans)}</h3>
        <ul>${s.plans
          .map((p) => `<li><b>${esc(p.name)}</b>: ${esc(p.price)}${p.note ? ` — ${esc(p.note)}` : ""}</li>`)
          .join("")}</ul>
        <ul>${s.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <p>
          <a href="${esc(s.eulaUrl)}" rel="noopener">${esc(s.eulaLabel)}</a>
          &nbsp;·&nbsp;
          <a href="${rel(localPath(lang, s.privacyPath))}">${esc(s.privacyLabel)}</a>
        </p>
      </section>`;
}

function appPage(app, lang, allApps) {
  const m = META[lang];
  const t = stringsFor(lang);
  const canonical = abs(app.pagePath);
  const urls = Object.fromEntries(LANGS.map((l) => [l, abs(localPath(l, `apps/${app.slug}/`))]));
  const title = `${app.displayName} — ${app.tagline.replace(/\.$/, "")} | iDoctor Music Tools`;
  const description = truncate(`${app.tagline} ${app.description}`);
  const stars = app.ratingCount ? "★".repeat(Math.round(app.rating)) + "☆".repeat(5 - Math.round(app.rating)) : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      softwareJsonLd(app, lang),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "iDoctor Music Tools", item: homeUrl(lang) },
          { "@type": "ListItem", position: 2, name: app.name, item: canonical },
        ],
      },
    ],
  };
  const others = allApps.filter((a) => a.slug !== app.slug);
  const body = `
      <span class="status${app.available ? "" : " soon"}">${esc(app.statusLabel)}</span>
      <div class="head">
        ${app.iconImage ? `<img src="${rel(app.iconImage)}" alt="" width="96" height="96" />` : ""}
        <h1>${esc(app.displayName)}</h1>
      </div>
      <p class="tagline">${esc(app.tagline)}</p>
      <ul class="meta">
        ${app.formattedPrice ? `<li>${esc(t.pages.priceLabel)}: <b>${esc(app.formattedPrice)}</b></li>` : ""}
        ${app.ratingCount ? `<li>${esc(m.ratingLabel)}: <b class="stars">${stars}</b> ${app.rating.toFixed(1)} (${app.ratingCount})</li>` : ""}
        ${app.version ? `<li>${esc(t.pages.versionLabel)}: <b>${esc(app.version)}</b></li>` : ""}
        ${app.minimumOsVersion ? `<li>${esc(t.pages.requiresLabel)}: <b>iOS ${esc(app.minimumOsVersion)}+</b></li>` : ""}
        ${app.languages?.length ? `<li>${esc(t.pages.languagesLabel)}: <b>${esc(app.languages.join(", "))}</b></li>` : ""}
        ${app.updatedDate ? `<li>${esc(t.pages.updatedLabel)}: <b>${esc(app.updatedDate)}</b></li>` : ""}
      </ul>
      <p>${esc(app.description)}</p>
      <div>
        ${
          app.appStoreUrl
            ? `<a class="cta" href="${esc(app.appStoreUrl)}" rel="noopener">${esc(t.pages.buy)}${app.formattedPrice ? ` · ${esc(app.formattedPrice)}` : ""}</a>` +
              (app.reviewUrl ? `<a class="cta ghost" href="${esc(app.reviewUrl)}" rel="noopener">${esc(t.pages.rate)}</a>` : "")
            : `<p><strong>${esc(app.available ? m.pending : m.soon)}</strong></p>`
        }
      </div>
      ${
        app.screenshots.length
          ? `<section class="panel"><h2>${esc(t.pages.screenshotsTitle)}</h2><div class="shots">${app.screenshots
              .map((s, i) => `<img src="${rel(s)}" alt="${esc(t.apps.screenshotAlt(app.name, i + 1))}" loading="${i ? "lazy" : "eager"}" width="320" height="693" />`)
              .join("")}</div></section>`
          : ""
      }
      <section class="panel">
        <h2>${esc(t.apps.features)}</h2>
        <ul class="features">${app.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        <h2>${esc(t.apps.audience)}</h2>
        <p>${esc(app.audience)}</p>
        ${app.note ? `<p><em>${esc(app.note)}</em></p>` : ""}
      </section>
      ${subscriptionSection(app, lang, t)}
      <section class="panel">
        <h2>${esc(t.pages.alsoTitle)}</h2>
        <div class="also">${others
          .map(
            (o) =>
              `<a href="${rel(o.pagePath)}">${o.iconImage ? `<img src="${rel(o.iconImage)}" alt="" width="44" height="44" loading="lazy" />` : ""}<span>${esc(o.name)}<small>${esc(o.statusLabel)}${o.formattedPrice ? ` · ${esc(o.formattedPrice)}` : ""}</small></span></a>`,
          )
          .join("")}</div>
        <p style="margin-top:14px"><a href="${APP_STORE_DEVELOPER_URL}" rel="noopener">${esc(m.developerLink)}</a></p>
      </section>`;
  return pageShell({ lang, title, description, canonical, urls, ogImage: app.ogImage, jsonLd, body });
}

// ---------- privacidad (desde los .txt) ----------
function txtToHtml(txt) {
  const out = [];
  let list = [];
  const flush = () => {
    if (list.length) {
      out.push(`<ul>${list.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`);
      list = [];
    }
  };
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === "⸻") {
      flush();
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      flush();
      out.push(`<h2>${esc(line)}</h2>`);
    } else if (/^[*•\-–]\s/.test(line)) {
      list.push(line.replace(/^[*•\-–]\s/, ""));
    } else {
      flush();
      out.push(`<p>${esc(line)}</p>`);
    }
  }
  flush();
  return out.join("\n");
}

async function privacyPage(lang) {
  const t = stringsFor(lang);
  const m = META[lang];
  const file = resolve(m.privacyFile);
  const txt = existsSync(file) ? await readFile(file, "utf8") : "";
  const lines = txt.split(/\r?\n/);
  const heading = lines[0] || t.pages.privacyTitle;
  const rest = lines.slice(1).join("\n");
  const canonical = privacyUrl(lang);
  const urls = Object.fromEntries(LANGS.map((l) => [l, privacyUrl(l)]));
  const body = `
      <article class="privacy">
        <h1>${esc(t.pages.privacyTitle)}</h1>
        <p><strong>${esc(heading)}</strong></p>
        ${txtToHtml(rest)}
      </article>`;
  return pageShell({
    lang,
    title: `${t.pages.privacyTitle} | iDoctor Music Tools`,
    description: truncate(
      lang === "en"
        ? "Privacy policy for iDoctor Music Tools iOS apps: no personal data collection, no tracking, data stays on your device. Contact and rights."
        : "Política de privacidad de las apps iOS de iDoctor Music Tools: sin recogida de datos personales, sin seguimiento, los datos se quedan en tu dispositivo. Contacto y derechos.",
    ),
    canonical,
    urls,
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t.pages.privacyTitle,
      url: canonical,
      inLanguage: lang,
      isPartOf: { "@id": websiteId(lang) },
      publisher: { "@id": orgId },
    },
    body,
  });
}

// ---------- soporte ----------
function supportPage(lang, apps) {
  const t = stringsFor(lang);
  const canonical = supportUrl(lang);
  const urls = Object.fromEntries(LANGS.map((l) => [l, supportUrl(l)]));
  const subject = encodeURIComponent(lang === "en" ? "Support — iDoctor Music Tools" : "Soporte — iDoctor Music Tools");
  const body = `
      <h1>${esc(t.pages.supportTitle)}</h1>
      <p>${esc(t.pages.supportIntro)}</p>
      <section class="panel">
        <h2>${esc(t.pages.supportEmailLabel)}</h2>
        <p><a class="cta" href="mailto:${SUPPORT_EMAIL}?subject=${subject}">${SUPPORT_EMAIL}</a></p>
      </section>
      <section class="panel">
        <h2>${esc(t.pages.supportAppsTitle)}</h2>
        <div class="also">${apps
          .map(
            (a) =>
              `<a href="mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${a.name} — ${lang === "en" ? "support" : "soporte"}`)}">${a.iconImage ? `<img src="${rel(a.iconImage)}" alt="" width="44" height="44" loading="lazy" />` : ""}<span>${esc(a.name)}<small>${esc(a.statusLabel)}${a.version ? ` · v${esc(a.version)}` : ""}</small></span></a>`,
          )
          .join("")}</div>
      </section>
      <section class="panel">
        <h2>${esc(t.pages.supportManualsTitle)}</h2>
        <p>${esc(t.pages.supportManualsText)}</p>
      </section>
      <section class="panel">
        <h2>${esc(t.footer.links.privacy)}</h2>
        <p>${esc(t.pages.supportPrivacyText)} <a href="${privacyUrl(lang)}">${esc(t.pages.privacyTitle)}</a></p>
      </section>`;
  return pageShell({
    lang,
    title: `${t.pages.supportTitle} | iDoctor Music Tools`,
    description: truncate(t.pages.supportIntro),
    canonical,
    urls,
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: t.pages.supportTitle,
      url: canonical,
      inLanguage: lang,
      isPartOf: { "@id": websiteId(lang) },
      publisher: { "@id": orgId },
    },
    body,
  });
}

// ---------- ejecución ----------
const viteIndex = await readFile(resolve(distDir, "index.html"), "utf8");
const appsByLang = Object.fromEntries(LANGS.map((l) => [l, getApps(l)]));

for (const lang of LANGS) {
  let html = viteIndex
    .replace('<html lang="es">', `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>\s*/, "")
    .replace("</head>", `${homeHead(lang, appsByLang[lang])}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${homeFallback(lang, appsByLang[lang])}</div>`);
  await write(lang === "es" ? "index.html" : `${lang}/index.html`, html);
  if (lang === "es") await write("404.html", html);

  for (const app of appsByLang[lang]) {
    await write(`${localPath(lang, `apps/${app.slug}/`)}index.html`.replace(/^\//, ""), appPage(app, lang, appsByLang[lang]));
  }
  await write(`${localPath(lang, META[lang].privacySlug)}index.html`.replace(/^\//, ""), await privacyPage(lang));
  await write(`${localPath(lang, META[lang].supportSlug)}index.html`.replace(/^\//, ""), supportPage(lang, appsByLang[lang]));
}

// ---------- sitemap con hreflang ----------
const entries = [];
const pushPair = (byLang, priority, changefreq = "weekly") => {
  for (const l of LANGS) entries.push({ loc: byLang[l], priority, changefreq, alternates: byLang });
};
pushPair(Object.fromEntries(LANGS.map((l) => [l, homeUrl(l)])), "1.0");
for (const app of appsByLang.es) {
  pushPair(
    Object.fromEntries(LANGS.map((l) => [l, abs(localPath(l, `apps/${app.slug}/`))])),
    app.available ? "0.9" : "0.6",
  );
}
pushPair(Object.fromEntries(LANGS.map((l) => [l, supportUrl(l)])), "0.5", "monthly");
pushPair(Object.fromEntries(LANGS.map((l) => [l, privacyUrl(l)])), "0.3", "yearly");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
    ${LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${e.alternates[l]}" />`).join("\n    ")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${e.alternates.es}" />
  </url>`,
  )
  .join("\n")}
</urlset>
`;
await write("sitemap.xml", sitemapXml);
await write(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${abs("sitemap.xml")}
`,
);
await write(`${indexNowKey}.txt`, indexNowKey);
await write(
  "llms.txt",
  `# iDoctor Music Tools

${BRAND_SLOGAN}. iOS apps for musicians, singers, guitarists, bands and creators, made by working musicians. Spanish site: ${homeUrl("es")} · English site: ${homeUrl("en")}
Sitemap: ${abs("sitemap.xml")} · Support: ${supportUrl("en")} · All apps on the App Store: ${APP_STORE_DEVELOPER_URL}

## Apps
${appsByLang.en
  .map(
    (app) =>
      `- ${app.name}: ${app.tagline} ${app.available ? `Available on the App Store${app.formattedPrice ? ` (${app.formattedPrice})` : ""}` : "Coming soon"}. ${abs(app.pagePath)}${app.appStoreUrl ? ` · ${app.appStoreUrl}` : ""}`,
  )
  .join("\n")}
`,
);
for (const f of ["Privacy.txt", "Privacy_EN.txt"]) {
  if (existsSync(resolve(f))) await copyFile(resolve(f), resolve(distDir, f));
}

console.log(`SEO generado para ${siteUrl}: ${LANGS.length} idiomas, ${appsByLang.es.length} apps, ${entries.length} URLs en el sitemap.`);
