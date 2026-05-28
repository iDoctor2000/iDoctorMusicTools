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
      "iDoctor MusicBand será una herramienta para grupos musicales que necesitan organizar repertorios, setlists, conciertos, ensayos y canciones. La app transmite la idea de control total del directo: canciones, orden, tempo, tonalidad, cejilla, notas, duración y preparación del concierto.",
    features: [
      "Gestión de canciones",
      "Creación de setlists",
      "Ordenación del repertorio para conciertos",
      "Información por canción: tonalidad, tempo, duración, cejilla y notas",
      "Metrónomo asociado a cada tema",
      "Preparación de ensayos",
      "Organización de conciertos",
      "Pensada para bandas reales que tocan en directo",
    ],
    audience:
      "Bandas, grupos de versiones, orquestas, músicos de directo y directores musicales.",
    appStoreUrl: null,
    screenshot: "/screenshots/musicband-1.png",
    icon: "ListMusic",
    accent: "magenta",
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
  "iDoctor Vocal WarmUp",
  "Nuevas herramientas para músicos",
];
