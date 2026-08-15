export const APP_STORE_PORTFOLIO_URL =
  "#apps";

export const BRAND_SLOGAN = "Tu Doctor musical";

export const apps = [
  {
    slug: "tuner",
    name: "iDoctor Tuner Pro",
    tagline: "Afinación precisa en un universo de frecuencias.",
    status: "Disponible",
    description:
      "iDoctor Tuner Pro es un afinador cromático profesional diseñado para músicos que necesitan precisión, claridad visual y rapidez. Ideal para guitarra, bajo, ukelele, voz e instrumentos acústicos. Su interfaz oscura y luminosa permite usarlo cómodamente en ensayo, estudio o directo.",
    features: [
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
    appStoreUrl: "https://apps.apple.com/us/app/idoctor-tunerpro/id6770253477",
    screenshot: "/screenshots/tuner-1.png",
    icon: "Gauge",
    accent: "cyan",
  },
  {
    slug: "metronome",
    name: "iDoctor Metronome Pro",
    tagline: "El pulso de la galaxia, en la palma de tu mano.",
    status: "Disponible",
    description:
      "iDoctor Metronome Pro es un metrónomo profesional para músicos que necesitan precisión, control y una interfaz visual potente. Está pensado para practicar, ensayar, estudiar ritmos complejos y tocar en directo con un tempo sólido.",
    features: [
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
    appStoreUrl:
      "https://apps.apple.com/us/app/idoctor-metronome-pro/id6772919575",
    screenshot: "/screenshots/metronome-1.png",
    icon: "Timer",
    accent: "violet",
  },
  {
    slug: "beatbuddy-assistant",
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
    appStoreUrl: null,
    screenshot: "/screenshots/beatbuddy-1.png",
    icon: "Drum",
    accent: "amber",
  },
  {
    slug: "capo",
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
    appStoreUrl: "https://apps.apple.com/us/app/idoctor-capo-pro/id6771513138",
    screenshot: "/screenshots/capo-1.png",
    icon: "Guitar",
    accent: "sky",
  },
  {
    slug: "musicband",
    name: "iDoctor MusicBand",
    tagline: "El centro de mando de tu banda.",
    status: "Próximamente",
    description:
      "iDoctor MusicBand es el centro de mando del directo: repertorio, setlists, agenda de conciertos y ensayos, y toda la banda dentro con su propio acceso. Su función estrella es el Concierto Interactivo — el público escanea un QR y vota la siguiente canción desde su móvil, con recuento en vivo y pantalla de proyección para la sala. La versión PRO añade el Modo Show con letra y acordes a pantalla completa, pistas multipista con click y órdenes por salidas independientes, MIDI y pedaleras AirTurn. Hay una versión gratuita para empezar.",
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
    appStoreUrl: null,
    screenshot: "/screenshots/musicband-1.png",
    icon: "ListMusic",
    accent: "magenta",
  },
  {
    slug: "livestems",
    name: "iDoctor Live Stems",
    tagline: "El control de misión de tu directo.",
    status: "Próximamente",
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
    appStoreUrl: null,
    screenshot: "/screenshots/livestems-1.png",
    icon: "AudioLines",
    accent: "cyan",
  },
  {
    slug: "vocal-warmup",
    name: "iDoctor Vocal WarmUp",
    displayName: "iDoctor Vocal WarmUp",
    tagline: "Descubre tu órbita vocal.",
    status: "Próximamente",
    description:
      "Una futura herramienta para cantantes que permitirá detectar de forma orientativa el rango vocal, la zona cómoda y el tipo vocal probable mediante notas guiadas y análisis de frecuencia. Siempre se mostrará como orientación, no como diagnóstico vocal absoluto, porque la clasificación vocal depende también del timbre, passaggio, potencia, edad, entrenamiento y técnica.",
    features: [
      "Test guiado de rango vocal",
      "Detección de frecuencia fundamental",
      "Nota mínima fiable",
      "Nota máxima fiable",
      "Tesitura cómoda",
      "Estabilidad de afinación",
      "Tipo vocal orientativo",
      "Recomendaciones para cantar en una zona cómoda",
    ],
    audience:
      "Cantantes, coristas, profesores de canto, guitarristas que cantan y músicos que quieren adaptar canciones a su voz.",
    appStoreUrl: null,
    screenshot: "/screenshots/vocal-1.png",
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
