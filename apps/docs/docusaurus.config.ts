import { NovaIdentity } from '@cbnventures/nova/toolkit';

import type { DocusaurusNovaConfig } from '@cbnventures/docusaurus-preset-nova/types/config';

/**
 * Identity.
 *
 * @since 0.0.0
 */
const identity = new NovaIdentity().forDocs();

/**
 * Docusaurus Configuration.
 *
 * @since 0.0.0
 */
const config: DocusaurusNovaConfig = {
  // Site Metadata.
  title: identity['title'] ?? '',
  titleDelimiter: '-',
  tagline: identity['tagline'],
  favicon: './favicon.ico',

  // Deployment.
  url: identity['url'] ?? '',
  baseUrl: identity['baseUrl'] ?? '/',
  organizationName: identity['organizationName'],
  projectName: identity['projectName'],
  deploymentBranch: undefined,
  githubHost: undefined,
  githubPort: undefined,
  trailingSlash: true,
  noIndex: false,

  // Error Handling.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',

  // Static Assets.
  staticDirectories: ['static'],
  baseUrlIssueBanner: true,
  scripts: [],
  stylesheets: [],
  clientModules: [],
  themes: [],

  // Custom Fields.
  customFields: {},

  // Head Tags.
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
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

  // Internationalization.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    path: 'i18n',
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
        path: 'en',
      },
    },
  },

  // Markdown.
  markdown: {
    format: 'mdx',
    mermaid: true,
    emoji: true,
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
    anchors: {
      maintainCase: false,
    },
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'throw',
    },
  },

  // Presets (Nova).
  presets: [[
    '@cbnventures/docusaurus-preset-nova',
    {
      // Preset Identity.
      preset: 'sentinel',

      // Preset Overrides (undefined = use preset default).
      overrides: {
        colors: {
          primary: {
            light: '#0F766E',
            dark: '#14B8A6',
          },
          secondary: {
            light: '#F59E0B',
            dark: '#FBBF24',
          },
          text: undefined,
          border: undefined,
          warning: undefined,
          danger: undefined,
        },
        fonts: {
          display: undefined,
          body: undefined,
          code: undefined,
        },
        navbar: undefined,
        footer: undefined,
      },

      // Plugins.
      plugins: {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/mrjackyliang/pfsense-actions/tree/main/apps/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          lastVersion: 'current',
          versions: {
            current: {
              label: 'Current',
              badge: false,
              banner: 'none',
            },
          },
        },
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
        pages: {
          editUrl: 'https://github.com/mrjackyliang/pfsense-actions/tree/main/apps/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: [`${identity['baseUrl'] ?? '/'}docs/tags/**`],
          filename: 'sitemap.xml',
        },
      },

      // Analytics.
      analytics: {
        gtm: {
          containerId: 'GTM-NJN3C25S',
        },
      },

      // Search.
      search: {
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: 'docs',
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        searchBarShortcutKeymap: 'mod+k',
        searchResultLimits: 8,
        fuzzyMatchingDistance: 1,
        ignorePatterns: [],
      },

      // Progress Bar.
      progressBar: true,
    },
  ]],

  // Plugins.
  plugins: [],

  // Theme Config.
  themeConfig: {
    // Site.
    site: {
      logo: {
        alt: 'pfSense Actions',
        src: {
          light: `${identity['baseUrl'] ?? '/'}images/navbar.svg`,
          dark: undefined,
        },
        href: '/',
        target: undefined,
        rel: undefined,
        ariaLabel: undefined,
        wordmark: {
          light: undefined,
          dark: undefined,
        },
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

    // Color Mode.
    colorMode: {
      defaultMode: 'system',
      disableSwitch: false,
    },

    // Navbar.
    navbar: {
      hideOnScroll: false,
      items: [
        {
          label: 'Docs',
          position: 'left',
          type: 'dropdown',
          icon: 'lucide:book-open',
          items: [
            {
              label: 'Overview',
              to: '/docs/overview/',
              icon: 'lucide:rocket',
              activeBaseRegex: '^/docs/(overview/|getting-started/|category/getting-started/|tags/)',
            },
            {
              label: 'Build With the API',
              to: '/docs/category/build-with-the-api/',
              icon: 'lucide:braces',
              activeBaseRegex: '^/docs/(api/|category/build-with-the-api/)',
            },
            {
              label: 'Operations Console',
              to: '/docs/category/operations-console/',
              icon: 'lucide:monitor-cog',
              activeBaseRegex: '^/docs/(console/|category/operations-console/)',
            },
            {
              label: 'Run the Controller',
              to: '/docs/category/run-the-controller/',
              icon: 'lucide:server-cog',
              activeBaseRegex: '^/docs/(operations/|category/run-the-controller/)',
            },
            {
              label: 'Reference',
              to: '/docs/category/reference/',
              icon: 'lucide:library',
              activeBaseRegex: '^/docs/(reference/|category/reference/)',
            },
          ],
        },
        {
          label: 'Quick Start',
          position: 'left',
          type: undefined,
          to: '/docs/getting-started/install-with-docker/',
          icon: 'lucide:play',
        },
        {
          label: 'Blog',
          position: 'left',
          type: undefined,
          to: '/blog/',
          icon: 'lucide:pen-line',
        },
        {
          label: 'Resources',
          position: 'left',
          type: 'dropdown',
          icon: 'lucide:life-buoy',
          items: [
            {
              label: 'FAQ',
              to: '/docs/reference/faq/',
              icon: 'lucide:circle-help',
            },
            {
              label: 'Troubleshooting',
              to: '/docs/operations/troubleshooting/',
              icon: 'lucide:wrench',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/mrjackyliang/pfsense-actions/releases',
              icon: 'lucide:history',
            },
            {
              label: 'Report an Issue',
              href: 'https://github.com/mrjackyliang/pfsense-actions/issues',
              icon: 'lucide:bug',
            },
            {
              label: 'Docker Hub',
              href: 'https://hub.docker.com/r/mrjackyliang/pfsense-actions',
              icon: 'lucide:package',
            },
          ],
        },
      ],
    },

    // Docs.
    docs: {
      versionPersistence: 'localStorage',
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      },
    },

    // Blog.
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

    // Table of Contents.
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },

    // Announcement Bar.
    announcementBar: undefined,

    // Back to Top Button.
    backToTopButton: true,

    // Error Pages - overrides Nova's randomized defaults with consumer copy.
    // Any unset field falls through to the Nova-flavored randomized pool.
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

    // Footer.
    footer: {
      sections: {
        docs: [
          {
            label: 'Overview',
            href: '/docs/overview/',
          },
          {
            label: 'Build With the API',
            href: '/docs/category/build-with-the-api/',
          },
          {
            label: 'Operations Console',
            href: '/docs/category/operations-console/',
          },
          {
            label: 'Run the Controller',
            href: '/docs/category/run-the-controller/',
          },
          {
            label: 'Reference',
            href: '/docs/category/reference/',
          },
        ],
        resources: [
          {
            label: 'Blog',
            href: '/blog/',
          },
          {
            label: 'FAQ',
            href: '/docs/reference/faq/',
          },
          {
            label: 'Troubleshooting',
            href: '/docs/operations/troubleshooting/',
          },
          {
            label: 'Changelog',
            href: 'https://github.com/mrjackyliang/pfsense-actions/releases',
          },
          {
            label: 'Report an Issue',
            href: 'https://github.com/mrjackyliang/pfsense-actions/issues',
          },
          {
            label: 'Source Code',
            href: 'https://github.com/mrjackyliang/pfsense-actions',
          },
          {
            label: 'Docker Hub',
            href: 'https://hub.docker.com/r/mrjackyliang/pfsense-actions',
          },
        ],
        project: [
          {
            label: 'Sponsor',
            href: 'https://github.com/sponsors/mrjackyliang',
          },
          {
            label: 'pfSense',
            href: 'https://www.pfsense.org/',
          },
          {
            label: 'Other Projects',
            href: 'https://www.mrjackyliang.com/work/',
          },
        ],
        legal: [{
          label: 'License',
          href: 'https://github.com/mrjackyliang/pfsense-actions/blob/HEAD/LICENSE',
        }],
      },
      layout: {
        docs: {
          title: 'Docs',
          section: 'docs',
        },
        resources: {
          title: 'Resources',
          section: 'resources',
        },
        project: {
          title: 'Project',
          section: 'project',
        },
        legal: {
          title: 'Legal',
          section: 'legal',
        },
      },
      socialLinks: [
        {
          icon: 'ri:facebook-fill',
          href: 'https://www.facebook.com/jackyliangofficial',
          label: 'Facebook',
        },
        {
          icon: 'ri:twitter-x-fill',
          href: 'https://x.com/mrjackyliang',
          label: 'X',
        },
        {
          icon: 'ri:youtube-fill',
          href: 'https://www.youtube.com/@mrjackyliang',
          label: 'YouTube',
        },
        {
          icon: 'ri:instagram-fill',
          href: 'https://www.instagram.com/mrjackyliang/',
          label: 'Instagram',
        },
        {
          icon: 'ri:github-fill',
          href: 'https://github.com/mrjackyliang',
          label: 'GitHub',
        },
        {
          icon: 'ri:linkedin-fill',
          href: 'https://www.linkedin.com/in/mrjackyliang/',
          label: 'LinkedIn',
        },
        {
          icon: 'ri:reddit-fill',
          href: 'https://www.reddit.com/user/mrjackyliang/',
          label: 'Reddit',
        },
        {
          icon: 'ri:heart-fill',
          href: 'https://github.com/sponsors/mrjackyliang',
          label: 'GitHub Sponsors',
        },
      ],
      copyright: identity['copyright'],
      credit: true,
      cta: {
        label: 'Ready to deploy the controller?',
        href: '/docs/getting-started/install-with-docker/',
      },
    },
  },
};

export default config;
