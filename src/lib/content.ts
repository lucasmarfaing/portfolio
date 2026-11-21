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

/** Text where **words** are highlighted. */
const richText = z.string().min(1);

const crewSchema = z.object({
  ...sectionHead,
  paragraphs: z.array(richText).min(1),
  badge: z.object({
    title: z.string(),
    role: z.string(),
    name: z.string().min(1),
    job: z.string(),
    photoAlt: z.string().min(1),
    details: z.array(z.object({ label: z.string(), value: z.string() })).max(6),
    status: z.string(),
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

/** Language-neutral star map: groups, stars (position on a 620×620 map) and constellation links. */
const skySchema = z
  .object({
    groups: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          code: z.string().min(1).max(3),
          color: z.enum(['red', 'blue', 'amber']),
        }),
      )
      .min(1),
    stars: z
      .array(
        z.object({
          name: z.string().min(1),
          group: z.string(),
          symbol: z.string().min(1).max(3),
          url: z.url(),
          x: z.number().min(20).max(600),
          y: z.number().min(20).max(600),
          since: z.number().int().min(1990).max(2100).optional(),
        }),
      )
      .min(1),
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
    sky.links.forEach(([a, b], i) => {
      for (const n of [a, b])
        if (!names.has(n)) ctx.addIssue({ code: 'custom', path: ['links', i], message: `Liaison vers une étoile inconnue "${n}"` });
    });
  });

const inventorySchema = z.object({
  ...sectionHead,
  intro: z.string(),
  introTouch: z.string(),
  mapCaption: z.string(),
  groups: z.record(z.string(), z.object({ label: z.string(), module: z.string(), sector: z.string() })),
  card: z.object({
    title: z.string(),
    designation: z.string(),
    module: z.string(),
    experience: z.string(),
    years: z.object({ one: z.string(), many: z.string() }),
    status: z.string(),
    statusValue: z.string(),
    sector: z.string(),
    documentation: z.string(),
  }),
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
    performance: z.string(),
    lighthouse: z.string(),
    activity: z.string(),
    months: z.array(z.string()),
    trend: z.object({ up: z.string(), down: z.string(), ended: z.string(), secret: z.string() }),
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
        /** Optional screenshot in public/, e.g. "/missions/gmee.webp" */
        image: z.string().startsWith('/').optional(),
        screenshotLabel: z.string(),
        elapsed: z.string(),
        brief: z.string(),
        role: z.string(),
        stack: z.string(),
        duration: z.string().optional(),
        launch: z.string().optional(),
        crew: z.string(),
        lighthouse: z.number().int().min(0).max(100).optional(),
        activity: z.array(z.number().min(0)).min(2).optional(),
        meters: z.array(z.object({ label: z.string(), value: z.string(), level: z.number().int().min(0).max(12) })).max(3),
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
  intervalSeconds: z.number().min(3).max(30),
  items: z
    .array(
      z.object({
        freq: z.string(),
        name: z.string().min(1),
        role: z.string(),
        relation: z.string(),
        quote: z.string().min(1),
        /** Optional photo in public/, e.g. "/transmissions/jane.webp" */
        photo: z.string().startsWith('/').optional(),
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
  'site' | 'hero' | 'crew' | 'trajectory' | 'inventory' | 'missions' | 'transmissions' | 'contact',
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
