import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SOURCES, lienSource } from '../lib/sources.js';
import { creationAbonne } from '../lib/cycles.js';

/**
 * Page « Architecture » — académie intégrée de MboloPay.
 *
 * <p>Trois sections didactiques :
 * <ol>
 *   <li><b>Bounded Contexts</b> — cartes des 3 modules (identite, portefeuille, shared).</li>
 *   <li><b>Cycle d'une opération</b> — timeline 13 étapes de la création d'un abonné.</li>
 *   <li><b>Glossaire</b> — 10 cartes définissant les concepts DDD/Hexa/Modulith.</li>
 * </ol>
 *
 * <p>Accessible même mode pédagogique désactivé : l'académie est une
 * documentation, pas du jargon imposé dans le flux d'usage.
 *
 * @author BANGA Romaric
 */
@customElement('page-architecture')
export class PageArchitecture extends LitElement {

  private allerVers(ancre: string) {
    const cible = this.renderRoot.querySelector(`#${ancre}`);
    if (cible) {
      cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  static styles = css`
    :host {
      display: block;
      padding-block: var(--space-5) var(--space-8);
    }
    .intro {
      max-width: 64ch;
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      line-height: 1.6;
      margin: 0 0 var(--space-5) 0;
    }
    .intro strong {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-semibold);
    }
    .ancres {
      position: sticky;
      top: 56px;
      z-index: 5;
      background: var(--color-bg-canvas);
      padding: var(--space-3) 0;
      margin: 0 calc(var(--space-4) * -1) var(--space-5) calc(var(--space-4) * -1);
      padding-inline: var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .ancres button {
      all: unset;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: background-color var(--duration-quick) var(--easing-standard);
    }
    .ancres button:hover {
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
    }
    .ancres button:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    section {
      margin-top: var(--space-8);
      scroll-margin-top: 120px;
    }
    section > h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-2) 0;
      letter-spacing: -0.01em;
    }
    section > .legende {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-5) 0;
      max-width: 60ch;
    }
    .grille-cartes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-4);
    }
    .flux {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      box-shadow: var(--shadow-xs);
    }
    .liens-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
    }
    .liens-chips span {
      padding: 2px var(--space-2);
      background: var(--color-bg-subtle);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
    }
    .liens-chips a {
      padding: 2px var(--space-2);
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
      border-radius: var(--radius-sm);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .liens-chips a:hover {
      text-decoration: underline;
    }
  `;

  render() {
    return html`
      <p class="intro">
        MboloPay est un <strong>support pédagogique</strong> conçu pour
        enseigner l'architecture hexagonale, le Domain-Driven Design et
        Spring Modulith. Cette page explique les concepts à l'œuvre,
        montre comment ils s'enchaînent sur une opération réelle et
        définit le vocabulaire utilisé dans le code et l'interface.
      </p>

      <nav class="ancres" aria-label="Sommaire">
        <button type="button" @click=${() => this.allerVers('bounded-contexts')}>
          Bounded Contexts
        </button>
        <button type="button" @click=${() => this.allerVers('cycle')}>
          Cycle d'une opération
        </button>
        <button type="button" @click=${() => this.allerVers('glossaire')}>
          Glossaire
        </button>
      </nav>

      ${this.renduBoundedContexts()}
      ${this.renduCycle()}
      ${this.renduGlossaire()}
    `;
  }

  // =========================================================================
  // §1 — Bounded Contexts
  // =========================================================================

  private renduBoundedContexts() {
    return html`
      <section id="bounded-contexts" aria-labelledby="t-bc">
        <h2 id="t-bc">1. Bounded Contexts</h2>
        <p class="legende">
          MboloPay est découpé en trois <em>bounded contexts</em> (frontières
          sémantiques) gérés par Spring Modulith. Chaque module est isolé :
          il ne peut dépendre que de ce qui est déclaré dans son
          <code>package-info.java</code>.
        </p>
        <div class="grille-cartes">
          <mbolo-concept-card
            titre="identite"
            sous-titre="Gestion des abonnés"
            icone="user-round"
            .source=${lienSource('identitePackage')}
          >
            <div slot="body">
              Gère le cycle de vie des abonnés MboloPay. Valide les numéros de
              téléphone gabonais, vérifie l'unicité, attribue un identifiant
              fortement typé, puis publie l'événement
              <code>EvenementAbonneCree</code> consommé par
              <code>portefeuille</code>.
              <div class="liens-chips" style="margin-top: var(--space-3);">
                <span>Abonne</span>
                <span>AbonneId</span>
                <span>NumeroTelephoneGabonais</span>
                <span>NomGabonais</span>
              </div>
            </div>
            <div slot="exemple">@ApplicationModule(
    displayName = "Identité - Gestion des Abonnés",
    allowedDependencies = {"shared"}
)</div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="portefeuille"
            sous-titre="Gestion des portefeuilles & opérations"
            icone="wallet"
            .source=${lienSource('portefeuillePackage')}
          >
            <div slot="body">
              Crée un portefeuille à <code>0 FCFA</code> dès qu'un abonné est
              créé (via un listener cross-module). Gère ensuite dépôts,
              retraits, historique paginé. Ne connaît pas l'identifiant typé
              de <code>identite</code> : il utilise une
              <code>AbonneIdReference</code> (référence valuée).
              <div class="liens-chips" style="margin-top: var(--space-3);">
                <span>Portefeuille</span>
                <span>OperationPortefeuille</span>
                <span>Argent</span>
                <span>AbonneIdReference</span>
              </div>
            </div>
            <div slot="exemple">@ApplicationModule(
    displayName = "Portefeuille - Gestion des Portefeuilles",
    allowedDependencies = {"shared", "identite :: events"}
)</div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="shared"
            sous-titre="Module technique transverse"
            icone="shield-check"
            .source=${lienSource('exceptionDomaine')}
          >
            <div slot="body">
              Type <code>OPEN</code> : visible par tous les autres modules.
              Expose la classe racine <code>ExceptionDomaine</code> dont
              héritent toutes les exceptions métier (numéro déjà utilisé,
              solde insuffisant, portefeuille introuvable…). Pas d'agrégat.
              <div class="liens-chips" style="margin-top: var(--space-3);">
                <span>ExceptionDomaine</span>
              </div>
            </div>
            <div slot="exemple">@ApplicationModule(
    displayName = "Shared",
    type = Type.OPEN
)</div>
          </mbolo-concept-card>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // §2 — Cycle d'une opération (création d'un abonné)
  // =========================================================================

  private renduCycle() {
    return html`
      <section id="cycle" aria-labelledby="t-cycle">
        <h2 id="t-cycle">2. Cycle d'une opération</h2>
        <p class="legende">
          Exemple complet : que se passe-t-il quand un utilisateur envoie
          <code>POST /api/abonnes</code> ? Treize étapes traversant les deux
          bounded contexts, dont une orchestration asynchrone via événement
          de domaine.
        </p>
        <div class="flux">
          ${creationAbonne.etapes.map(
            (etape) => html`
              <mbolo-flow-step
                .numero=${etape.numero}
                titre=${etape.titre}
                etiquette=${etape.etiquette}
                .source=${etape.sourceKey ? lienSource(etape.sourceKey) : null}
              >
                <div slot="body">${etape.description}</div>
              </mbolo-flow-step>
            `,
          )}
        </div>
      </section>
    `;
  }

  // =========================================================================
  // §3 — Glossaire
  // =========================================================================

  private renduGlossaire() {
    return html`
      <section id="glossaire" aria-labelledby="t-glossaire">
        <h2 id="t-glossaire">3. Glossaire</h2>
        <p class="legende">
          Dix concepts pour parler de l'architecture du projet sans
          ambiguïté.
        </p>
        <div class="grille-cartes">
          <mbolo-concept-card
            titre="Architecture Hexagonale"
            sous-titre="Ports & Adapters"
            icone="shield-check"
            .source=${lienSource('hexagonalArchitectureTest')}
          >
            <div slot="body">
              Le domaine est au centre et ne dépend de rien. L'infrastructure
              gravite autour et dépend du domaine via des
              <strong>ports</strong> (interfaces). MboloPay vérifie cette
              règle par <code>HexagonalArchitectureTest</code> (ArchUnit).
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Bounded Context"
            sous-titre="DDD"
            icone="user-round"
            .source=${lienSource('modularityTests')}
          >
            <div slot="body">
              Frontière sémantique. Le mot « Abonné » a une signification
              précise dans <code>identite</code>, et une représentation
              différente (<code>AbonneIdReference</code>) dans
              <code>portefeuille</code>. Pas de modèle partagé.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Agrégat"
            sous-titre="DDD"
            icone="wallet"
            .source=${lienSource('portefeuille')}
          >
            <div slot="body">
              Racine de cohérence d'un cluster d'objets. Un
              <code>Portefeuille</code> protège son solde via des méthodes
              métier (<code>deposer</code>, <code>retirer</code>). On ne
              touche jamais le champ <code>solde</code> directement.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Value Object"
            sous-titre="DDD"
            icone="bell"
            .source=${lienSource('argent')}
          >
            <div slot="body">
              Objet sans identité, défini par sa valeur. <code>Argent</code>
              (record immuable avec BigDecimal sans centimes) plutôt qu'un
              <code>long</code> partout : un montant ne peut pas être
              confondu avec un identifiant ou un téléphone.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Port In (Use Case)"
            sous-titre="Architecture hexagonale"
            icone="cpu"
            .source=${lienSource('deposerArgentUseCase')}
          >
            <div slot="body">
              Interface décrivant un cas d'usage que le domaine expose au
              monde extérieur. Exemple :
              <code>DeposerArgentUseCase.executer(commande)</code>. Les
              controllers REST consomment ces ports.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Port Out"
            sous-titre="Architecture hexagonale"
            icone="arrow-right-left"
            .source=${lienSource('depotPortefeuille')}
          >
            <div slot="body">
              Interface décrivant un service externe dont le domaine a
              besoin. <code>DepotPortefeuille</code> = persistance abstraite,
              <code>DepotOperations</code> = historique abstrait. Le domaine
              déclare ses besoins, l'infrastructure y répond.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Adapter Primary"
            sous-titre="Driving — pilote le domaine"
            icone="arrow-down-to-line"
            .source=${lienSource('abonneController')}
          >
            <div slot="body">
              Traduit le monde extérieur (HTTP, événements Kafka, GUI) en
              appels vers les ports in. Dans MboloPay : les
              <code>@RestController</code> de
              <code>infrastructure/primary/web/</code>.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Adapter Secondary"
            sous-titre="Driven — implémente les besoins"
            icone="arrow-up-from-line"
            .source=${lienSource('depotPortefeuillePostgres')}
          >
            <div slot="body">
              Implémente les ports out (persistance, publication, transaction).
              Toute dépendance framework vit ici : JPA repositories,
              <code>@Transactional</code>, Spring Modulith publisher.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Événement de Domaine"
            sous-titre="Spring Modulith"
            icone="radio-tower"
            .source=${lienSource('evenementAbonneCree')}
          >
            <div slot="body">
              Un changement métier significatif publié de façon
              asynchrone. <code>EvenementAbonneCree</code> est émis par
              <code>identite</code>, consommé par <code>portefeuille</code>
              via <code>@ApplicationModuleListener</code>. Aucun couplage
              direct entre les deux modules.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="Types Driven Development"
            sous-titre="jspecify + records"
            icone="book-open"
            .source=${lienSource('abonneId')}
          >
            <div slot="body">
              Un type Java dédié pour chaque concept métier :
              <code>AbonneId</code>, <code>PortefeuilleId</code>,
              <code>Argent</code>, <code>NomGabonais</code>… Impossible de
              passer un identifiant au mauvais endroit : la compilation
              l'interdit. Les erreurs métier deviennent des erreurs de
              compilation.
            </div>
          </mbolo-concept-card>

          <mbolo-concept-card
            titre="CQRS"
            sous-titre="Command-Query Responsibility Segregation"
            icone="arrow-right-left"
            .source=${lienSource('rechercherAbonneUseCase')}
          >
            <div slot="body">
              Séparer les opérations qui <strong>lisent</strong>
              (<em>Query</em>) de celles qui <strong>mutent</strong>
              l'état (<em>Command</em>). Visuellement repérables dans le
              mode pédagogique :
              <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-3);">
                <mbolo-port-indicator
                  port="RechercherAbonneUseCase"
                  type="query"
                  .source=${lienSource('rechercherAbonneUseCase')}
                ></mbolo-port-indicator>
                <mbolo-port-indicator
                  port="DeposerArgentUseCase"
                  type="command"
                  .source=${lienSource('deposerArgentUseCase')}
                ></mbolo-port-indicator>
              </div>
              <p style="margin-top: var(--space-3);">
                Dans MboloPay, les Queries sont décorées
                <code>@Transactional(readOnly=true)</code> ; les Commands
                mutent l'état et publient parfois des événements de domaine
                (ex. <code>EvenementAbonneCree</code>).
              </p>
            </div>
          </mbolo-concept-card>
        </div>
      </section>
    `;
  }
}

// Référence d'export utilisée nulle part — assure la copie SOURCES non tree-shakée.
void SOURCES;
