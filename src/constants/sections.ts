/** One-page sections: `id` is the anchor, `navKey` the i18n label for the nav. */
export const SECTIONS = [
  { id: 'home', navKey: 'nav.home', showNav: false },
  { id: 'about', navKey: 'nav.about', showNav: true },
  { id: 'projects', navKey: 'nav.projects', showNav: true },
  { id: 'contact', navKey: 'nav.contact', showNav: true},
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
