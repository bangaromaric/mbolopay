import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/** Nature CQRS du port : lecture seule ou mutation d'état. */
export type TypePort = 'query' | 'command' | null;

/**
 * Chip révélant le port (cas d'usage) appelé par une action métier
 * (charte §7.3). Affiché en mode pédagogique pour matérialiser
 * l'architecture hexagonale.
 *
 * <p>Trois éléments visuels combinés :
 * <ul>
 *   <li><b>Pastille Q/C</b> (optionnelle) : indique la nature CQRS du port.
 *       Query = bleu/eye (lecture), Command = vert/square-pen (mutation).</li>
 *   <li><b>Icône cpu</b> : signifie « port / cas d'usage ».</li>
 *   <li><b>Nom du port</b> : nom de l'interface Java.</li>
 * </ul>
 *
 * <p>Si {@code source} est renseigné, le chip devient un lien GitHub vers
 * le fichier {@code .java} correspondant.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-port-indicator')
export class MboloPortIndicator extends LitElement {
  @property({ type: String }) accessor port = '';
  @property({ type: String }) accessor source: string | null = null;
  @property({ type: String, reflect: true }) accessor type: TypePort = null;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
      background: var(--color-bg-subtle);
      color: var(--color-text-secondary);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      border: 1px dashed var(--color-border-strong);
    }
    a {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      cursor: pointer;
      color: inherit;
    }
    a:hover {
      color: var(--color-text-brand);
    }
    a:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }
    .ext { opacity: 0.5; }

    .qc-pastille {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }
    :host([type="query"]) .qc-pastille {
      background: var(--brand-secondary-100);
      color: var(--brand-secondary-700);
    }
    :host([type="command"]) .qc-pastille {
      background: var(--color-success-100);
      color: var(--color-success-500);
    }
  `;

  private renduPastille() {
    if (this.type === 'query') {
      return html`
        <span class="qc-pastille" title="Query — lecture seule (readOnly)" aria-label="Query">
          <mbolo-icon name="eye" .size=${10}></mbolo-icon>
        </span>
      `;
    }
    if (this.type === 'command') {
      return html`
        <span class="qc-pastille" title="Command — mutation d'état" aria-label="Command">
          <mbolo-icon name="square-pen" .size=${10}></mbolo-icon>
        </span>
      `;
    }
    return nothing;
  }

  render() {
    const contenu = html`
      ${this.renduPastille()}
      <mbolo-icon name="cpu" .size=${12}></mbolo-icon>
      <span>${this.port}</span>
      ${this.source
        ? html`<mbolo-icon class="ext" name="external-link" .size=${10}></mbolo-icon>`
        : nothing}
    `;
    if (this.source) {
      return html`
        <a
          href=${this.source}
          target="_blank"
          rel="noopener noreferrer"
          title=${`Port appelé : ${this.port} — voir sur GitHub`}
        >
          ${contenu}
        </a>
      `;
    }
    return html`<span title="Port appelé (mode pédagogique)">${contenu}</span>`;
  }
}
