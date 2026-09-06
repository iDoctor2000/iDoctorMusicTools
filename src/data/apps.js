// Página del desarrollador en la App Store (todas las apps juntas). Sin país
// en la ruta: Apple redirige a la tienda de cada visitante.
export const APP_STORE_DEVELOPER_URL =
  "https://apps.apple.com/developer/id1617442259";

// `appleId` es la clave que enlaza cada app con la App Store. Con él,
// `npm run store` (scripts/fetch-store-meta.mjs) descarga precio, valoraciones
// y capturas OFICIALES a src/data/store-meta.json, y `src/data/store.js` las
// fusiona con lo de aquí. Regla: si una app tiene ficha en la tienda, la web
// dice "Disponible" y enlaza — la web no vuelve a decir "Próximamente" de
// algo que está a la venta.
export const APP_STORE_PORTFOLIO_URL = APP_STORE_DEVELOPER_URL;

export const BRAND_SLOGAN = "Tu Doctor musical";

export const apps = [
  {
    slug: "tuner",
    appleId: 6770253477,
    name: "iDoctor Tuner Pro",
    tagline: "Afinación precisa en un universo de frecuencias.",
    status: "Disponible",
    description:
      "iDoctor Tuner Pro es un afinador cromático multiinstrumento diseñado para músicos que necesitan precisión, claridad visual y rapidez. Afina guitarra, guitarra de 12 cuerdas, bajo, ukelele, guitalele, mandolina, violín, tres cubano, requinto, bandurria y banjo de 4 y 5 cuerdas, con cuatro modos de afinación (digital, medidor, aguja analógica y tonos de referencia). Su interfaz oscura y luminosa permite usarlo cómodamente en ensayo, estudio o directo. Sin anuncios, sin suscripción y sin compras dentro de la app: pagas una vez y es tuyo.",
    features: [
      "Sin anuncios, sin suscripción y sin compras dentro de la app",
      "Bandurria, tres cubano, requinto, guitalele, mandolina y banjo",
      "Cuatro modos: digital, medidor, aguja analógica y de oído",
      "Afinador cromático preciso",
      "Detección de frecuencia en tiempo real",
      "Visualización clara de nota y desviación",
      "Diseño oscuro profesional",
      "Pensado para escenario y práctica diaria",
      "Compatible con distintos instrumentos",
      "Interfaz rápida, limpia y sin distracciones",
    ],
    audience:
      "Guitarristas, bajistas, cantantes, profesores, músicos de directo y estudiantes.",
    appStoreUrl: "https://apps.apple.com/app/id6770253477",
    screenshot: null, // capturas oficiales vía store-meta (npm run store)
    icon: "Gauge",
    accent: "cyan",
  },
  {
    slug: "metronome",
    appleId: 6772919575,
    name: "iDoctor Metronome Pro",
    tagline: "El pulso de la galaxia, en la palma de tu mano.",
    status: "Disponible",
    description:
      "iDoctor Metronome Pro es un metrónomo profesional para músicos que necesitan precisión, control y una interfaz visual potente, con app nativa para Apple Watch: el tempo va contigo en la muñeca, sin sacar el iPhone. Está pensado para practicar, ensayar, estudiar ritmos complejos y tocar en directo con un tempo sólido.",
    features: [
      "App nativa para Apple Watch: el tempo en la muñeca",
      "Rango amplio de BPM",
      "Tap Tempo",
      "Compases configurables",
      "Subdivisiones rítmicas",
      "LEDs visuales sincronizados",
      "Sonidos diferenciados para acento, pulso y subdivisión",
      "Primer golpe de compás distinguible",
      "Presets musicales de tempo",
      "Interfaz oscura, clara y visible en escenario",
    ],
    audience:
      "Bateristas, guitarristas, bajistas, pianistas, profesores, estudiantes y bandas.",
    appStoreUrl: "https://apps.apple.com/app/id6772919575",
    screenshot: null, // capturas oficiales vía store-meta (npm run store)
    icon: "Timer",
    accent: "violet",
  },
  {
    slug: "beatbuddy-assistant",
    appleId: 6788465334,
    name: "iDoctor Beatbuddy Assistant",
    tagline: "El radar rítmico de tu BeatBuddy.",
    status: "Disponible",
    description:
      "iDoctor Beatbuddy Assistant analiza cualquier canción y te dice exactamente qué patrón de tu pedal BeatBuddy 2 usar para tocarla en directo. Detecta el BPM, el groove y el compás en el propio iPhone en segundos, compara con los 267 patrones del catálogo del pedal y, si conectas tu clave de Claude, la IA afina la recomendación con criterio musical y consejos de directo. Se acabó probar patrones a ciegas en mitad del ensayo: eliges la canción, y el pedal ya sabe qué tocar.",
    features: [
      "Análisis de BPM, groove y feel en tu iPhone (sin servidores, sin esperas)",
      "Detección de hi-hat en corcheas o semicorcheas, swing y compás ternario",
      "Ranking de patrones del catálogo BeatBuddy 2 con puntuación explicada",
      "Números MIDI exactos (MSB · LSB · PC) para marcar el patrón en el pedal",
      "Refinado con IA (Claude) usando tu propia clave: género real y consejos para el directo",
      "Re-análisis con IA sin volver a abrir el archivo de audio",
      "Historial con búsqueda, ordenación y copia de seguridad automática en iCloud",
      "Disponible en español, inglés, francés y alemán",
      "Interfaz oscura profesional pensada para el escenario",
    ],
    audience:
      "Músicos que tocan en directo con el pedal BeatBuddy: cantautores, dúos, one-man-bands y bandas sin batería.",
    appStoreUrl: "https://apps.apple.com/app/id6788465334",
    screenshot: null, // capturas oficiales vía store-meta (npm run store)
    icon: "Drum",
    accent: "amber",
  },
  {
    slug: "capo",
    appleId: 6771513138,
    name: "iDoctor Capo Pro",
    tagline: "Transporta canciones como si movieras estrellas.",
    status: "Disponible",
    description:
      "iDoctor Capo Pro ayuda a guitarristas y cantantes a encontrar rápidamente la tonalidad adecuada usando cejilla. Permite entender cómo cambia una canción al colocar la cejilla en distintos trastes y facilita adaptar canciones a la voz del cantante.",
    features: [
      "Cálculo de tonalidades con cejilla",
      "Ayuda para transportar canciones",
      "Ideal para adaptar canciones a la voz",
      "Interfaz visual sencilla y rápida",
      "Pensada para guitarra acústica y eléctrica",
      "Herramienta útil para ensayos y directos",
      "Diseño oscuro coherente con el ecosistema iDoctor Music Tools",
    ],
    audience:
      "Guitarristas, cantantes, compositores, profesores y músicos de versiones.",
    appStoreUrl: "https://apps.apple.com/app/id6771513138",
    screenshot: null, // capturas oficiales vía store-meta (npm run store)
    icon: "Guitar",
    accent: "sky",
  },
  {
    slug: "musicband",
    appleId: 6775728069,
    name: "iDoctor MusicBand",
    displayName: "iDoctor MusicBand Pro",
    tagline: "El centro de mando de tu banda.",
    status: "Disponible",
    description:
      "iDoctor MusicBand es el centro de mando del directo: repertorio, setlists, agenda de conciertos y ensayos, y toda la banda dentro con su propio acceso. En el escenario, el Modo Show pinta letra y acordes a pantalla completa, con autoscroll, transposición y anotaciones a lápiz; las pistas multipista salen por canales independientes —la música al PA y el click a los in-ears— con MIDI y pedaleras AirTurn. Y su función más celebrada, el Concierto Interactivo: el público escanea un QR y vota la siguiente canción desde su móvil, con recuento en vivo, karaoke en el teléfono y pantalla de proyección para la sala. La app se descarga gratis y las funciones Pro van por suscripción, con 14 días de prueba.",
    features: [
      "Concierto Interactivo: el público vota la siguiente canción por QR",
      "Pantalla de proyección 16:9 para la sala, con tu logo",
      "Setlists con duración real, descansos y bloques con notas",
      "Repertorio con tonalidad, tempo, duración, cejilla y preparación",
      "Toda la banda dentro: cada músico con su propio acceso",
      "PRO: Modo Show con letra, acordes, autoscroll y transposición",
      "PRO: stems multipista con click y órdenes a los in-ears",
      "PRO: pedales AirTurn BT500S y pedaleras MIDI, con anotaciones Apple Pencil",
    ],
    audience:
      "Bandas, grupos de versiones, orquestas, músicos de directo y directores musicales.",
    appStoreUrl: "https://apps.apple.com/app/id6775728069",
    // SUSCRIPCIÓN (2026-08-19): la app se descarga gratis; las funciones Pro
    // van por suscripción. Este bloque lo pintan la web y las páginas SEO, y
    // debe decir LO MISMO que la ficha de la App Store — es lo que Apple exige
    // (guía 3.1.2) y lo que el usuario espera leer antes de suscribirse.
    subscription: {
      intro:
        "iDoctor MusicBand Pro se descarga gratis: te registras, creas tu banda y empiezas. Las funciones Pro (Modo Show, stems, MIDI, IA…) van por suscripción, con 14 días de prueba gratis.",
      plans: [
        { name: "Mensual", price: "3,99 €/mes" },
        { name: "Anual", price: "44,99 €/año", note: "14 días de prueba gratis" },
      ],
      points: [
        "La suscripción se renueva automáticamente salvo que la canceles al menos 24 horas antes de que acabe el periodo en curso.",
        "El pago se carga a tu cuenta de Apple al confirmar la compra, y la renovación se cobra en las 24 horas previas al final de cada periodo.",
        "Puedes gestionarla o cancelarla cuando quieras en los Ajustes de tu Apple ID; al cancelar conservas el acceso hasta que termine el periodo ya pagado.",
        "Es una sola suscripción por banda: los músicos que des de alta entran con su nombre y contraseña, sin pagar cada uno lo suyo.",
        "Si la suscripción caduca no pierdes nada: tus canciones, setlists y conciertos siguen ahí y puedes seguir consultándolos; para volver a editarlos, reactívala.",
        "Precios de España. En tu país verás el equivalente en tu moneda, en la propia App Store.",
      ],
      eulaUrl: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
      eulaLabel: "Términos de uso (EULA)",
      privacyPath: "privacidad/",
      privacyLabel: "Política de privacidad",
    },
    screenshot: "/screenshots/musicband-1.webp",
    // Capturas locales de respaldo: en cuanto `npm run store` traiga las
    // oficiales de la ficha, mandan las de la tienda.
    screenshots: [
      "/screenshots/musicband-1.webp",
      "/screenshots/musicband-2.webp",
      "/screenshots/musicband-3.webp",
      "/screenshots/musicband-4.webp",
    ],
    ogImage: "/screenshots/musicband-og.jpg",
    iconImage: "/icons/musicband.png",
    icon: "ListMusic",
    accent: "magenta",
  },
  {
    slug: "livestems",
    appleId: 6785842131,
    name: "iDoctor Live Stems",
    tagline: "El control de misión de tu directo.",
    status: "Disponible",
    description:
      "iDoctor Live Stems convierte tu iPad o iPhone en un reproductor multipista de escenario para bandas que tocan con backing tracks. Hasta 6 stems perfectamente sincronizados, mixer tipo consola y routing multicanal USB-C: el click y las órdenes a los in-ears de la banda, la base al público. Graba tus propias órdenes de voz sincronizadas con cada canción y edítalas en un editor de audio integrado.",
    features: [
      "Hasta 6 stems sincronizados al sample",
      "Mixer tipo consola con faders, VU y salidas independientes",
      "Routing multicanal real por USB-C (click solo a los in-ears)",
      "Pista de órdenes grabada por ti, con editor de audio completo",
      "Marcadores de sección, loop A-B y letra en pantalla",
      "Tono y tempo en tiempo real, recordados por canción",
      "Setlists, medleys encadenados y pedalera MIDI",
      "Preflight: verifica stems, canales y batería antes de salir",
      "Diseño oscuro de escenario, en iPad, iPhone y Mac",
    ],
    audience:
      "Bandas con backing tracks, cantantes solistas con secuencias, grupos de versiones, teclistas-directores musicales y técnicos de directo.",
    appStoreUrl: "https://apps.apple.com/app/id6785842131",
    screenshot: null, // capturas oficiales vía store-meta (npm run store)
    icon: "AudioLines",
    accent: "cyan",
  },
  {
    slug: "vocal-warmup",
    appleId: 6774223047,
    name: "iDoctor Vocal WarmUp",
    displayName: "iDoctor Vocal WarmUp",
    tagline: "Calienta la voz antes de cantar, guiado al piano.",
    status: "Disponible",
    description:
      "Tu voz necesita calentarse antes de cantar, igual que tus músculos antes de correr. iDoctor Vocal WarmUp guía tu calentamiento con piano y micrófono, con ejercicios adaptados a tu tesitura, en 5, 10 o 15 minutos. Elige tu tipo de voz o deja que la app lo estime con un test de dos notas, y observa tu onda en el osciloscopio en tiempo real: cuando la nota es limpia y estable, la onda se mantiene fija. Sin suscripción, sin anuncios y sin conexión.",
    features: [
      "Tres rutinas guiadas: rápida (5 min), completa (10 min) e intensiva (15 min)",
      "Hasta 8 ejercicios clásicos: notas sostenidas, escalas, arpegios, quintas y octavas",
      "El piano sube por semitonos y trabaja todo tu rango de forma progresiva",
      "Ejercicios adaptados a tu tesitura: soprano, mezzo, contralto, tenor, barítono o bajo",
      "Test de dos notas que estima tu perfil vocal de forma orientativa",
      "Osciloscopio en tiempo real para entrenar estabilidad y afinación",
      "Sin suscripción, sin anuncios y sin compras dentro de la app",
      "Funciona sin conexión; el micrófono se procesa solo en tu dispositivo",
    ],
    audience:
      "Cantantes, coristas, profesores de canto, actores de doblaje, locutores, guitarristas que cantan y cualquiera que use la voz.",
    note: "La estimación del tipo vocal es orientativa: no sustituye la valoración de un profesor de canto.",
    appStoreUrl: "https://apps.apple.com/app/id6774223047",
    screenshot: null, // capturas oficiales vía store-meta (npm run store)
    icon: "MicVocal",
    accent: "violet",
  },
];

export const ecosystemPoints = [
  "Afinar con precisión",
  "Practicar con tempo perfecto",
  "Transportar canciones con cejilla",
  "Organizar repertorios y conciertos",
  "Preparar ensayos",
  "Ayudar a cantantes a encontrar su rango y tesitura",
  "Tocar en directo con stems sincronizados y click a los in-ears",
];

export const audiences = [
  {
    label: "Guitarristas",
    icon: "Guitar",
    text: "Transporte, cejilla, afinación y control para tocar con seguridad.",
  },
  {
    label: "Bajistas",
    icon: "AudioLines",
    text: "Precisión de frecuencia y pulso sólido para sostener la banda.",
  },
  {
    label: "Cantantes",
    icon: "MicVocal",
    text: "Herramientas para encontrar una zona vocal cómoda e inspiradora.",
  },
  {
    label: "Bateristas",
    icon: "Timer",
    text: "Tempo claro, acentos visibles y práctica rítmica con intención.",
  },
  {
    label: "Bandas",
    icon: "Users",
    text: "Setlists, ensayos y conciertos organizados desde un mismo panel.",
  },
  {
    label: "Bandas con backing tracks",
    icon: "AudioLines",
    text: "Stems sincronizados, click a los in-ears y órdenes grabadas: el directo, bajo control.",
  },
  {
    label: "Profesores de música",
    icon: "GraduationCap",
    text: "Recursos directos para explicar afinación, tempo y tonalidad.",
  },
  {
    label: "Estudiantes",
    icon: "BookOpen",
    text: "Apps limpias para practicar mejor, sin ruido ni distracciones.",
  },
  {
    label: "Músicos de directo",
    icon: "Headphones",
    text: "Diseño oscuro, lectura rápida y decisiones claras sobre el escenario.",
  },
  {
    label: "Compositores",
    icon: "Sparkles",
    text: "Tecnología musical al servicio de la inspiración y la creación.",
  },
];

export const roadmap = [
  "iDoctor Tuner Pro",
  "iDoctor Metronome Pro",
  "iDoctor Capo Pro",
  "iDoctor MusicBand",
  "iDoctor Live Stems",
  "iDoctor Vocal WarmUp",
  "Nuevas herramientas para músicos",
];
