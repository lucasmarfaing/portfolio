import { z } from 'astro/zod';
import rawTheme from '@/content/theme.json';

const color = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'Couleur hexadécimale attendue (#RGB, #RRGGBB ou #RRGGBBAA)');

const palette = z
  .object({
    bg: color,
    bgGlow: color,
    surface: color,
    surfaceRaised: color,
    text: color,
    textSoft: color,
    textSubtle: color,
    textMuted: color,
    textFaint: color,
    accent: color,
    accentAlt: color,
    accentSoft: color,
    onAccent: color,
    success: color,
    warning: color,
    planetCore: color,
    planetMid: color,
    planetEdge: color,
    earthCore: color,
    earthMid: color,
    earthEdge: color,
    earthLand: color,
    earthText: color,
    redacted: color,
    redactedBg: color,
  })
  .strict();

const themeSchema = z.object({
  default: z.enum(['dark', 'light']),
  dark: palette,
  light: palette,
});

export type ThemeName = 'dark' | 'light';

export const theme = themeSchema.parse(rawTheme);

const toKebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const toDeclarations = (colors: z.infer<typeof palette>) =>
  Object.entries(colors)
    .map(([key, value]) => `--${toKebab(key)}:${value};`)
    .join('');

/** Turns theme.json into CSS variables, one block per mode. */
export const themeCss = (['dark', 'light'] as const)
  .map((mode) => `[data-theme="${mode}"]{color-scheme:${mode};${toDeclarations(theme[mode])}}`)
  .join('');
