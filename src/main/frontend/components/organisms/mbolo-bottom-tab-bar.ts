import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { afficherToast } from '../molecules/mbolo-toast.js';

interface Onglet {
  readonly id: string;
  readonly libelle: string;
  readonly icone: string;
  readonly chemin: string;
  readonly desactive?: boolean;
}

const ONGLETS: readonly Onglet[] = [
  { id: 'accueil', libelle: 'Accueil', icone: 'home', chemin: '/' },
  { id: 'historique', libelle: 'Historique', icone: 'clock', chemin: '/historique' },
  { id: 'envoyer', libelle: 'Envoyer', icone: 'send', chemin: '/envoyer', desactive: true },
  { id: 'profil', libelle: 'Profil', icone: 'user-round', chemin: '/profil' },
];

/**
 * Barre de navigation inférieure (charte §8.6). Quatre onglets, hauteur
 * 64px, respect de `safe-area-inset-bottom` pour les écrans à encoche.
 *
 * Highlight de l'onglet actif via écoute de l'événement
 * `mbolo-route-change` émis par le routeur. L'onglet « Envoyer » est
 * désactivé tant que le backend ne propose pas de cas d'usage de transfert ;
 * un clic affiche un toast informatif au lieu de naviguer.
 *
 * Sémantique ARIA : `role="tablist"`, `role="tab"` + `aria-current="page"`
 * sur l'onglet actif (charte §11.4).
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-bottom-tab-bar')
export class MboloBottomTabBar extends LitElement {
  @state() private accessor cheminActif = window.location.pathname;

  private readonly onRouteChange = (evt: Event) => {
    const detail = (evt as CustomEvent<{ path: string }>).detail;
    if (detail?.path) {
      this.cheminActif = detail.path;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-route-change', this.onRouteChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-route-change', this.onRouteChange);
  }

  static styles = css`
    :host {
      position: sticky;
      bottom: 0;
      z-index: 10;
      display: block;
      background: var(--color-bg-surface);
      border-top: 1px solid var(--color-border-subtle);
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
    .liste {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      height: 64px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .onglet {
      all: unset;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      cursor: pointer;
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      transition: color var(--duration-quick) var(--easing-standard);
      min-height: 48px;
    }
    .onglet:hover {
      color: var(--color-text-primary);
    }
    .onglet:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 2px var(--color-border-focus);
    }
    .onglet[aria-current="page"] {
      color: var(--color-text-brand);
    }
    .onglet[aria-disabled="true"] {
      color: var(--color-text-disabled);
      cursor: pointer;
    }
    @media (prefers-reduced-motion: reduce) {
      .onglet {
        transition: none;
      }
    }
  `;

  private cliqueOnglet(onglet: Onglet, evt: Event) {
    evt.preventDefault();
    if (onglet.desactive) {
      afficherToast({ variant: 'info', message: 'Bientôt disponible.' });
      return;
    }
    if (onglet.chemin === this.cheminActif) return;
    window.dispatchEvent(new CustomEvent('mbolo-navigate', { detail: { path: onglet.chemin } }));
  }

  render() {
    return html`
      <div class="liste" role="tablist">
        ${ONGLETS.map((onglet) => {
          const actif = this.cheminActif === onglet.chemin
            || (onglet.chemin !== '/' && this.cheminActif.startsWith(onglet.chemin));
          return html`
            <a
              class="onglet"
              role="tab"
              href=${onglet.chemin}
              aria-current=${actif ? 'page' : 'false'}
              aria-disabled=${onglet.desactive ? 'true' : 'false'}
              aria-label=${onglet.libelle}
              @click=${(evt: Event) => this.cliqueOnglet(onglet, evt)}
            >
              <mbolo-icon name=${onglet.icone} .size=${24}></mbolo-icon>
              <span>${onglet.libelle}</span>
            </a>
          `;
        })}
      </div>
    `;
  }
}
