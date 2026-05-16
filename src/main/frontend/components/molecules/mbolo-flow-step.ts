import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Étape d'un flux d'exécution (section « Cycle d'une opération »).
 *
 * <p>Visuel inspiré de la charte §9.3 : numéro circulaire à gauche relié
 * par une ligne verticale à l'étape suivante (effet timeline). Au centre :
 * titre + body. À droite : lien GitHub optionnel.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-flow-step')
export class MboloFlowStep extends LitElement {
  @property({ type: Number }) accessor numero = 0;
  @property({ type: String }) accessor titre = '';
  @property({ type: String }) accessor source: string | null = null;
  /** Étiquette technique discrète (ex. nom de port, fichier). */
  @property({ type: String }) accessor etiquette: string | null = null;

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 40px 1fr auto;
      gap: var(--space-4);
      align-items: flex-start;
      position: relative;
      padding-bottom: var(--space-5);
    }
    :host(:not(:last-of-type))::before {
      content: '';
      position: absolute;
      top: 40px;
      left: 19px;
      bottom: 0;
      width: 2px;
      background: var(--color-border-subtle);
    }
    .pastille {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--brand-primary-500);
      color: var(--neutral-0);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      flex-shrink: 0;
      z-index: 1;
      position: relative;
    }
    .corps {
      min-width: 0;
    }
    .titre {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-1) 0;
      line-height: 1.4;
    }
    .etiquette {
      display: inline-block;
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      background: var(--color-bg-subtle);
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
      margin: var(--space-1) 0;
    }
    ::slotted([slot="body"]) {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.5;
      margin-top: var(--space-2);
    }
    .lien-source {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--color-text-brand);
      text-decoration: none;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
    }
    .lien-source:hover {
      text-decoration: underline;
      background: var(--color-bg-subtle);
    }
    .lien-source:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
  `;

  render() {
    return html`
      <div class="pastille" aria-hidden="true">${this.numero}</div>
      <div class="corps">
        <h4 class="titre">${this.titre}</h4>
        ${this.etiquette
          ? html`<span class="etiquette">${this.etiquette}</span>`
          : nothing}
        <slot name="body"></slot>
      </div>
      ${this.source
        ? html`
            <a
              class="lien-source"
              href=${this.source}
              target="_blank"
              rel="noopener noreferrer"
              title="Voir le fichier source sur GitHub"
            >
              <mbolo-icon name="github" .size=${14}></mbolo-icon>
            </a>
          `
        : nothing}
    `;
  }
}
