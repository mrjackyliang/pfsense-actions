import { NovaIdentity } from '@cbnventures/nova/toolkit';

import type { DocusaurusNovaConfig } from '@cbnventures/docusaurus-preset-nova/types/config';

/**
 * Docusaurus - Identity.
 *
 * Reads the documentation identity from the generated Nova configuration.
 * Fallbacks keep the site runnable while consumers finish project metadata.
 *
 * @since 0.0.0
 */
const identity = new NovaIdentity().forDocs();

/**
 * Docusaurus - Config.
 *
 * Configures the generated documentation site with Nova's selected preset.
 * Consumers can extend these values through normal Docusaurus configuration.
 *
 * @since 0.0.0
 */
const config: DocusaurusNovaConfig = {
  title: identity['title'] ?? '',
  titleDelimiter: '-',
  tagline: identity['tagline'] ?? 'Documentation',
  url: identity['url'] ?? 'https://www.example.com',
  baseUrl: identity['baseUrl'] ?? '/',
  favicon: './favicon.ico',
  organizationName: identity['organizationName'] ?? 'your-org',
  projectName: identity['projectName'] ?? 'pfsense-actions',
  trailingSlash: true,
  noIndex: false,
  onBrokenLinks: 'throw',

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: `${identity['baseUrl'] ?? '/'}apple-touch-icon.png`,
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: `${identity['baseUrl'] ?? '/'}favicon-96x96.png`,
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${identity['baseUrl'] ?? '/'}favicon.svg`,
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: `${identity['baseUrl'] ?? '/'}site.webmanifest`,
      },
    },
  ],

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [[
    '@cbnventures/docusaurus-preset-nova',
    {
      preset: 'sentinel',
      overrides: {
        colors: {
          primary: {
            light: '#0f766e',
            dark: '#14b8a6',
          },
          secondary: {
            light: '#f59e0b',
            dark: '#fbbf24',
          },
        },
      },
      plugins: {
        blog: {
          showReadingTime: true,
          blogTitle: 'Blog',
          blogDescription: 'Release notes, upgrade guides, and notes on giving automation only the pfSense access it needs.',
          postsPerPage: 10,
          blogSidebarTitle: 'Recent Posts',
          blogSidebarCount: 15,
          feedOptions: {
            type: [
              'rss',
              'atom',
            ],
            copyright: identity['copyright'],
            limit: 20,
            title: 'pfSense Actions Blog',
            description: 'Release notes, upgrade guides, and notes on giving automation only the pfSense access it needs.',
          },
        },
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['**/docs/tags/**'],
          filename: 'sitemap.xml',
        },
      },
      search: {
        indexBlog: true,
      },
    },
  ]],

  themeConfig: {
    site: {
      logo: {
        alt: 'pfSense Actions',
        src: {
          light: `${identity['baseUrl'] ?? '/'}images/navbar.svg`,
          dark: undefined,
        },
        href: '/',
      },
      image: '/thumbnails/brand.png',
      metadata: [
        {
          name: 'description',
          content: identity['metaDescription'] ?? '',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
      ],
    },
    navbar: {
      title: 'pfSense Actions',
      items: [
        {
          label: 'Home',
          position: 'left',
          to: '/',
          icon: 'lucide:house',
        },
        {
          label: 'Guides',
          position: 'left',
          type: 'docSidebar',
          sidebarId: 'docs',
          icon: 'lucide:book-open',
        },
        {
          label: 'API',
          position: 'left',
          to: '/docs/api/request-basics/',
          icon: 'lucide:braces',
        },
        {
          label: 'Deploy',
          position: 'left',
          to: '/docs/getting-started/install-with-docker/',
          icon: 'lucide:container',
        },
        {
          label: 'Blog',
          position: 'left',
          to: '/blog/',
          icon: 'lucide:pen-line',
        },
      ],
    },
    blog: {
      sidebar: {
        groupByYear: true,
      },
      layout: {
        heading: 'Blog',
        description: 'Release notes and upgrade guides',
      },
      share: {
        platforms: [
          'linkedin',
          'reddit',
          'facebook',
          'x',
          'copy',
        ],
      },
    },
    errorPages: {
      notFound: {
        title: 'This page returned 404.',
        description: 'The link may be out of date, or the page may have moved. The overview links to every guide.',
        backHomeLabel: 'Back to the overview',
        backHomeHref: '/docs/overview/',
      },
      errorPageContent: {
        title: 'This page failed to load.',
        retryLabel: 'Reload the page',
      },
      error: {
        retryLabel: 'Try again',
      },
    },
    footer: {
      sections: {
        learn: [
          {
            label: 'Getting Started',
            href: '/docs/overview/',
          },
          {
            label: 'Authentication',
            href: '/docs/api/request-basics/#authentication',
          },
          {
            label: 'Automation',
            href: '/docs/api/automation-clients/',
          },
        ],
        resources: [
          {
            label: 'API Reference',
            href: '/docs/api/request-basics/',
          },
          {
            label: 'Deployment',
            href: '/docs/getting-started/install-with-docker/',
          },
          {
            label: 'Security',
            href: '/docs/operations/security-model/',
          },
          {
            label: 'Blog',
            href: '/blog/',
          },
          {
            label: 'GitHub Repository',
            href: 'https://github.com/mrjackyliang/pfsense-actions',
          },
        ],
      },
      layout: {
        learn: {
          title: 'Learn',
          section: 'learn',
        },
        resources: {
          title: 'Resources',
          section: 'resources',
        },
      },
      socialLinks: [{
        icon: 'ri:github-fill',
        href: 'https://github.com/mrjackyliang/pfsense-actions',
        label: 'GitHub',
      }],
      copyright: identity['copyright'],
      credit: true,
      cta: {
        label: 'Deploy the controller',
        href: '/docs/getting-started/install-with-docker/',
      },
    },
  },
};

export default config;
