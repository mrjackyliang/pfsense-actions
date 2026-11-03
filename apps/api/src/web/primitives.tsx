import brandMarkUrl from '@/web/assets/brand-mark.svg';

import type { ReactElement } from 'react';

import type {
  Web_Components_Button_Props,
  Web_Components_Icon_Name,
  Web_Components_Icon_Props,
} from '@/types/web/components.d.ts';

/**
 * Primitives - Icon paths.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const iconPaths: Record<Web_Components_Icon_Name, ReactElement> = {
  'activity': <path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" />,
  'add': <path d="M12 5v14M5 12h14" />,
  'bell': <path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15L6 17Zm3.5 3a2.5 2.5 0 0 0 5 0" />,
  'check': <path d="m5 12 4 4L19 6" />,
  'chevron': <path d="m9 18 6-6-6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'copy': <path d="M9 9h11v11H9V9Zm-4 6H4V4h11v1" />,
  'download': <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />,
  'edit': <path d="M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4" />,
  'key': <path d="M15 7a5 5 0 1 1-3.5 8.6L3 24v-5l3-3h3l1.5-1.5A5 5 0 0 1 15 7Z" />,
  'logout': <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  'more': <path d="M6 12h.01M12 12h.01M18 12h.01" />,
  'overview': <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />,
  'refresh': <path d="M20 7v5h-5M4 17v-5h5M18.5 9A7 7 0 0 0 6 6.5L4 9m2 6a7 7 0 0 0 12.5 2.5L20 15" />,
  'remove': <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />,
  'send': <path d="M21 3 3 10.5l7.5 3L21 3Zm0 0-7.5 18-3-7.5" />,
  'server': <path d="M4 5h16v6H4V5Zm0 8h16v6H4v-6Zm3-5h.01M7 16h.01M11 8h6M11 16h6" />,
  'shield': <path d="M12 3 4.5 6v5.5c0 4.7 3.2 8 7.5 9.5 4.3-1.5 7.5-4.8 7.5-9.5V6L12 3Zm-3 9 2 2 4-5" />,
  'warning': <path d="M12 4 21 20H3L12 4Zm0 5v5m0 3h.01" />,
  'x': <path d="m6 6 12 12M18 6 6 18" />,
};

/**
 * Primitives - Icon.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const Icon = ({
  name,
  size = 20,
}: Web_Components_Icon_Props): ReactElement => (
  <svg
    aria-hidden="true"
    className="icon"
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
  >
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {iconPaths[name]}
    </g>
  </svg>
);

/**
 * Primitives - Brand mark.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
export const BrandMark = (): ReactElement => (
  <img alt="" className="brand-mark" src={brandMarkUrl} />
);

/**
 * Primitives - Button.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const Button = ({
  block = false,
  children,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  variant = 'secondary',
}: Web_Components_Button_Props): ReactElement => (
  <button
    className={`button button-${variant}${(block) ? ' button-block' : ''}`}
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {(icon === undefined) ? null : <Icon name={icon} size={16} />}
    <span>{children}</span>
  </button>
);
