/** One-page sections: `id` is the anchor, `navKey` the i18n label for the nav. */
export const SECTIONS = [
  { id: 'home', navKey: 'nav.home', showNav: false, title: 'title.home' },
  { id: 'about', navKey: 'nav.about', showNav: true, title: 'title.about' },
  { id: 'projects', navKey: 'nav.projects', showNav: true, title: 'title.projects' },
  { id: 'contact', navKey: 'nav.contact', showNav: true, title: 'title.contact'},
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
