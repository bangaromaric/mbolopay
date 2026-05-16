import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { DescripteurVO } from '../../lib/value-objects.js';
import { SOURCES } from '../../lib/sources.js';

/**
 * Chip pédagogique exposant le Value Object Java attendu par un champ
 * métier de l'UI.
 *
 * <p>Visible uniquement en mode pédagogique (le parent décide de monter
 * le composant ou non). Au clic, déploie un popover détaillant le record
 * Java : description, contraintes de validation, lien vers le code
 * source.
 *
 * <p>Comportement clavier :
 * <ul>
 *   <li><kbd>Enter</kbd> ou <kbd>Space</kbd> sur le chip → toggle popover</li>
 *   <li><kbd>Esc</kbd> sur le popover → ferme</li>
 *   <li>Clic en dehors → ferme (via {@code composedPath})</li>
 * </ul>
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-vo-hint')
export class MboloVoHint extends LitElement {
  @property({ attribute: false }) accessor descripteur: DescripteurVO | null = null;
  @property({ type: Boolean, reflect: true }) accessor compact = false;

  @state() private accessor ouvert = false;

  private readonly fermerSurClicExtérieur = (evt: MouseEvent) => {
    if (!this.ouvert) return;
    const chemin = evt.composedPath();
    if (!chemin.includes(this)) {
      this.ouvert = false;
    }
  };

  private readonly fermerSurEchap = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape' && this.ouvert) {
      this.ouvert = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.fermerSurClicExtérieur);
    document.addEventListener('keydown', this.fermerSurEchap);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.fermerSurClicExtérieur);
    document.removeEventListener('keydown', this.fermerSurEchap);
  }

  static styles = css`
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
    }

    button.chip {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 2px var(--space-2);
      border-radius: var(--radius-full);
      background: var(--brand-secondary-100);
      color: var(--brand-secondary-700);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: filter var(--duration-instant) var(--easing-standard);
      white-space: nowrap;
    }
    button.chip:hover {
      filter: brightness(0.96);
    }
    button.chip:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    button.chip[aria-expanded="true"] {
      background: var(--brand-secondary-500);
      color: var(--neutral-0);
    }
    :host([compact]) button.chip .nom { display: none; }
    .chevron {
      transition: transform var(--duration-quick) var(--easing-standard);
    }
    button.chip[aria-expanded="true"] .chevron {
      transform: rotate(180deg);
    }

    .popover {
      position: absolute;
      top: calc(100% + var(--space-2));
      left: 0;
      z-index: 50;
      min-width: 280px;
      max-width: 360px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--space-4);
      animation: pop-in var(--duration-quick) var(--easing-emphasized);
    }
    .popover-en-tete {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }
    .popover-titre {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
    button.fermer {
      all: unset;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary);
    }
    button.fermer:hover {
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
    }
    button.fermer:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    .description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-3) 0;
      line-height: 1.5;
    }
    h4 {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-2) 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    ul.contraintes {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    ul.contraintes li {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      padding-left: var(--space-3);
      position: relative;
      line-height: 1.4;
    }
    ul.contraintes li::before {
      content: '•';
      position: absolute;
      left: var(--space-1);
      color: var(--brand-secondary-500);
      font-weight: var(--font-weight-bold);
    }
    a.source {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-3);
      color: var(--color-text-brand);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    a.source:hover {
      text-decoration: underline;
    }
    a.source:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }

    @keyframes pop-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .popover, .chevron, button.chip { animation: none; transition: none; }
    }

    /* Popover full-width sur mobile pour éviter les débordements. */
    @media (max-width: 480px) {
      .popover {
        position: fixed;
        top: auto;
        bottom: var(--space-4);
        left: var(--space-4);
        right: var(--space-4);
        max-width: none;
        min-width: 0;
      }
    }
  `;

  private toggle(evt: Event) {
    evt.stopPropagation();
    this.ouvert = !this.ouvert;
  }

  private fermer(evt: Event) {
    evt.stopPropagation();
    this.ouvert = false;
  }

  render() {
    const d = this.descripteur;
    if (!d) return nothing;
    const sourceUrl = SOURCES[d.sourceKey];
    return html`
      <button
        type="button"
        class="chip"
        aria-expanded=${this.ouvert ? 'true' : 'false'}
        aria-haspopup="dialog"
        title=${`Value Object : ${d.nom}`}
        @click=${this.toggle}
      >
        <mbolo-icon name="search" .size=${12}></mbolo-icon>
        <span class="nom">${d.nom}</span>
        <mbolo-icon class="chevron" name="chevron-down" .size=${12}></mbolo-icon>
      </button>
      ${this.ouvert
        ? html`
            <div class="popover" role="dialog" aria-label=${`Détails de ${d.nom}`}>
              <div class="popover-en-tete">
                <p class="popover-titre">${d.nom}</p>
                <button class="fermer" type="button" aria-label="Fermer" @click=${this.fermer}>
                  <mbolo-icon name="x" .size=${16}></mbolo-icon>
                </button>
              </div>
              <p class="description">${d.description}</p>
              <h4>Contraintes</h4>
              <ul class="contraintes">
                ${d.contraintes.map((c) => html`<li>${c}</li>`)}
              </ul>
              <a
                class="source"
                href=${sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <mbolo-icon name="github" .size=${14}></mbolo-icon>
                Voir ${d.nom}.java sur GitHub
              </a>
            </div>
          `
        : nothing}
    `;
  }
}
