import { useState } from 'react';

import { activityCategoryLabel } from '@/web/activity.ts';
import {
  formatDate,
  formatRelative,
  keepTogether,
} from '@/web/format.ts';
import {
  Button,
  Icon,
} from '@/web/primitives.tsx';

import type {
  Web_ActivityView_ActivityList_Activity,
  Web_ActivityView_ActivityList_Compact,
  Web_ActivityView_ActivityList_Props,
  Web_ActivityView_ActivityList_Returns,
  Web_ActivityView_ActivityView_Activity,
  Web_ActivityView_ActivityView_Error,
  Web_ActivityView_ActivityView_ErrorState,
  Web_ActivityView_ActivityView_Filter,
  Web_ActivityView_ActivityView_FilterState,
  Web_ActivityView_ActivityView_OnRefresh,
  Web_ActivityView_ActivityView_Props,
  Web_ActivityView_ActivityView_Refresh,
  Web_ActivityView_ActivityView_Refresh_Returns,
  Web_ActivityView_ActivityView_Refreshing,
  Web_ActivityView_ActivityView_RefreshingState,
  Web_ActivityView_ActivityView_Returns,
  Web_ActivityView_ActivityView_SetError,
  Web_ActivityView_ActivityView_SetFilter,
  Web_ActivityView_ActivityView_SetRefreshing,
  Web_ActivityView_ActivityView_VisibleActivity,
  Web_ActivityView_Filters,
} from '@/types/web/activity-view.d.ts';

/**
 * Activity View - Filters.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const filters: Web_ActivityView_Filters = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'access',
    label: 'Access',
  },
  {
    id: 'token',
    label: 'Tokens',
  },
  {
    id: 'configuration',
    label: 'Configuration',
  },
  {
    id: 'service',
    label: 'Service',
  },
  {
    id: 'failed',
    label: 'Failed',
  },
];

/**
 * Activity View - Activity List.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @param {Web_ActivityView_ActivityList_Props} props - Props.
 *
 * @returns {Web_ActivityView_ActivityList_Returns}
 *
 * @since 2.0.0
 */
export const ActivityList = (props: Web_ActivityView_ActivityList_Props): Web_ActivityView_ActivityList_Returns => {
  const activity: Web_ActivityView_ActivityList_Activity = props['activity'];
  const compact: Web_ActivityView_ActivityList_Compact = props['compact'] ?? false;

  if (activity.length === 0) {
    return <p className="select-list select-list-empty">Nothing has happened yet.</p>;
  }

  return (
    <ul className={(compact === true) ? 'activity-list activity-list-compact' : 'activity-list'}>
      {activity.map((event) => (
        <li className="activity-row" key={event['id']}>
          <span
            aria-label={(event['outcome'] === 'failed') ? 'Failed' : 'Succeeded'}
            className={(event['outcome'] === 'failed') ? 'status-dot status-error' : 'status-dot status-seeding'}
            role="img"
          />
          <span className="activity-main">
            <span>{event['summary']}</span>
            <small>
              <span className="mono">{event['action']}</span>
              {` · ${keepTogether(event['actorId'])}`}
              {(compact === true) ? null : ` · ${keepTogether(activityCategoryLabel(event['category']))}`}
            </small>
          </span>
          <time className="activity-time" dateTime={event['createdAt']} title={formatDate(event['createdAt'])}>
            {formatRelative(event['createdAt'])}
          </time>
        </li>
      ))}
    </ul>
  );
};

/**
 * Activity View - Activity View.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @param {Web_ActivityView_ActivityView_Props} props - Props.
 *
 * @returns {Web_ActivityView_ActivityView_Returns}
 *
 * @since 2.0.0
 */
export const ActivityView = (props: Web_ActivityView_ActivityView_Props): Web_ActivityView_ActivityView_Returns => {
  const activity: Web_ActivityView_ActivityView_Activity = props['activity'];
  const onRefresh: Web_ActivityView_ActivityView_OnRefresh = props['onRefresh'];
  const filterState: Web_ActivityView_ActivityView_FilterState = useState<Web_ActivityView_ActivityView_Filter>('all');
  const filter: Web_ActivityView_ActivityView_Filter = filterState[0];
  const setFilter: Web_ActivityView_ActivityView_SetFilter = filterState[1];
  const refreshingState: Web_ActivityView_ActivityView_RefreshingState = useState<Web_ActivityView_ActivityView_Refreshing>(false);
  const refreshing: Web_ActivityView_ActivityView_Refreshing = refreshingState[0];
  const setRefreshing: Web_ActivityView_ActivityView_SetRefreshing = refreshingState[1];
  const errorState: Web_ActivityView_ActivityView_ErrorState = useState<Web_ActivityView_ActivityView_Error>('');
  const error: Web_ActivityView_ActivityView_Error = errorState[0];
  const setError: Web_ActivityView_ActivityView_SetError = errorState[1];

  const visibleActivity: Web_ActivityView_ActivityView_VisibleActivity = activity.filter((event) => {
    if (filter === 'all') {
      return true;
    }

    if (filter === 'failed') {
      return event['outcome'] === 'failed';
    }

    return event['category'] === filter;
  });

  /**
   * Activity View - Refresh.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_ActivityView_ActivityView_Refresh_Returns}
   *
   * @since 2.0.0
   */
  const refresh: Web_ActivityView_ActivityView_Refresh = async (): Web_ActivityView_ActivityView_Refresh_Returns => {
    setRefreshing(true);
    setError('');
    try {
      await onRefresh();
    } catch (caughtError) {
      setError((caughtError instanceof Error) ? caughtError.message : 'The activity log could not be loaded.');
    } finally {
      setRefreshing(false);
    }

    return;
  };

  return (
    <section className="workspace-section">
      <div className="workspace-heading workspace-heading-split">
        <div>
          <h1>Activity</h1>
          <p>The last 250 events. Request bodies, targets and SSH output are never recorded.</p>
        </div>
        <Button
          disabled={refreshing}
          icon="refresh"
          onClick={() => {
            void refresh();

            return;
          }}
        >
          Refresh
        </Button>
      </div>

      {(error === '') ? null : (
        <div className="form-error" role="alert">
          <Icon name="warning" size={16} />
          <span>{error}</span>
        </div>
      )}

      <div aria-label="Filter activity" className="status-chips" role="group">
        {filters.map((option) => (
          <button
            aria-pressed={filter === option['id']}
            className="chip"
            key={option['id']}
            onClick={() => setFilter(option['id'])}
            type="button"
          >
            {option['label']}
          </button>
        ))}
      </div>

      <div className="panel">
        <ActivityList activity={visibleActivity} />
      </div>
    </section>
  );
};
