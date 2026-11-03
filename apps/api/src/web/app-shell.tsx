import {
  useEffect,
  useState,
} from 'react';

import {
  BrandMark,
  Icon,
} from '@/web/primitives.tsx';
import {
  applyThemePreference,
  readThemePreference,
  themeOptions,
} from '@/web/theme.ts';
import { useEscapeKey } from '@/web/use-escape-key.ts';

import type { ReactElement } from 'react';

import type {
  Web_Components_AccountMenu_Props,
  Web_Components_AppShell_Props,
  Web_Components_ConnectionStatus,
  Web_Components_NavigationItem,
} from '@/types/web/components.d.ts';
import type {
  Web_Theme_Option,
  Web_Theme_Preference,
} from '@/types/web/theme.d.ts';

/**
 * App Shell - Navigation items.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const navigationItems: Web_Components_NavigationItem[] = [
  {
    id: 'overview',
    icon: 'overview',
    label: 'Overview',
  },
  {
    id: 'activity',
    icon: 'activity',
    label: 'Activity',
  },
  {
    id: 'access',
    icon: 'key',
    label: 'Access tokens',
  },
  {
    id: 'connection',
    icon: 'server',
    label: 'Connection',
  },
];

// Notifications sits after these in the sidebar, and in the account menu on small screens.

/**
 * App Shell - Secondary items.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const secondaryItems: Web_Components_NavigationItem[] = [{
  id: 'notifications',
  icon: 'bell',
  label: 'Notifications',
}];

// Reduces the saved connection and the last test to what the shell shows at a glance.

/**
 * App Shell - Describe connection.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const describeConnection = (
  connection: Web_Components_AppShell_Props['connection'],
  connectionTest: Web_Components_AppShell_Props['connectionTest'],
): Web_Components_ConnectionStatus => {
  if (connection === null) {
    return {
      detail: 'Loading…',
      label: 'pfSense',
      tone: 'idle',
    };
  }

  if (!connection['configured']) {
    return {
      detail: 'Set up the SSH connection',
      label: 'Not connected',
      tone: 'blocked',
    };
  }

  if (connection['credentialSaved'] === false) {
    return {
      detail: (connection['credentialType'] === 'privateKey') ? 'Enter the private key again' : 'Enter the password again',
      label: 'Not connected',
      tone: 'blocked',
    };
  }

  const target: string = `${connection['pfsenseUsername'] ?? ''}@${connection['pfsenseSshIp'] ?? ''}`;

  if (connectionTest === true) {
    return {
      detail: target,
      label: 'Connected',
      tone: 'protected',
    };
  }

  if (connectionTest === false) {
    return {
      detail: 'The last test failed',
      label: 'Can\'t reach pfSense',
      tone: 'blocked',
    };
  }

  return {
    detail: target,
    label: 'pfSense',
    tone: 'idle',
  };
};

/**
 * App Shell - Account menu.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const AccountMenu = ({
  compact,
  onLogout,
  onViewChange,
  username,
}: Web_Components_AccountMenu_Props): ReactElement => {
  const [
    open,
    setOpen,
  ] = useState<boolean>(false);
  const [
    themePreference,
    setThemePreference,
  ] = useState<Web_Theme_Preference>(readThemePreference);

  useEffect((): void => applyThemePreference(themePreference), [themePreference]);

  useEscapeKey((): void => setOpen(false), open);

  return (
    <div className="account">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="account-button"
        onClick={(): void => setOpen(!open)}
        type="button"
      >
        <span aria-hidden="true" className="avatar">{username.slice(0, 1).toUpperCase()}</span>
        <span>{username}</span>
        <Icon name="more" size={18} />
      </button>

      {(open) ? (
        <>
          <button
            aria-label="Close menu"
            className="menu-scrim"
            onClick={(): void => setOpen(false)}
            type="button"
          />
          <div className="menu account-menu" role="menu">
            <div className="account-menu-section">
              <span id="appearance-label">Appearance</span>
              <div aria-labelledby="appearance-label" className="segmented" role="group">
                {themeOptions.map((option: Web_Theme_Option): ReactElement => (
                  <button
                    aria-pressed={themePreference === option['id']}
                    key={option['id']}
                    onClick={(): void => setThemePreference(option['id'])}
                    type="button"
                  >
                    {option['label']}
                  </button>
                ))}
              </div>
            </div>
            <hr />
            {(compact) ? secondaryItems.map((item: Web_Components_NavigationItem): ReactElement => (
              <button
                key={item['id']}
                onClick={(): void => {
                  setOpen(false);
                  onViewChange(item['id']);
                }}
                role="menuitem"
                type="button"
              >
                <Icon name={item['icon']} size={16} />
                {item['label']}
              </button>
            )) : null}
            <button
              onClick={(): void => {
                setOpen(false);
                onViewChange('security');
              }}
              role="menuitem"
              type="button"
            >
              <Icon name="key" size={16} />
              Password and sign-in
            </button>
            <button
              onClick={(): void => {
                setOpen(false);
                onLogout();
              }}
              role="menuitem"
              type="button"
            >
              <Icon name="logout" size={16} />
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

/**
 * App Shell.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const AppShell = ({
  activeView,
  children,
  connection,
  connectionTest,
  notice,
  onLogout,
  onViewChange,
  username,
}: Web_Components_AppShell_Props): ReactElement => {
  const status: Web_Components_ConnectionStatus = describeConnection(connection, connectionTest);

  /**
   * App Shell - Renders item.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const renderItem = (item: Web_Components_NavigationItem): ReactElement => (
    <button
      aria-current={(activeView === item['id']) ? 'page' : undefined}
      className="nav-item"
      key={item['id']}
      onClick={(): void => onViewChange(item['id'])}
      type="button"
    >
      <Icon name={item['icon']} size={18} />
      {item['label']}
    </button>
  );

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="brand">
          <BrandMark />
          <span>pfSense Actions</span>
        </div>

        <nav aria-label="Main" className="nav">
          {navigationItems.map(renderItem)}
          {secondaryItems.map(renderItem)}
        </nav>

        <div className="sidebar-footer">
          <button
            className={`protection-card protection-${status['tone']}`}
            onClick={(): void => onViewChange('connection')}
            type="button"
          >
            <span className="status-dot" />
            <strong>{status['label']}</strong>
            <small>{status['detail']}</small>
          </button>
          <AccountMenu compact={false} onLogout={onLogout} onViewChange={onViewChange} username={username} />
        </div>
      </aside>

      <header className="mobile-header">
        <div className="brand">
          <BrandMark />
          <span>pfSense Actions</span>
        </div>
        <div className="mobile-header-end">
          <button
            className={`protection-pill protection-${status['tone']}`}
            onClick={(): void => onViewChange('connection')}
            type="button"
          >
            <span className="status-dot" />
            {status['label']}
          </button>
          <AccountMenu compact onLogout={onLogout} onViewChange={onViewChange} username={username} />
        </div>
      </header>

      <main className="app-main">
        {notice}
        {children}
      </main>

      <nav aria-label="Main" className="tab-bar">
        {navigationItems.map((item: Web_Components_NavigationItem): ReactElement => (
          <button
            aria-current={(activeView === item['id']) ? 'page' : undefined}
            key={item['id']}
            onClick={(): void => onViewChange(item['id'])}
            type="button"
          >
            <Icon name={item['icon']} size={20} />
            {item['label']}
          </button>
        ))}
      </nav>
    </div>
  );
};
