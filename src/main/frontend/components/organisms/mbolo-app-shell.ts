import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface ContexteRoute {
  readonly titre: string;
  readonly showBack: boolean;
  readonly boundedContext: string | null;
}

/**
 * Mapping `pathname → contexte d'affichage` pour la top app bar. Permet de
 * synchroniser titre / bouton retour / bounded context (mode pédagogique)
 * avec la route active.
 */
const CONTEXTES: Readonly<Record<string, ContexteRoute>> = {
  '/': { titre: 'Accueil', showBack: false, boundedContext: 'portefeuille' },
  '/historique': { titre: 'Historique', showBack: false, boundedContext: 'portefeuille' },
  '/profil': { titre: 'Profil', showBack: false, boundedContext: 'identite' },
  '/creer-abonne': { titre: 'Créer un compte', showBack: true, boundedContext: 'identite' },
  '/evenements-domaine': { titre: 'Événements de domaine', showBack: true, boundedContext: null },
  '/architecture': { titre: 'Architecture', showBack: true, boundedContext: null },
};

const FALLBACK: ContexteRoute = { titre: 'MboloPay', showBack: true, boundedContext: null };

/**
 * Shell racine de l'application (charte §8.6). Compose :
 * <ul>
 *   <li>la barre supérieure (titre, retour, badge bounded context) — landmark {@code <header>} ;</li>
 *   <li>la zone de contenu où le routeur monte les pages — landmark {@code <main id="outlet">} ;</li>
 *   <li>la barre d'onglets inférieure — landmark {@code <nav>}.</li>
 * </ul>
 *
 * <b>Light DOM imposé</b> ({@link createRenderRoot}) : le routeur résout
 * l'outlet par {@code document.querySelector('#outlet')}. En shadow DOM,
 * l'outlet ne serait pas atteignable sans piercing, et {@code <main>} doit
 * être un landmark global du document, pas isolé dans un shadow root.
 *
 * Le shell réagit à l'événement {@code mbolo-route-change} (émis par le
 * routeur après chaque navigation) pour mettre à jour le contexte d'en-tête.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-app-shell')
export class MboloAppShell extends LitElement {
  @state() private accessor contexte: ContexteRoute = CONTEXTES[window.location.pathname] ?? FALLBACK;

  private readonly onRouteChange = (evt: Event) => {
    const path = (evt as CustomEvent<{ path: string }>).detail?.path ?? window.location.pathname;
    this.contexte = CONTEXTES[path] ?? FALLBACK;
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-route-change', this.onRouteChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-route-change', this.onRouteChange);
  }

  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <header role="banner" class="mbolo-shell__header">
        <mbolo-top-app-bar
          .titre=${this.contexte.titre}
          ?show-back=${this.contexte.showBack}
          .boundedContext=${this.contexte.boundedContext}
        ></mbolo-top-app-bar>
      </header>
      <main id="outlet" role="main" class="mbolo-shell__main"></main>
      <nav role="navigation" aria-label="Navigation principale" class="mbolo-shell__nav">
        <mbolo-bottom-tab-bar></mbolo-bottom-tab-bar>
      </nav>
      <mbolo-fab-inspector></mbolo-fab-inspector>
      <mbolo-inspector-drawer></mbolo-inspector-drawer>
    `;
  }

  static styles = css``;
}
