import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

/**
 * Variantes de toast.
 */
export type VariantToast = 'success' | 'danger' | 'info';

/**
 * Détail d'un événement `mbolo-toast` global.
 */
export interface DetailToast {
  message: string;
  variant?: VariantToast;
  durationMs?: number;
}

const DUREE_DEFAUT_MS = 4000;

/**
 * Toast singleton MboloPay.
 *
 * À placer **une seule fois** dans l'app (typiquement dans le shell racine).
 * S'affiche en bas d'écran lors de la réception d'un `CustomEvent('mbolo-toast', { detail })`
 * dispatched sur `window`. Auto-disparition après {@link DetailToast.durationMs} ms (4000 par défaut).
 *
 * Utilisation :
 * ```ts
 * window.dispatchEvent(new CustomEvent<DetailToast>('mbolo-toast', {
 *   detail: { message: 'Abonné créé', variant: 'success' }
 * }));
 * ```
 *
 * `aria-live="polite"` pour l'accessibilité (charte §11.4).
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-toast')
export class MboloToast extends LitElement {
  @state() private accessor visible = false;
  @state() private accessor message = '';
  @state() private accessor variant: VariantToast = 'info';

  private timeoutId: number | null = null;
  private readonly onToast = (e: Event) => {
    const detail = (e as CustomEvent<DetailToast>).detail;
    this.message = detail.message;
    this.variant = detail.variant ?? 'info';
    this.visible = true;
    if (this.timeoutId !== null) window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      this.visible = false;
    }, detail.durationMs ?? DUREE_DEFAUT_MS);
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-toast', this.onToast);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-toast', this.onToast);
    if (this.timeoutId !== null) window.clearTimeout(this.timeoutId);
  }

  static styles = css`
    :host {
      position: fixed;
      bottom: var(--space-5);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      max-width: 90vw;
      transition: opacity var(--duration-quick) var(--easing-standard),
                  transform var(--duration-quick) var(--easing-standard);
      opacity: 0;
      transform: translateY(8px);
    }
    .toast.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .toast.success { background: var(--color-success-500); color: var(--neutral-0); }
    .toast.danger  { background: var(--color-danger-500);  color: var(--neutral-0); }
    .toast.info    { background: var(--brand-secondary-500); color: var(--neutral-0); }
  `;

  render() {
    const classes = `toast ${this.variant} ${this.visible ? 'visible' : ''}`;
    return html`
      <div class=${classes} role="status" aria-live="polite">
        ${this.message}
      </div>
    `;
  }
}

/** Helper ergonomique pour dispatcher un toast depuis n'importe où. */
export function afficherToast(detail: DetailToast): void {
  window.dispatchEvent(new CustomEvent<DetailToast>('mbolo-toast', { detail }));
}
