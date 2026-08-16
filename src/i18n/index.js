// i18n — textos de la INTERFAZ (los de las apps viven en src/data/apps*.js).
//
// Idioma en runtime, sin router: el generador SEO escribe `<html lang="en">`
// en /en/index.html; el bundle (uno solo para ambos idiomas) lo lee al
// arrancar y, si no está, mira si la ruta empieza por /en/. Un solo build,
// dos webs. `t` es el diccionario del idioma activo; `href()` construye rutas
// internas respetando el prefijo (/ o /en/).

import { DEFAULT_LANG, langPrefix, localPath } from "../data/catalog.js";
import { BRAND_SLOGAN } from "../data/apps.js";

function detectLang() {
  if (typeof document !== "undefined") {
    const htmlLang = (document.documentElement.lang || "").toLowerCase();
    if (htmlLang.startsWith("en")) return "en";
    if (htmlLang.startsWith("es")) return "es";
  }
  if (typeof location !== "undefined" && /^\/en(\/|$)/.test(location.pathname)) return "en";
  return DEFAULT_LANG;
}

export const LANG = detectLang();
export const PREFIX = langPrefix(LANG);
export const href = (path = "") => localPath(LANG, path);
/** Ruta equivalente en el otro idioma (para el selector ES/EN). */
export const altHref = (lang, hash = "") => `${langPrefix(lang)}${hash}`;

const strings = {
  es: {
    slogan: BRAND_SLOGAN,
    nav: [
      { href: "#ecosistema", label: "Ecosistema" },
      { href: "#apps", label: "Apps" },
      { href: "#pantalla", label: "En pantalla" },
      { href: "#roadmap", label: "Roadmap" },
    ],
    header: {
      cta: "Ver en App Store",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      langLabel: "Idioma",
    },
    hero: {
      badge: "Una constelación de herramientas para músicos",
      title: "iDoctor Music Tools",
      lead:
        "Afinador, metrónomo, cejilla, BeatBuddy, setlists y stems en directo: apps iOS hechas por músicos que tocan, para el ensayo y el escenario.",
      sub:
        "Cinco apps ya en la App Store y dos en camino. Diseño oscuro legible en el escenario, precisión de estudio y cero menús inútiles: abrir y tocar.",
      primary: "Explorar apps",
      secondary: "Ver en App Store",
      chips: ["Afina", "Mide", "Transporta", "Organiza", "Toca en directo"],
      scrollAria: "Ir al ecosistema",
      core: "Music OS",
      tools: {
        Guitar: "Guitarra",
        Timer: "Metrónomo",
        Gauge: "Afinador",
        ListMusic: "Setlist",
        MicVocal: "Voz",
        AudioLines: "Stems",
      },
    },
    ecosystem: {
      eyebrow: "El ecosistema",
      title: "Una galaxia de herramientas para músicos reales",
      text:
        "iDoctor Music Tools no es una sola app: es un portfolio diseñado para resolver problemas concretos del músico moderno. Cada app, una herramienta. Todas juntas, un ecosistema.",
      core: "Core",
    },
    apps: {
      eyebrow: "Apps",
      title: "Precisión, control y creatividad, del ensayo al escenario",
      text:
        "Cinco apps a la venta en la App Store y dos en desarrollo. Cada una resuelve un problema concreto; juntas cubren el directo de principio a fin.",
      features: "Funciones principales",
      audience: "Dirigido a",
      buy: "Descargar en App Store",
      buyWithPrice: (price) => `Descargar · ${price}`,
      rate: "Valorar en App Store",
      more: "Más información",
      soon: "Próximamente en App Store",
      pending: "Enlace de App Store en preparación",
      screenshotAlt: (name, i) => `Captura ${i} de ${name}`,
      ratingAria: (rating, count) => `${rating} de 5 estrellas, ${count} valoraciones`,
    },
    why: {
      eyebrow: "Por qué iDoctor Music Tools",
      title: "Tecnología musical al servicio de la inspiración",
      blocks: [
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
      ],
    },
    audience: {
      eyebrow: "Para quién es",
      title: "Del ensayo al escenario",
      text: "El centro de mando musical de tu iPhone y iPad: herramientas claras para perfiles reales, rutinas reales y música real.",
    },
    screens: {
      eyebrow: "En pantalla",
      title: "Así se ven en tu iPhone y iPad",
      text: "Capturas reales de las apps, tal y como están en la App Store. Diseño oscuro pensado para leerse de un vistazo en el escenario.",
    },
    roadmap: {
      eyebrow: "Roadmap",
      title: "Un proyecto vivo, en expansión constante",
      text: "Precisión, control y creatividad: cada lanzamiento añade una nueva órbita al ecosistema musical iDoctor.",
      phase: "Fase",
      done: "En la App Store",
      soon: "En camino",
    },
    cta: {
      kicker: "Afina. Mide. Transporta. Organiza. Toca en directo.",
      title: "Entra en la constelación iDoctor Music Tools",
      text: "Convierte tu iPhone o iPad en una estación musical inteligente, con herramientas diseñadas para músicos reales.",
      primary: "Ver todas en App Store",
      secondary: "Explorar el portfolio",
    },
    footer: {
      blurb: (slogan) => `${slogan}. Apps musicales diseñadas para músicos, cantantes y bandas.`,
      links: {
        appStore: "App Store",
        privacy: "Política de privacidad",
        support: "Soporte",
        contact: "Contacto",
      },
      rights: "Todos los derechos reservados.",
    },
    pages: {
      back: "← Volver a iDoctor Music Tools",
      appTitleSuffix: "iDoctor Music Tools",
      buy: "Descargar en App Store",
      rate: "Valorar en App Store",
      priceLabel: "Precio",
      versionLabel: "Versión",
      requiresLabel: "Requiere",
      languagesLabel: "Idiomas",
      updatedLabel: "Actualizada",
      screenshotsTitle: "Capturas",
      alsoTitle: "También en iDoctor Music Tools",
      privacyTitle: "Política de privacidad",
      supportTitle: "Soporte y contacto",
      supportIntro:
        "¿Algo no funciona, tienes una duda o una idea? Escríbenos: respondemos personalmente, porque somos músicos y usamos estas apps en nuestros propios conciertos.",
      supportEmailLabel: "Correo de soporte",
      supportAppsTitle: "Soporte por app",
      supportManualsTitle: "Manuales",
      supportManualsText:
        "iDoctor MusicBand tiene manual de usuario en español e inglés (versiones PRO y gratuita), accesible desde el botón «?» de la propia app.",
      supportPrivacyText: "Cómo tratamos tus datos:",
      writeReview: "Escribir una reseña",
    },
  },
  en: {
    slogan: "Your musical Doctor",
    nav: [
      { href: "#ecosistema", label: "Ecosystem" },
      { href: "#apps", label: "Apps" },
      { href: "#pantalla", label: "Screens" },
      { href: "#roadmap", label: "Roadmap" },
    ],
    header: {
      cta: "View on App Store",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      langLabel: "Language",
    },
    hero: {
      badge: "A constellation of tools for musicians",
      title: "iDoctor Music Tools",
      lead:
        "Tuner, metronome, capo, BeatBuddy, setlists and live stems: iOS apps made by working musicians, for rehearsal and stage.",
      sub:
        "Five apps already on the App Store and two on the way. Dark design you can read on stage, studio-grade precision and zero useless menus: open and play.",
      primary: "Explore the apps",
      secondary: "View on App Store",
      chips: ["Tune", "Measure", "Transpose", "Organise", "Play live"],
      scrollAria: "Go to the ecosystem",
      core: "Music OS",
      tools: {
        Guitar: "Guitar",
        Timer: "Metronome",
        Gauge: "Tuner",
        ListMusic: "Setlist",
        MicVocal: "Voice",
        AudioLines: "Stems",
      },
    },
    ecosystem: {
      eyebrow: "The ecosystem",
      title: "A galaxy of tools for real musicians",
      text:
        "iDoctor Music Tools is not a single app: it is a portfolio designed to solve concrete problems of the modern musician. Each app, one tool. All together, an ecosystem.",
      core: "Core",
    },
    apps: {
      eyebrow: "Apps",
      title: "Precision, control and creativity, from rehearsal to stage",
      text:
        "Five apps on sale on the App Store and two in development. Each solves one concrete problem; together they cover the live show from start to finish.",
      features: "Key features",
      audience: "Made for",
      buy: "Get it on the App Store",
      buyWithPrice: (price) => `Get it · ${price}`,
      rate: "Rate on the App Store",
      more: "Learn more",
      soon: "Coming soon to the App Store",
      pending: "App Store link coming soon",
      screenshotAlt: (name, i) => `${name} screenshot ${i}`,
      ratingAria: (rating, count) => `${rating} out of 5 stars, ${count} ratings`,
    },
    why: {
      eyebrow: "Why iDoctor Music Tools",
      title: "Music technology at the service of inspiration",
      blocks: [
        {
          title: "Designed by musicians",
          text: "Tools born from real experience in rehearsal, on stage and while writing.",
          icon: "Guitar",
        },
        {
          title: "Precision without fuss",
          text: "Direct, clear, useful apps. No unnecessary menus. Open and play.",
          icon: "SlidersHorizontal",
        },
        {
          title: "Professional look",
          text: "Dark, readable, elegant design made for real practice and live situations.",
          icon: "ShieldCheck",
        },
        {
          title: "A growing ecosystem",
          text: "Each app solves one concrete problem, but all share one vision: help musicians play better, get organised and create more.",
          icon: "Orbit",
        },
      ],
    },
    audience: {
      eyebrow: "Who it's for",
      title: "From rehearsal to stage",
      text: "The musical command centre of your iPhone and iPad: clear tools for real profiles, real routines and real music.",
    },
    screens: {
      eyebrow: "On screen",
      title: "This is how they look on your iPhone and iPad",
      text: "Real screenshots of the apps, exactly as they are on the App Store. Dark design meant to be read at a glance on stage.",
    },
    roadmap: {
      eyebrow: "Roadmap",
      title: "A living project, constantly expanding",
      text: "Precision, control and creativity: every release adds a new orbit to the iDoctor musical ecosystem.",
      phase: "Phase",
      done: "On the App Store",
      soon: "On the way",
    },
    cta: {
      kicker: "Tune. Measure. Transpose. Organise. Play live.",
      title: "Enter the iDoctor Music Tools constellation",
      text: "Turn your iPhone or iPad into a smart music station, with tools designed for real musicians.",
      primary: "See them all on the App Store",
      secondary: "Explore the portfolio",
    },
    footer: {
      blurb: (slogan) => `${slogan}. Music apps designed for musicians, singers and bands.`,
      links: {
        appStore: "App Store",
        privacy: "Privacy policy",
        support: "Support",
        contact: "Contact",
      },
      rights: "All rights reserved.",
    },
    pages: {
      back: "← Back to iDoctor Music Tools",
      appTitleSuffix: "iDoctor Music Tools",
      buy: "Get it on the App Store",
      rate: "Rate on the App Store",
      priceLabel: "Price",
      versionLabel: "Version",
      requiresLabel: "Requires",
      languagesLabel: "Languages",
      updatedLabel: "Updated",
      screenshotsTitle: "Screenshots",
      alsoTitle: "Also from iDoctor Music Tools",
      privacyTitle: "Privacy policy",
      supportTitle: "Support & contact",
      supportIntro:
        "Something not working, a question or an idea? Write to us: we answer personally, because we are musicians and we use these apps at our own gigs.",
      supportEmailLabel: "Support email",
      supportAppsTitle: "Support per app",
      supportManualsTitle: "Manuals",
      supportManualsText:
        "iDoctor MusicBand has a user manual in Spanish and English (PRO and free versions), available from the “?” button inside the app.",
      supportPrivacyText: "How we handle your data:",
      writeReview: "Write a review",
    },
  },
};

export const t = strings[LANG];
export const stringsFor = (lang) => strings[lang] || strings[DEFAULT_LANG];
export default t;
