# Portfolio — Lucas Marfaing

One-page portfolio. **React + TypeScript + Vite**, SCSS, atomic design, i18n (FR/EN).

> Architecture skeleton — no design/content yet.

## Scripts

```bash
npm run dev        # dev server
npm run build      # type-check + production build
npm run preview    # preview the build
npm run lint       # ESLint
```

## Structure

```
src/
├── assets/                 # images, fonts, icons, sounds
├── components/
│   ├── atoms/              # (empty — basic building blocks)
│   ├── molecules/          # (empty)
│   └── organisms/
│       ├── Navbar/         # Navbar.tsx + Navbar.module.scss
│       └── index.ts        # folder barrel → import { Navbar } from '@/components/organisms'
├── sections/               # HeroSection, AboutSection, ProjectsSection, ContactSection
│   └── index.ts            # folder barrel → import { ... } from '@/sections'
├── constants/
│   └── sections.ts         # SECTIONS list (drives nav + section ids)
├── i18n/
│   ├── index.ts            # i18next setup (FR default, EN)
│   └── locales/{fr,en}.json
├── styles/
│   ├── _root.scss          # CSS variables (colors + width)
│   └── main.scss           # entry: @use root + minimal reset
├── App.tsx
└── main.tsx
```

## Conventions

- `@` is aliased to `src/` (`import { Navbar } from '@/components/organisms'`).
- Each component owns a co-located `*.module.scss`.
- Barrel `index.ts` files exist **only at folder level** (organisms, sections),
  never one per component.
- CSS variables live in `styles/_root.scss`: `--color-primary`, `--color-white`,
  `--color-black`, `--width`.
```
