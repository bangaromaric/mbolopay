import { LitElement, html, css, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { navigate } from '../router.js';
import { abonneApi } from '../api/abonne-api.js';
import type { ApiError } from '../api/client.js';
import { afficherToast } from '../components/molecules/mbolo-toast.js';
import * as evenements from '../lib/evenements-domaine.js';
import * as session from '../lib/session-abonne.js';
import { estActif as modePedagogiqueActif } from '../lib/mode-pedagogique.js';
import { lienSource } from '../lib/sources.js';
import { VO } from '../lib/value-objects.js';
import { deduire as deduireException } from '../lib/exceptions-metier.js';
import type { MetaException } from '../lib/exceptions-metier.js';
import { executerAvecSlowMo } from '../lib/slow-mo-runner.js';
import { creationAbonne } from '../lib/cycles.js';

/**
 * Page de création d'un abonné MboloPay (charte §9.2, §13).
 *
 * Couvre les 5 chemins métier :
 * <ol>
 *   <li>Succès 201 → toast vert + publication de l'événement de domaine
 *       observé côté front ({@code EvenementAbonneCree}) + (mode pédagogique
 *       actif) flash transitoire du badge avant redirection vers l'accueil.</li>
 *   <li>{@code ValidationError} (400) → banner inline {@code role="alert"}
 *       avec le détail métier.</li>
 *   <li>{@code ClientError} 409 (numéro déjà utilisé) → banner inline.</li>
 *   <li>{@code ServerError} (5xx) → toast rouge générique.</li>
 *   <li>{@code NetworkError} → toast rouge « connexion impossible ».</li>
 * </ol>
 *
 * Voice & tone (charte §13) : vouvoiement, libellés explicites, messages
 * d'erreur sous forme de phrases complètes. Focus auto sur le premier champ
 * à l'arrivée pour accélérer la saisie clavier.
 *
 * @author BANGA Romaric
 */
@customElement('page-creer-abonne')
export class PageCreerAbonne extends LitElement {
  @state() private accessor enCours = false;
  @state() private accessor erreurInline: string | null = null;
  @state() private accessor exceptionMetier: MetaException | null = null;
  @state() private accessor evenementFlash: string | null = null;

  @query('#form-creer-abonne') private accessor form!: HTMLFormElement;
  @query('#prenom') private accessor prenomInput!: HTMLInputElement;
  @query('#nom') private accessor nomInput!: HTMLInputElement;
  @query('#numero') private accessor numeroInput!: HTMLInputElement;

  static styles = css`
    :host {
      display: block;
      max-width: 560px;
      margin-inline: auto;
      padding-block: var(--space-5);
    }
    .intro {
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-5) 0;
      font-size: var(--font-size-sm);
    }
    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    md-outlined-text-field {
      width: 100%;
    }
    .champ {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    .vo-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .vo-row .label-bc {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: var(--font-weight-medium);
    }
    .actions {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-3);
    }
    .actions mbolo-button {
      flex: 1;
    }
    .banner-erreur {
      padding: var(--space-3) var(--space-4);
      background: var(--color-danger-100);
      color: var(--color-danger-500);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      border-left: 4px solid var(--color-danger-500);
      margin-bottom: var(--space-4);
    }
    .flash-evenement {
      position: fixed;
      bottom: var(--space-6);
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      animation: monte var(--duration-moderate) var(--easing-emphasized);
    }
    @keyframes monte {
      from { opacity: 0; transform: translate(-50%, 12px); }
      to   { opacity: 1; transform: translate(-50%, 0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .flash-evenement {
        animation: none;
      }
    }
  `;

  firstUpdated() {
    this.prenomInput?.focus();
  }

  private async onSoumettre(e: Event) {
    e.preventDefault();
    if (this.enCours) return;
    if (!this.form.reportValidity()) return;

    this.erreurInline = null;
    this.exceptionMetier = null;
    this.enCours = true;

    try {
      const commande = {
        prenom: this.prenomInput.value.trim(),
        nom: this.nomInput.value.trim(),
        numeroTelephone: this.numeroInput.value.trim(),
      };
      const cree = await executerAvecSlowMo(creationAbonne, () => abonneApi.creer(commande));

      session.connecter(cree);

      evenements.publier({
        nom: 'EvenementAbonneCree',
        boundedContext: 'identite',
        publiePar: 'identite',
        consommePar: ['portefeuille'],
        payload: {
          abonneId: cree.id,
          prenom: cree.prenom,
          nom: cree.nom,
          numeroTelephone: cree.numeroTelephone,
        },
        timestamp: new Date(),
      });

      afficherToast({
        message: `C'est bon ${cree.prenom} ! Votre compte est créé.`,
        variant: 'success',
      });

      this.form.reset();

      if (modePedagogiqueActif()) {
        this.evenementFlash = 'EvenementAbonneCree';
        setTimeout(() => {
          this.evenementFlash = null;
          navigate('/');
        }, 1800);
      } else {
        navigate('/');
      }
    } catch (e) {
      this.gererErreur(e as ApiError);
    } finally {
      this.enCours = false;
    }
  }

  private gererErreur(err: ApiError) {
    switch (err.kind) {
      case 'NetworkError':
        afficherToast({
          message: 'La connexion est lente. Réessayez dans quelques secondes.',
          variant: 'danger',
        });
        return;
      case 'ServerError':
        afficherToast({
          message: 'Le service est momentanément indisponible. Réessayez plus tard.',
          variant: 'danger',
        });
        return;
      case 'ValidationError':
        this.erreurInline = err.body.details ?? 'Les données saisies ne sont pas valides.';
        this.exceptionMetier = deduireException(
          'POST',
          '/api/abonnes',
          400,
          err.body.message ?? err.body.details,
        );
        return;
      case 'ClientError':
        if (err.status === 409) {
          this.erreurInline = 'Ce numéro de téléphone est déjà utilisé. Essayez-en un autre.';
        } else {
          const body = err.body as { details?: string };
          this.erreurInline = body.details ?? `Une erreur s'est produite (code ${err.status}).`;
        }
        this.exceptionMetier = deduireException(
          'POST',
          '/api/abonnes',
          err.status,
          (err.body as { message?: string; details?: string })?.message ??
            (err.body as { details?: string })?.details,
        );
        return;
    }
  }

  private onAnnuler() {
    navigate('/');
  }

  render() {
    return html`
      <p class="intro">
        Renseignez vos informations ci-dessous. Le compte vous donne accès à
        votre portefeuille MboloPay.
      </p>

      ${this.erreurInline
        ? html`<div class="banner-erreur" role="alert">${this.erreurInline}</div>`
        : nothing}
      ${this.erreurInline && this.exceptionMetier && modePedagogiqueActif()
        ? html`<mbolo-error-annotation .exception=${this.exceptionMetier}></mbolo-error-annotation>`
        : nothing}

      <form id="form-creer-abonne" @submit=${this.onSoumettre} novalidate>
        <div class="champ">
          ${modePedagogiqueActif()
            ? html`<div class="vo-row">
                <span class="label-bc">Prénom — Value Object</span>
                <mbolo-vo-hint .descripteur=${VO.nomGabonais}></mbolo-vo-hint>
              </div>`
            : nothing}
          <md-outlined-text-field
            id="prenom"
            label="Votre prénom *"
            required
            maxlength="60"
            autocomplete="given-name"></md-outlined-text-field>
        </div>

        <div class="champ">
          ${modePedagogiqueActif()
            ? html`<div class="vo-row">
                <span class="label-bc">Nom — Value Object</span>
                <mbolo-vo-hint .descripteur=${VO.nomGabonais}></mbolo-vo-hint>
              </div>`
            : nothing}
          <md-outlined-text-field
            id="nom"
            label="Votre nom *"
            required
            maxlength="60"
            autocomplete="family-name"></md-outlined-text-field>
        </div>

        <div class="champ">
          ${modePedagogiqueActif()
            ? html`<div class="vo-row">
                <span class="label-bc">Numéro — Value Object</span>
                <mbolo-vo-hint .descripteur=${VO.numeroTelephoneGabonais}></mbolo-vo-hint>
              </div>`
            : nothing}
          <md-outlined-text-field
            id="numero"
            label="Votre numéro de téléphone *"
            required
            type="tel"
            pattern="^\\+241[0-9]{8}$"
            placeholder="+24177XXXXXX"
            autocomplete="tel"
            supporting-text="Indiquez votre numéro Airtel ou Moov. Format attendu : +241 suivi de 8 chiffres."></md-outlined-text-field>
        </div>

        <div class="actions">
          <mbolo-button
            type="submit"
            variant="primary"
            size="lg"
            ?disabled=${this.enCours}
            ?loading=${this.enCours}
          >
            ${this.enCours ? 'Création…' : 'Créer mon compte'}
          </mbolo-button>
          <mbolo-button
            type="button"
            variant="secondary"
            size="lg"
            ?disabled=${this.enCours}
            @click=${this.onAnnuler}
          >
            Annuler
          </mbolo-button>
        </div>
      </form>

      ${this.evenementFlash
        ? html`
            <div class="flash-evenement" aria-live="polite">
              <mbolo-domain-event-badge
                .nom=${this.evenementFlash}
                .source=${lienSource('evenementAbonneCree')}
              ></mbolo-domain-event-badge>
            </div>
          `
        : nothing}
    `;
  }
}
