import { motion } from "framer-motion";
import { Icons } from "./icons.jsx";
import SectionHeading from "./SectionHeading.jsx";
import { t } from "../i18n/index.js";

export default function WhySection() {
  const blocks = t.why.blocks;
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} />

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {blocks.map((block, index) => {
            const Icon = Icons[block.icon];

            return (
              <motion.article
                key={block.title}
                className="glass-panel p-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <div className="mb-6 grid h-12 w-12 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-neon-cyan shadow-glow">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">
                  {block.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{block.text}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
