import { motion } from "framer-motion";
import { apps, ecosystemPoints } from "../data/apps.js";
import { DynamicIcon, Icons } from "./icons.jsx";
import SectionHeading from "./SectionHeading.jsx";

export default function Ecosystem() {
  return (
    <section id="ecosistema" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="El ecosistema"
          title="Una galaxia de herramientas para músicos reales"
        >
          iDoctor Music Tools no es una sola app: es un portfolio diseñado para
          resolver problemas concretos del músico moderno. Cada app, una
          herramienta. Todas juntas, un ecosistema.
        </SectionHeading>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            {ecosystemPoints.map((point, index) => (
              <div key={point} className="ecosystem-point">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-neon-cyan">
                  {index + 1}
                </span>
                <p>{point}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="constellation-map"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <svg
              aria-hidden="true"
              className="absolute inset-0 hidden h-full w-full lg:block"
              viewBox="0 0 740 460"
              fill="none"
            >
              <path
                d="M114 278 C226 88 406 90 586 178 C662 216 608 360 472 354 C308 346 250 432 114 278Z"
                stroke="url(#constellationGradient)"
                strokeWidth="1.5"
                strokeDasharray="8 12"
              />
              <path
                d="M176 126 C318 222 438 286 604 312"
                stroke="rgba(217,70,239,0.32)"
                strokeWidth="1"
                strokeDasharray="4 10"
              />
              <defs>
                <linearGradient id="constellationGradient" x1="92" y1="93" x2="636" y2="383">
                  <stop stopColor="#22D3EE" stopOpacity="0.72" />
                  <stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#D946EF" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative grid gap-4 sm:grid-cols-2 lg:min-h-[560px] lg:grid-cols-none">
              {apps.map((app, index) => (
                <div key={app.slug} className={`planet-module planet-${index + 1}`}>
                  <span className={`planet-icon accent-${app.accent}`}>
                    <DynamicIcon name={app.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-white">
                      {app.name}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      {app.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-center lg:block">
              <div className="grid h-32 w-32 place-items-center rounded-full border border-cyan-300/25 bg-space-black/75 shadow-glow backdrop-blur-xl">
                <div>
                  <Icons.Satellite className="mx-auto h-8 w-8 text-neon-cyan" />
                  <p className="mt-2 font-orbitron text-[10px] uppercase tracking-[0.24em] text-slate-300">
                    Core
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
