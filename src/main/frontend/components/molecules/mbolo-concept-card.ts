import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Carte didactique présentant un concept (Agrégat, Value Object, Port…)
 * sur la page architecture (charte §8.3).
 *
 * <p>Quatre slots :
 * <ul>
 *   <li>{@code body} — texte explicatif (HTML libre, paragraphes, listes).</li>
 *   <li>{@code exemple} — extrait de code court en monospace.</li>
 *   <li>{@code liens} — chips/badges secondaires (autres références).</li>
 * </ul>
 *
 * <p>Prop {@code source} : si renseignée, un lien « Voir sur GitHub »
 * apparaît en pied de carte.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-concept-card')
export class MboloConceptCard extends LitElement {
  @property({ type: String }) accessor titre = '';
  @property({ type: String, attribute: 'sous-titre' }) accessor sousTitre: string | null = null;
  @property({ type: String }) accessor icone = 'book-open';
  @property({ type: String }) accessor source: string | null = null;

  static styles = css`
    :host {
      display: block;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      box-shadow: var(--shadow-xs);
      transition: box-shadow var(--duration-quick) var(--easing-standard);
    }
    :host(:hover) {
      box-shadow: var(--shadow-sm);
    }
    .en-tete {
      display: grid;
      grid-template-columns: 40px 1fr;
      gap: var(--space-3);
      align-items: start;
      margin-bottom: var(--space-3);
    }
    .icone-bulle {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    h3 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.3;
    }
    .sous-titre {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 2px 0 0 0;
      font-family: var(--font-family-mono);
    }
    ::slotted([slot="body"]) {
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      line-height: 1.6;
    }
    ::slotted([slot="exemple"]) {
      display: block;
      margin-top: var(--space-3);
      padding: var(--space-3);
      background: var(--color-bg-canvas);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
      overflow-x: auto;
      white-space: pre;
      line-height: 1.5;
    }
    .liens {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }
    .lien-source {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-brand);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin-top: var(--space-3);
    }
    .lien-source:hover {
      text-decoration: underline;
    }
    .lien-source:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }
  `;

  render() {
    return html`
      <div class="en-tete">
        <div class="icone-bulle" aria-hidden="true">
          <mbolo-icon name=${this.icone} .size=${20}></mbolo-icon>
        </div>
        <div>
          <h3>${this.titre}</h3>
          ${this.sousTitre ? html`<p class="sous-titre">${this.sousTitre}</p>` : nothing}
        </div>
      </div>
      <slot name="body"></slot>
      <slot name="exemple"></slot>
      <div class="liens">
        <slot name="liens"></slot>
      </div>
      ${this.source
        ? html`
            <a
              class="lien-source"
              href=${this.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              <mbolo-icon name="github" .size=${16}></mbolo-icon>
              Voir sur GitHub
            </a>
          `
        : nothing}
    `;
  }
}
