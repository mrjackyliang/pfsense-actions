import type {
  Web_Activity_ActivityCategoryLabel_Category,
  Web_Activity_ActivityCategoryLabel_Returns,
  Web_Activity_CategoryLabels,
} from '@/types/web/activity.d.ts';

/**
 * Web - Activity - Category Labels.
 *
 * Gives each stored category the broader label shown beside activity events.
 * Configuration includes both connection and notification destination changes.
 *
 * @since 2.0.0
 */
const categoryLabels: Web_Activity_CategoryLabels = {
  access: 'Access',
  configuration: 'Configuration',
  service: 'Service',
  token: 'Tokens',
};

/**
 * Web - Activity - Activity Category Label.
 *
 * Returns the console label for one stored activity category.
 * The label stays broader than any one action inside that category.
 *
 * @param {Web_Activity_ActivityCategoryLabel_Category} category - Category.
 *
 * @returns {Web_Activity_ActivityCategoryLabel_Returns}
 *
 * @since 2.0.0
 */
export function activityCategoryLabel(category: Web_Activity_ActivityCategoryLabel_Category): Web_Activity_ActivityCategoryLabel_Returns {
  return categoryLabels[category];
}
