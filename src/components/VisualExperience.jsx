import { useState } from "react";
import { motion } from "framer-motion";
import { getApps } from "../data/catalog.js";
import DeviceMockup from "./DeviceMockup.jsx";
import SectionHeading from "./SectionHeading.jsx";
import { t, LANG } from "../i18n/index.js";

/**
 * Conmutador iPhone / iPad, con el mismo lenguaje visual que el de idioma del
 * Header (píldora con el activo en cian). Son botones de verdad —no enlaces—
 * porque no cambian de página: solo cambian lo que se pinta debajo.
 */
function DeviceSwitch({ device, onChange }) {
  const options = [
    ["iphone", t.screens.iphone],
    ["ipad", t.screens.ipad],
  ];
  return (
    <div
      role="group"
      aria-label={t.screens.deviceLabel}
      className="mx-auto mt-8 inline-flex items-center overflow-hidden rounded-full border border-cyan-300/25 bg-white/5 text-xs font-bold uppercase tracking-wider"
    >
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={device === value}
          className={
            device === value
              ? "bg-neon-cyan px-4 py-2 text-space-black"
              : "px-4 py-2 text-slate-300 transition hover:text-neon-cyan"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function VisualExperience() {
  const [device, setDevice] = useState("iphone");
  const apps = getApps(LANG);

  // iPhone: la portada de cada app (una tarjeta por app).
  // iPad: TODAS las capturas de iPad, una tarjeta por captura.
  const cards =
    device === "ipad"
      ? apps.flatMap((app) =>
          (app.ipadScreenshots || []).map((src, i) => ({
            key: src,
            app,
            src,
            index: i + 1,
          })),
        )
      : apps
          .filter((app) => app.screenshot)
          .map((app) => ({ key: app.slug, app, src: app.screenshot, index: 1 }));

  return (
    <section id="pantalla" className="section-shell relative overflow-hidden">
      {/* Resplandor decorativo. `pointer-events-none` es OBLIGATORIO: al estar
          posicionado en absoluto y sin z-index, se pintaba POR ENCIMA del
          contenido y se tragaba los clics del conmutador (que cae justo en su
          franja, de 80px a 400px). Las tarjetas quedan más abajo y por eso el
          problema no se veía. */}
      <div className="pointer-events-none absolute inset-x-0 top-20 h-80 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t.screens.eyebrow} title={t.screens.title}>
          {t.screens.text}
        </SectionHeading>

        <div className="text-center">
          <DeviceSwitch device={device} onChange={setDevice} />
        </div>

        {cards.length === 0 ? (
          <p className="mt-16 text-center text-slate-400">{t.screens.emptyIpad}</p>
        ) : (
          <motion.div
            /* OJO: sin `key={device}`. Ponerlo obliga a REMONTAR la rejilla al
               cambiar de dispositivo y, como la animación de entrada arranca en
               opacidad 0 y solo se dispara al entrar en pantalla, si el usuario
               ya había pasado de largo la sección se quedaba INVISIBLE. Sin key,
               la rejilla se revela una vez y el conmutador solo cambia lo que
               hay dentro — que además es lo que se espera de un filtro. */
            className={
              device === "ipad"
                ? "mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                : "mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-110px" }}
            transition={{ duration: 0.75 }}
          >
            {cards.map((card) => (
              <DeviceMockup
                key={card.key}
                app={card.app}
                device={device}
                src={card.src}
                index={card.index}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
