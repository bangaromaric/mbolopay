import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Carte de solde — composant phare de la page d'accueil (charte §8.4).
 *
 * Deux modes de rendu :
 * <ul>
 *   <li><b>Garni</b> — quand {@code montant} est fourni : affiche le montant
 *       en {@code font-size-2xl semibold}, caption « Solde disponible » et
 *       timestamp relatif (« Mis à jour il y a 2 secondes »).</li>
 *   <li><b>Vide</b> — par défaut, en l'absence de backend solde : empty-state
 *       avec CTA « Créer un compte ».</li>
 * </ul>
 *
 * Style charte §8.4 : fond {@code --brand-primary-50}, bordure gauche
 * {@code 4px} {@code --brand-primary-500}, coins {@code --radius-lg}.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-balance-card')
export class MboloBalanceCard extends LitElement {
  @property({ type: Number }) accessor montant: number | null = null;
  @property({ attribute: false }) accessor derniereMaj: Date | null = null;
  @property({ type: Boolean }) accessor loading = false;
  @property({ type: String }) accessor erreur: string | null = null;

  static styles = css`
    :host {
      display: block;
      background: var(--brand-primary-50);
      border-left: 4px solid var(--brand-primary-500);
      padding: var(--space-5);
      box-shadow: var(--shadow-sm);
    }
    .caption {
      font-size: var(--font-size-sm);
      color: var(--brand-primary-700);
      font-weight: var(--font-weight-medium);
      margin: 0 0 var(--space-2) 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .montant {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--brand-primary-700);
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
      line-height: 1.1;
      margin: 0;
    }
    .meta {
      font-size: var(--font-size-xs);
      color: var(--brand-primary-700);
      opacity: 0.75;
      margin-top: var(--space-3);
    }
    /* En dark, fond clair primaire-50 reste mais texte devient lisible via texte sombre primary-700 — OK pour AAA. */
  `;

  private formatterMaj(date: Date): string {
    const secondes = Math.round((Date.now() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
    if (secondes < 60) return `Mis à jour ${rtf.format(-secondes, 'second')}`;
    const minutes = Math.round(secondes / 60);
    if (minutes < 60) return `Mis à jour ${rtf.format(-minutes, 'minute')}`;
    const heures = Math.round(minutes / 60);
    if (heures < 24) return `Mis à jour ${rtf.format(-heures, 'hour')}`;
    return `Mis à jour ${rtf.format(-Math.round(heures / 24), 'day')}`;
  }

  private renduGarni() {
    return html`
      <p class="caption">Solde disponible</p>
      <div class="montant">
        <mbolo-montant-fcfa .value=${this.montant!}></mbolo-montant-fcfa>
      </div>
      ${this.derniereMaj
        ? html`<div class="meta">${this.formatterMaj(this.derniereMaj)}</div>`
        : nothing}
    `;
  }

  private renduVide() {
    return html`
      <mbolo-empty-state>
        <mbolo-icon slot="icon" name="wallet" .size=${24}></mbolo-icon>
        <span slot="title">Connectez-vous pour voir votre solde</span>
        <span slot="body">Créez votre compte MboloPay pour activer votre portefeuille.</span>
        <mbolo-button slot="cta" variant="primary" size="md" href="/creer-abonne">
          Créer un compte
        </mbolo-button>
      </mbolo-empty-state>
    `;
  }

  private renduChargement() {
    return html`
      <p class="caption">Solde disponible</p>
      <mbolo-skeleton width="180px" height="2.5rem"></mbolo-skeleton>
      <div class="meta" style="margin-top: var(--space-3);">
        <mbolo-skeleton width="120px" height="0.75rem"></mbolo-skeleton>
      </div>
    `;
  }

  private renduErreur() {
    return html`
      <mbolo-empty-state compact>
        <mbolo-icon slot="icon" name="wallet" .size=${24}></mbolo-icon>
        <span slot="title">Solde indisponible</span>
        <span slot="body">${this.erreur}</span>
      </mbolo-empty-state>
    `;
  }

  render() {
    if (this.loading) return this.renduChargement();
    if (this.erreur) return this.renduErreur();
    return this.montant != null ? this.renduGarni() : this.renduVide();
  }
}
