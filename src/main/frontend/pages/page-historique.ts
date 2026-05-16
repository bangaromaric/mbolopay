import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { portefeuilleApi } from '../api/portefeuille-api.js';
import type { ApiError } from '../api/client.js';
import type { OperationResponse, PortefeuilleResponse } from '../api/types.js';
import * as session from '../lib/session-abonne.js';

/**
 * Page « Historique des transactions » (charte §10.2, §8.5).
 *
 * Trois états visuels :
 * <ul>
 *   <li><b>Déconnecté</b> — empty-state « Connectez-vous » + CTA création de compte.</li>
 *   <li><b>Chargement</b> — 5 skeletons hauteur 64px (cibles de la charte §10.3).</li>
 *   <li><b>Liste vide</b> — empty-state « Pas encore de transactions ».</li>
 *   <li><b>Liste paginée</b> — items {@code mbolo-operation-item} + bouton
 *       « Charger plus » tant que la dernière page n'est pas atteinte.</li>
 * </ul>
 *
 * Écoute {@code mbolo-operation-effectuee} pour recharger la première page après
 * un dépôt ou retrait effectué ailleurs dans l'app.
 *
 * @author BANGA Romaric
 */
@customElement('page-historique')
export class PageHistorique extends LitElement {
  @state() private accessor abonne = session.abonneCourant();
  @state() private accessor portefeuille: PortefeuilleResponse | null = null;
  @state() private accessor operations: OperationResponse[] = [];
  @state() private accessor loading = false;
  @state() private accessor erreur: string | null = null;
  @state() private accessor pageActuelle = 0;
  @state() private accessor totalPages = 0;
  @state() private accessor totalElements = 0;

  private readonly TAILLE_PAGE = 20;

  private readonly onSessionChange = () => {
    this.abonne = session.abonneCourant();
    this.reinitialiser();
    if (this.abonne) void this.chargerInitial();
  };

  private readonly onOperationEffectuee = () => {
    // Rafraîchit la première page silencieusement après un dépôt/retrait ailleurs.
    this.reinitialiser();
    void this.chargerInitial();
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-session-change', this.onSessionChange);
    window.addEventListener('mbolo-operation-effectuee', this.onOperationEffectuee);
    if (this.abonne) void this.chargerInitial();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-session-change', this.onSessionChange);
    window.removeEventListener('mbolo-operation-effectuee', this.onOperationEffectuee);
  }

  private reinitialiser() {
    this.operations = [];
    this.pageActuelle = 0;
    this.totalPages = 0;
    this.totalElements = 0;
    this.erreur = null;
    this.portefeuille = null;
  }

  private async chargerInitial() {
    if (!this.abonne) return;
    this.loading = true;
    this.erreur = null;
    try {
      this.portefeuille = await portefeuilleApi.parAbonne(this.abonne.id);
      const page = await portefeuilleApi.historique(this.portefeuille.id, 0, this.TAILLE_PAGE);
      this.operations = page.contenu;
      this.pageActuelle = page.pageActuelle;
      this.totalPages = page.totalPages;
      this.totalElements = page.totalElements;
    } catch (e) {
      this.gererErreur(e as ApiError);
    } finally {
      this.loading = false;
    }
  }

  private async chargerSuivante() {
    if (!this.portefeuille) return;
    if (this.pageActuelle + 1 >= this.totalPages) return;
    this.loading = true;
    try {
      const page = await portefeuilleApi.historique(
        this.portefeuille.id,
        this.pageActuelle + 1,
        this.TAILLE_PAGE,
      );
      this.operations = [...this.operations, ...page.contenu];
      this.pageActuelle = page.pageActuelle;
      this.totalPages = page.totalPages;
      this.totalElements = page.totalElements;
    } catch (e) {
      this.gererErreur(e as ApiError);
    } finally {
      this.loading = false;
    }
  }

  private gererErreur(err: ApiError) {
    switch (err.kind) {
      case 'NetworkError':
        this.erreur = 'Connexion lente. L\'historique ne peut pas être chargé pour le moment.';
        return;
      case 'ServerError':
        this.erreur = 'Service momentanément indisponible.';
        return;
      case 'ClientError':
        if (err.status === 404) {
          this.erreur = 'Portefeuille introuvable. Reconnectez-vous.';
        } else {
          this.erreur = `Erreur (code ${err.status}).`;
        }
        return;
      case 'ValidationError':
        this.erreur = err.body.details ?? 'Requête invalide.';
        return;
    }
  }

  static styles = css`
    :host {
      display: block;
      padding-block: var(--space-5);
    }
    .resume {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin: 0 0 var(--space-4) 0;
    }
    .liste {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xs);
      overflow: hidden;
    }
    .erreur-banner {
      padding: var(--space-3) var(--space-4);
      background: var(--color-danger-100);
      color: var(--color-danger-500);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      border-left: 4px solid var(--color-danger-500);
      margin-bottom: var(--space-4);
    }
    .charger-plus {
      display: flex;
      justify-content: center;
      margin-top: var(--space-4);
    }
    .skeletons {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .skeleton-item {
      display: grid;
      grid-template-columns: 40px 1fr 80px;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
      min-height: 64px;
    }
    .skeleton-item:last-child {
      border-bottom: none;
    }
  `;

  private renduDeconnecte() {
    return html`
      <mbolo-empty-state>
        <mbolo-icon slot="icon" name="clock" .size=${28}></mbolo-icon>
        <span slot="title">Vous n'êtes pas connecté</span>
        <span slot="body">Créez votre compte pour suivre vos opérations.</span>
        <mbolo-button slot="cta" variant="primary" size="md" href="/creer-abonne">
          Créer un compte
        </mbolo-button>
      </mbolo-empty-state>
    `;
  }

  private renduChargement() {
    return html`
      <div class="liste skeletons" aria-busy="true" aria-live="polite">
        ${[0, 1, 2, 3, 4].map(
          () => html`
            <div class="skeleton-item">
              <mbolo-skeleton width="40px" height="40px" circle></mbolo-skeleton>
              <div>
                <mbolo-skeleton width="80px" height="1rem"></mbolo-skeleton>
                <div style="margin-top: 6px;">
                  <mbolo-skeleton width="120px" height="0.75rem"></mbolo-skeleton>
                </div>
              </div>
              <mbolo-skeleton width="80px" height="1.25rem"></mbolo-skeleton>
            </div>
          `,
        )}
      </div>
    `;
  }

  private renduVide() {
    return html`
      <mbolo-empty-state>
        <mbolo-icon slot="icon" name="clock" .size=${28}></mbolo-icon>
        <span slot="title">Pas encore de transactions</span>
        <span slot="body">
          Vos opérations apparaîtront ici dès votre premier dépôt.
        </span>
        <mbolo-button slot="cta" variant="primary" size="md" href="/">
          Aller à l'accueil
        </mbolo-button>
      </mbolo-empty-state>
    `;
  }

  private renduListe() {
    const peutCharger = this.pageActuelle + 1 < this.totalPages;
    return html`
      <p class="resume">
        ${this.totalElements} opération${this.totalElements > 1 ? 's' : ''}
        — ${this.operations.length} affichée${this.operations.length > 1 ? 's' : ''}
      </p>
      <div class="liste" role="list">
        ${this.operations.map(
          (op) => html`<mbolo-operation-item .operation=${op}></mbolo-operation-item>`,
        )}
      </div>
      ${peutCharger
        ? html`
            <div class="charger-plus">
              <mbolo-button
                variant="ghost"
                size="md"
                ?disabled=${this.loading}
                ?loading=${this.loading}
                @click=${this.chargerSuivante}
              >
                ${this.loading ? 'Chargement…' : 'Charger plus'}
              </mbolo-button>
            </div>
          `
        : nothing}
    `;
  }

  render() {
    if (!this.abonne) return this.renduDeconnecte();

    return html`
      ${this.erreur
        ? html`<div class="erreur-banner" role="alert">${this.erreur}</div>`
        : nothing}
      ${this.loading && this.operations.length === 0
        ? this.renduChargement()
        : this.operations.length === 0 && !this.erreur
          ? this.renduVide()
          : this.renduListe()}
    `;
  }
}
