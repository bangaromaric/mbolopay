import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Variantes sémantiques supportées par {@link MboloBadge}.
 */
export type VariantBadge = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Pastille colorée façon Material chip (statique). Mapping sur les tokens charte
 * sémantiques (`--color-success-*`, `--color-warning-*`, etc.).
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-badge')
export class MboloBadge extends LitElement {
  @property({ type: String }) accessor variant: VariantBadge = 'neutral';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      line-height: 1;
    }
    :host([variant="neutral"]) {
      background: var(--color-bg-subtle);
      color: var(--color-text-secondary);
    }
    :host([variant="success"]) {
      background: var(--color-success-100);
      color: var(--color-success-500);
    }
    :host([variant="warning"]) {
      background: var(--color-warning-100);
      color: var(--color-warning-500);
    }
    :host([variant="danger"]) {
      background: var(--color-danger-100);
      color: var(--color-danger-500);
    }
    :host([variant="info"]) {
      background: var(--brand-secondary-100);
      color: var(--brand-secondary-500);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
