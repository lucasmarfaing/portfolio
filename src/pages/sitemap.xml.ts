import type { APIRoute } from 'astro';

/** Static sitemap: the two language versions of the home page, linked as alternates. */
export const GET: APIRoute = ({ site }) => {
  const fr = new URL('/', site).href;
  const en = new URL('/en/', site).href;
  const alternates = `
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}" />
    <xhtml:link rel="alternate" hreflang="en" href="${en}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${fr}" />`;
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${fr}</loc><lastmod>${lastmod}</lastmod>${alternates}
  </url>
  <url><loc>${en}</loc><lastmod>${lastmod}</lastmod>${alternates}
  </url>
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
