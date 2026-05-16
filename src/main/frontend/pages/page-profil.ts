import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import * as theme from '../lib/theme.js';
import * as modePedagogique from '../lib/mode-pedagogique.js';
import * as modeSlowMo from '../lib/mode-slow-mo.js';
import type { Vitesse } from '../lib/mode-slow-mo.js';
import * as session from '../lib/session-abonne.js';
import type { AbonneEnSession } from '../lib/session-abonne.js';
import { afficherToast } from '../components/molecules/mbolo-toast.js';
import { reposConfigure, SOURCES } from '../lib/sources.js';

/**
 * Page « Profil » (charte §10.2 / §14 / §7.3).
 *
 * Deux modes :
 * <ul>
 *   <li><b>Connecté</b> — affiche l'identité de l'abonné en session
 *       (prénom, nom, numéro de téléphone formaté) avec un bouton de
 *       déconnexion en variante {@code destructive}.</li>
 *   <li><b>Déconnecté</b> — empty-state {@code role="empty"} avec CTA
 *       « Créer un compte » pointant vers {@code /creer-abonne}.</li>
 * </ul>
 *
 * Suivent les préférences globales : Apparence (clair / sombre / auto) et
 * Mode pédagogique (interrupteur + lien vers la timeline des événements).
 *
 * @author BANGA Romaric
 */
@customElement('page-profil')
export class PageProfil extends LitElement {
  @state() private accessor mode: theme.ModeTheme = theme.modeCourant();
  @state() private accessor pedagogique: boolean = modePedagogique.estActif();
  @state() private accessor slowMo: boolean = modeSlowMo.estActif();
  @state() private accessor vitesseSlowMo: Vitesse = modeSlowMo.vitesse();
  @state() private accessor abonne: AbonneEnSession | null = session.abonneCourant();

  private readonly onSessionChange = () => {
    this.abonne = session.abonneCourant();
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-session-change', this.onSessionChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-session-change', this.onSessionChange);
  }

  static styles = css`
    :host {
      display: block;
      padding-block: var(--space-5);
    }
    section {
      margin-top: var(--space-6);
    }
    h2 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-3) 0;
    }
    .carte-identite {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-5);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--brand-primary-100);
      color: var(--brand-primary-700);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.02em;
    }
    .identite-nom {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-1) 0;
    }
    .identite-meta {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
    .deconnexion {
      margin-top: var(--space-3);
    }
    .options {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
    }
    .toggle p {
      margin: 0;
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
    }
    .toggle small {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
    .interrupteur {
      all: unset;
      width: 48px;
      height: 28px;
      border-radius: var(--radius-full);
      background: var(--color-border-strong);
      position: relative;
      cursor: pointer;
      transition: background-color var(--duration-quick) var(--easing-standard);
      flex-shrink: 0;
    }
    .interrupteur::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-bg-surface);
      box-shadow: var(--shadow-sm);
      transition: transform var(--duration-quick) var(--easing-standard);
    }
    .interrupteur[aria-checked="true"] {
      background: var(--color-action-primary-bg);
    }
    .interrupteur[aria-checked="true"]::before {
      transform: translateX(20px);
    }
    .interrupteur:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    a.lien-evenements {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-3);
      color: var(--color-text-brand);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
    }
    a.lien-evenements:hover {
      text-decoration: underline;
    }
    .interrupteur[aria-disabled="true"],
    .interrupteur:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .vitesse {
      margin-top: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .vitesse legend {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      padding: 0;
    }
    .vitesse label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      cursor: pointer;
    }
    .vitesse label:hover {
      color: var(--color-text-primary);
    }
    .vitesse input[type="radio"] {
      accent-color: var(--color-action-primary-bg);
      cursor: pointer;
    }
    @media (prefers-reduced-motion: reduce) {
      .interrupteur, .interrupteur::before {
        transition: none;
      }
    }
  `;

  private appliquerMode(mode: theme.ModeTheme) {
    theme.appliquer(mode);
    this.mode = mode;
  }

  private basculerPedagogique() {
    this.pedagogique = modePedagogique.basculer();
    if (!this.pedagogique && this.slowMo) {
      modeSlowMo.definir(false);
      this.slowMo = false;
    }
  }

  private basculerSlowMo() {
    if (!this.pedagogique) return;
    this.slowMo = modeSlowMo.basculer();
  }

  private changerVitesseSlowMo(evt: Event) {
    const v = (evt.target as HTMLInputElement).value as Vitesse;
    modeSlowMo.definirVitesse(v);
    this.vitesseSlowMo = v;
  }

  private seDeconnecter() {
    session.deconnecter();
    afficherToast({ variant: 'info', message: 'Vous êtes déconnecté.' });
  }

  private initiales(): string {
    if (!this.abonne) return '?';
    return `${this.abonne.prenom.charAt(0)}${this.abonne.nom.charAt(0)}`.toUpperCase();
  }

  private formatterNumero(brut: string): string {
    // Si format E.164 attendu +241XXXXXXXX → afficher +241 XX XX XX XX
    const match = /^\+241(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(brut);
    if (match) return `+241 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    return brut;
  }

  private renduIdentite() {
    if (!this.abonne) {
      return html`
        <mbolo-empty-state>
          <mbolo-icon slot="icon" name="user-round" .size=${28}></mbolo-icon>
          <span slot="title">Vous n'êtes pas connecté</span>
          <span slot="body">Créez un compte pour profiter de toutes les fonctionnalités MboloPay.</span>
          <mbolo-button slot="cta" variant="primary" size="md" href="/creer-abonne">
            Créer un compte
          </mbolo-button>
        </mbolo-empty-state>
      `;
    }
    return html`
      <div class="carte-identite">
        <div class="avatar" aria-hidden="true">${this.initiales()}</div>
        <div>
          <p class="identite-nom">${this.abonne.prenom} ${this.abonne.nom}</p>
          <p class="identite-meta">${this.formatterNumero(this.abonne.numeroFormatInternational ?? this.abonne.numeroTelephone)}</p>
        </div>
      </div>
      <div class="deconnexion">
        <mbolo-button variant="destructive" size="md" @click=${this.seDeconnecter}>
          Se déconnecter
        </mbolo-button>
      </div>
    `;
  }

  render() {
    return html`
      ${this.renduIdentite()}

      <section aria-labelledby="titre-apparence">
        <h2 id="titre-apparence">Apparence</h2>
        <div class="options">
          <mbolo-button
            variant=${this.mode === 'light' ? 'primary' : 'secondary'}
            size="sm"
            @click=${() => this.appliquerMode('light')}
          >
            Mode clair
          </mbolo-button>
          <mbolo-button
            variant=${this.mode === 'dark' ? 'primary' : 'secondary'}
            size="sm"
            @click=${() => this.appliquerMode('dark')}
          >
            Mode sombre
          </mbolo-button>
          <mbolo-button
            variant=${this.mode === 'auto' ? 'primary' : 'secondary'}
            size="sm"
            @click=${() => this.appliquerMode('auto')}
          >
            Automatique
          </mbolo-button>
        </div>
      </section>

      <section aria-labelledby="titre-pedagogique">
        <h2 id="titre-pedagogique">Mode pédagogique</h2>
        <div class="toggle">
          <div>
            <p>Afficher les événements de domaine</p>
            <small>
              Révèle les bounded contexts, ports et événements émis. Conçu
              pour les démos pédagogiques.
            </small>
          </div>
          <button
            class="interrupteur"
            role="switch"
            aria-checked=${this.pedagogique ? 'true' : 'false'}
            aria-label="Activer le mode pédagogique"
            @click=${this.basculerPedagogique}
          ></button>
        </div>
        <a class="lien-evenements" href="/evenements-domaine">
          <mbolo-icon name="radio-tower" .size=${18}></mbolo-icon>
          Voir les événements observés
        </a>
      </section>

      <section aria-labelledby="titre-slow-mo">
        <h2 id="titre-slow-mo">Mode slow-mo</h2>
        <div class="toggle">
          <div>
            <p>Animer le voyage à travers les couches</p>
            <small>
              Pause entre chaque étape (Primary → Application → Domain →
              Secondary) lors d'une création, d'un dépôt ou d'un retrait.
              Nécessite le mode pédagogique activé.
            </small>
          </div>
          <button
            class="interrupteur"
            role="switch"
            aria-checked=${this.slowMo ? 'true' : 'false'}
            aria-disabled=${!this.pedagogique ? 'true' : 'false'}
            ?disabled=${!this.pedagogique}
            aria-label="Activer le mode slow-mo"
            @click=${this.basculerSlowMo}
          ></button>
        </div>
        ${this.slowMo
          ? html`
              <fieldset class="vitesse">
                <legend>Vitesse de défilement</legend>
                <label>
                  <input
                    type="radio"
                    name="vitesse-slow-mo"
                    value="apprentissage"
                    ?checked=${this.vitesseSlowMo === 'apprentissage'}
                    @change=${this.changerVitesseSlowMo}
                  />
                  Apprentissage — 1,8 s par étape (démos en classe)
                </label>
                <label>
                  <input
                    type="radio"
                    name="vitesse-slow-mo"
                    value="normale"
                    ?checked=${this.vitesseSlowMo === 'normale'}
                    @change=${this.changerVitesseSlowMo}
                  />
                  Normale — 0,9 s par étape (découverte fluide)
                </label>
                <label>
                  <input
                    type="radio"
                    name="vitesse-slow-mo"
                    value="rapide"
                    ?checked=${this.vitesseSlowMo === 'rapide'}
                    @change=${this.changerVitesseSlowMo}
                  />
                  Rapide — 0,4 s par étape (re-visualisation)
                </label>
              </fieldset>
            `
          : nothing}
      </section>

      <section aria-labelledby="titre-apprendre">
        <h2 id="titre-apprendre">Apprendre</h2>
        <a class="lien-evenements" href="/architecture">
          <mbolo-icon name="book-open" .size=${18}></mbolo-icon>
          Architecture du projet (bounded contexts, cycle, glossaire)
        </a>
        ${reposConfigure()
          ? html`
              <a
                class="lien-evenements"
                href=${SOURCES.identitePackage.replace('/blob/master/src/main/java/ga/banga/mbolopay/identite/package-info.java', '')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <mbolo-icon name="github" .size=${18}></mbolo-icon>
                Voir le code source sur GitHub
              </a>
            `
          : nothing}
      </section>
    `;
  }
}
