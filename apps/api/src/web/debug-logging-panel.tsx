import {
  useEffect,
  useState,
} from 'react';

import {
  getDiagnostics,
  summaryFor,
  updateDiagnostics,
} from '@/web/api.ts';
import { showToast } from '@/web/toast.ts';

import type { ReactElement } from 'react';

/**
 * Debug Logging Panel.
 *
 * Shows the Debug logging switch and saves each change as soon as it's made.
 * The switch waits for the saved setting before it can be turned.
 *
 * @since 2.1.0
 */
export const DebugLoggingPanel = (): ReactElement => {
  const [
    debugLogging,
    setDebugLogging,
  ] = useState<boolean | null>(null);
  const [
    saving,
    setSaving,
  ] = useState<boolean>(false);

  useEffect((): (() => void) => {
    let active: boolean = true;

    getDiagnostics().then((diagnostics): void => {
      if (active) {
        setDebugLogging(diagnostics['debugLogging']);
      }
    }).catch((caughtError: unknown): void => {
      if (active) {
        showToast(summaryFor(caughtError, [], 'Debug logging couldn\'t be loaded. Reload the page.'), false);
      }
    });

    return (): void => {
      active = false;
    };
  }, []);

  /**
   * Debug Logging Panel - Toggle.
   *
   * Moves the switch at once, saves it, and shows what the server kept.
   * A failed save puts the switch back where it was.
   *
   * @since 2.1.0
   */
  const toggle = async (enabled: boolean): Promise<void> => {
    const previous: boolean | null = debugLogging;

    setDebugLogging(enabled);
    setSaving(true);

    try {
      const saved = await updateDiagnostics({ debugLogging: enabled });

      setDebugLogging(saved['debugLogging']);
    } catch (caughtError) {
      setDebugLogging(previous);
      showToast(summaryFor(caughtError, [], 'Debug logging couldn\'t be changed. Try again.'), false);
    } finally {
      setSaving(false);
    }
  };

  const enabled: boolean = debugLogging === true;

  return (
    <div className="panel">
      <section className="form-section">
        <div className="form-section-head">
          <h2>Diagnostics</h2>
        </div>
        <div className="setting-list">
          <div className="setting-row">
            <div className="setting-copy">
              <div className="setting-title"><span>Debug logging</span></div>
              <p>Adds DEBUG lines to the container log while you track down a problem.</p>
            </div>
            <div className="setting-control">
              <label className="switch-control">
                <span className="switch-label">{(enabled) ? 'On' : 'Off'}</span>
                <input
                  aria-label="Debug logging"
                  checked={enabled}
                  disabled={debugLogging === null || saving}
                  onChange={(event): void => {
                    void toggle(event.currentTarget.checked);
                  }}
                  type="checkbox"
                />
                <span className="switch-track"><span /></span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
