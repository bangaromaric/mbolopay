import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { afficherToast } from '../components/molecules/mbolo-toast.js';
import { estActif as modePedagogiqueActif } from '../lib/mode-pedagogique.js';
import * as session from '../lib/session-abonne.js';
import type { AbonneEnSession } from '../lib/session-abonne.js';
import { portefeuilleApi } from '../api/portefeuille-api.js';
import type { ApiError } from '../api/client.js';
import type { PortefeuilleResponse } from '../api/types.js';
import type { ModeOperation } from '../components/molecules/mbolo-sheet-operation.js';
import { lienSource } from '../lib/sources.js';
import type { TypePort } from '../components/atoms/mbolo-port-indicator.js';

interface ActionRapide {
  readonly id: 'deposer' | 'retirer' | 'envoyer';
  readonly libelle: string;
  readonly icone: string;
  readonly port: string;
  /** Clé dans {@code SOURCES} pour le lien GitHub (mode pédagogique). */
  readonly sourceKey: 'deposerArgentUseCase' | 'retirerArgentUseCase' | null;
  /** Nature CQRS du port (Query/Command) — affichée en mode pédagogique. */
  readonly typePort: TypePort;
  /** {@code true} si l'endpoint backend existe — bouton actif quand session ouverte. */
  readonly cableable: boolean;
}

const ACTIONS: readonly ActionRapide[] = [
  { id: 'deposer', libelle: 'Déposer', icone: 'arrow-down-to-line', port: 'DeposerArgentUseCase', sourceKey: 'deposerArgentUseCase', typePort: 'command', cableable: true },
  { id: 'retirer', libelle: 'Retirer', icone: 'arrow-up-from-line', port: 'RetirerArgentUseCase', sourceKey: 'retirerArgentUseCase', typePort: 'command', cableable: true },
  { id: 'envoyer', libelle: 'Envoyer', icone: 'arrow-right-left', port: 'EnvoyerArgentUseCase', sourceKey: null, typePort: 'command', cableable: false },
];

/**
 * Page d'accueil — écran d'entrée du shell MboloPay (charte §8.4, §9, §13).
 *
 * Affiche dynamiquement :
 * <ul>
 *   <li><b>Hors session</b> — hero générique + balance-card empty-state +
 *       3 actions désactivées + activité récente vide.</li>
 *   <li><b>En session</b> — hero personnalisé « Mbolo, {prénom} ! », carte
 *       de solde renseignée via {@code GET /api/portefeuilles/abonne/{id}},
 *       action « Déposer » fonctionnelle (ouvre un bottom sheet et appelle
 *       {@code POST /api/portefeuilles/{pid}/depot}).</li>
 * </ul>
 *
 * Les actions « Retirer » et « Envoyer » restent désactivées tant que les
 * use cases correspondants n'existent pas côté domaine (helper « Bientôt »).
 *
 * @author BANGA Romaric
 */
@customElement('page-accueil')
export class PageAccueil extends LitElement {
  @state() private accessor pedagogique = modePedagogiqueActif();
  @state() private accessor abonne: AbonneEnSession | null = session.abonneCourant();
  @state() private accessor portefeuille: PortefeuilleResponse | null = null;
  @state() private accessor loadingSolde = false;
  @state() private accessor erreurSolde: string | null = null;
  @state() private accessor sheetOuverte = false;
  @state() private accessor sheetMode: ModeOperation = 'depot';

  private readonly onModePedagogiqueChange = () => {
    this.pedagogique = modePedagogiqueActif();
  };

  private readonly onSessionChange = (evt: Event) => {
    const detail = (evt as CustomEvent<{ abonne: AbonneEnSession | null }>).detail;
    this.abonne = detail?.abonne ?? null;
    this.portefeuille = null;
    this.erreurSolde = null;
    if (this.abonne) {
      void this.chargerPortefeuille();
    }
  };

  private readonly onOperationEffectuee = (evt: Event) => {
    const maj = (evt as CustomEvent<PortefeuilleResponse>).detail;
    this.portefeuille = maj;
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-mode-pedagogique-change', this.onModePedagogiqueChange);
    window.addEventListener('mbolo-session-change', this.onSessionChange);
    this.addEventListener('mbolo-operation-effectuee', this.onOperationEffectuee);
    if (this.abonne) void this.chargerPortefeuille();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-mode-pedagogique-change', this.onModePedagogiqueChange);
    window.removeEventListener('mbolo-session-change', this.onSessionChange);
    this.removeEventListener('mbolo-operation-effectuee', this.onOperationEffectuee);
  }

  private async chargerPortefeuille() {
    if (!this.abonne) return;
    this.loadingSolde = true;
    this.erreurSolde = null;
    try {
      this.portefeuille = await portefeuilleApi.parAbonne(this.abonne.id);
    } catch (e) {
      this.gererErreurFetch(e as ApiError);
    } finally {
      this.loadingSolde = false;
    }
  }

  private gererErreurFetch(err: ApiError) {
    switch (err.kind) {
      case 'NetworkError':
        this.erreurSolde = 'Connexion lente. Le solde ne peut pas être chargé pour le moment.';
        return;
      case 'ServerError':
        this.erreurSolde = 'Service momentanément indisponible.';
        return;
      case 'ClientError':
        if (err.status === 404) {
          this.erreurSolde = 'Portefeuille introuvable. Reconnectez-vous.';
        } else {
          this.erreurSolde = `Erreur (code ${err.status}).`;
        }
        return;
      case 'ValidationError':
        this.erreurSolde = err.body.details ?? 'Requête invalide.';
        return;
    }
  }

  static styles = css`
    :host {
      display: block;
      padding-block: var(--space-5);
    }
    .hero {
      margin: 0 0 var(--space-5) 0;
    }
    .hero h1 {
      font-size: var(--font-size-2xl);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-2) 0;
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.01em;
      line-height: 1.15;
    }
    .hero p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      margin: 0;
    }
    section {
      margin-top: var(--space-6);
    }
    @media (min-width: 768px) {
      section {
        margin-top: var(--space-8);
      }
    }
    h2 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-3) 0;
    }
    .actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }
    .action-cell {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-1);
    }
    .helper {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      text-align: center;
      display: block;
      width: 100%;
    }
    .action-cell mbolo-port-indicator {
      align-self: center;
    }
    .activite {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xs);
    }
  `;

  private cliqueAction(action: ActionRapide) {
    if (!this.actionEstActive(action)) {
      afficherToast({
        variant: 'info',
        message: action.cableable && !this.abonne
          ? `Connectez-vous pour ${action.libelle.toLowerCase()} de l'argent.`
          : action.id === 'retirer' && this.portefeuille && this.portefeuille.solde === 0
            ? 'Votre solde est nul, déposez d\'abord de l\'argent.'
            : `${action.libelle} sera bientôt disponible.`,
      });
      return;
    }
    if (action.id === 'deposer') {
      this.sheetMode = 'depot';
      this.sheetOuverte = true;
    } else if (action.id === 'retirer') {
      this.sheetMode = 'retrait';
      this.sheetOuverte = true;
    }
  }

  private actionEstActive(action: ActionRapide): boolean {
    if (!action.cableable) return false;
    if (!this.abonne || !this.portefeuille || this.loadingSolde) return false;
    if (action.id === 'retirer' && this.portefeuille.solde === 0) return false;
    return true;
  }

  private hero() {
    if (this.abonne) {
      return html`
        <h1>Mbolo, ${this.abonne.prenom} !</h1>
        <p>Bienvenue sur votre portefeuille MboloPay.</p>
      `;
    }
    return html`
      <h1>Mbolo et bienvenue !</h1>
      <p>Mini mobile money pédagogique — Gabon.</p>
    `;
  }

  render() {
    return html`
      <header class="hero">${this.hero()}</header>

      <mbolo-balance-card
        .montant=${this.portefeuille ? this.portefeuille.solde : null}
        .derniereMaj=${this.portefeuille ? new Date() : null}
        ?loading=${this.loadingSolde}
        .erreur=${this.erreurSolde}
      ></mbolo-balance-card>

      <section aria-labelledby="titre-actions">
        <h2 id="titre-actions">Actions rapides</h2>
        <div class="actions">
          ${ACTIONS.map((action) => {
            const active = this.actionEstActive(action);
            return html`
              <div class="action-cell">
                <mbolo-button
                  variant=${active ? 'primary' : 'secondary'}
                  size="md"
                  stacked
                  aria-describedby="aide-${action.id}"
                  @click=${() => this.cliqueAction(action)}
                >
                  <mbolo-icon name=${action.icone} .size=${24}></mbolo-icon>
                  ${action.libelle}
                </mbolo-button>
                <span id="aide-${action.id}" class="helper">
                  ${active ? ' ' : action.cableable ? 'Connectez-vous' : 'Bientôt'}
                </span>
                ${this.pedagogique
                  ? html`<mbolo-port-indicator
                      .port=${action.port}
                      .source=${action.sourceKey ? lienSource(action.sourceKey) : null}
                      .type=${action.typePort}
                    ></mbolo-port-indicator>`
                  : ''}
              </div>
            `;
          })}
        </div>
      </section>

      <section aria-labelledby="titre-activite">
        <h2 id="titre-activite">Activité récente</h2>
        <div class="activite">
          <mbolo-empty-state compact>
            <mbolo-icon slot="icon" name="bell" .size=${20}></mbolo-icon>
            <span slot="title">Rien à afficher pour l'instant</span>
            <span slot="body">
              Vos dernières opérations apparaîtront ici dès vos premières transactions.
            </span>
          </mbolo-empty-state>
        </div>
      </section>

      ${this.abonne && this.portefeuille
        ? html`
            <mbolo-sheet-operation
              ?ouvert=${this.sheetOuverte}
              .mode=${this.sheetMode}
              .portefeuilleId=${this.portefeuille.id}
              .soldeActuel=${this.portefeuille.solde}
              @mbolo-sheet-ferme=${() => (this.sheetOuverte = false)}
            ></mbolo-sheet-operation>
          `
        : nothing}
    `;
  }
}
