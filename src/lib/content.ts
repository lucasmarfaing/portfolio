import { z } from 'astro/zod';
import frSite from '@/content/fr/site.json';
import frHero from '@/content/fr/hero.json';
import enSite from '@/content/en/site.json';
import enHero from '@/content/en/hero.json';

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
    since: z.string().date().optional(),
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

export type SiteContent = z.infer<typeof siteSchema>;
export type HeroContent = z.infer<typeof heroSchema>;
export type Stat = z.infer<typeof stat>;

const raw: Record<Locale, { site: unknown; hero: unknown }> = {
  fr: { site: frSite, hero: frHero },
  en: { site: enSite, hero: enHero },
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
  };
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
