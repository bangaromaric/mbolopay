import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { estActif as modePedagogiqueActif } from '../../lib/mode-pedagogique.js';
import * as journal from '../../lib/journal-http.js';
import type { EntreeHttp } from '../../lib/journal-http.js';
import { SOURCES } from '../../lib/sources.js';

/**
 * Drawer pédagogique exposant en temps réel les appels HTTP émis par
 * l'application.
 *
 * <p>Slide-in depuis la droite (380px desktop, full-width mobile). Liste
 * les 50 dernières entrées du journal, triées par récence. Chaque entrée
 * est cliquable pour révéler les détails (payload requête, payload
 * réponse, annotation pédagogique de l'exception si l'appel a échoué).
 *
 * <p>Écoute {@code mbolo-inspector-toggle} sur {@code window} pour ouvrir.
 * Esc ou clic sur l'overlay ferme.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-inspector-drawer')
export class MboloInspectorDrawer extends LitElement {
  @state() private accessor ouvert = false;
  @state() private accessor entrees: readonly EntreeHttp[] = journal.liste();
  @state() private accessor expandedId: string | null = null;

  private readonly onToggle = () => {
    if (!modePedagogiqueActif()) return;
    this.ouvert = !this.ouvert;
  };
  private readonly onHttpPublie = () => {
    this.entrees = journal.liste();
  };
  private readonly onEchap = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape' && this.ouvert) {
      this.ouvert = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-inspector-toggle', this.onToggle);
    window.addEventListener('mbolo-http-publie', this.onHttpPublie);
    document.addEventListener('keydown', this.onEchap);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-inspector-toggle', this.onToggle);
    window.removeEventListener('mbolo-http-publie', this.onHttpPublie);
    document.removeEventListener('keydown', this.onEchap);
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1500;
      pointer-events: none;
    }
    :host([ouvert]) { pointer-events: auto; }
    .voile {
      position: absolute;
      inset: 0;
      background: rgb(11 20 27 / 0.40);
      opacity: 0;
      transition: opacity var(--duration-moderate) var(--easing-standard);
    }
    :host([ouvert]) .voile { opacity: 1; }
    .drawer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 380px;
      max-width: 100vw;
      background: var(--color-bg-surface);
      border-left: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-lg);
      transform: translateX(100%);
      transition: transform var(--duration-moderate) var(--easing-emphasized);
      display: flex;
      flex-direction: column;
    }
    :host([ouvert]) .drawer { transform: translateX(0); }
    @media (max-width: 480px) {
      .drawer { width: 100vw; }
    }
    @media (prefers-reduced-motion: reduce) {
      .voile, .drawer { transition: none; }
    }

    header {
      flex-shrink: 0;
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
      background: var(--color-bg-surface);
    }
    .header-haut {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
    }
    .titre {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
    .header-bas {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      margin-top: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    button.icon-btn {
      all: unset;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary);
    }
    button.icon-btn:hover {
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
    }
    button.icon-btn:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    button.txt-btn {
      all: unset;
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-brand);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
    }
    button.txt-btn:hover {
      background: var(--color-bg-subtle);
    }
    button.txt-btn:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .corps {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-3);
    }
    .empty {
      padding: var(--space-6) var(--space-4);
      text-align: center;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
    .empty mbolo-icon {
      display: block;
      margin: 0 auto var(--space-3) auto;
      color: var(--color-text-disabled);
    }

    .item {
      background: var(--color-bg-canvas);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-2);
      transition: border-color var(--duration-quick) var(--easing-standard);
    }
    .item-tete {
      all: unset;
      display: block;
      padding: var(--space-3);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }
    .item-tete:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-md);
    }
    .ligne-haut {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }
    .pastille {
      width: 18px;
      height: 18px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pastille.succes {
      background: var(--color-success-100);
      color: var(--color-success-500);
    }
    .pastille.erreur {
      background: var(--color-danger-100);
      color: var(--color-danger-500);
    }
    .pastille.en-cours {
      background: var(--color-bg-subtle);
      color: var(--color-text-secondary);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .verb {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      padding: 2px var(--space-1);
      border-radius: var(--radius-sm);
      background: var(--color-bg-subtle);
    }
    .url {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .statut-http {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
    }
    .ligne-bas {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .duree {
      font-variant-numeric: tabular-nums;
    }

    .details {
      padding: 0 var(--space-3) var(--space-3) var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
    }
    .section {
      margin-top: var(--space-3);
    }
    .section h5 {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin: 0 0 var(--space-1) 0;
    }
    pre.payload {
      margin: 0;
      padding: var(--space-2);
      background: var(--color-bg-canvas);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-sm);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
    }
    .erreur-reseau {
      padding: var(--space-2) var(--space-3);
      background: var(--color-danger-100);
      color: var(--color-danger-500);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }
  `;

  updated() {
    this.toggleAttribute('ouvert', this.ouvert);
  }

  private fermer() {
    this.ouvert = false;
  }

  private vider() {
    journal.vider();
    this.expandedId = null;
  }

  private toggleItem(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  private renduPastille(statut: EntreeHttp['statut']) {
    if (statut === 'succes') {
      return html`<span class="pastille succes" aria-label="Succès">
        <mbolo-icon name="circle-check" .size=${12}></mbolo-icon>
      </span>`;
    }
    if (statut === 'erreur') {
      return html`<span class="pastille erreur" aria-label="Erreur">
        <mbolo-icon name="circle-x" .size=${12}></mbolo-icon>
      </span>`;
    }
    return html`<span class="pastille en-cours" aria-label="En cours">
      <mbolo-icon name="loader-circle" .size=${12}></mbolo-icon>
    </span>`;
  }

  private renduDetails(e: EntreeHttp) {
    return html`
      <div class="details">
        ${e.port
          ? html`
              <div class="section">
                <h5>Port appelé</h5>
                <mbolo-port-indicator
                  .port=${e.port.nom}
                  .type=${e.port.type}
                  .source=${SOURCES[e.port.sourceKey]}
                ></mbolo-port-indicator>
              </div>
            `
          : nothing}
        ${e.requestBody !== undefined
          ? html`
              <div class="section">
                <h5>Requête (body)</h5>
                <pre class="payload">${JSON.stringify(e.requestBody, null, 2)}</pre>
              </div>
            `
          : nothing}
        ${e.responseBody !== undefined
          ? html`
              <div class="section">
                <h5>Réponse (body)</h5>
                <pre class="payload">${JSON.stringify(e.responseBody, null, 2)}</pre>
              </div>
            `
          : nothing}
        ${e.erreurReseau
          ? html`<div class="section">
              <h5>Erreur réseau</h5>
              <div class="erreur-reseau">${e.erreurReseau}</div>
            </div>`
          : nothing}
        ${e.exceptionMetier
          ? html`<div class="section">
              <h5>Exception métier</h5>
              <mbolo-error-annotation .exception=${e.exceptionMetier}></mbolo-error-annotation>
            </div>`
          : nothing}
      </div>
    `;
  }

  private renduItem(e: EntreeHttp) {
    const expanded = this.expandedId === e.id;
    return html`
      <div class="item">
        <button
          class="item-tete"
          type="button"
          aria-expanded=${expanded ? 'true' : 'false'}
          @click=${() => this.toggleItem(e.id)}
        >
          <div class="ligne-haut">
            ${this.renduPastille(e.statut)}
            <span class="verb">${e.method}</span>
            <span class="url" title=${e.url}>${e.url}</span>
            ${e.statutHttp ? html`<span class="statut-http">${e.statutHttp}</span>` : nothing}
          </div>
          <div class="ligne-bas">
            <span>${e.port ? e.port.nom : '—'}</span>
            <span class="duree">${e.dureeMs != null ? `${e.dureeMs} ms` : '…'}</span>
          </div>
        </button>
        ${expanded ? this.renduDetails(e) : nothing}
      </div>
    `;
  }

  render() {
    return html`
      <div class="voile" @click=${this.fermer} aria-hidden="true"></div>
      <aside
        class="drawer"
        role="dialog"
        aria-modal="false"
        aria-labelledby="inspector-titre"
        ?hidden=${!this.ouvert}
      >
        <header>
          <div class="header-haut">
            <h2 id="inspector-titre" class="titre">
              <mbolo-icon name="terminal" .size=${20}></mbolo-icon>
              Inspector pédagogique
            </h2>
            <button class="icon-btn" type="button" aria-label="Fermer" @click=${this.fermer}>
              <mbolo-icon name="x" .size=${20}></mbolo-icon>
            </button>
          </div>
          <div class="header-bas">
            <span>${this.entrees.length} appel(s) en session</span>
            ${this.entrees.length > 0
              ? html`<button class="txt-btn" type="button" @click=${this.vider}>Vider</button>`
              : nothing}
          </div>
        </header>
        <div class="corps">
          ${this.entrees.length === 0
            ? html`
                <div class="empty">
                  <mbolo-icon name="terminal" .size=${40}></mbolo-icon>
                  <p>
                    Aucun appel HTTP encore. Effectuez une action (créer un compte,
                    déposer, retirer, charger l'historique) pour observer les
                    requêtes en direct.
                  </p>
                </div>
              `
            : this.entrees.map((e) => this.renduItem(e))}
        </div>
      </aside>
    `;
  }
}
