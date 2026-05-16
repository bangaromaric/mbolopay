import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Page 404 client (route inconnue par Vaadin Router). Ne renvoie pas un 404 HTTP :
 * le serveur a bien servi `index.html`, c'est le routeur côté client qui détecte
 * que la route ne correspond à aucune entry.
 *
 * @author BANGA Romaric
 */
@customElement('page-erreur-404')
export class PageErreur404 extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 480px;
      margin: var(--space-8) auto;
      padding: var(--space-5);
      text-align: center;
    }
    h1 {
      font-size: var(--font-size-lg);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }
    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
    }
  `;

  render() {
    return html`
      <h1>Page introuvable</h1>
      <p>La page demandée n'existe pas.</p>
      <a href="/">Retour à l'accueil</a>
    `;
  }
}
