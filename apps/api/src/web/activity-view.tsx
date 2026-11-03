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

import type { ReactElement } from 'react';

import type { Web_Api_ActivityEvent } from '@/types/web/api.d.ts';
import type {
  Web_Components_ActivityFilter,
  Web_Components_ActivityFilterOption,
  Web_Components_ActivityList_Props,
  Web_Components_ActivityView_Props,
} from '@/types/web/components.d.ts';

/**
 * Activity View - Filters.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const filters: Web_Components_ActivityFilterOption[] = [
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
 * Activity View - Activity list.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const ActivityList = ({
  activity,
  compact = false,
}: Web_Components_ActivityList_Props): ReactElement => {
  if (activity.length === 0) {
    return <p className="select-list select-list-empty">Nothing has happened yet.</p>;
  }

  return (
    <ul className={(compact) ? 'activity-list activity-list-compact' : 'activity-list'}>
      {activity.map((event: Web_Api_ActivityEvent): ReactElement => (
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
              {(compact) ? null : ` · ${keepTogether(activityCategoryLabel(event['category']))}`}
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
 * Activity View.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const ActivityView = ({
  activity,
  onRefresh,
}: Web_Components_ActivityView_Props): ReactElement => {
  const [
    filter,
    setFilter,
  ] = useState<Web_Components_ActivityFilter>('all');
  const [
    refreshing,
    setRefreshing,
  ] = useState<boolean>(false);
  const [
    error,
    setError,
  ] = useState<string>('');

  const visibleActivity: Web_Api_ActivityEvent[] = activity.filter((event: Web_Api_ActivityEvent): boolean => {
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
   * @since 2.0.0
   */
  const refresh = async (): Promise<void> => {
    setRefreshing(true);
    setError('');
    try {
      await onRefresh();
    } catch (caughtError) {
      setError((caughtError instanceof Error) ? caughtError.message : 'The activity log could not be loaded.');
    } finally {
      setRefreshing(false);
    }
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
          onClick={(): void => {
            void refresh();
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
        {filters.map((option: Web_Components_ActivityFilterOption): ReactElement => (
          <button
            aria-pressed={filter === option['id']}
            className="chip"
            key={option['id']}
            onClick={(): void => setFilter(option['id'])}
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
