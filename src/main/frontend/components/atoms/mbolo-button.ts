import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Variantes de bouton conformes à la charte §8.1.
 */
export type VariantBouton = 'primary' | 'secondary' | 'ghost' | 'destructive';

/**
 * Tailles de bouton conformes à la charte §8.1.
 */
export type TailleBouton = 'sm' | 'md' | 'lg';

/**
 * Bouton MboloPay couvrant les quatre variantes de la charte §8.1
 * (primary, secondary, ghost, destructive) et les trois tailles (sm, md, lg).
 *
 * Implémenté en bouton natif stylé via tokens sémantiques plutôt qu'en wrapper
 * Material Web : la variante destructive nécessite un override de
 * `--md-filled-button-container-color` qui n'est pas garanti sur Material Web
 * 2.x, et la variante ghost n'a pas d'équivalent natif. L'implémentation
 * native garantit le rendu charte sur toutes les variantes et préserve la
 * sémantique HTML (`<button>` natif, support `form`, `formaction`, etc.).
 *
 * Cibles tactiles (charte §11.2) : `md` = 40px, `lg` = 48px (recommandation
 * pour boutons d'action financière).
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-button')
export class MboloButton extends LitElement {
  @property({ type: String, reflect: true }) accessor variant: VariantBouton = 'primary';
  @property({ type: String, reflect: true }) accessor size: TailleBouton = 'md';
  @property({ type: String }) accessor type: 'button' | 'submit' | 'reset' = 'button';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean, reflect: true }) accessor stacked = false;
  @property({ type: Boolean }) accessor loading = false;
  @property({ type: String }) accessor href: string | null = null;
  @property({ type: String, attribute: 'aria-label' }) accessor ariaLabelOverride: string | null = null;

  static styles = css`
    :host {
      display: inline-flex;
    }
    :host([disabled]) {
      pointer-events: none;
    }

    button, a {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-family: var(--font-family-sans);
      font-weight: var(--font-weight-medium);
      line-height: 1;
      cursor: pointer;
      text-align: center;
      transition: background-color var(--duration-quick) var(--easing-standard),
                  color var(--duration-quick) var(--easing-standard),
                  border-color var(--duration-quick) var(--easing-standard),
                  transform var(--duration-instant) var(--easing-standard);
      user-select: none;
      white-space: nowrap;
    }

    button:focus-visible, a:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    button:active:not([disabled]), a:active {
      transform: scale(0.98);
    }

    button[disabled] {
      cursor: not-allowed;
      opacity: 0.4;
    }

    /* === Tailles === */
    :host([size="sm"]) button, :host([size="sm"]) a {
      height: 32px;
      padding: 0 var(--space-3);
      font-size: var(--font-size-sm);
      border-radius: var(--radius-md);
    }
    :host([size="md"]) button, :host([size="md"]) a,
    :host(:not([size])) button, :host(:not([size])) a {
      height: 40px;
      padding: 0 var(--space-4);
      font-size: var(--font-size-base);
      border-radius: var(--radius-md);
    }
    :host([size="lg"]) button, :host([size="lg"]) a {
      height: 48px;
      padding: 0 var(--space-5);
      font-size: var(--font-size-md);
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-semibold);
    }

    /* === Layout vertical (icône au-dessus du libellé) === */
    :host([stacked]) button, :host([stacked]) a {
      flex-direction: column;
      height: auto;
      min-height: 72px;
      padding-block: var(--space-3);
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      line-height: 1.2;
    }
    :host([stacked][size="lg"]) button, :host([stacked][size="lg"]) a {
      min-height: 88px;
      font-size: var(--font-size-base);
    }

    /* === Variante primary === */
    :host([variant="primary"]) button,
    :host([variant="primary"]) a,
    :host(:not([variant])) button,
    :host(:not([variant])) a {
      background: var(--color-action-primary-bg);
      color: var(--color-action-primary-fg);
    }
    :host([variant="primary"]) button:hover:not([disabled]),
    :host([variant="primary"]) a:hover,
    :host(:not([variant])) button:hover:not([disabled]),
    :host(:not([variant])) a:hover {
      background: var(--color-action-primary-bg-hover);
    }

    /* === Variante secondary === */
    :host([variant="secondary"]) button, :host([variant="secondary"]) a {
      background: transparent;
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-subtle);
    }
    :host([variant="secondary"]) button:hover:not([disabled]),
    :host([variant="secondary"]) a:hover {
      background: var(--color-bg-subtle);
      border-color: var(--color-border-strong);
    }

    /* === Variante ghost === */
    :host([variant="ghost"]) button, :host([variant="ghost"]) a {
      background: transparent;
      color: var(--color-text-primary);
    }
    :host([variant="ghost"]) button:hover:not([disabled]),
    :host([variant="ghost"]) a:hover {
      background: var(--color-bg-subtle);
    }

    /* === Variante destructive === */
    :host([variant="destructive"]) button, :host([variant="destructive"]) a {
      background: var(--color-danger-500);
      color: var(--neutral-0);
    }
    :host([variant="destructive"]) button:hover:not([disabled]),
    :host([variant="destructive"]) a:hover {
      filter: brightness(0.92);
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      button, a {
        transition: none;
      }
      .spinner {
        animation: none;
      }
    }
  `;

  private renduContenu() {
    return html`
      ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
      <slot></slot>
    `;
  }

  /**
   * Propage manuellement le clic du bouton interne vers le {@code <form>}
   * ancêtre. Nécessaire parce que le {@code <button>} natif vit dans le
   * shadow DOM de ce composant : sans cette propagation, un clic sur un
   * bouton {@code type="submit"} ne déclenche pas la soumission du form
   * parent (frontière shadow non franchissable par la submission native).
   *
   * On utilise {@code form.requestSubmit()} plutôt que {@code form.submit()}
   * pour conserver le passage par les validations HTML5 et l'émission
   * d'un événement {@code submit} interceptable par {@code @submit}.
   */
  private onClicInterne(evt: Event) {
    if (this.disabled || this.loading) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      return;
    }
    if (this.type === 'submit' || this.type === 'reset') {
      const form = this.closest('form');
      if (!form) return;
      evt.preventDefault();
      if (this.type === 'submit') {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          form.submit();
        }
      } else {
        form.reset();
      }
    }
  }

  render() {
    const ariaLabel = this.ariaLabelOverride ?? undefined;
    if (this.href && !this.disabled) {
      return html`
        <a href=${this.href} aria-label=${ariaLabel ?? nothing}>
          ${this.renduContenu()}
        </a>
      `;
    }
    return html`
      <button
        type=${this.type}
        ?disabled=${this.disabled}
        aria-label=${ariaLabel ?? nothing}
        aria-busy=${this.loading ? 'true' : 'false'}
        @click=${this.onClicInterne}
      >
        ${this.renduContenu()}
      </button>
    `;
  }
}
