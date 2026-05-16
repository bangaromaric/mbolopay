import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Spinner indéterminé MboloPay.
 *
 * S'appuie sur `<md-circular-progress indeterminate>` de Material Web.
 * Le composant doit donc être enregistré via `@material/web/progress/circular-progress.js`
 * (effectué dans `main.ts`).
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-spinner')
export class MboloSpinner extends LitElement {
  @property({ type: String }) accessor label = 'Chargement…';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-secondary);
    }
    md-circular-progress {
      --md-circular-progress-size: 24px;
      --md-circular-progress-active-indicator-color: var(--brand-primary-500);
    }
  `;

  render() {
    return html`
      <md-circular-progress indeterminate aria-label=${this.label}></md-circular-progress>
      <span>${this.label}</span>
    `;
  }
}
