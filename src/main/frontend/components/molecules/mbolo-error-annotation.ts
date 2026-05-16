import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { MetaException } from '../../lib/exceptions-metier.js';
import { SOURCES } from '../../lib/sources.js';

/**
 * Annotation pédagogique d'une erreur API.
 *
 * <p>Placée sous le banner d'erreur fonctionnel pour exposer à l'étudiant :
 * le nom de l'exception Java levée par le domaine, son module
 * (bounded context), le statut HTTP retourné et les liens vers la classe
 * d'exception ET le {@code @RestControllerAdvice} qui assure le mapping.
 *
 * <p>Affichée uniquement en mode pédagogique (le parent gate). Si l'exception
 * n'a pas pu être déduite, le composant ne rend rien.
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-error-annotation')
export class MboloErrorAnnotation extends LitElement {
  @property({ attribute: false }) accessor exception: MetaException | null = null;

  static styles = css`
    :host {
      display: block;
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--color-danger-100);
      border-left: 4px solid var(--color-danger-500);
      border-radius: var(--radius-md);
    }
    .titre {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-danger-500);
      margin: 0 0 var(--space-2) 0;
    }
    .meta-ligne {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-3);
    }
    .meta-ligne strong {
      font-family: var(--font-family-mono);
      color: var(--color-text-primary);
    }
    .description {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      line-height: 1.5;
      margin: 0 0 var(--space-3) 0;
    }
    .liens {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .liens a {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-brand);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .liens a:hover {
      text-decoration: underline;
    }
    .liens a:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }
  `;

  render() {
    const e = this.exception;
    if (!e) return nothing;
    return html`
      <h4 class="titre">
        <mbolo-icon name="circle-x" .size=${18}></mbolo-icon>
        ${e.classe}
      </h4>
      <div class="meta-ligne">
        <span>Module : <strong>${e.module}</strong></span>
        <span>·</span>
        <span>HTTP <strong>${e.statutHttp} ${e.raisonHttp}</strong></span>
      </div>
      <p class="description">${e.description}</p>
      <div class="liens">
        <a href=${SOURCES[e.sourceClasseKey]} target="_blank" rel="noopener noreferrer">
          <mbolo-icon name="github" .size=${16}></mbolo-icon>
          Voir ${e.classe}.java
        </a>
        <a href=${SOURCES[e.sourceHandlerKey]} target="_blank" rel="noopener noreferrer">
          <mbolo-icon name="github" .size=${16}></mbolo-icon>
          Voir le gestionnaire (mapping HTTP)
        </a>
      </div>
    `;
  }
}
