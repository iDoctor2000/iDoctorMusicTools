import { motion } from "framer-motion";
import { apps } from "../data/apps.js";
import { DynamicIcon, Icons } from "./icons.jsx";
import SectionHeading from "./SectionHeading.jsx";

function AppCard({ app, index }) {
  const isSoon = app.status === "Próximamente";
  const showVocalNote = app.slug === "vocal-warmup";

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
            <span className={`app-icon accent-${app.accent}`}>
              <DynamicIcon name={app.icon} className="h-8 w-8" />
            </span>
            <div>
              <span className={isSoon ? "status-pill status-soon" : "status-pill"}>
                {app.status}
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                {app.displayName || app.name}
              </h3>
            </div>
          </div>

          <p className="mt-6 text-xl font-semibold leading-8 text-neon-cyan">
            {app.tagline}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            {app.description}
          </p>
        </div>

        <div className="app-signal" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.82fr]">
        <div>
          <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-slate-400">
            Funciones principales
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
            Dirigido a
          </p>
          <p className="mt-4 text-base leading-8 text-slate-200">{app.audience}</p>
          {showVocalNote && (
            <p className="mt-5 rounded-2xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-sm leading-6 text-violet-100">
              Próximamente: se presentará como orientación vocal, no como
              diagnóstico absoluto.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          className="glow-button justify-center"
          href={app.appStoreUrl}
          target="_blank"
          rel="noreferrer"
        >
          Comprar en App Store
          <Icons.ExternalLink className="h-4 w-4" />
        </a>
        <a className="ghost-button justify-center" href="#experiencia">
          Más información
          <Icons.ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.article>
  );
}

export default function AppsSection() {
  return (
    <section id="apps" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Apps"
          title="Precisión, control y creatividad en módulos premium"
        >
          Del ensayo al escenario: apps diseñadas por músicos para músicos, con
          una estética profesional y enlaces de App Store configurables.
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
