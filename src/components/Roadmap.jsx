import { motion } from "framer-motion";
import { roadmap } from "../data/apps.js";
import { Icons } from "./icons.jsx";
import SectionHeading from "./SectionHeading.jsx";

export default function Roadmap() {
  return (
    <section id="roadmap" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Roadmap"
          title="Un proyecto vivo, en expansión constante"
        >
          Precisión, control y creatividad: cada lanzamiento añade una nueva
          órbita al ecosistema musical iDoctor.
        </SectionHeading>

        <div className="relative mt-16">
          <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-neon-cyan via-neon-violet to-neon-magenta md:left-1/2" />
          <div className="grid gap-8">
            {roadmap.map((item, index) => (
              <motion.div
                key={item}
                className={`roadmap-item ${index % 2 ? "md:ml-auto md:pl-14" : "md:pr-14"}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.25) }}
              >
                <span className="roadmap-node">
                  {index < 3 ? (
                    <Icons.BadgeCheck className="h-5 w-5" />
                  ) : (
                    <Icons.Sparkles className="h-5 w-5" />
                  )}
                </span>
                <div className="glass-panel px-5 py-4">
                  <p className="font-orbitron text-xs uppercase tracking-[0.22em] text-neon-cyan">
                    Fase {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-white">
                    {item}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
