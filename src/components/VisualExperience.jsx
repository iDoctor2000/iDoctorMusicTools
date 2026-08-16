import { motion } from "framer-motion";
import { getApps } from "../data/catalog.js";
import DeviceMockup from "./DeviceMockup.jsx";
import SectionHeading from "./SectionHeading.jsx";
import { t, LANG } from "../i18n/index.js";

export default function VisualExperience() {
  const apps = getApps(LANG).filter((app) => app.screenshot);
  return (
    <section id="pantalla" className="section-shell relative overflow-hidden">
      <div className="absolute inset-x-0 top-20 h-80 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t.screens.eyebrow} title={t.screens.title}>
          {t.screens.text}
        </SectionHeading>

        <motion.div
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-110px" }}
          transition={{ duration: 0.75 }}
        >
          {apps.map((app) => (
            <DeviceMockup key={app.slug} app={app} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
