import {
  useEffect,
  useState,
} from 'react';

import {
  issueFor,
  summaryFor,
} from '@/web/api.ts';
import { FieldLabel } from '@/web/field-label.tsx';
import { formatDate } from '@/web/format.ts';
import {
  Button,
  Icon,
} from '@/web/primitives.tsx';
import { showToast } from '@/web/toast.ts';
import { useEscapeKey } from '@/web/use-escape-key.ts';

import type {
  FormEvent,
  ReactElement,
} from 'react';

import type { Web_Api_Scope } from '@/types/web/api.d.ts';
import type {
  Web_Components_ScopeOption,
  Web_Components_TokenDialog_Expiry,
  Web_Components_TokenDialog_Props,
} from '@/types/web/components.d.ts';

/**
 * Token Dialog - Scope options.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const scopeOptions: Web_Components_ScopeOption[] = [
  {
    description: 'Check that pfSense answers, and read its operating system and release.',
    endpoints: [
      'GET /api/v1/connectivity',
      'GET /api/v1/system',
    ],
    id: 'pfsense:read',
  },
  {
    description: 'Ping an address from the firewall.',
    endpoints: ['POST /api/v1/ping'],
    id: 'reachability:read',
  },
  {
    description: 'Send Wake-on-LAN packets.',
    endpoints: ['POST /api/v1/wol'],
    id: 'wol:execute',
  },
];

// expiryDate turns a choice like "in 90 days" into the timestamp the API stores.

/**
 * Token Dialog - Expiry date.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const expiryDate = (expiry: Web_Components_TokenDialog_Expiry): string | null | undefined => {
  if (expiry === 'keep') {
    return undefined;
  }

  if (expiry === 'never') {
    return null;
  }

  return new Date(Date.now() + (Number(expiry) * 24 * 60 * 60 * 1000)).toISOString();
};

/**
 * Token Dialog.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const TokenDialog = ({
  onClose,
  onCreate,
  onUpdate,
  open,
  token,
}: Web_Components_TokenDialog_Props): ReactElement | null => {
  const [
    name,
    setName,
  ] = useState<string>('');
  const [
    scopes,
    setScopes,
  ] = useState<Web_Api_Scope[]>(['pfsense:read']);
  const [
    expiry,
    setExpiry,
  ] = useState<Web_Components_TokenDialog_Expiry>('never');
  const [
    error,
    setError,
  ] = useState<unknown>(null);
  const [
    busy,
    setBusy,
  ] = useState<boolean>(false);

  useEscapeKey(onClose, open);

  useEffect((): void => {
    if (!open) {
      return;
    }

    setName((token === null) ? '' : token['name']);
    setScopes((token === null) ? ['pfsense:read'] : token['scopes']);
    setExpiry((token === null || token['expiresAt'] === null) ? 'never' : 'keep');
    setError(null);
  }, [
    open,
    token,
  ]);

  if (!open) {
    return null;
  }

  const editing: boolean = token !== null;

  /**
   * Token Dialog - Toggles scope.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const toggleScope = (scope: Web_Api_Scope): void => {
    setScopes((current: Web_Api_Scope[]): Web_Api_Scope[] => (
      (current.includes(scope)) ? current.filter((candidate: Web_Api_Scope): boolean => candidate !== scope) : [
        ...current,
        scope,
      ]
    ));
  };

  /**
   * Token Dialog - Submit.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const orderedScopes: Web_Api_Scope[] = scopeOptions
      .map((option: Web_Components_ScopeOption): Web_Api_Scope => option['id'])
      .filter((scope: Web_Api_Scope): boolean => scopes.includes(scope));
    const expiresAt: string | null | undefined = expiryDate(expiry);

    try {
      if (token === null) {
        await onCreate({
          ...((typeof expiresAt === 'string') ? { expiresAt } : {}),
          name,
          scopes: orderedScopes,
        });
      } else {
        await onUpdate(token['id'], {
          ...((expiresAt === undefined) ? {} : { expiresAt }),
          name,
          scopes: orderedScopes,
        });
        showToast(`${name.trim()} saved.`, true);
      }

      onClose();
    } catch (caughtError) {
      setError(caughtError);
    } finally {
      setBusy(false);
    }
  };

  const nameIssue: string = issueFor(error, 'name');
  const scopesIssue: string = issueFor(error, 'scopes');
  const summary: string = summaryFor(error, [
    'name',
    'scopes',
  ], 'The token could not be saved.');

  return (
    <div className="dialog-backdrop" role="presentation">
      <section aria-labelledby="token-dialog-title" aria-modal="true" className="dialog" role="dialog">
        <div className="dialog-heading">
          <div>
            <h2 id="token-dialog-title">{(token === null) ? 'Create token' : `Edit ${token['name']}`}</h2>
            <p>{(editing) ? 'Change its name, what it can do, or when it expires. Its value stays the same.' : 'The token is shown once, right after it\'s created.'}</p>
          </div>
          <button aria-label="Close" className="icon-button" onClick={onClose} type="button">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form noValidate onSubmit={submit}>
          <FieldLabel>
            <span>Name</span>
            <input
              aria-invalid={nameIssue !== ''}
              onChange={(event): void => setName(event.currentTarget.value)}
              placeholder="e.g. Home automation"
              value={name}
            />
            {(nameIssue === '') ? <small>{'A name you\'ll recognize, like the app that uses it.'}</small> : <small className="field-error">{nameIssue}</small>}
          </FieldLabel>

          <fieldset className="scope-fieldset">
            <legend>Scopes</legend>
            {scopeOptions.map((option: Web_Components_ScopeOption): ReactElement => (
              <label aria-label={option['id']} className="check-row" key={option['id']}>
                <input
                  checked={scopes.includes(option['id'])}
                  onChange={(): void => toggleScope(option['id'])}
                  type="checkbox"
                />
                <span>
                  <strong className="mono">{option['id']}</strong>
                  <small>{option['description']}</small>
                  <small className="mono scope-endpoints">
                    {option['endpoints'].map((endpoint: string): ReactElement => <span key={endpoint}>{endpoint}</span>)}
                  </small>
                </span>
              </label>
            ))}
            {(scopesIssue === '') ? null : <small className="field-error">{scopesIssue}</small>}
          </fieldset>

          <FieldLabel>
            <span>Expires</span>
            <select className="select-control" onChange={(event): void => setExpiry(event.currentTarget.value as Web_Components_TokenDialog_Expiry)} value={expiry}>
              {(token !== null && token['expiresAt'] !== null) ? <option value="keep">{`Keep ${formatDate(token['expiresAt'])}`}</option> : null}
              <option value="never">Never</option>
              <option value="30">In 30 days</option>
              <option value="90">In 90 days</option>
              <option value="365">In 1 year</option>
            </select>
          </FieldLabel>

          {(summary === '') ? null : (
            <div className="form-error" role="alert">
              <Icon name="warning" size={16} />
              <span>{summary}</span>
            </div>
          )}

          <div className="dialog-actions">
            <Button onClick={onClose}>Cancel</Button>
            <Button disabled={busy || scopes.length === 0 || name.trim() === ''} type="submit" variant="primary">
              {(editing) ? 'Save' : 'Create token'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
