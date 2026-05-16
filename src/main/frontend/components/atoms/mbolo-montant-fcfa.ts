import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const formatter = new Intl.NumberFormat('fr-FR', {
  useGrouping: true,
  maximumFractionDigits: 0,
});

/**
 * Affichage d'un montant FCFA conforme à la charte §9.1.
 *
 * Règles :
 *   - séparateur de milliers : espace insécable (assuré par Intl fr-FR)
 *   - aucune décimale (FCFA n'en a pas)
 *   - signe optionnel via l'attribut `signed` : `+` pour positif, `−` (U+2212) pour négatif
 *   - tabular-nums obligatoire (alignement vertical des chiffres)
 *   - couleur sémantique : verte si positif et signé, rouge si négatif et signé
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-montant-fcfa')
export class MboloMontantFcfa extends LitElement {
  @property({ type: Number }) accessor value = 0;
  @property({ type: Boolean }) accessor signed = false;

  static styles = css`
    :host {
      font-variant-numeric: tabular-nums;
      font-feature-settings: 'tnum';
      display: inline-flex;
      align-items: baseline;
      gap: var(--space-1);
    }
    .negatif { color: var(--color-amount-negative); }
    .positif { color: var(--color-amount-positive); }
    .suffixe {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  `;

  render() {
    const positif = this.value >= 0;
    const signe = this.signed ? (positif ? '+' : '−') : '';
    const classe = this.signed ? (positif ? 'positif' : 'negatif') : '';
    const formate = formatter.format(Math.abs(this.value));
    return html`
      <span class=${classe}>${signe}${formate}</span>
      <span class="suffixe">FCFA</span>
    `;
  }
}
