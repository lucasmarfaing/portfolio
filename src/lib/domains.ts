import { z } from 'astro/zod';
import raw from '@/content/domains.json';

/**
 * Domains the site is served on. The first one is the main domain: it is written in the HTML at build,
 * and the email address is switched in the browser to match the domain the visitor actually used.
 */
export const { domains } = z
  .object({
    domains: z
      .array(z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, 'Nom de domaine du type "lucasmarfaing.pro"'))
      .min(1),
  })
  .parse(raw);

export const mainDomain = domains[0]!;
