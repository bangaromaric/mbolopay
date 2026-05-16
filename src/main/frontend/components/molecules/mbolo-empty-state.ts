import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * État vide d'écran (charte §10.2). Quatre slots : `icon`, `title`, `body`,
 * `cta`. La charte impose qu'un empty-state ait toujours un titre et — si le
 * contexte le permet — un CTA. Jamais un simple « Aucune donnée ».
 *
 * Layout vertical centré, padding généreux pour respirer dans une carte ou
 * une page pleine. Attribut {@code compact} pour usage imbriqué dans une
 * carte interne (padding et icône réduits).
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-empty-state')
export class MboloEmptyState extends LitElement {
  @property({ type: Boolean, reflect: true }) accessor compact = false;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-6) var(--space-4);
      text-align: center;
      color: var(--color-text-secondary);
    }
    .icone {
      width: 48px;
      height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      background: var(--color-bg-subtle);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }
    .titre {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
    .corps {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      max-width: 36ch;
      margin: 0;
    }
    .cta {
      margin-top: var(--space-3);
    }
    ::slotted(*) {
      margin: 0;
    }
    :host([compact]) {
      padding: var(--space-4) var(--space-3);
      gap: var(--space-2);
    }
    :host([compact]) .icone {
      width: 40px;
      height: 40px;
      margin-bottom: 0;
    }
    :host([compact]) .titre {
      font-size: var(--font-size-base);
    }
    :host([compact]) .corps {
      font-size: var(--font-size-xs);
    }
    :host([compact]) .cta {
      margin-top: var(--space-2);
    }
  `;

  render() {
    return html`
      <div class="icone">
        <slot name="icon"></slot>
      </div>
      <h3 class="titre">
        <slot name="title"></slot>
      </h3>
      <p class="corps">
        <slot name="body"></slot>
      </p>
      <div class="cta">
        <slot name="cta"></slot>
      </div>
    `;
  }
}
