import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { afficherToast } from './mbolo-toast.js';
import { portefeuilleApi } from '../../api/portefeuille-api.js';
import type { ApiError } from '../../api/client.js';
import type { PortefeuilleResponse } from '../../api/types.js';
import * as evenements from '../../lib/evenements-domaine.js';
import { estActif as modePedagogiqueActif } from '../../lib/mode-pedagogique.js';
import { VO } from '../../lib/value-objects.js';
import { deduire as deduireException } from '../../lib/exceptions-metier.js';
import type { MetaException } from '../../lib/exceptions-metier.js';
import { executerAvecSlowMo } from '../../lib/slow-mo-runner.js';
import { depotArgent, retraitArgent } from '../../lib/cycles.js';

export type ModeOperation = 'depot' | 'retrait';

interface Config {
  readonly titre: string;
  readonly icone: string;
  readonly cta: string;
  readonly toastSucces: (montant: number) => string;
  readonly nomEvenement: string;
  readonly bcSource: string;
  readonly bcConsommateurs: readonly string[];
}

const CONFIGS: Readonly<Record<ModeOperation, Config>> = {
  depot: {
    titre: "Déposer de l'argent",
    icone: 'arrow-down-to-line',
    cta: 'Confirmer le dépôt',
    toastSucces: (m) => `Dépôt de ${m.toLocaleString('fr-FR')} FCFA effectué.`,
    nomEvenement: 'DepotEffectue',
    bcSource: 'portefeuille',
    bcConsommateurs: [],
  },
  retrait: {
    titre: "Retirer de l'argent",
    icone: 'arrow-up-from-line',
    cta: 'Confirmer le retrait',
    toastSucces: (m) => `Retrait de ${m.toLocaleString('fr-FR')} FCFA effectué.`,
    nomEvenement: 'RetraitEffectue',
    bcSource: 'portefeuille',
    bcConsommateurs: [],
  },
};

/**
 * Bottom sheet générique de saisie d'une opération sur le portefeuille
 * (charte §8.7, §9.2). Couvre les deux flux dépôt et retrait via la prop
 * {@code mode} : titre, icône, libellé du CTA, message succès et nom de
 * l'événement de domaine simulé sont adaptés.
 *
 * Affiche un overlay sombre avec une sheet remontée en bas d'écran sur
 * mobile (centrée sur desktop). La validation HTML5 garantit montant
 * entier positif. En mode retrait, le composant pré-vérifie côté client
 * que {@code montant <= soldeActuel} et affiche un message inline avant
 * même l'appel API.
 *
 * Émet :
 * <ul>
 *   <li>{@code mbolo-operation-effectuee} (detail = {@link PortefeuilleResponse})
 *       après succès ;</li>
 *   <li>{@code mbolo-sheet-ferme} à l'annulation ou la fermeture.</li>
 * </ul>
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-sheet-operation')
export class MboloSheetOperation extends LitElement {
  @property({ type: Boolean, reflect: true }) accessor ouvert = false;
  @property({ type: String }) accessor portefeuilleId = '';
  @property({ type: String }) accessor mode: ModeOperation = 'depot';
  @property({ type: Number }) accessor soldeActuel = 0;

  @state() private accessor enCours = false;
  @state() private accessor erreur: string | null = null;
  @state() private accessor exceptionMetier: MetaException | null = null;
  @state() private accessor montant = '';

  @query('#input-montant') private accessor input!: HTMLInputElement;

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: none;
      pointer-events: none;
    }
    :host([ouvert]) {
      display: block;
      pointer-events: auto;
    }
    .voile {
      position: absolute;
      inset: 0;
      background: rgb(11 20 27 / 0.50);
      animation: fade-in var(--duration-quick) var(--easing-standard);
    }
    .sheet {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-bg-surface);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      box-shadow: var(--shadow-lg);
      padding: var(--space-5) var(--space-4) calc(var(--space-5) + env(safe-area-inset-bottom));
      animation: slide-up var(--duration-moderate) var(--easing-emphasized);
      max-width: 560px;
      margin: 0 auto;
    }
    @media (min-width: 768px) {
      .sheet {
        position: absolute;
        inset: auto;
        top: 50%;
        left: 50%;
        right: auto;
        bottom: auto;
        transform: translate(-50%, -50%);
        border-radius: var(--radius-xl);
        animation: pop-in var(--duration-moderate) var(--easing-emphasized);
        min-width: 420px;
      }
    }
    .titre {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-4) 0;
    }
    :host([mode="depot"]) .titre mbolo-icon {
      color: var(--color-success-500);
    }
    :host([mode="retrait"]) .titre mbolo-icon {
      color: var(--color-danger-500);
    }
    .barre-haut {
      width: 36px;
      height: 4px;
      border-radius: var(--radius-full);
      background: var(--color-border-strong);
      margin: 0 auto var(--space-4) auto;
    }
    @media (min-width: 768px) {
      .barre-haut { display: none; }
    }
    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }
    .label-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0 var(--space-3);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      background: var(--color-bg-canvas);
      transition: border-color var(--duration-quick) var(--easing-standard);
    }
    .input-wrap:focus-within {
      border-color: var(--color-border-focus);
      box-shadow: var(--shadow-focus);
    }
    input {
      flex: 1;
      border: none;
      outline: none;
      padding: var(--space-3) 0;
      background: transparent;
      font-family: var(--font-family-sans);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      font-variant-numeric: tabular-nums;
      width: 100%;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type="number"] { -moz-appearance: textfield; }
    .suffixe {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }
    .helpers {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .helper-chip {
      all: unset;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      cursor: pointer;
      font-weight: var(--font-weight-medium);
    }
    .helper-chip:hover {
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
    }
    .helper-chip:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    .info-solde {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
    }
    .erreur {
      padding: var(--space-2) var(--space-3);
      background: var(--color-danger-100);
      color: var(--color-danger-500);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      border-left: 4px solid var(--color-danger-500);
    }
    .actions {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-3);
    }
    .actions mbolo-button { flex: 1; }
    @keyframes fade-in {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes slide-up {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    @keyframes pop-in {
      from { transform: translate(-50%, -45%); opacity: 0; }
      to   { transform: translate(-50%, -50%); opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .voile, .sheet { animation: none; }
    }
  `;

  private get config(): Config {
    return CONFIGS[this.mode];
  }

  private fermer() {
    this.ouvert = false;
    this.erreur = null;
    this.exceptionMetier = null;
    this.montant = '';
    this.enCours = false;
    this.dispatchEvent(new CustomEvent('mbolo-sheet-ferme', { bubbles: true, composed: true }));
  }

  private cliqueVoile(evt: MouseEvent) {
    if (evt.target === evt.currentTarget) this.fermer();
  }

  private appliquerRaccourci(montantFcfa: number) {
    this.montant = String(montantFcfa);
    this.erreur = null;
    queueMicrotask(() => this.input?.focus());
  }

  private raccourcis(): readonly number[] {
    if (this.mode === 'retrait' && this.soldeActuel > 0) {
      // En retrait, propose des fractions du solde + des arrondis.
      const base = [1000, 5000, 10000, 25000];
      return base.filter((m) => m <= this.soldeActuel);
    }
    return [1000, 5000, 10000, 25000];
  }

  private async onSoumettre(evt: Event) {
    evt.preventDefault();
    if (this.enCours) return;
    const montantNum = Number.parseInt(this.montant, 10);
    if (!Number.isFinite(montantNum) || montantNum <= 0) {
      this.erreur = 'Indiquez un montant entier supérieur à zéro.';
      return;
    }
    if (this.mode === 'retrait' && montantNum > this.soldeActuel) {
      this.erreur = `Solde insuffisant. Disponible : ${this.soldeActuel.toLocaleString('fr-FR')} FCFA.`;
      return;
    }
    if (!this.portefeuilleId) {
      this.erreur = 'Identifiant de portefeuille manquant. Reconnectez-vous.';
      return;
    }
    this.enCours = true;
    this.erreur = null;
    this.exceptionMetier = null;
    try {
      const cycle = this.mode === 'depot' ? depotArgent : retraitArgent;
      const maj = await executerAvecSlowMo(cycle, () =>
        this.mode === 'depot'
          ? portefeuilleApi.deposer(this.portefeuilleId, { montant: montantNum })
          : portefeuilleApi.retirer(this.portefeuilleId, { montant: montantNum }),
      );

      const cfg = this.config;
      evenements.publier({
        nom: cfg.nomEvenement,
        boundedContext: cfg.bcSource,
        publiePar: cfg.bcSource,
        consommePar: [...cfg.bcConsommateurs],
        payload: { portefeuilleId: maj.id, montant: montantNum, nouveauSolde: maj.solde },
        timestamp: new Date(),
      });
      afficherToast({ variant: 'success', message: cfg.toastSucces(montantNum) });
      this.dispatchEvent(
        new CustomEvent<PortefeuilleResponse>('mbolo-operation-effectuee', {
          bubbles: true,
          composed: true,
          detail: maj,
        }),
      );
      this.fermer();
    } catch (e) {
      this.gererErreur(e as ApiError);
    } finally {
      this.enCours = false;
    }
  }

  private gererErreur(err: ApiError) {
    const urlBidon = `/api/portefeuilles/X/${this.mode === 'depot' ? 'depot' : 'retrait'}`;
    const message =
      'body' in err
        ? (err.body as { message?: string; details?: string })?.message ??
          (err.body as { details?: string })?.details
        : undefined;
    switch (err.kind) {
      case 'NetworkError':
        this.erreur = 'La connexion est lente. Réessayez dans quelques secondes.';
        return;
      case 'ServerError':
        this.erreur = 'Le service est momentanément indisponible.';
        this.exceptionMetier = deduireException('POST', urlBidon, err.status, message);
        return;
      case 'ValidationError':
        this.erreur = err.body.details ?? 'Montant invalide.';
        this.exceptionMetier = deduireException('POST', urlBidon, 400, message);
        return;
      case 'ClientError':
        if (err.status === 404) {
          this.erreur = 'Votre portefeuille est introuvable. Reconnectez-vous.';
        } else if (err.status === 400) {
          const body = err.body as { details?: string };
          this.erreur = body.details ?? 'Opération refusée.';
        } else {
          const body = err.body as { details?: string };
          this.erreur = body.details ?? `Échec de l'opération (code ${err.status}).`;
        }
        this.exceptionMetier = deduireException('POST', urlBidon, err.status, message);
        return;
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('ouvert') && this.ouvert) {
      queueMicrotask(() => this.input?.focus());
    }
  }

  render() {
    if (!this.ouvert) return nothing;
    const cfg = this.config;
    return html`
      <div class="voile" @click=${this.cliqueVoile} aria-hidden="true"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="titre-operation">
        <div class="barre-haut" aria-hidden="true"></div>
        <h2 id="titre-operation" class="titre">
          <mbolo-icon name=${cfg.icone} .size=${20}></mbolo-icon>
          ${cfg.titre}
        </h2>
        <form @submit=${this.onSoumettre} novalidate>
          <div class="label-row">
            <label for="input-montant">Montant ${this.mode === 'depot' ? 'à déposer' : 'à retirer'}</label>
            ${modePedagogiqueActif()
              ? html`<mbolo-vo-hint .descripteur=${VO.argent}></mbolo-vo-hint>`
              : nothing}
          </div>
          <div class="input-wrap">
            <input
              id="input-montant"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              required
              autocomplete="off"
              .value=${this.montant}
              @input=${(e: Event) => (this.montant = (e.target as HTMLInputElement).value)}
              placeholder="0"
            />
            <span class="suffixe">FCFA</span>
          </div>
          ${this.mode === 'retrait' && this.soldeActuel > 0
            ? html`<div class="info-solde">
                Solde disponible :
                <strong>${this.soldeActuel.toLocaleString('fr-FR')} FCFA</strong>
              </div>`
            : nothing}
          <div class="helpers" role="group" aria-label="Montants suggérés">
            ${this.raccourcis().map(
              (m) => html`
                <button
                  type="button"
                  class="helper-chip"
                  @click=${() => this.appliquerRaccourci(m)}
                >
                  ${this.mode === 'depot' ? '+' : '−'}${m.toLocaleString('fr-FR')}
                </button>
              `,
            )}
          </div>
          ${this.erreur ? html`<div class="erreur" role="alert">${this.erreur}</div>` : nothing}
          ${this.erreur && this.exceptionMetier && modePedagogiqueActif()
            ? html`<mbolo-error-annotation .exception=${this.exceptionMetier}></mbolo-error-annotation>`
            : nothing}
          <div class="actions">
            <mbolo-button
              type="button"
              variant="secondary"
              size="lg"
              ?disabled=${this.enCours}
              @click=${this.fermer}
            >
              Annuler
            </mbolo-button>
            <mbolo-button
              type="submit"
              variant=${this.mode === 'retrait' ? 'destructive' : 'primary'}
              size="lg"
              ?disabled=${this.enCours}
              ?loading=${this.enCours}
            >
              ${this.enCours ? '…' : cfg.cta}
            </mbolo-button>
          </div>
        </form>
      </div>
    `;
  }
}
