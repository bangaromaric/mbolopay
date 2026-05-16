import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Pastille signalant la publication d'un événement de domaine (charte §7.3).
 * Utilisée en mode pédagogique uniquement : badge transitoire après une
 * action métier réussie (ex. {@code EvenementAbonneCree} après création
 * d'abonné), ou entrée de timeline sur {@code page-evenements-domaine}.
 *
 * <p>Style : pill {@code --brand-accent-100} / {@code --brand-accent-700}
 * (charte §3.2 — accent or FCFA), icône {@code radio-tower}.
 *
 * <p>Si la prop {@code source} est renseignée, le badge devient cliquable
 * vers le fichier Java correspondant sur GitHub.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-domain-event-badge')
export class MboloDomainEventBadge extends LitElement {
  @property({ type: String }) accessor nom = '';
  @property({ type: String }) accessor source: string | null = null;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      background: var(--brand-accent-100);
      color: var(--brand-accent-700);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      font-family: var(--font-family-mono);
    }
    a {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
    }
    a:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-full);
    }
    mbolo-icon { flex-shrink: 0; }
    .ext { opacity: 0.5; }
  `;

  render() {
    const contenu = html`
      <mbolo-icon name="radio-tower" .size=${16}></mbolo-icon>
      <span>${this.nom}</span>
      ${this.source
        ? html`<mbolo-icon class="ext" name="external-link" .size=${12}></mbolo-icon>`
        : nothing}
    `;
    if (this.source) {
      return html`
        <a
          href=${this.source}
          target="_blank"
          rel="noopener noreferrer"
          title=${`Événement : ${this.nom} — voir sur GitHub`}
        >
          ${contenu}
        </a>
      `;
    }
    return contenu;
  }
}
