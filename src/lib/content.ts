import { z } from 'astro/zod';
import frSite from '@/content/fr/site.json';
import frHero from '@/content/fr/hero.json';
import enSite from '@/content/en/site.json';
import enHero from '@/content/en/hero.json';
import frCrew from '@/content/fr/crew.json';
import enCrew from '@/content/en/crew.json';
import frTrajectory from '@/content/fr/trajectory.json';
import enTrajectory from '@/content/en/trajectory.json';
import frInventory from '@/content/fr/inventory.json';
import enInventory from '@/content/en/inventory.json';
import rawSky from '@/content/sky.json';
import frMissions from '@/content/fr/missions.json';
import enMissions from '@/content/en/missions.json';
import frTransmissions from '@/content/fr/transmissions.json';
import enTransmissions from '@/content/en/transmissions.json';
import frContact from '@/content/fr/contact.json';
import enContact from '@/content/en/contact.json';
import frNotFound from '@/content/fr/notfound.json';
import enNotFound from '@/content/en/notfound.json';
import frEggs from '@/content/fr/eggs.json';
import enEggs from '@/content/en/eggs.json';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

const link = z.object({ label: z.string().min(1), href: z.string().min(1) });

const siteSchema = z.object({
  meta: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  callsign: z.string(),
  status: z.string(),
  statusShort: z.string(),
  navLabel: z.string(),
  nav: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), label: z.string() })).min(1),
  menu: z.object({ open: z.string(), close: z.string() }),
  theme: z.object({ toLight: z.string(), toDark: z.string() }),
  switchLanguage: link.extend({ ariaLabel: z.string() }),
});

const milestone = z.object({
  date: z.string().optional(),
  label: z.string().min(1),
  variant: z.enum(['launch', 'secret']).optional(),
  redactedLabel: z.string().optional(),
});

/** A stat shows either a fixed `value`, or the number of whole years elapsed `since` a date (computed at build). */
const stat = z
  .object({
    label: z.string().min(1),
    value: z.string().optional(),
    since: z.iso.date().optional(),
    suffix: z.string().optional(),
  })
  .refine((s) => (s.value === undefined) !== (s.since === undefined), {
    message: 'Chaque stat doit avoir soit "value", soit "since" (pas les deux)',
  });

const heroSchema = z.object({
  eyebrow: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  tagline: z.string(),
  intro: z.string(),
  cta: link,
  cv: link,
  portraitAlt: z.string().min(1),
  milestonesLabel: z.string(),
  milestones: z.array(milestone).max(5, 'Le hero affiche 5 jalons au maximum'),
  stats: z.array(stat).max(3, 'Le hero affiche 3 stats + le carburant'),
  fuel: z.object({ label: z.string(), detail: z.string(), value: z.string() }),
});

/** Section heading shared by every numbered section ("02 — Équipage"). */
const sectionHead = {
  index: z.string().regex(/^\d{2}$/, 'Numéro de section sur 2 chiffres, ex. "02"'),
  label: z.string().min(1),
  title: z.string().min(1),
  titleMuted: z.string(),
};

const crewSchema = z.object({
  ...sectionHead,
  /** The pilot's note: a quote, a paragraph and a signature */
  note: z.object({
    entry: z.string(),
    place: z.string(),
    quote: z.string().min(1),
    text: z.string(),
    signature: z.string(),
    signatureRole: z.string(),
    end: z.string(),
  }),
  offDuty: z.object({ label: z.string(), items: z.array(z.string().min(1)) }),
  badge: z.object({
    title: z.string(),
    name: z.string().min(1),
    job: z.string(),
    /** Current company (used for search engines) */
    employer: z.string().optional(),
    photoAlt: z.string().min(1),
    /** Up to 3 short facts; like the hero stats, a value can be computed from a `since` date */
    details: z.array(stat).max(3, 'Le badge affiche 3 infos au maximum'),
    id: z.string(),
    status: z.string(),
    cv: link,
  }),
  skillsLabel: z.string(),
  skills: z
    .array(
      z.object({
        icon: z.enum(['team', 'search', 'refresh', 'heart', 'rocket', 'bulb', 'star', 'code']),
        title: z.string().min(1),
        text: z.string(),
        featured: z.boolean().optional(),
      }),
    )
    .min(1),
});

const trajectorySchema = z.object({
  ...sectionHead,
  intro: z.string(),
  origin: z.object({ label: z.string(), city: z.string(), coords: z.string() }),
  logLabel: z.string(),
  highlightsLabel: z.string(),
  altitudeLabel: z.string(),
  altitudeUnits: z.object({ start: z.string(), one: z.string(), many: z.string() }),
  stackLabel: z.string(),
  previous: z.object({ label: z.string(), ariaLabel: z.string() }),
  next: z.object({ label: z.string(), ariaLabel: z.string() }),
  waypoints: z
    .array(
      z.object({
        year: z.number().int().min(1990).max(2100),
        name: z.string().min(1),
        org: z.string(),
        type: z.string(),
        description: z.string(),
        highlights: z.array(z.string()).default([]),
        stack: z.array(z.string()).default([]),
        secret: z.boolean().optional(),
      }),
    )
    .min(2, 'Il faut au moins 2 points de passage')
    .max(8, 'La courbe affiche 8 points de passage au maximum')
    .refine((w) => w.every((p, i) => i === 0 || p.year >= w[i - 1]!.year), {
      message: 'Les points de passage doivent être dans l’ordre chronologique',
    }),
});

const mapCoord = z.number().min(20).max(600);
const year = z.number().int().min(1990).max(2100);

/**
 * Language-neutral star map: constellations (groups), stars (position on a 620×620 map),
 * stars "in approach" (being learnt) and constellation links.
 */
const skySchema = z
  .object({
    groups: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          code: z.string().min(1).max(3),
          color: z.enum(['red', 'blue', 'amber', 'purple', 'grey']),
          /** Column of its list on desktop */
          side: z.enum(['left', 'right']),
          /** false: no mastery level shown (tools) */
          rated: z.boolean().default(true),
          /** true: technologies no longer used ("extinct" constellation, drawn dashed) */
          extinct: z.boolean().default(false),
          /** Where the constellation's name is written on the map [x, y] */
          label: z.tuple([mapCoord, mapCoord]),
        }),
      )
      .min(1),
    stars: z
      .array(
        z.object({
          name: z.string().min(1),
          group: z.string(),
          symbol: z.string().min(1).max(3),
          /** Name of the real star it stands for, e.g. "Bételgeuse" */
          star: z.string().min(1),
          url: z.url(),
          x: mapCoord,
          y: mapCoord,
          /** 3 = mastery, 2 = comfortable, 1 = notions (also sets the star's brightness) */
          level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
          since: year.optional(),
          /** "current" = still in use, or the last year it was used */
          lastUsed: z.union([z.literal('current'), year]).optional(),
          /** Related missions: a name ("Gmee"), or a key translated in inventory.json "missionNames" */
          missions: z.array(z.string().min(1)).default([]),
        }),
      )
      .min(1),
    approaching: z
      .array(z.object({ name: z.string().min(1), status: z.enum(['learning', 'spotted']), x: mapCoord, y: mapCoord }))
      .default([]),
    links: z.array(z.tuple([z.string(), z.string()])),
  })
  .superRefine((sky, ctx) => {
    const groupIds = new Set(sky.groups.map((g) => g.id));
    const names = new Set<string>();
    sky.stars.forEach((s, i) => {
      if (!groupIds.has(s.group)) ctx.addIssue({ code: 'custom', path: ['stars', i, 'group'], message: `Groupe inconnu "${s.group}"` });
      if (names.has(s.name)) ctx.addIssue({ code: 'custom', path: ['stars', i, 'name'], message: `Étoile en double "${s.name}"` });
      names.add(s.name);
    });
    sky.groups.forEach((g, i) => {
      if (!sky.stars.some((s) => s.group === g.id))
        ctx.addIssue({ code: 'custom', path: ['groups', i], message: `Constellation sans étoile "${g.id}"` });
    });
    sky.links.forEach(([a, b], i) => {
      for (const n of [a, b])
        if (!names.has(n)) ctx.addIssue({ code: 'custom', path: ['links', i], message: `Liaison vers une étoile inconnue "${n}"` });
    });
  });

const byLevel = z.object({ 1: z.string(), 2: z.string(), 3: z.string() });

const inventorySchema = z.object({
  ...sectionHead,
  intro: z.string(),
  introTouch: z.string(),
  mapCaption: z.string(),
  /** Legend of the mastery bars */
  levels: byLevel,
  /** Brightness shown on the card ("Éclatante"…), by level */
  brightness: byLevel,
  extinctState: z.string(),
  starsLabel: z.string(),
  groups: z.record(z.string(), z.object({ label: z.string(), name: z.string(), sector: z.string() })),
  approaching: z.object({
    label: z.string(),
    labelLong: z.string(),
    status: z.object({
      learning: z.object({ map: z.string(), short: z.string(), long: z.string() }),
      spotted: z.object({ map: z.string(), short: z.string(), long: z.string() }),
    }),
    notes: z.record(z.string(), z.string()).default({}),
  }),
  card: z.object({
    title: z.string(),
    designation: z.string(),
    logbook: z.string(),
    experience: z.string(),
    /** {year} and {years} are filled in */
    since: z.string(),
    years: z.object({ one: z.string(), many: z.string() }),
    lastUsed: z.string(),
    current: z.string(),
    state: z.string(),
    sector: z.string(),
    missions: z.string(),
    documentation: z.string(),
  }),
  /** Translations of mission keys used in sky.json ("all", "personal"…) */
  missionNames: z.record(z.string(), z.string()).default({}),
  descriptions: z.record(z.string(), z.string()),
});

const missionStatus = z.enum(['done', 'live', 'archived', 'secret']);
const byStatus = z.object({ done: z.string(), live: z.string(), archived: z.string(), secret: z.string() });

const missionsSchema = z.object({
  ...sectionHead,
  intro: z.string(),
  labels: z.object({
    status: byStatus,
    statusLong: byStatus,
    feed: z.string(),
    progress: z.string(),
    rec: z.string(),
    archivedStamp: z.string(),
    archivedStampSub: z.string(),
    secretStamp: z.string(),
    secretStampSub: z.string(),
    phases: z.array(z.string()).length(4, 'Il faut exactement 4 phases'),
    rows: z.object({
      status: z.string(),
      role: z.string(),
      stack: z.string(),
      duration: z.string(),
      crew: z.string(),
      launch: z.string(),
    }),
    gauge: z.string(),
    gaugeUnit: z.string(),
    activity: z.string(),
    activityMissing: z.string(),
    months: z.array(z.string()),
    trend: z.object({ up: z.string(), down: z.string(), ended: z.string(), secret: z.string(), none: z.string() }),
    meters: z.object({ duration: z.string(), crew: z.string(), technos: z.string() }),
    units: z.object({
      month: z.string(),
      months: z.string(),
      year: z.string(),
      years: z.string(),
      solo: z.string(),
      people: z.string(),
    }),
    viewMission: z.string(),
    source: z.string(),
    requestAccess: z.string(),
    accessDenied: z.string(),
  }),
  missions: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string(),
        status: missionStatus,
        /** Current phase for a mission in progress: 0 Briefing … 3 Mise en orbite */
        phase: z.number().int().min(0).max(3).optional(),
        tint: z.enum(['red', 'blue', 'amber']).default('red'),
        /** Optional screenshot: a file name in src/assets/missions/, e.g. "gmee.png" (optimised at build) */
        image: z
          .string()
          .regex(/^[\w-]+\.(png|jpe?g|webp|avif)$/i, 'Nom de fichier du type "gmee.png", placé dans src/assets/missions/')
          .optional(),
        /** Optional folder in src/assets/missions/ whose images scroll as a tilted mosaic, e.g. "portfolio" */
        gallery: z
          .string()
          .regex(/^[\w-]+$/, 'Nom de dossier du type "portfolio", placé dans src/assets/missions/')
          .optional(),
        /** "encrypted": the video feed shows scrambled noise instead of a screenshot (like a classified mission) */
        screen: z.enum(['encrypted']).optional(),
        screenshotLabel: z.string(),
        elapsed: z.string(),
        brief: z.string(),
        role: z.string(),
        stack: z.string(),
        duration: z.string().optional(),
        launch: z.string().optional(),
        crew: z.string(),
        /** Mission length in months, for the "Duration" meter */
        months: z.number().int().min(1).optional(),
        /** Number of people, for the "Crew" meter */
        crewSize: z.number().int().min(1).optional(),
        /** Real commits per month (12 values, oldest first). Without it: "Data unavailable". */
        activity: z.array(z.number().min(0)).min(2).optional(),
        links: z.object({ mission: z.url().optional(), source: z.url().optional() }).optional(),
      }),
    )
    .min(1),
});

const transmissionsSchema = z.object({
  index: sectionHead.index,
  label: z.string(),
  signal: z.string(),
  emitter: z.string(),
  photoPlaceholder: z.string(),
  segmentLabel: z.string(),
  /** Read by screen readers instead of an undecipherable (alien) transmission */
  alienLabel: z.string().min(1),
  intervalSeconds: z.number().min(3).max(30),
  items: z
    .array(
      z.object({
        freq: z.string(),
        name: z.string().min(1),
        role: z.string(),
        relation: z.string(),
        quote: z.string().min(1),
        /** Optional photo in public/, e.g. "/transmissions/jane.webp" (otherwise initials as a periodic element) */
        photo: z.string().startsWith('/').optional(),
        /** Optional element symbol replacing the automatic initials, e.g. "Th" */
        symbol: z.string().min(1).max(3).optional(),
        /**
         * Undecipherable signal: the quote is never shown, only its shape (word lengths),
         * written with constantly morphing alien glyphs.
         */
        alien: z.boolean().optional(),
      }),
    )
    .min(1),
});

const contactSchema = z.object({
  index: sectionHead.index,
  label: z.string(),
  title: z.string().min(1),
  titleAccent: z.string(),
  intro: z.string(),
  availability: z.string(),
  availabilityShort: z.string(),
  channels: z
    .array(
      z.object({
        icon: z.enum(['mail', 'linkedin', 'github', 'file', 'link']),
        label: z.string(),
        value: z.string(),
        /** Without a url, the channel is shown but not clickable */
        url: z.string().optional(),
      }),
    )
    .max(6),
  form: z.object({
    console: z.string(),
    consoleShort: z.string(),
    statusOpen: z.string(),
    statusSending: z.string(),
    statusSent: z.string(),
    typeLabel: z.string(),
    types: z.array(z.string()).min(1),
    nameLabel: z.string(),
    namePlaceholder: z.string(),
    emailLabel: z.string(),
    emailPlaceholder: z.string(),
    messageLabel: z.string(),
    messagePlaceholder: z.string(),
    submit: z.string(),
    sentTitle: z.string(),
    sentText: z.string(),
    sentTextMail: z.string(),
    errorText: z.string(),
    reset: z.string(),
    /**
     * Where the form is sent: "/api/contact" (this site's own Node route), a form service URL,
     * or empty to open the visitor's mail app with the message instead.
     */
    endpoint: z.union([z.literal(''), z.url(), z.string().regex(/^\/[\w\-/]+$/, 'Chemin du type "/api/contact"')]),
    mailTo: z.email(),
    mailSubject: z.string(),
  }),
  footer: z.object({ signoff: z.string(), backToTop: z.string(), copyright: z.string(), coords: z.string() }),
});

const notFoundSchema = z.object({
  metaTitle: z.string().min(1),
  status: z.string(),
  eyebrow: z.string(),
  eyebrowShort: z.string(),
  title: z.string().min(1),
  text: z.string(),
  home: z.string(),
  report: z.string(),
  astronautLabel: z.string(),
  telemetry: z.object({
    title: z.string(),
    status: z.string(),
    rows: z.array(z.object({ label: z.string(), value: z.string(), tone: z.enum(['alert', 'ok']).optional() })).max(6),
  }),
  routesLabel: z.string(),
  footer: z.string(),
  coords: z.string(),
});

/** Easter eggs: hidden texts. A value in [brackets] is a placeholder and is not shown. */
const eggsSchema = z.object({
  konami: z.object({
    status: z.string(),
    statusShort: z.string(),
    countdown: z.string(),
    ignition: z.string(),
    stamp: z.string(),
    level: z.string(),
    title: z.string().min(1),
    /** {star}, {ly} and {years} are filled in with a random destination */
    trip: z.string(),
    labels: z.object({ destination: z.string(), distance: z.string(), duration: z.string(), ref: z.string() }),
    units: z.object({ ly: z.string(), years: z.string() }),
    /** Real stars: distance in light-years; the duration is computed at Voyager 1's speed (17 km/s) */
    destinations: z
      .array(z.object({ name: z.string().min(1), code: z.string().regex(/^[A-Z0-9]{2,5}$/), ly: z.number().positive() }))
      .min(1),
    hint: z.string(),
    close: z.string(),
    announce: z.string(),
  }),
  radio: z.object({
    intercept: z.string(),
    statusPriority: z.string(),
    statusLinked: z.string(),
    seconds: z.number().min(2).max(30),
    /** Words typed in the contact "call sign" field (matched without accents or capitals) */
    words: z
      .array(
        z.object({
          match: z.array(z.string().min(1)).min(1),
          lines: z.array(z.string()).min(1),
          badge: z.string().optional(),
          effect: z.enum(['bolt', 'hud', 'fuel']).optional(),
        }),
      )
      .min(1),
  }),
  fuel: z.object({
    empty: z.string(),
    refilled: z.string(),
  }),
  hud: z.object({
    boot: z.string(),
    system: z.string(),
    home: z.string(),
    target: z.string(),
    altitude: z.string(),
    altitudeUnit: z.string(),
    /** Gauges on the right edge; level 0-100 fills the bar */
    readouts: z
      .array(z.object({ label: z.string(), value: z.string(), level: z.number().min(0).max(100), alert: z.boolean().optional() }))
      .max(6),
    /** Lines "spoken" by the assistant at the bottom of the screen, in turn */
    voice: z.array(z.string().min(1)).min(1),
    pilot: z.string(),
    pilotValue: z.string(),
    coffee: z.string(),
    coffeeValue: z.string(),
    state: z.string(),
    stateValue: z.string(),
    analysis: z.string(),
    exit: z.string(),
    exitTouch: z.string(),
    announceOn: z.string(),
    announceOff: z.string(),
    /** Annotations per section id ("missions"…); {stars} and {missions} are counted automatically */
    sections: z.record(z.string(), z.array(z.object({ label: z.string(), value: z.string() }))),
  }),
});

export type EggsContent = z.infer<typeof eggsSchema>;
export type NotFoundContent = z.infer<typeof notFoundSchema>;
export type TransmissionsContent = z.infer<typeof transmissionsSchema>;
export type ContactContent = z.infer<typeof contactSchema>;
export type SkyContent = z.infer<typeof skySchema>;
export type MissionsContent = z.infer<typeof missionsSchema>;
export type InventoryContent = z.infer<typeof inventorySchema>;
export type SiteContent = z.infer<typeof siteSchema>;
export type TrajectoryContent = z.infer<typeof trajectorySchema>;
export type HeroContent = z.infer<typeof heroSchema>;
export type CrewContent = z.infer<typeof crewSchema>;
export type Stat = z.infer<typeof stat>;

type RawLocale = Record<
  'site' | 'hero' | 'crew' | 'trajectory' | 'inventory' | 'missions' | 'transmissions' | 'contact' | 'notFound' | 'eggs',
  unknown
>;
const raw: Record<Locale, RawLocale> = {
  fr: {
    site: frSite,
    hero: frHero,
    crew: frCrew,
    trajectory: frTrajectory,
    inventory: frInventory,
    missions: frMissions,
    transmissions: frTransmissions,
    contact: frContact,
    notFound: frNotFound,
    eggs: frEggs,
  },
  en: {
    site: enSite,
    hero: enHero,
    crew: enCrew,
    trajectory: enTrajectory,
    inventory: enInventory,
    missions: enMissions,
    transmissions: enTransmissions,
    contact: enContact,
    notFound: enNotFound,
    eggs: enEggs,
  },
};

/** Loads and validates a locale's content. An invalid JSON file fails the build with a readable message. */
export function getContent(lang: Locale) {
  const parse = <T>(schema: z.ZodType<T>, data: unknown, file: string): T => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `  - ${i.path.join('.') || '(racine)'} : ${i.message}`).join('\n');
      throw new Error(`Contenu invalide dans src/content/${lang}/${file}.json :\n${issues}`);
    }
    return result.data;
  };
  const skyResult = skySchema.safeParse(rawSky);
  if (!skyResult.success) {
    const issues = skyResult.error.issues.map((i) => `  - ${i.path.join('.') || '(racine)'} : ${i.message}`).join('\n');
    throw new Error(`Contenu invalide dans src/content/sky.json :\n${issues}`);
  }
  const sky = skyResult.data;
  const inventory = parse(inventorySchema, raw[lang].inventory, 'inventory');
  // Every star and group needs its text in each language
  const missing = [
    ...sky.stars.filter((s) => !inventory.descriptions[s.name]).map((s) => `descriptions."${s.name}"`),
    ...sky.groups.filter((g) => !inventory.groups[g.id]).map((g) => `groups."${g.id}"`),
  ];
  if (missing.length)
    throw new Error(`Contenu manquant dans src/content/${lang}/inventory.json :\n${missing.map((m) => `  - ${m}`).join('\n')}`);

  return {
    sky,
    inventory,
    site: parse(siteSchema, raw[lang].site, 'site'),
    hero: parse(heroSchema, raw[lang].hero, 'hero'),
    crew: parse(crewSchema, raw[lang].crew, 'crew'),
    trajectory: parse(trajectorySchema, raw[lang].trajectory, 'trajectory'),
    missions: parse(missionsSchema, raw[lang].missions, 'missions'),
    transmissions: parse(transmissionsSchema, raw[lang].transmissions, 'transmissions'),
    contact: parse(contactSchema, raw[lang].contact, 'contact'),
    notFound: parse(notFoundSchema, raw[lang].notFound, 'notfound'),
    eggs: parse(eggsSchema, raw[lang].eggs, 'eggs'),
  };
}

/** Replaces {placeholders} in a string, e.g. "{years} ans de vol". */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

/** Text partly hidden with █ characters is shown as a redacted bar. */
export const isRedacted = (text: string) => text.includes('█');

/** Splits "Objectif : ██████ ██" into plain and redacted parts. */
export const redactedParts = (text: string) =>
  text
    .split(/(█+(?:[ ·]+█+)*)/)
    .filter(Boolean)
    .map((part) => ({ text: part, redacted: part.includes('█') }));

/** Splits "le **front-end** et" into plain and highlighted parts. */
export function highlights(text: string): { text: string; strong: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('**') && part.endsWith('**') ? { text: part.slice(2, -2), strong: true } : { text: part, strong: false },
    );
}

/** Whole years between `since` and the build date. */
export function yearsSince(since: string, now = new Date()): number {
  const start = new Date(`${since}T00:00:00`);
  let years = now.getFullYear() - start.getFullYear();
  const anniversary = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (now < anniversary) years -= 1;
  return years;
}

export const statValue = (s: Stat) => (s.since ? String(yearsSince(s.since)) : (s.value ?? ''));
