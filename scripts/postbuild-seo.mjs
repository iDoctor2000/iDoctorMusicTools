import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { apps, audiences, BRAND_SLOGAN, ecosystemPoints, roadmap } from "../src/data/apps.js";

const siteUrl = (process.env.VITE_SITE_URL || "https://idoctor2000.github.io/iDoctorMusicTools").replace(/\/+$/, "");
const distDir = resolve("dist");
const today = new Date().toISOString().slice(0, 10);
const indexNowKey = "8f3c9b6c0f2a4f0f9d4f2a2dbf49d701";
const mainDescription =
  "iDoctor Music Tools es un ecosistema de apps iOS para músicos: afinador, metrónomo, cejilla, BeatBuddy, setlists, stems y herramientas vocales.";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const absoluteUrl = (path = "") => {
  const cleanPath = path.replace(/^\/+/, "");
  return `${siteUrl}/${cleanPath}`;
};

const truncate = (text, max = 156) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
};

const keywords = [
  "apps iOS para músicos",
  "afinador cromático iPhone",
  "metrónomo profesional iPhone",
  "calculadora de cejilla guitarra",
  "BeatBuddy Assistant",
  "patrones BeatBuddy 2",
  "backing tracks iPad",
  "stems para directo",
  "setlists para bandas",
  "rango vocal cantantes",
  "herramientas musicales iPhone",
  "iDoctor Music Tools",
];

const appJsonLd = (app) => ({
  "@type": "SoftwareApplication",
  "@id": `${absoluteUrl(`apps/${app.slug}/`)}#software`,
  name: app.name,
  alternateName: app.displayName || app.name,
  description: app.description,
  applicationCategory: "MusicApplication",
  operatingSystem: "iOS, iPadOS",
  url: absoluteUrl(`apps/${app.slug}/`),
  image: absoluteUrl(app.screenshot),
  isPartOf: { "@id": `${siteUrl}/#website` },
  audience: {
    "@type": "Audience",
    audienceType: app.audience,
  },
  offers: {
    "@type": "Offer",
    availability:
      app.appStoreUrl || app.status === "Disponible"
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
    url: app.appStoreUrl || absoluteUrl(`apps/${app.slug}/`),
  },
  ...(app.appStoreUrl ? { sameAs: [app.appStoreUrl] } : {}),
});

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "iDoctor Music Tools",
      alternateName: BRAND_SLOGAN,
      url: `${siteUrl}/`,
      inLanguage: "es",
      description: mainDescription,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "iDoctor Music Tools",
      url: `${siteUrl}/`,
      slogan: BRAND_SLOGAN,
      logo: absoluteUrl("favicon.svg"),
      sameAs: apps.filter((app) => app.appStoreUrl).map((app) => app.appStoreUrl),
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: "iDoctor Music Tools | Tu Doctor musical | Apps iOS para músicos",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: apps.map((app) => ({ "@id": `${absoluteUrl(`apps/${app.slug}/`)}#software` })),
      inLanguage: "es",
      description: mainDescription,
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#app-list`,
      name: "Portfolio de aplicaciones iDoctor Music Tools",
      numberOfItems: apps.length,
      itemListElement: apps.map((app, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@id": `${absoluteUrl(`apps/${app.slug}/`)}#software` },
      })),
    },
    ...apps.map(appJsonLd),
  ],
};

const seoFallback = `
<section class="seo-fallback" aria-label="Contenido SEO de iDoctor Music Tools">
  <h1>iDoctor Music Tools: ${escapeHtml(BRAND_SLOGAN)}</h1>
  <p>${escapeHtml(mainDescription)}</p>
  <h2>Apps iOS para músicos, cantantes, bandas y creadores</h2>
  <p>Una constelación de herramientas para afinar, medir, transportar, organizar, preparar ensayos, tocar con BeatBuddy y controlar stems en directo.</p>
  <ul>
    ${ecosystemPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("\n    ")}
  </ul>
  <h2>Aplicaciones del portfolio</h2>
  ${apps
    .map(
      (app) => `
  <article>
    <h3><a href="${absoluteUrl(`apps/${app.slug}/`)}">${escapeHtml(app.displayName || app.name)}</a></h3>
    <p><strong>${escapeHtml(app.status)}.</strong> ${escapeHtml(app.tagline)}</p>
    <p>${escapeHtml(app.description)}</p>
    <p><strong>Dirigido a:</strong> ${escapeHtml(app.audience)}</p>
    ${
      app.appStoreUrl
        ? `<p><a href="${escapeHtml(app.appStoreUrl)}">Comprar ${escapeHtml(app.name)} en App Store</a></p>`
        : app.status === "Disponible"
          ? `<p>Enlace de App Store pendiente.</p>`
          : `<p>Próximamente en App Store.</p>`
    }
  </article>`,
    )
    .join("\n")}
  <h2>Para quién es</h2>
  <ul>
    ${audiences.map((audience) => `<li><strong>${escapeHtml(audience.label)}:</strong> ${escapeHtml(audience.text)}</li>`).join("\n    ")}
  </ul>
  <h2>Roadmap</h2>
  <p>${escapeHtml(roadmap.join(" · "))}</p>
</section>`;

const headSeo = `
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="author" content="iDoctor Music Tools" />
    <meta name="application-name" content="iDoctor Music Tools" />
    <meta name="keywords" content="${escapeHtml(keywords.join(", "))}" />
    <link rel="canonical" href="${siteUrl}/" />
    <link rel="alternate" hreflang="es" href="${siteUrl}/" />
    <link rel="alternate" hreflang="x-default" href="${siteUrl}/" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:site_name" content="iDoctor Music Tools" />
    <meta property="og:title" content="iDoctor Music Tools | ${BRAND_SLOGAN}" />
    <meta property="og:description" content="${escapeHtml(mainDescription)}" />
    <meta property="og:url" content="${siteUrl}/" />
    <meta property="og:image" content="${absoluteUrl("assets/galactic-command-center.png")}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="iDoctor Music Tools | ${BRAND_SLOGAN}" />
    <meta name="twitter:description" content="${escapeHtml(mainDescription)}" />
    <meta name="twitter:image" content="${absoluteUrl("assets/galactic-command-center.png")}" />
    <script type="application/ld+json">${JSON.stringify(graph)}</script>`;

function appPage(app, index) {
  const title = `${app.displayName || app.name} | iDoctor Music Tools`;
  const description = truncate(`${app.tagline} ${app.description}`);
  const canonical = absoluteUrl(`apps/${app.slug}/`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      appJsonLd(app),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "iDoctor Music Tools", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: app.name, item: canonical },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="${absoluteUrl("favicon.svg")}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:site_name" content="iDoctor Music Tools" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${absoluteUrl(app.screenshot)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style>
      :root{color-scheme:dark;font-family:Inter,system-ui,sans-serif;background:#030712;color:#f8fafc}
      body{margin:0;background:radial-gradient(circle at 20% 10%,rgba(34,211,238,.18),transparent 34%),radial-gradient(circle at 80% 20%,rgba(139,92,246,.16),transparent 34%),#030712}
      main{max-width:960px;margin:0 auto;padding:48px 20px 72px}
      a{color:#22d3ee} .back{display:inline-flex;margin-bottom:32px;text-decoration:none}
      .status{display:inline-block;border:1px solid rgba(34,211,238,.35);border-radius:999px;padding:6px 12px;color:#22d3ee;background:rgba(34,211,238,.1);font-weight:800;font-size:12px;text-transform:uppercase}
      h1{font-size:clamp(42px,8vw,82px);line-height:.95;margin:18px 0 20px} h2{margin-top:34px}
      p,li{color:#cbd5e1;line-height:1.8;font-size:18px}.tagline{color:#22d3ee;font-size:24px;font-weight:800}
      .panel{border:1px solid rgba(34,211,238,.22);background:rgba(255,255,255,.045);border-radius:12px;padding:24px;margin-top:28px}
      .cta{display:inline-flex;margin-top:22px;border-radius:999px;padding:14px 20px;background:#22d3ee;color:#020617;text-decoration:none;font-weight:900}
      img{max-width:260px;width:100%;border-radius:26px;border:1px solid rgba(34,211,238,.24);box-shadow:0 0 44px rgba(34,211,238,.22)}
    </style>
  </head>
  <body>
    <main>
      <a class="back" href="${siteUrl}/">← Volver a iDoctor Music Tools</a>
      <span class="status">${escapeHtml(app.status)}</span>
      <h1>${escapeHtml(app.displayName || app.name)}</h1>
      <p class="tagline">${escapeHtml(app.tagline)}</p>
      <p>${escapeHtml(app.description)}</p>
      <img src="${absoluteUrl(app.screenshot)}" alt="Captura de ${escapeHtml(app.name)}" />
      <section class="panel">
        <h2>Funciones principales</h2>
        <ul>${app.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        <h2>Dirigido a</h2>
        <p>${escapeHtml(app.audience)}</p>
        ${
          app.appStoreUrl
            ? `<a class="cta" href="${escapeHtml(app.appStoreUrl)}">Comprar en App Store</a>`
            : app.status === "Disponible"
              ? `<p><strong>Enlace de App Store pendiente.</strong></p>`
              : `<p><strong>Próximamente en App Store.</strong></p>`
        }
      </section>
      <p>Parte del portfolio iDoctor Music Tools: afinador, metrónomo, cejilla, BeatBuddy, setlists, stems y herramientas vocales para músicos reales.</p>
    </main>
  </body>
</html>`;
}

async function write(path, content) {
  const target = resolve(distDir, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

let indexHtml = await readFile(resolve(distDir, "index.html"), "utf8");
indexHtml = indexHtml.replace("<title>iDoctor Music Tools</title>", "<title>iDoctor Music Tools | Tu Doctor musical | Apps iOS para músicos</title>");
indexHtml = indexHtml.replace("</head>", `${headSeo}\n  </head>`);
indexHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${seoFallback}</div>`);
await writeFile(resolve(distDir, "index.html"), indexHtml);
await writeFile(resolve(distDir, "404.html"), indexHtml);

for (const [index, app] of apps.entries()) {
  await write(`apps/${app.slug}/index.html`, appPage(app, index));
}

const urls = [
  { loc: `${siteUrl}/`, priority: "1.0" },
  ...apps.map((app) => ({ loc: absoluteUrl(`apps/${app.slug}/`), priority: app.status === "Disponible" ? "0.9" : "0.7" })),
  { loc: absoluteUrl("Privacy.txt"), priority: "0.3" },
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await write("sitemap.xml", sitemapXml);
await write("google-sitemap.xml", sitemapXml);
await write(
  "sitemap-index.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${absoluteUrl("sitemap.xml")}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${absoluteUrl("google-sitemap.xml")}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`,
);

await write(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("sitemap.xml")}
Sitemap: ${absoluteUrl("google-sitemap.xml")}
Sitemap: ${absoluteUrl("sitemap-index.xml")}
`,
);

await write(`${indexNowKey}.txt`, indexNowKey);
await write(
  "llms.txt",
  `# iDoctor Music Tools

${BRAND_SLOGAN}. Portfolio de aplicaciones iOS para músicos, cantantes, guitarristas, bandas y creadores.

URL principal: ${siteUrl}/
Sitemap: ${absoluteUrl("sitemap.xml")}

## Aplicaciones
${apps
  .map(
    (app) => `- ${app.name}: ${app.tagline} Estado: ${app.status}. URL: ${absoluteUrl(`apps/${app.slug}/`)}`,
  )
  .join("\n")}
`,
);

if (existsSync(resolve("Privacy.txt"))) {
  await copyFile(resolve("Privacy.txt"), resolve(distDir, "Privacy.txt"));
}

console.log(`SEO files generated for ${siteUrl}`);
console.log(`IndexNow key: ${indexNowKey}`);
