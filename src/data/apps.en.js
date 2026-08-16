// apps.en.js — Traducción al inglés del CONTENIDO (apps, públicos, ecosistema).
//
// El español de src/data/apps.js es la fuente de verdad (slugs, ids, iconos,
// capturas). Aquí solo viven los textos en inglés, clave = slug. Lo que falte
// aquí cae al español, así una app nueva nunca rompe la versión inglesa.
//
// PORQUÉ: las apps están en es/en/fr/de y la web solo hablaba español; el
// mercado anglófono de "capo transpose", "BeatBuddy patterns" o "backing
// tracks iPad" es varias veces el español. `src/data/catalog.js` fusiona.

export const appsEn = {
  tuner: {
    tagline: "Precise tuning in a universe of frequencies.",
    description:
      "iDoctor Tuner Pro is a professional chromatic tuner for musicians who need accuracy, visual clarity and speed. Ideal for guitar, bass, ukulele, voice and acoustic instruments. Its dark, luminous interface is comfortable in rehearsal, in the studio or on stage.",
    features: [
      "Accurate chromatic tuner",
      "Real-time frequency detection",
      "Clear note and deviation display",
      "Professional dark design",
      "Built for stage and daily practice",
      "Works with many instruments",
      "Fast, clean, distraction-free interface",
    ],
    audience: "Guitarists, bassists, singers, teachers, live musicians and students.",
  },
  metronome: {
    tagline: "The pulse of the galaxy, in the palm of your hand.",
    description:
      "iDoctor Metronome Pro is a professional metronome for musicians who need precision, control and a powerful visual interface. Made for practising, rehearsing, studying complex rhythms and playing live with a rock-solid tempo.",
    features: [
      "Wide BPM range",
      "Tap tempo",
      "Configurable time signatures",
      "Rhythmic subdivisions",
      "Synchronised visual LEDs",
      "Distinct sounds for accent, beat and subdivision",
      "Clearly marked downbeat",
      "Musical tempo presets",
      "Dark interface, readable on stage",
    ],
    audience: "Drummers, guitarists, bassists, pianists, teachers, students and bands.",
  },
  "beatbuddy-assistant": {
    tagline: "The rhythm radar for your BeatBuddy.",
    description:
      "iDoctor Beatbuddy Assistant analyses any song and tells you exactly which pattern of your BeatBuddy 2 pedal to use to play it live. It detects BPM, groove and time signature on the iPhone itself in seconds, compares against the 267 patterns in the pedal's catalogue and, if you connect your Claude key, AI refines the recommendation with musical judgement and live-performance tips. No more trying patterns blindly mid-rehearsal: pick the song, and the pedal already knows what to play.",
    features: [
      "BPM, groove and feel analysis on your iPhone (no servers, no waiting)",
      "Hi-hat detection in eighths or sixteenths, swing and ternary metre",
      "Ranked BeatBuddy 2 catalogue patterns with an explained score",
      "Exact MIDI numbers (MSB · LSB · PC) to dial the pattern on the pedal",
      "AI refinement (Claude) with your own key: real genre and live tips",
      "Re-analyse with AI without reopening the audio file",
      "History with search, sorting and automatic iCloud backup",
      "Available in Spanish, English, French and German",
      "Professional dark interface designed for the stage",
    ],
    audience:
      "Musicians who play live with the BeatBuddy pedal: singer-songwriters, duos, one-man bands and bands without a drummer.",
  },
  capo: {
    tagline: "Transpose songs as if you were moving stars.",
    description:
      "iDoctor Capo Pro helps guitarists and singers quickly find the right key using a capo. It shows how a song changes when you place the capo on different frets and makes it easy to adapt songs to the singer's voice.",
    features: [
      "Key calculation with capo",
      "Help transposing songs",
      "Ideal for adapting songs to your voice",
      "Simple, fast visual interface",
      "Made for acoustic and electric guitar",
      "Handy for rehearsals and gigs",
      "Dark design consistent with the iDoctor Music Tools ecosystem",
    ],
    audience: "Guitarists, singers, songwriters, teachers and cover musicians.",
  },
  musicband: {
    tagline: "Your band's command centre.",
    description:
      "iDoctor MusicBand is the command centre for live shows: repertoire, setlists, gig and rehearsal calendar, and the whole band inside with their own access. Its star feature is the Interactive Concert — the audience scans a QR code and votes for the next song from their phones, with a live count and a projection screen for the venue. The PRO version adds Show Mode with full-screen lyrics and chords, multitrack backing tracks with click and cues on independent outputs, MIDI and AirTurn pedals. There is a free version to get started.",
    features: [
      "Interactive Concert: the audience votes for the next song via QR",
      "16:9 projection screen for the venue, with your logo",
      "Setlists with real duration, breaks and blocks with notes",
      "Repertoire with key, tempo, duration, capo and readiness",
      "The whole band inside: each musician with their own access",
      "PRO: Show Mode with lyrics, chords, autoscroll and transposition",
      "PRO: multitrack stems with click and cues to the in-ears",
      "PRO: AirTurn BT500S pedals and MIDI foot controllers, Apple Pencil annotations",
    ],
    audience: "Bands, cover bands, orchestras, live musicians and musical directors.",
  },
  livestems: {
    tagline: "Mission control for your live show.",
    description:
      "iDoctor Live Stems turns your iPad or iPhone into a stage multitrack player for bands that play with backing tracks. Up to 6 perfectly synchronised stems, a console-style mixer and USB-C multichannel routing: click and cues to the band's in-ears, the backing to the audience. Record your own voice cues in sync with each song and edit them in a built-in audio editor.",
    features: [
      "Up to 6 sample-accurate synchronised stems",
      "Console-style mixer with faders, VU meters and independent outputs",
      "Real USB-C multichannel routing (click only to the in-ears)",
      "Cue track recorded by you, with a full audio editor",
      "Section markers, A-B loop and on-screen lyrics",
      "Real-time pitch and tempo, remembered per song",
      "Setlists, chained medleys and MIDI foot controller",
      "Preflight: check stems, channels and battery before going on",
      "Dark stage design, on iPad, iPhone and Mac",
    ],
    audience:
      "Bands with backing tracks, solo singers with sequences, cover bands, keyboardist-musical directors and live sound techs.",
  },
  "vocal-warmup": {
    tagline: "Warm up your voice before you sing, guided at the piano.",
    description:
      "Your voice needs warming up before you sing, just like your muscles before a run. iDoctor Vocal WarmUp guides your warm-up with piano and microphone, with exercises adapted to your range, in 5, 10 or 15 minutes. Pick your voice type or let the app estimate it with a two-note test, and watch your waveform on the built-in oscilloscope in real time: when the note is clean and steady, the wave holds still. No subscription, no ads, works offline.",
    features: [
      "Three guided routines: quick (5 min), full (10 min) and intensive (15 min)",
      "Up to 8 classic exercises: sustained notes, scales, arpeggios, fifths and octaves",
      "The piano rises by semitones, working your whole range progressively",
      "Exercises adapted to your range: soprano, mezzo, contralto, tenor, baritone or bass",
      "Two-note test that estimates your vocal profile as guidance",
      "Real-time oscilloscope to train stability and pitch",
      "No subscription, no ads, no in-app purchases",
      "Works offline; the microphone is processed on your device only",
    ],
    audience:
      "Singers, backing vocalists, voice teachers, voice actors, presenters, guitarists who sing and anyone who uses their voice.",
    note: "The voice-type estimate is guidance only: it does not replace the judgement of a singing teacher.",
  },
};

export const ecosystemPointsEn = [
  "Tune with precision",
  "Practise with perfect tempo",
  "Transpose songs with a capo",
  "Organise repertoires and gigs",
  "Prepare rehearsals",
  "Help singers find their range and tessitura",
  "Play live with synced stems and click to the in-ears",
];

export const audiencesEn = [
  { label: "Guitarists", text: "Transposition, capo, tuning and control to play with confidence." },
  { label: "Bassists", text: "Frequency precision and a solid pulse to hold the band together." },
  { label: "Singers", text: "Tools to find a comfortable, inspiring vocal zone." },
  { label: "Drummers", text: "Clear tempo, visible accents and rhythm practice with intent." },
  { label: "Bands", text: "Setlists, rehearsals and gigs organised from one panel." },
  {
    label: "Bands with backing tracks",
    text: "Synced stems, click to the in-ears and recorded cues: the show, under control.",
  },
  { label: "Music teachers", text: "Direct resources to explain tuning, tempo and key." },
  { label: "Students", text: "Clean apps to practise better, without noise or distractions." },
  { label: "Live musicians", text: "Dark design, quick reading and clear decisions on stage." },
  { label: "Songwriters", text: "Music technology at the service of inspiration and creation." },
];

export const roadmapExtraEn = "New tools for musicians";
