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

import type {
  Web_DebugLoggingPanel_DebugLoggingPanel_Active,
  Web_DebugLoggingPanel_DebugLoggingPanel_DebugLogging,
  Web_DebugLoggingPanel_DebugLoggingPanel_DebugLoggingState,
  Web_DebugLoggingPanel_DebugLoggingPanel_Enabled,
  Web_DebugLoggingPanel_DebugLoggingPanel_Returns,
  Web_DebugLoggingPanel_DebugLoggingPanel_Saving,
  Web_DebugLoggingPanel_DebugLoggingPanel_SavingState,
  Web_DebugLoggingPanel_DebugLoggingPanel_SetDebugLogging,
  Web_DebugLoggingPanel_DebugLoggingPanel_SetSaving,
  Web_DebugLoggingPanel_DebugLoggingPanel_Toggle,
  Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Enabled,
  Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Previous,
  Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Returns,
  Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Saved,
} from '@/types/web/debug-logging-panel.d.ts';

/**
 * Debug Logging Panel - Debug Logging Panel.
 *
 * Shows the Debug logging switch and saves each change as soon as it's made.
 * The switch waits for the saved setting before it can be turned.
 *
 * @returns {Web_DebugLoggingPanel_DebugLoggingPanel_Returns}
 *
 * @since 2.1.0
 */
export const DebugLoggingPanel = (): Web_DebugLoggingPanel_DebugLoggingPanel_Returns => {
  const debugLoggingState: Web_DebugLoggingPanel_DebugLoggingPanel_DebugLoggingState = useState<Web_DebugLoggingPanel_DebugLoggingPanel_DebugLogging>(null);
  const debugLogging: Web_DebugLoggingPanel_DebugLoggingPanel_DebugLogging = debugLoggingState[0];
  const setDebugLogging: Web_DebugLoggingPanel_DebugLoggingPanel_SetDebugLogging = debugLoggingState[1];
  const savingState: Web_DebugLoggingPanel_DebugLoggingPanel_SavingState = useState<Web_DebugLoggingPanel_DebugLoggingPanel_Saving>(false);
  const saving: Web_DebugLoggingPanel_DebugLoggingPanel_Saving = savingState[0];
  const setSaving: Web_DebugLoggingPanel_DebugLoggingPanel_SetSaving = savingState[1];

  useEffect(() => {
    let active: Web_DebugLoggingPanel_DebugLoggingPanel_Active = true;

    getDiagnostics().then((diagnostics) => {
      if (active === true) {
        setDebugLogging(diagnostics['debugLogging']);
      }

      return;
    }).catch((caughtError) => {
      if (active === true) {
        showToast(summaryFor(caughtError, [], 'Debug logging couldn\'t be loaded. Reload the page.'), false);
      }

      return;
    });

    return () => {
      active = false;

      return;
    };
  }, []);

  /**
   * Debug Logging Panel - Toggle.
   *
   * Moves the switch at once, saves it, and shows what the server kept.
   * A failed save puts the switch back where it was.
   *
   * @param {Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Enabled} enabled - Enabled.
   *
   * @returns {Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Returns}
   *
   * @since 2.1.0
   */
  const toggle: Web_DebugLoggingPanel_DebugLoggingPanel_Toggle = async (enabled: Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Enabled): Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Returns => {
    const previous: Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Previous = debugLogging;

    setDebugLogging(enabled);
    setSaving(true);

    try {
      const saved: Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Saved = await updateDiagnostics({ debugLogging: enabled });

      setDebugLogging(saved['debugLogging']);
    } catch (caughtError) {
      setDebugLogging(previous);
      showToast(summaryFor(caughtError, [], 'Debug logging couldn\'t be changed. Try again.'), false);
    } finally {
      setSaving(false);
    }

    return;
  };

  const enabled: Web_DebugLoggingPanel_DebugLoggingPanel_Enabled = debugLogging === true;

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
                <span className="switch-label">{(enabled === true) ? 'On' : 'Off'}</span>
                <input
                  aria-label="Debug logging"
                  checked={enabled}
                  disabled={debugLogging === null || saving === true}
                  onChange={(event) => {
                    void toggle(event.currentTarget.checked);

                    return;
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
