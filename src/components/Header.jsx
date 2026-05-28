import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { APP_STORE_PORTFOLIO_URL, BRAND_SLOGAN } from "../data/apps.js";
import { Icons } from "./icons.jsx";

const navLinks = [
  { href: "#ecosistema", label: "Ecosistema" },
  { href: "#apps", label: "Apps" },
  { href: "#experiencia", label: "Mockups" },
  { href: "#roadmap", label: "Roadmap" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-cyan-300/10 bg-space-black/[0.74] shadow-glow backdrop-blur-2xl"
          : "bg-space-black/[0.25] backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#inicio"
          className="group flex items-center gap-3"
          aria-label="iDoctor Music Tools"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-neon-cyan shadow-glow">
            <Icons.Orbit className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
            <span className="absolute inset-1 rounded-2xl border border-violet-400/20" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold tracking-wide text-white sm:text-base">
              iDoctor Music Tools
            </span>
            <span className="hidden text-[11px] font-semibold text-neon-cyan/85 sm:block">
              {BRAND_SLOGAN}
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition hover:text-neon-cyan"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            className="glow-button glow-button-sm"
            href={APP_STORE_PORTFOLIO_URL}
            target="_blank"
            rel="noreferrer"
          >
            App Store
            <Icons.ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/20 bg-white/5 text-slate-100 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <Icons.X className="h-5 w-5" /> : <Icons.Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          className="border-t border-cyan-300/10 bg-space-black/[0.95] px-4 pb-5 pt-2 backdrop-blur-2xl lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
          <div className="mx-auto grid max-w-7xl gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-cyan-300/10 hover:text-neon-cyan"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              className="glow-button mt-2 justify-center"
              href={APP_STORE_PORTFOLIO_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              Ver en App Store
              <Icons.ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
}
