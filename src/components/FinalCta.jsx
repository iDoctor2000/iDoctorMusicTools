import { motion } from "framer-motion";
import { APP_STORE_PORTFOLIO_URL } from "../data/apps.js";
import { Icons } from "./icons.jsx";

export default function FinalCta() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        className="cta-panel mx-auto max-w-6xl overflow-hidden px-6 py-14 text-center sm:px-10 lg:px-16"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="relative z-10">
          <p className="mb-5 font-orbitron text-xs uppercase tracking-[0.32em] text-neon-cyan">
            Afina. Mide. Transporta. Organiza. Crea.
          </p>
          <h2 className="mx-auto max-w-4xl font-display text-4xl font-black leading-tight text-white sm:text-5xl">
            Entra en la constelación iDoctor Music Tools
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Convierte tu iPhone o iPad en una estación musical inteligente.
            Afina, mide, transporta, organiza y crea con herramientas diseñadas
            para músicos reales.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              className="glow-button glow-button-lg justify-center"
              href={APP_STORE_PORTFOLIO_URL}
              target="_blank"
              rel="noreferrer"
            >
              Ver apps en App Store
              <Icons.ExternalLink className="h-5 w-5" />
            </a>
            <a className="ghost-button ghost-button-lg justify-center" href="#apps">
              Explorar el portfolio
              <Icons.ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
