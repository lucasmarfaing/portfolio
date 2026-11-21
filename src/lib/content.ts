import { z } from 'astro/zod';
import frSite from '@/content/fr/site.json';
import frHero from '@/content/fr/hero.json';
import enSite from '@/content/en/site.json';
import enHero from '@/content/en/hero.json';
import frCrew from '@/content/fr/crew.json';
import enCrew from '@/content/en/crew.json';
import frTrajectory from '@/content/fr/trajectory.json';
import enTrajectory from '@/content/en/trajectory.json';

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

export type SiteContent = z.infer<typeof siteSchema>;
export type TrajectoryContent = z.infer<typeof trajectorySchema>;
export type HeroContent = z.infer<typeof heroSchema>;
export type CrewContent = z.infer<typeof crewSchema>;
export type Stat = z.infer<typeof stat>;

const raw: Record<Locale, { site: unknown; hero: unknown; crew: unknown; trajectory: unknown }> = {
  fr: { site: frSite, hero: frHero, crew: frCrew, trajectory: frTrajectory },
  en: { site: enSite, hero: enHero, crew: enCrew, trajectory: enTrajectory },
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
  return {
    site: parse(siteSchema, raw[lang].site, 'site'),
    hero: parse(heroSchema, raw[lang].hero, 'hero'),
    crew: parse(crewSchema, raw[lang].crew, 'crew'),
    trajectory: parse(trajectorySchema, raw[lang].trajectory, 'trajectory'),
  };
}

/** Replaces {placeholders} in a string, e.g. "{years} ans de vol". */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

/** Text partly hidden with █ characters is shown as a redacted bar. */
export const isRedacted = (text: string) => text.includes('█');

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
