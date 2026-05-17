import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { estActif as modePedagogiqueActif } from '../../lib/mode-pedagogique.js';
import { lienSource } from '../../lib/sources.js';

/**
 * Barre d'en-tête supérieure (charte §8.6). Hauteur fixe 56px, sticky en
 * haut, bordure subtile inférieure. Trois zones : bouton retour optionnel à
 * gauche, titre centré, slot `action` à droite pour actions contextuelles.
 *
 * En mode pédagogique (charte §8.6, §13.3), un badge bounded context est
 * affiché à droite du titre (ex. « identite », « portefeuille ») pour
 * faciliter la pédagogie DDD/Modulith.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-top-app-bar')
export class MboloTopAppBar extends LitElement {
  @property({ type: String }) accessor titre = '';
  @property({ type: Boolean, attribute: 'show-back' }) accessor showBack = false;
  @property({ type: String, attribute: 'bounded-context' }) accessor boundedContext: string | null = null;

  @state() private accessor pedagogique = false;

  private readonly onModePedagogiqueChange = () => {
    this.pedagogique = modePedagogiqueActif();
  };

  connectedCallback() {
    super.connectedCallback();
    this.pedagogique = modePedagogiqueActif();
    window.addEventListener('mbolo-mode-pedagogique-change', this.onModePedagogiqueChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-mode-pedagogique-change', this.onModePedagogiqueChange);
  }

  static styles = css`
    :host {
      position: sticky;
      top: 0;
      z-index: 10;
      display: block;
      background: var(--color-bg-surface);
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .barre {
      height: 56px;
      display: grid;
      grid-template-columns: 48px 1fr auto;
      align-items: center;
      padding: 0 var(--space-4);
      gap: var(--space-2);
      max-width: 1200px;
      margin: 0 auto;
    }
    .retour {
      all: unset;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-primary);
    }
    .retour:hover {
      background: var(--color-bg-subtle);
    }
    .retour:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    .titre {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }
    .droite {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      justify-self: end;
      min-width: 0;
    }
    .badge-bc {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-full);
      background: var(--brand-secondary-100);
      color: var(--brand-secondary-700);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      flex-shrink: 0;
      max-width: 100%;
    }
    .badge-bc .badge-bc__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Sur mobile étroit (< 380px), on masque le texte du badge pour éviter
       qu'il déborde sur le titre. L'icône cpu reste visible et le title HTML
       préserve l'information complète au survol/long-press. */
    @media (max-width: 379px) {
      .badge-bc .badge-bc__label {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      .badge-bc {
        padding-inline: var(--space-1);
      }
    }
    a.badge-bc:hover { filter: brightness(0.95); }
    a.badge-bc:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
  `;

  private retour() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.dispatchEvent(new CustomEvent('mbolo-navigate', { detail: { path: '/' } }));
    }
  }

  private renduBadgeBC() {
    const bc = this.boundedContext!;
    const source =
      bc === 'identite' ? lienSource('identitePackage') :
      bc === 'portefeuille' ? lienSource('portefeuillePackage') :
      bc === 'shared' ? lienSource('sharedPackage') :
      null;
    const titre = `Bounded context « ${bc} » — voir le module sur GitHub`;
    if (source) {
      return html`
        <a
          class="badge-bc"
          href=${source}
          target="_blank"
          rel="noopener noreferrer"
          title=${titre}
        >
          <mbolo-icon name="cpu" .size=${14}></mbolo-icon>
          <span class="badge-bc__label">${bc}</span>
        </a>
      `;
    }
    return html`
      <span class="badge-bc" title=${`Bounded context « ${bc} » (mode pédagogique)`}>
        <mbolo-icon name="cpu" .size=${14}></mbolo-icon>
        <span class="badge-bc__label">${bc}</span>
      </span>
    `;
  }

  render() {
    return html`
      <div class="barre">
        <div>
          ${this.showBack
            ? html`
                <button class="retour" type="button" aria-label="Retour" @click=${this.retour}>
                  <mbolo-icon name="chevron-left" .size=${24}></mbolo-icon>
                </button>
              `
            : nothing}
        </div>
        <h1 class="titre">${this.titre}</h1>
        <div class="droite">
          ${this.pedagogique && this.boundedContext
            ? this.renduBadgeBC()
            : nothing}
          <slot name="action"></slot>
        </div>
      </div>
    `;
  }
}
