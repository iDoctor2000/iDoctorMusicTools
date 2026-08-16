import { motion } from "framer-motion";
import { APP_STORE_DEVELOPER_URL } from "../data/catalog.js";
import { DynamicIcon, Icons } from "./icons.jsx";
import { publicUrl } from "../utils/publicUrl.js";
import { t } from "../i18n/index.js";

const floatingTools = [
  { icon: "Guitar", x: "7%", y: "19%", delay: 0 },
  { icon: "Timer", x: "73%", y: "13%", delay: 0.35 },
  { icon: "Gauge", x: "84%", y: "62%", delay: 0.7 },
  { icon: "ListMusic", x: "16%", y: "72%", delay: 1.05 },
  { icon: "MicVocal", x: "56%", y: "79%", delay: 1.4 },
  { icon: "AudioLines", x: "42%", y: "8%", delay: 1.75 },
];

// Fondo del hero: WebP de ~150 KB (antes un PNG de 2 MB, el LCP de la página).
// El postbuild añade un <link rel="preload"> a esta misma ruta.
export const HERO_BG = "assets/galactic-command-center.webp";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden px-4 pb-14 pt-28 sm:px-6 lg:px-8"
    >
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.56]"
        style={{ backgroundImage: `url('${publicUrl(HERO_BG)}')` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-space-black via-space-deep/[0.88] to-space-night/[0.72]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-space-deep to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        {/* Sin animación de opacidad en el bloque de texto: el LCP debe pintarse
            en el primer frame (Core Web Vitals) y no aparecer 0,85 s después. */}
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-neon-cyan shadow-glow backdrop-blur-xl">
            <Icons.Sparkles className="h-4 w-4" />
            {t.hero.badge}
          </div>
          <p className="mb-4 font-orbitron text-sm font-bold text-neon-magenta sm:text-base">{t.slogan}</p>
          <h1 className="max-w-5xl font-display text-5xl font-black leading-[0.92] tracking-normal text-white sm:text-7xl lg:text-8xl">
            {t.hero.title}
          </h1>
          <p className="mt-7 max-w-3xl text-xl font-semibold leading-8 text-slate-100 sm:text-2xl">
            {t.hero.lead}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{t.hero.sub}</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a className="glow-button glow-button-lg" href="#apps">
              {t.hero.primary}
              <Icons.ArrowRight className="h-5 w-5" />
            </a>
            <a
              className="ghost-button ghost-button-lg"
              href={APP_STORE_DEVELOPER_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t.hero.secondary}
              <Icons.ExternalLink className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-slate-300">
            {t.hero.chips.map((item) => (
              <span key={item} className="hud-chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="relative mx-auto hidden aspect-square w-full max-w-[560px] lg:block"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          aria-hidden="true"
        >
          <div className="orbital-shell absolute inset-4 rounded-full border border-cyan-300/20" />
          <div className="orbital-shell orbital-shell-delayed absolute inset-16 rounded-full border border-violet-400/20" />
          <div className="absolute inset-24 rounded-full border border-fuchsia-300/[0.15] bg-white/[0.035] shadow-violetGlow backdrop-blur-md" />
          <div className="command-core absolute left-1/2 top-1/2 grid h-52 w-52 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/30 bg-space-black/[0.70] text-center shadow-glow backdrop-blur-xl">
            <div>
              <Icons.Orbit className="mx-auto mb-4 h-10 w-10 text-neon-cyan" />
              <p className="font-orbitron text-xs uppercase tracking-[0.32em] text-neon-cyan">{t.hero.core}</p>
              <p className="mt-2 font-display text-2xl font-bold text-white">iDoctor</p>
            </div>
          </div>

          {floatingTools.map((tool) => (
            <motion.div
              key={tool.icon}
              className="floating-tool absolute"
              style={{ left: tool.x, top: tool.y }}
              animate={{ y: [0, -14, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 4, delay: tool.delay, repeat: Infinity, ease: "easeInOut" }}
            >
              <DynamicIcon name={tool.icon} className="h-6 w-6 text-neon-cyan" />
              <span>{t.hero.tools[tool.icon]}</span>
            </motion.div>
          ))}

          <div className="frequency-panel absolute bottom-7 left-1/2 h-24 w-[82%] -translate-x-1/2 overflow-hidden rounded-lg border border-cyan-300/20 bg-space-black/[0.55] p-5 shadow-glow backdrop-blur-xl">
            <div className="frequency-bars">
              {Array.from({ length: 38 }, (_, index) => (
                <span key={index} style={{ "--i": index }} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <a
        href="#ecosistema"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-neon-cyan/80 sm:block"
        aria-label={t.hero.scrollAria}
      >
        <Icons.ChevronDown className="h-7 w-7 animate-bounce" />
      </a>
    </section>
  );
}
