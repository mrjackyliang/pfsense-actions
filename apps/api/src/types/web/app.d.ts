import type { Web_Components_View } from '@/types/web/components.d.ts';

/**
 * App.
 *
 * @since 2.0.0
 */
export type Web_App_Phase = 'application' | 'claim' | 'loading' | 'login';

/**
 * App.
 *
 * @since 2.0.0
 */
export type Web_App_RemovedSecretAction = {
  label: string;
  view: Web_Components_View;
};
