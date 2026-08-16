import { motion } from "framer-motion";
import { getApps } from "../data/catalog.js";
import { DynamicIcon, Icons } from "./icons.jsx";
import SectionHeading from "./SectionHeading.jsx";
import { publicUrl } from "../utils/publicUrl.js";
import { t, LANG } from "../i18n/index.js";

/** Icono REAL de la app (el de la App Store) con el lucide de reserva. */
export function AppIcon({ app, className = "h-8 w-8" }) {
  if (app.iconImage) {
    return (
      <img
        src={publicUrl(app.iconImage)}
        alt=""
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        className="h-14 w-14 rounded-2xl shadow-glow"
      />
    );
  }
  return (
    <span className={`app-icon accent-${app.accent}`}>
      <DynamicIcon name={app.icon} className={className} />
    </span>
  );
}

/** Estrellas de la App Store (solo si hay valoraciones). */
function Rating({ app }) {
  if (!app.ratingCount) return null;
  const rounded = Math.round(app.rating * 2) / 2;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300"
      aria-label={t.apps.ratingAria(app.rating.toFixed(1), app.ratingCount)}
      title={t.apps.ratingAria(app.rating.toFixed(1), app.ratingCount)}
    >
      <span aria-hidden="true">{"★".repeat(Math.floor(rounded))}{rounded % 1 ? "½" : ""}</span>
      <span className="text-slate-400">
        {app.rating.toFixed(1)} · {app.ratingCount}
      </span>
    </span>
  );
}

/** Tira de capturas reales (WebP, lazy). Hasta 3 en la tarjeta. */
function ScreenshotStrip({ app }) {
  const shots = app.screenshots.slice(0, 3);
  if (!shots.length) return null;
  return (
    <div className="screenshot-strip" aria-label={t.pages.screenshotsTitle}>
      {shots.map((src, i) => (
        <a key={src} href={app.pagePath} className="screenshot-thumb">
          <img
            src={publicUrl(src)}
            alt={t.apps.screenshotAlt(app.name, i + 1)}
            width={320}
            height={693}
            loading="lazy"
            decoding="async"
          />
        </a>
      ))}
    </div>
  );
}

function AppCard({ app, index }) {
  return (
    <motion.article
      id={`app-${app.slug}`}
      className="app-card"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.08, 0.24) }}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <AppIcon app={app} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={app.available ? "status-pill" : "status-pill status-soon"}>
                  {app.statusLabel}
                </span>
                {app.available && app.formattedPrice && (
                  <span className="text-sm font-bold text-white">{app.formattedPrice}</span>
                )}
                <Rating app={app} />
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                <a href={app.pagePath} className="hover:text-neon-cyan">
                  {app.displayName}
                </a>
              </h3>
            </div>
          </div>

          <p className="mt-6 text-xl font-semibold leading-8 text-neon-cyan">{app.tagline}</p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{app.description}</p>
        </div>

        <ScreenshotStrip app={app} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.82fr]">
        <div>
          <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-slate-400">
            {t.apps.features}
          </h4>
          <ul className="grid gap-3 sm:grid-cols-2">
            {app.features.map((feature) => (
              <li key={feature} className="feature-item">
                <Icons.BadgeCheck className="h-4 w-4 shrink-0 text-neon-cyan" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="app-audience-panel">
          <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-slate-400">
            {t.apps.audience}
          </p>
          <p className="mt-4 text-base leading-8 text-slate-200">{app.audience}</p>
          {app.note && (
            <p className="mt-5 rounded-2xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-sm leading-6 text-violet-100">
              {app.note}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {app.appStoreUrl ? (
          <>
            <a
              className="glow-button justify-center"
              href={app.appStoreUrl}
              target="_blank"
              rel="noreferrer"
            >
              {app.formattedPrice ? t.apps.buyWithPrice(app.formattedPrice) : t.apps.buy}
              <Icons.ExternalLink className="h-4 w-4" />
            </a>
            {app.reviewUrl && (
              <a
                className="ghost-button justify-center"
                href={app.reviewUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Icons.Sparkles className="h-4 w-4" />
                {t.apps.rate}
              </a>
            )}
          </>
        ) : (
          <span className="disabled-button justify-center">
            {app.available ? t.apps.pending : t.apps.soon}
          </span>
        )}
        <a className="ghost-button justify-center" href={app.pagePath}>
          {t.apps.more}
          <Icons.ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.article>
  );
}

export default function AppsSection() {
  const apps = getApps(LANG);
  return (
    <section id="apps" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t.apps.eyebrow} title={t.apps.title}>
          {t.apps.text}
        </SectionHeading>

        <div className="mt-16 grid gap-6">
          {apps.map((app, index) => (
            <AppCard key={app.slug} app={app} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
