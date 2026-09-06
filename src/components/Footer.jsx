import { APP_STORE_DEVELOPER_URL } from "../data/catalog.js";
import { Icons } from "./icons.jsx";
import { t, href } from "../i18n/index.js";

export const SUPPORT_EMAIL = "soporte@idoctormusic.com";

export default function Footer() {
  const links = [
    { label: t.footer.links.appStore, href: APP_STORE_DEVELOPER_URL, external: true },
    { label: t.footer.links.privacy, href: href("privacidad/") },
    { label: t.footer.links.support, href: href("soporte/") },
    { label: t.footer.links.contact, href: `mailto:${SUPPORT_EMAIL}` },
  ];

  return (
    <footer className="relative border-t border-cyan-300/10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-neon-cyan">
              <Icons.Music className="h-5 w-5" />
            </span>
            <p className="font-display text-lg font-bold text-white">iDoctor Music Tools</p>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{t.footer.blurb(t.slogan)}</p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-300">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="transition hover:text-neon-cyan"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-cyan-300/10 pt-6 text-sm text-slate-500">
        © {new Date().getFullYear()} iDoctor Music Tools · Juan A. Gómez Company. {t.footer.rights}
      </div>
    </footer>
  );
}
