import { motion } from "framer-motion";
import { audiences } from "../data/apps.js";
import { DynamicIcon } from "./icons.jsx";
import SectionHeading from "./SectionHeading.jsx";

export default function AudienceSection() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Para quién es" title="Del ensayo al escenario">
          El centro de mando musical de tu iPhone y iPad: herramientas claras
          para perfiles reales, rutinas reales y música real.
        </SectionHeading>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience, index) => (
            <motion.article
              key={audience.label}
              className="audience-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-90px" }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.25) }}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-neon-cyan">
                <DynamicIcon name={audience.icon} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {audience.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {audience.text}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
