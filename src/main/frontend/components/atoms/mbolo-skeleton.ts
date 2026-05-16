import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Placeholder de chargement (charte §10.3). Animation pulse 1.5s respectant
 * `prefers-reduced-motion`. Background `--neutral-100` qui s'inverse
 * naturellement en mode sombre via les tokens.
 *
 * Doit toujours respecter la hauteur réelle du contenu remplacé pour éviter
 * un saut visuel au moment de la résolution.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-skeleton')
export class MboloSkeleton extends LitElement {
  @property({ type: String }) accessor width = '100%';
  @property({ type: String }) accessor height = '1rem';
  @property({ type: Boolean }) accessor circle = false;

  static styles = css`
    :host {
      display: block;
      background: var(--color-bg-subtle);
      border-radius: var(--radius-md);
      animation: pulse 1.5s ease-in-out infinite;
    }
    :host([circle]) {
      border-radius: 50%;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }
  `;

  render() {
    const styles = `width: ${this.width}; height: ${this.height};`;
    return html`<div style=${styles} role="status" aria-busy="true" aria-live="polite"></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.setProperty('width', this.width);
    this.style.setProperty('height', this.height);
  }
}
