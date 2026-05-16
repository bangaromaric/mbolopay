import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Composant icône MboloPay.
 *
 * Wrappe un SVG via `<use href="/assets/icons/lucide.svg#nom"/>`. Le sprite
 * Lucide doit être présent à l'URL `/assets/icons/lucide.svg` ; tant qu'il
 * ne l'est pas, un rectangle de la taille demandée est rendu en placeholder.
 *
 * La couleur est héritée via `currentColor` — il suffit de définir `color`
 * sur le parent pour teinter l'icône.
 *
 * Si le nom passé ne correspond à aucun {@code <symbol>} du sprite, un
 * {@code console.warn} est émis au premier rendu pour faciliter le
 * diagnostic en développement.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-icon')
export class MboloIcon extends LitElement {
  @property({ type: String }) accessor name = '';
  @property({ type: Number }) accessor size = 20;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      vertical-align: middle;
    }
    svg {
      width: var(--mbolo-icon-size, 20px);
      height: var(--mbolo-icon-size, 20px);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .placeholder {
      width: var(--mbolo-icon-size, 20px);
      height: var(--mbolo-icon-size, 20px);
      background: currentColor;
      opacity: 0.15;
      border-radius: 2px;
    }
  `;

  private static spriteVerifie: Promise<Set<string>> | null = null;

  private static chargerSprite(): Promise<Set<string>> {
    if (!MboloIcon.spriteVerifie) {
      MboloIcon.spriteVerifie = fetch('/assets/icons/lucide.svg')
        .then((r) => (r.ok ? r.text() : ''))
        .then((texte) => {
          const ids = new Set<string>();
          const regex = /<symbol\s+id="([^"]+)"/g;
          let match;
          while ((match = regex.exec(texte)) !== null) {
            ids.add(match[1]);
          }
          return ids;
        })
        .catch(() => new Set<string>());
    }
    return MboloIcon.spriteVerifie;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.name) {
      MboloIcon.chargerSprite().then((ids) => {
        if (ids.size > 0 && !ids.has(this.name)) {
          console.warn(
            `[mbolo-icon] Icône "${this.name}" introuvable dans /assets/icons/lucide.svg`,
          );
        }
      });
    }
  }

  render() {
    const sizeStyle = `--mbolo-icon-size: ${this.size}px`;
    if (!this.name) {
      return html`<span class="placeholder" style=${sizeStyle}></span>`;
    }
    return html`
      <svg style=${sizeStyle} aria-hidden="true">
        <use href="/assets/icons/lucide.svg#${this.name}"></use>
      </svg>
    `;
  }
}
