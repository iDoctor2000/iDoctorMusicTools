import { motion } from "framer-motion";
import { apps } from "../data/apps.js";
import DeviceMockup from "./DeviceMockup.jsx";
import SectionHeading from "./SectionHeading.jsx";

export default function VisualExperience() {
  return (
    <section id="experiencia" className="section-shell relative overflow-hidden">
      <div className="absolute inset-x-0 top-20 h-80 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Experiencia visual"
          title="Mockups listos para tus capturas de iPhone y iPad"
        >
          La estructura ya apunta a las rutas definitivas en
          /public/screenshots. Cuando tengas las capturas, solo tendrás que
          reemplazar los archivos.
        </SectionHeading>

        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-5"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-110px" }}
          transition={{ duration: 0.75 }}
        >
          {apps.map((app, index) => (
            <DeviceMockup key={app.slug} app={app} size={index === 3 ? "tablet" : "phone"} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
