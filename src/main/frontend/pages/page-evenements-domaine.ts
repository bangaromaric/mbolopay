import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import * as store from '../lib/evenements-domaine.js';
import type { EvenementDomaine } from '../lib/evenements-domaine.js';
import { SOURCES } from '../lib/sources.js';

/** Mapping nom événement → clé SOURCES pour le lien GitHub. */
const SOURCE_PAR_NOM: Record<string, keyof typeof SOURCES> = {
  EvenementAbonneCree: 'evenementAbonneCree',
};

/**
 * Timeline des événements de domaine observés en session (charte §9.3).
 *
 * Cette page est la seule où le jargon technique est <i>acceptable</i> : elle
 * cible explicitement la pédagogie. Chaque entrée affiche le nom de
 * l'événement, l'émetteur, les consommateurs et le payload sérialisé
 * (repliable via <code>&lt;details&gt;</code>).
 *
 * Les événements sont alimentés par {@link store.publier} appelé depuis
 * {@code page-creer-abonne} après chaque création réussie — miroir
 * best-effort de l'événement réel publié par Spring Modulith côté backend.
 *
 * @author BANGA Romaric
 */
@customElement('page-evenements-domaine')
export class PageEvenementsDomaine extends LitElement {
  @state() private accessor evenements: readonly EvenementDomaine[] = store.liste();

  private readonly onPublication = () => {
    this.evenements = store.liste();
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mbolo-evenement-publie', this.onPublication);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mbolo-evenement-publie', this.onPublication);
  }

  static styles = css`
    :host {
      display: block;
      padding-block: var(--space-5);
    }
    .intro {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin: 0 0 var(--space-5) 0;
      max-width: 60ch;
    }
    .timeline {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    li.evt {
      position: relative;
      padding: var(--space-4);
      padding-left: var(--space-5);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-left: 4px solid var(--brand-accent-500);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .en-tete {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
      flex-wrap: wrap;
    }
    .meta {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      flex-wrap: wrap;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
    .meta .fleche {
      opacity: 0.5;
    }
    .timestamp {
      font-size: var(--font-size-xs);
      color: var(--color-text-disabled);
      font-variant-numeric: tabular-nums;
    }
    details summary {
      cursor: pointer;
      color: var(--color-text-brand);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin-top: var(--space-2);
    }
    details summary:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    pre.payload {
      margin: var(--space-2) 0 0 0;
      padding: var(--space-3);
      background: var(--color-bg-canvas);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  `;

  private formatterTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  private renduListe() {
    return html`
      <p class="intro">
        Chaque action métier réussie publie un événement de domaine. Ces
        événements sont observés ici de façon best-effort côté client — leur
        publication réelle est gérée par Spring Modulith côté backend.
      </p>
      <ol class="timeline">
        ${this.evenements.map(
          (evt) => html`
            <li class="evt">
              <div class="en-tete">
                <mbolo-domain-event-badge
                  .nom=${evt.nom}
                  .source=${SOURCE_PAR_NOM[evt.nom] ? SOURCES[SOURCE_PAR_NOM[evt.nom]] : null}
                ></mbolo-domain-event-badge>
                <span class="timestamp">${this.formatterTimestamp(evt.timestamp)}</span>
              </div>
              <div class="meta">
                <strong>${evt.publiePar}</strong>
                <span class="fleche">→</span>
                ${evt.consommePar.length > 0
                  ? evt.consommePar.map((c) => html`<span>${c}</span>`)
                  : html`<em>(aucun consommateur)</em>`}
              </div>
              ${evt.payload != null
                ? html`
                    <details>
                      <summary>Voir le payload</summary>
                      <pre class="payload">${JSON.stringify(evt.payload, null, 2)}</pre>
                    </details>
                  `
                : nothing}
            </li>
          `,
        )}
      </ol>
    `;
  }

  private renduVide() {
    return html`
      <mbolo-empty-state>
        <mbolo-icon slot="icon" name="radio-tower" .size=${28}></mbolo-icon>
        <span slot="title">Aucun événement observé pour l'instant</span>
        <span slot="body">
          Créez votre premier abonné pour déclencher
          <code>EvenementAbonneCree</code>.
        </span>
        <mbolo-button slot="cta" variant="primary" size="md" href="/creer-abonne">
          Créer un compte
        </mbolo-button>
      </mbolo-empty-state>
    `;
  }

  render() {
    return this.evenements.length > 0 ? this.renduListe() : this.renduVide();
  }
}
