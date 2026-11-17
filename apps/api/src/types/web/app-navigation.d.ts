import type { Web_Components_View } from '@/types/web/components.d.ts';

import type {
  Web_Navigation_Items,
  Web_Navigation_PathMatch,
} from '@/types/web/navigation.d.ts';

/**
 * App Navigation.
 *
 * @since 2.1.0
 */
export type Web_AppNavigation_Items = Web_Navigation_Items;

/**
 * App Navigation - Paths.
 *
 * @since 2.1.0
 */
export type Web_AppNavigation_Paths = {
  account: string;
  accessTokens: string;
  activity: string;
  connection: string;
  notifications: string;
  overview: string;
  root: string;
};

/**
 * App Navigation - Route.
 *
 * @since 2.1.0
 */
export type Web_AppNavigation_Route = {
  path: string;
  view: Web_Components_View;
};

/**
 * App Navigation - Path match.
 *
 * @since 2.1.0
 */
export type Web_AppNavigation_PathMatch = Web_Navigation_PathMatch<Web_AppNavigation_Route>;
