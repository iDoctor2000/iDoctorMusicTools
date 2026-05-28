import { motion } from "framer-motion";
import { Icons } from "./icons.jsx";
import SectionHeading from "./SectionHeading.jsx";

const blocks = [
  {
    title: "Diseñadas por músicos",
    text: "Herramientas pensadas desde la experiencia real del ensayo, el escenario y la composición.",
    icon: "Guitar",
  },
  {
    title: "Precisión sin complicaciones",
    text: "Apps directas, claras y útiles. Sin menús innecesarios. Abrir y tocar.",
    icon: "SlidersHorizontal",
  },
  {
    title: "Estética profesional",
    text: "Diseño oscuro, visible, elegante y pensado para usarse en situaciones reales de práctica o directo.",
    icon: "ShieldCheck",
  },
  {
    title: "Un ecosistema en expansión",
    text: "Cada app resuelve un problema concreto, pero todas forman parte de una visión común: ayudar al músico a tocar mejor, organizarse mejor y crear más.",
    icon: "Orbit",
  },
];

export default function WhySection() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Por qué iDoctor Music Tools"
          title="Tecnología musical al servicio de la inspiración"
        />

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
