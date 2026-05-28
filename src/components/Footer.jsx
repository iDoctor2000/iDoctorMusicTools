import { APP_STORE_PORTFOLIO_URL } from "../data/apps.js";
import { Icons } from "./icons.jsx";
import { publicUrl } from "../utils/publicUrl.js";

const links = [
  { label: "App Store", href: APP_STORE_PORTFOLIO_URL },
  { label: "Política de privacidad", href: publicUrl("Privacy.txt") },
  { label: "Contacto", href: "mailto:jagomezc@gmail.com" },
  { label: "Soporte", href: "mailto:jagomezc@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-300/10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-neon-cyan">
              <Icons.Music className="h-5 w-5" />
            </span>
            <p className="font-display text-lg font-bold text-white">
              iDoctor Music Tools
            </p>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            Apps musicales diseñadas para músicos, cantantes y bandas.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-300">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="transition hover:text-neon-cyan"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-cyan-300/10 pt-6 text-sm text-slate-500">
        © 2026 iDoctor Music Tools. Todos los derechos reservados.
      </div>
    </footer>
  );
}
