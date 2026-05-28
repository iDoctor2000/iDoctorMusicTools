import { motion } from "framer-motion";

export default function SectionHeading({
  eyebrow,
  title,
  children,
  align = "center",
}) {
  const centered = align === "center";

  return (
    <motion.div
      className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {eyebrow && (
        <p className="mb-4 font-orbitron text-xs uppercase tracking-[0.32em] text-neon-cyan">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {children && (
        <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
          {children}
        </p>
      )}
    </motion.div>
  );
}
