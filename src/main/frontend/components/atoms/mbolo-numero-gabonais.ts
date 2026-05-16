import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Convertit un numéro E.164 gabonais en format lisible `+241 XX XX XX XX`.
 *
 * Entrée attendue : `+24177123456`
 * Sortie : `+241 77 12 34 56`
 *
 * Si l'entrée ne commence pas par `+241`, l'entrée est rendue telle quelle
 * (le formatage est best-effort).
 *
 * @author BANGA Romaric
 */
function formatNumero(e164: string): string {
  if (!e164) return '';
  if (!e164.startsWith('+241')) return e164;
  const sansPrefixe = e164.slice(4);
  const groupes = sansPrefixe.match(/.{1,2}/g) ?? [];
  return `+241 ${groupes.join(' ')}`.trimEnd();
}

@customElement('mbolo-numero-gabonais')
export class MboloNumeroGabonais extends LitElement {
  @property({ type: String }) accessor value = '';

  static styles = css`
    :host {
      font-variant-numeric: tabular-nums;
      font-feature-settings: 'tnum';
    }
  `;

  render() {
    return html`<span>${formatNumero(this.value)}</span>`;
  }
}
