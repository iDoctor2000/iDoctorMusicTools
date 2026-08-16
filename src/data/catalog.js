// catalog.js — LA fuente única que consumen la web (React) y el generador SEO
// (scripts/postbuild-seo.mjs). Fusiona tres cosas:
//
//   1. src/data/apps.js        → contenido en español, slugs, iconos, orden
//   2. src/data/store-meta.js  → la VERDAD de la App Store (precio, valoración,
//                                capturas oficiales, icono), vía `npm run store`
//   3. src/data/apps.en.js     → textos en inglés (lo que falte cae al español)
//
// Regla de oro: si la app tiene ficha en la tienda, `available` es true y hay
// enlace, diga lo que diga `status` en apps.js. La web no vuelve a decir
// "Próximamente" de algo que está a la venta.
//
// No importa nada de React ni de Vite: debe poder ejecutarse en Node.

import { apps, audiences, ecosystemPoints, roadmap, APP_STORE_DEVELOPER_URL } from "./apps.js";
import storeMeta from "./store-meta.js";
import { appsEn, audiencesEn, ecosystemPointsEn, roadmapExtraEn } from "./apps.en.js";

export const LANGS = ["es", "en"];
export const DEFAULT_LANG = "es";

/** Prefijo de ruta por idioma: "/" (es) o "/en/". */
export const langPrefix = (lang) => (lang === "en" ? "/en/" : "/");

/** Ruta interna (relativa a la raíz del sitio) por idioma. */
export const localPath = (lang, path = "") => `${langPrefix(lang)}${path.replace(/^\/+/, "")}`;

const STATUS_LABEL = {
  es: { available: "Disponible", soon: "Próximamente" },
  en: { available: "Available", soon: "Coming soon" },
};

/**
 * Devuelve las apps resueltas para un idioma.
 * Cada app trae: available, statusLabel, appStoreUrl, reviewUrl, price,
 * formattedPrice, currency, rating, ratingCount, version, screenshots (array,
 * WebP), screenshot (portada), ogImage (JPG), iconImage, pagePath, y los
 * textos en el idioma pedido.
 */
export function getApps(lang = DEFAULT_LANG) {
  return apps.map((app) => {
    const store = storeMeta[app.slug] || null;
    const tr = lang === "en" ? appsEn[app.slug] || {} : {};
    const available = Boolean(store) || app.status === "Disponible";
    const screenshots = store?.screenshots?.length
      ? store.screenshots
      : app.screenshots?.length
        ? app.screenshots
        : app.screenshot
          ? [app.screenshot]
          : [];
    return {
      ...app,
      lang,
      name: app.name,
      displayName: app.displayName || app.name,
      tagline: tr.tagline || app.tagline,
      description: tr.description || app.description,
      features: tr.features || app.features,
      audience: tr.audience || app.audience,
      note: tr.note || app.note || null,
      available,
      statusLabel: STATUS_LABEL[lang][available ? "available" : "soon"],
      appStoreUrl: store?.url || app.appStoreUrl || null,
      reviewUrl: store?.reviewUrl || null,
      developerUrl: APP_STORE_DEVELOPER_URL,
      price: store?.price ?? null,
      currency: store?.currency || null,
      formattedPrice: store?.formattedPrice || null,
      rating: store?.rating || 0,
      ratingCount: store?.ratingCount || 0,
      version: store?.version || null,
      minimumOsVersion: store?.minimumOsVersion || null,
      releaseDate: store?.releaseDate || null,
      updatedDate: store?.currentVersionReleaseDate || null,
      languages: store?.languages || [],
      screenshots,
      screenshot: screenshots[0] || null,
      ipadScreenshots: store?.ipadScreenshots || [],
      ogImage: store?.ogImage || app.ogImage || screenshots[0] || null,
      iconImage: store?.icon || app.iconImage || null,
      pagePath: localPath(lang, `apps/${app.slug}/`),
    };
  });
}

export function getEcosystemPoints(lang = DEFAULT_LANG) {
  return lang === "en" ? ecosystemPointsEn : ecosystemPoints;
}

export function getAudiences(lang = DEFAULT_LANG) {
  if (lang !== "en") return audiences;
  return audiences.map((a, i) => ({ ...a, ...(audiencesEn[i] || {}) }));
}

/**
 * Roadmap derivado de las apps: primero las publicadas (con check), luego las
 * que vienen, y el punto final "nuevas herramientas". Sustituye a la lista
 * fija de apps.js, cuyo "las 3 primeras tienen check" se quedó viejo cuando
 * ya había 5 a la venta.
 */
export function getRoadmap(lang = DEFAULT_LANG) {
  const list = getApps(lang);
  const done = list.filter((a) => a.available).map((a) => ({ label: a.name, done: true, slug: a.slug }));
  const soon = list.filter((a) => !a.available).map((a) => ({ label: a.name, done: false, slug: a.slug }));
  const extra = lang === "en" ? roadmapExtraEn : roadmap[roadmap.length - 1];
  return [...done, ...soon, { label: extra, done: false, slug: null }];
}

export { APP_STORE_DEVELOPER_URL };
