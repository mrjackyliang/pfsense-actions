import {
  useEffect,
  useRef,
} from 'react';

import type { RefObject } from 'react';

/**
 * Use Dialog Focus - Use Dialog Focus.
 *
 * Moves focus into a dialog when it opens or shows a new step, to its first
 * field or else its first enabled action. Focus goes back to the button
 * that opened it when the dialog closes.
 *
 * @param {boolean} open     - Open.
 * @param {string}  focusKey - Focus key.
 *
 * @since 2.0.0
 */
export const useDialogFocus = (open: boolean, focusKey: string = ''): RefObject<HTMLElement | null> => {
  const dialogRef: RefObject<HTMLElement | null> = useRef<HTMLElement | null>(null);

  useEffect((): (() => void) | undefined => {
    if (!open) {
      return undefined;
    }

    const opener: Element | null = document.activeElement;

    return (): void => {
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, [open]);

  useEffect((): void => {
    const dialog: HTMLElement | null = dialogRef.current;

    if (!open || dialog === null) {
      return;
    }

    const field: HTMLElement | null = dialog.querySelector<HTMLElement>('input:not([type="checkbox"]), select, textarea');
    const action: HTMLElement | null = dialog.querySelector<HTMLElement>('.dialog-actions button:not(:disabled)');

    (field ?? action ?? dialog).focus();
  }, [
    focusKey,
    open,
  ]);

  return dialogRef;
};
