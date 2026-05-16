import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { marquerVu } from '../../lib/onboarding.js';
import { definir as definirModePedagogique } from '../../lib/mode-pedagogique.js';

/**
 * Modale d'accueil affichée au premier lancement de l'app.
 *
 * <p>Présente MboloPay comme outil pédagogique et propose deux chemins :
 * activer immédiatement le mode pédagogique (badges, événements, lien vers
 * la page architecture) ou explorer en utilisateur simple.
 *
 * <p>Quel que soit le choix, l'onboarding est marqué comme vu — la modale
 * ne ré-apparaît pas au prochain lancement. Une bascule manuelle reste
 * possible depuis la page profil.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-onboarding')
export class MboloOnboarding extends LitElement {
  @state() private accessor ferme = false;

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: block;
      pointer-events: auto;
    }
    .voile {
      position: absolute;
      inset: 0;
      background: rgb(11 20 27 / 0.55);
      animation: fade-in var(--duration-quick) var(--easing-standard);
    }
    .modale {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-bg-surface);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      padding: var(--space-6) var(--space-5) calc(var(--space-6) + env(safe-area-inset-bottom));
      box-shadow: var(--shadow-lg);
      max-width: 560px;
      margin: 0 auto;
      animation: slide-up var(--duration-moderate) var(--easing-emphasized);
    }
    @media (min-width: 768px) {
      .modale {
        position: absolute;
        inset: auto;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: var(--radius-xl);
        animation: pop-in var(--duration-moderate) var(--easing-emphasized);
        min-width: 480px;
      }
    }
    .bandeau {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-full);
      background: var(--brand-primary-50);
      color: var(--brand-primary-500);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }
    h1 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-2) 0;
      letter-spacing: -0.01em;
    }
    .accroche {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-5) 0;
      line-height: 1.5;
    }
    .accroche strong {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-semibold);
    }
    .choix {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .choix-detail {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--space-1) 0 0 0;
      line-height: 1.4;
    }
    .skip {
      display: block;
      margin: var(--space-4) auto 0 auto;
      background: transparent;
      border: none;
      color: var(--color-text-disabled);
      font-size: var(--font-size-sm);
      cursor: pointer;
      padding: var(--space-2);
    }
    .skip:hover {
      color: var(--color-text-secondary);
    }
    .skip:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }
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
      .voile, .modale { animation: none; }
    }
  `;

  private fermer(activerPedagogique: boolean) {
    marquerVu();
    if (activerPedagogique) {
      definirModePedagogique(true);
    }
    this.ferme = true;
    // Délai pour laisser la transition jouer avant suppression du DOM
    setTimeout(() => {
      this.remove();
    }, 200);
    this.dispatchEvent(
      new CustomEvent('mbolo-onboarding-ferme', {
        bubbles: true,
        composed: true,
        detail: { modePedagogique: activerPedagogique },
      }),
    );
  }

  render() {
    if (this.ferme) return nothing;
    return html`
      <div class="voile" aria-hidden="true"></div>
      <div class="modale" role="dialog" aria-modal="true" aria-labelledby="titre-onboarding">
        <div class="bandeau" aria-hidden="true">
          <mbolo-icon name="book-open" .size=${32}></mbolo-icon>
        </div>
        <h1 id="titre-onboarding">Mbolo et bienvenue sur MboloPay</h1>
        <p class="accroche">
          MboloPay est un <strong>mini mobile money éducatif</strong>. Vous y
          manipulerez un service réel, mais surtout vous y observerez une
          architecture <strong>DDD + Hexagonale + Spring Modulith</strong>
          fonctionner en direct.
        </p>
        <div class="choix">
          <mbolo-button
            variant="primary"
            size="lg"
            @click=${() => this.fermer(true)}
          >
            <mbolo-icon name="cpu" .size=${20}></mbolo-icon>
            Activer le mode pédagogique
          </mbolo-button>
          <p class="choix-detail">
            Affiche les ports invoqués, les événements de domaine émis, les
            bounded contexts traversés, un <strong>Inspector live</strong>
            des requêtes HTTP, et un <strong>mode slow-mo</strong> activable
            pour observer pas à pas la traversée des couches.
          </p>
        </div>
        <button
          class="skip"
          type="button"
          @click=${() => this.fermer(false)}
        >
          Plus tard — explorer en utilisateur simple
        </button>
      </div>
    `;
  }
}
