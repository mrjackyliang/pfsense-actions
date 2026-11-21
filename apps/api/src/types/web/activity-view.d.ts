import type {
  Dispatch,
  ReactElement,
  SetStateAction,
} from 'react';

import type { Web_Api_ActivityEvent } from '@/types/web/api.d.ts';
import type {
  Web_Components_ActivityFilter,
  Web_Components_ActivityFilterOption,
  Web_Components_ActivityList_Props,
  Web_Components_ActivityView_Props,
} from '@/types/web/components.d.ts';

/**
 * Activity View.
 *
 * @since 2.2.1
 */
export type Web_ActivityView_ActivityList_Props = Web_Components_ActivityList_Props;
export type Web_ActivityView_ActivityList_Returns = ReactElement;
export type Web_ActivityView_ActivityList_Activity = Web_Components_ActivityList_Props['activity'];
export type Web_ActivityView_ActivityList_Compact = boolean;

/**
 * Activity View.
 *
 * @since 2.2.1
 */
export type Web_ActivityView_ActivityView_Props = Web_Components_ActivityView_Props;
export type Web_ActivityView_ActivityView_Returns = ReactElement;
export type Web_ActivityView_ActivityView_Activity = Web_Components_ActivityView_Props['activity'];
export type Web_ActivityView_ActivityView_OnRefresh = Web_Components_ActivityView_Props['onRefresh'];
export type Web_ActivityView_ActivityView_Filter = Web_Components_ActivityFilter;
export type Web_ActivityView_ActivityView_SetFilter = Dispatch<SetStateAction<Web_ActivityView_ActivityView_Filter>>;
export type Web_ActivityView_ActivityView_FilterState = [Web_ActivityView_ActivityView_Filter, Web_ActivityView_ActivityView_SetFilter];
export type Web_ActivityView_ActivityView_Refreshing = boolean;
export type Web_ActivityView_ActivityView_SetRefreshing = Dispatch<SetStateAction<Web_ActivityView_ActivityView_Refreshing>>;
export type Web_ActivityView_ActivityView_RefreshingState = [Web_ActivityView_ActivityView_Refreshing, Web_ActivityView_ActivityView_SetRefreshing];
export type Web_ActivityView_ActivityView_Error = string;
export type Web_ActivityView_ActivityView_SetError = Dispatch<SetStateAction<Web_ActivityView_ActivityView_Error>>;
export type Web_ActivityView_ActivityView_ErrorState = [Web_ActivityView_ActivityView_Error, Web_ActivityView_ActivityView_SetError];
export type Web_ActivityView_ActivityView_VisibleActivity = Web_Api_ActivityEvent[];
export type Web_ActivityView_ActivityView_Refresh_Returns = Promise<void>;
export type Web_ActivityView_ActivityView_Refresh = () => Web_ActivityView_ActivityView_Refresh_Returns;

/**
 * Activity View.
 *
 * @since 2.2.1
 */
export type Web_ActivityView_Filters = Web_Components_ActivityFilterOption[];
