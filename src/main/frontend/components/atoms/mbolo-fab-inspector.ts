import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { estActif as modePedagogiqueActif } from '../../lib/mode-pedagogique.js';
import { compteurSession } from '../../lib/journal-http.js';

/**
 * Bouton flottant (Floating Action Button) ouvrant l'Inspector pédagogique.
 *
 * <p>Visible uniquement quand le mode pédagogique est actif. Le badge
 * numérique affiche le nombre d'appels HTTP journalisés en session
 * (rafraîchi à chaque {@code mbolo-http-publie}).
 *
 * <p>Au clic, émet {@code mbolo-inspector-toggle} sur {@code window} ; le
 * drawer correspondant écoute cet événement pour s'ouvrir.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-fab-inspector')
export class MboloFabInspector extends LitElement {
  @state() private accessor pedagogique = modePedagogiqueActif();
  @state() private accessor compteur = compteurSession();

  private readonly onModeChange = () => {
    this.pedagogique = modePedagogiqueActif();
  };
  private readonly onHttpPublie = () => {
    this.compteur = compteurSession();
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-mode-pedagogique-change', this.onModeChange);
    window.addEventListener('mbolo-http-publie', this.onHttpPublie);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-mode-pedagogique-change', this.onModeChange);
    window.removeEventListener('mbolo-http-publie', this.onHttpPublie);
  }

  static styles = css`
    :host {
      position: fixed;
      right: var(--space-4);
      bottom: calc(80px + env(safe-area-inset-bottom, 0));
      z-index: 1400;
      display: none;
    }
    :host([visible]) { display: block; }
    button {
      all: unset;
      width: 56px;
      height: 56px;
      border-radius: var(--radius-full);
      background: var(--brand-primary-700);
      color: var(--neutral-0);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-lg);
      transition: transform var(--duration-quick) var(--easing-standard),
                  background-color var(--duration-quick) var(--easing-standard);
      position: relative;
    }
    button:hover {
      transform: scale(1.05);
      background: var(--brand-primary-500);
    }
    button:focus-visible {
      outline: none;
      box-shadow: var(--shadow-lg), var(--shadow-focus);
    }
    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      border-radius: var(--radius-full);
      background: var(--brand-accent-500);
      color: var(--brand-accent-700);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }
    @media (prefers-reduced-motion: reduce) {
      button { transition: none; }
      button:hover { transform: none; }
    }
  `;

  updated() {
    this.toggleAttribute('visible', this.pedagogique);
  }

  private ouvrir() {
    window.dispatchEvent(new CustomEvent('mbolo-inspector-toggle'));
  }

  render() {
    if (!this.pedagogique) return nothing;
    return html`
      <button
        type="button"
        aria-label="Ouvrir l'Inspector pédagogique"
        @click=${this.ouvrir}
      >
        <mbolo-icon name="terminal" .size=${24}></mbolo-icon>
        ${this.compteur > 0
          ? html`<span class="badge" aria-label=${`${this.compteur} appel(s)`}>${this.compteur}</span>`
          : nothing}
      </button>
    `;
  }
}
