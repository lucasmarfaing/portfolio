/** One-page sections: `id` is the anchor, `navKey` the i18n label for the nav. */
export const SECTIONS = [
  { id: 'home', navKey: 'nav.home' },
  { id: 'about', navKey: 'nav.about' },
  { id: 'projects', navKey: 'nav.projects' },
  { id: 'contact', navKey: 'nav.contact' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
