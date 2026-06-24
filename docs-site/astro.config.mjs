// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// GitHub Pages: https://konradthiemann.github.io/Waldbingo/
// `base` MUSS exakt dem (case-sensitive!) Repo-Namen entsprechen, sonst brechen
// die Asset-Pfade (CSS/JS) auf GitHub Pages.
export default defineConfig({
  site: 'https://konradthiemann.github.io',
  base: '/Waldbingo/',
  integrations: [
    // astro-mermaid MUSS vor Starlight stehen, damit es die ```mermaid-Blöcke
    // beansprucht. Rendering passiert client-seitig → kein Headless-Browser in CI.
    mermaid({ theme: 'default', autoTheme: true }),
    starlight({
      title: 'Waldbingo Docs',
      description:
        'Druckfertige Wald-Bingo-Karten als PDF und eine offline-fähige, kontextadaptive Wald-Bingo-PWA für Kinder.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Deutsch', lang: 'de' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/konradthiemann/Waldbingo',
        },
      ],
      // Manuell kuratierte Sidebar – mit den realen Slugs synchron halten.
      // Slug-Regel: Dateiname lowercased ohne `.md`; README.md → index (Landing).
      sidebar: [
        { label: 'Start', link: '/' },
        {
          label: 'Nutzung',
          items: [
            { label: 'PDF-Generator', link: '/generator/' },
            { label: 'Waldbingo-App (PWA)', link: '/app/' },
          ],
        },
        {
          label: 'Hintergrund',
          items: [
            { label: 'Konzept & Architektur', link: '/konzept/' },
            { label: 'Datenmodell & Tag-Schema', link: '/datenmodell/' },
            { label: 'Roadmap & Arbeitspakete', link: '/roadmap/' },
          ],
        },
      ],
    }),
  ],
});
