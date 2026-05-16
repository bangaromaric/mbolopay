import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { OperationResponse } from '../../api/types.js';

/**
 * Item d'historique d'une opération (charte §8.5 — mobile money pattern).
 *
 * Layout :
 * <pre>
 *   ┌──────────────────────────────────────────────────┐
 *   │ [↓]  Dépôt                              +5 000   │
 *   │      Aujourd'hui à 14:32                FCFA     │
 *   └──────────────────────────────────────────────────┘
 * </pre>
 *
 * <ul>
 *   <li>Icône circulaire 40px à gauche, fond sémantique (vert pour dépôt, rouge pour retrait).</li>
 *   <li>Label + timestamp humanisé (relatif si récent, date complète sinon).</li>
 *   <li>Montant à droite, signé (±), couleur sémantique via {@code mbolo-montant-fcfa}.</li>
 *   <li>Toute la ligne est focusable au clavier (rôle de bouton).</li>
 * </ul>
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-operation-item')
export class MboloOperationItem extends LitElement {
  @property({ attribute: false }) accessor operation: OperationResponse | null = null;

  static styles = css`
    :host {
      display: block;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    :host(:last-of-type) {
      border-bottom: none;
    }
    .ligne {
      display: grid;
      grid-template-columns: 40px 1fr auto;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      min-height: 64px;
    }
    .icone-cercle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    :host([data-type="DEPOT"]) .icone-cercle {
      background: var(--color-success-100);
      color: var(--color-success-500);
    }
    :host([data-type="RETRAIT"]) .icone-cercle {
      background: var(--color-danger-100);
      color: var(--color-danger-500);
    }
    .label {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      margin: 0;
    }
    .meta {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
    .montant {
      text-align: right;
      font-size: var(--font-size-md);
      font-variant-numeric: tabular-nums;
    }
    .montant small {
      display: block;
      font-size: var(--font-size-xs);
      color: var(--color-text-disabled);
      margin-top: 2px;
    }
  `;

  private formatterTimestamp(iso: string): string {
    const date = new Date(iso);
    const secondes = Math.round((Date.now() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

    if (secondes < 60) return rtf.format(-secondes, 'second');
    const minutes = Math.round(secondes / 60);
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    const heures = Math.round(minutes / 60);
    if (heures < 24) return rtf.format(-heures, 'hour');
    const jours = Math.round(heures / 24);
    if (jours < 7) return rtf.format(-jours, 'day');

    // Au-delà d'une semaine, date complète.
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  willUpdate() {
    if (this.operation) {
      this.setAttribute('data-type', this.operation.type);
    }
  }

  render() {
    if (!this.operation) return html``;
    const op = this.operation;
    const estDepot = op.type === 'DEPOT';
    const libelle = estDepot ? 'Dépôt' : 'Retrait';
    const icone = estDepot ? 'arrow-down-to-line' : 'arrow-up-from-line';
    const valeurSignee = estDepot ? op.montant : -op.montant;

    return html`
      <div class="ligne" role="listitem">
        <div class="icone-cercle" aria-hidden="true">
          <mbolo-icon name=${icone} .size=${20}></mbolo-icon>
        </div>
        <div>
          <p class="label">${libelle}</p>
          <p class="meta">${this.formatterTimestamp(op.dateOperation)}</p>
        </div>
        <div class="montant">
          <mbolo-montant-fcfa .value=${valeurSignee} signed></mbolo-montant-fcfa>
          <small>Solde : ${op.soldeApresFormate}</small>
        </div>
      </div>
    `;
  }
}
