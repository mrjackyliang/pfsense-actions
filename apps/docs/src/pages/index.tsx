import {
  BlogPreview,
  BrowserFrame,
  Canvas,
  Features,
  Showcase,
  Spotlight,
} from '@cbnventures/docusaurus-preset-nova/blocks';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';

import activityLogOneDark from '../../docs/console/_assets_/activity-log-1-dark.png';
import activityLogOneLight from '../../docs/console/_assets_/activity-log-1-light.png';
import notificationsOneDark from '../../docs/console/_assets_/notifications-1-dark.png';
import notificationsOneLight from '../../docs/console/_assets_/notifications-1-light.png';
import styles from './index.module.css';

import type {
  Pages_Index_Home_CodeSample,
  Pages_Index_Home_Returns,
} from '../types/pages/index.d.ts';

/**
 * Pages - Code Sample.
 *
 * Shows the Wake-on-LAN request that first motivated the project.
 * The example mirrors the documented public request contract.
 *
 * @since 0.0.0
 */
const codeSample: Pages_Index_Home_CodeSample = [
  'POST /wol HTTP/1.1',
  'Authorization: Bearer pfa_••••',
  'Content-Type: application/json',
  '',
  '{',
  '  "broadcastAddress": "192.0.2.255",',
  '  "macAddress": "00:11:22:33:44:55"',
  '}',
].join('\n');

/**
 * Pages - Home.
 *
 * Introduces pfSense Actions with the shared Nova homepage blocks used across
 * the project's related documentation sites.
 *
 * @returns {Pages_Index_Home_Returns}
 *
 * @since 0.0.0
 */
function Home(): Pages_Index_Home_Returns {
  return (
    <Layout description="Wake devices, test reachability, and read basic pfSense system information through a small API with scoped personal tokens.">
      <Head>
        <title>pfSense Actions - A Small API for Firewall Automation</title>
      </Head>

      <Canvas container="full" surface="default" className={styles['hero-section']}>
        <div className={styles['hero']}>
          <div className={styles['hero-inner']}>
            <div className={styles['hero-grid']}>
              <div className={styles['hero-content']}>
                <p className="nova-hero-eyebrow">pfSense automation</p>
                <h1 className="nova-hero-heading">
                  Give automation the pfSense actions it needs, and nothing more.
                </h1>
                <p className="nova-hero-tagline">
                  Wake a computer, check an address, or read basic system information without sharing your pfSense login with every script and shortcut.
                </p>
                <div className="nova-hero-actions">
                  <Link className="nova-cta-primary" to="/docs/getting-started/install-with-docker/">
                    Get Started
                  </Link>
                  <Link className="nova-cta-secondary" to="/docs/overview/">
                    Learn More
                  </Link>
                </div>
              </div>

              <div className={styles['request-preview']} aria-hidden="true">
                <div className={styles['request-preview-header']}>
                  <span className={styles['request-preview-dot']} />
                  <span className={styles['request-preview-dot']} />
                  <span className={styles['request-preview-dot']} />
                  <span className={styles['request-preview-title']}>wake-gaming-pc.http</span>
                </div>
                <pre className={styles['request-preview-code']}>
                  <code>{codeSample}</code>
                </pre>
                <div className={styles['request-preview-result']}>
                  <span>200</span>
                  <span>Wake-on-LAN request accepted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Canvas>

      <main>
        <Features
          items={[
            {
              icon: 'lucide:power',
              title: 'Wake-on-LAN',
              description: 'Wake a device through one validated broadcast address and MAC address. The route returns a status code instead of raw firewall output.',
            },
            {
              icon: 'lucide:radio-tower',
              title: 'Reachability Checks',
              description: 'Ask pfSense to ping one validated IP address with bounded attempts. Scripts get a predictable result without direct shell access.',
            },
            {
              icon: 'lucide:server-cog',
              title: 'System Information',
              description: 'Read the operating system, release, and architecture through a fixed response schema designed for safe automation.',
            },
            {
              icon: 'lucide:key-round',
              title: 'Scoped Personal Tokens',
              description: 'Give each client only the capability it needs. SQLite stores hashes rather than recoverable token values, independently from browser administration.',
            },
            {
              icon: 'lucide:layout-dashboard',
              title: 'Operations Console',
              description: 'Sign in with a local administrator account to manage client tokens, redacted activity, write-only pfSense settings, and alerts when pfSense stops answering.',
            },
            {
              icon: 'lucide:container',
              title: 'Container Operations',
              description: 'Run a slim Debian controller with health checks, encrypted state, and s6 process supervision.',
            },
          ]}
        />

        <Spotlight surface="alt" heading="Inside the Operations Console" className={styles['shot-spotlight']}>
          <Showcase
            tabsLabel="Operations console pages"
            items={[
              {
                label: 'Activity',
                heading: 'Every action on the record',
                description: 'The activity log shows which token ran each action, who signed in, and what changed. Request bodies, targets, and SSH output are never recorded.',
                link: {
                  label: 'Review the Activity Log',
                  to: '/docs/console/activity-log/',
                },
                content: (
                  <BrowserFrame title="pfSense Actions" url="localhost:22603" favicon="/favicon.svg">
                    <ThemedImage
                      sources={{
                        light: activityLogOneLight,
                        dark: activityLogOneDark,
                      }}
                      alt="Activity page listing recent access, token, configuration, and service events with their time"
                      width={1280}
                      height={706}
                    />
                  </BrowserFrame>
                ),
              },
              {
                label: 'Notifications',
                heading: 'Hear about it when pfSense stops answering',
                description: 'Send alerts to ntfy, Telegram, email, and other services when pfSense stops answering, sign-in is locked, or an action fails. Test each destination before you rely on it.',
                link: {
                  label: 'Set Up Notifications',
                  to: '/docs/console/notifications/',
                },
                content: (
                  <BrowserFrame title="pfSense Actions" url="localhost:22603" favicon="/favicon.svg">
                    <ThemedImage
                      sources={{
                        light: notificationsOneLight,
                        dark: notificationsOneDark,
                      }}
                      alt="Notifications page listing four destinations with their services, event counts, and last sends"
                      width={1280}
                      height={479}
                    />
                  </BrowserFrame>
                ),
              },
            ]}
          />
        </Spotlight>

        <BlogPreview
          heading="From the Blog"
          description="Launches, milestones, and what's new in pfSense Actions."
          auto={true}
          limit={3}
          sort="newest"
        />
      </main>
    </Layout>
  );
}

export default Home;
