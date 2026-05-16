import type { SOURCES } from './sources.js';

/**
 * Catalogue pédagogique des cycles d'opérations MboloPay.
 *
 * <p>Chaque cycle décrit la traversée des couches hexagonales par une
 * opération métier : création d'un abonné (13 étapes traversant les deux
 * bounded contexts via événement de domaine), dépôt (9 étapes mono-BC),
 * retrait (9 étapes mono-BC). Les définitions sont consommées par :
 * <ul>
 *   <li>{@code mbolo-slow-mo-overlay} pour animer les étapes une par une
 *       avec un pointeur lumineux dans la coupe hexagonale ;</li>
 *   <li>{@code page-architecture} pour la documentation statique du
 *       cycle de création d'un abonné (sécurise la cohérence : si on
 *       modifie une étape ici, la page architecture suit).</li>
 * </ul>
 *
 * @author BANGA Romaric
 */

/**
 * Les quatre bandes de la coupe hexagonale projetée par le slow-mo.
 *
 * <ul>
 *   <li>{@code primary} — adaptateurs entrants (REST, listeners) ;</li>
 *   <li>{@code application} — services applicatifs POJO d'orchestration ;</li>
 *   <li>{@code domain} — agrégats, value objects, événements ;</li>
 *   <li>{@code secondary} — adaptateurs sortants (JPA, transactions,
 *       publishers).</li>
 * </ul>
 */
export type CoucheHexa = 'primary' | 'application' | 'domain' | 'secondary';

/**
 * Effet visuel particulier joué sur certaines étapes pour souligner un
 * concept marquant (publication d'un événement, passage cross-module,
 * réponse HTTP finale).
 */
export type EffetSpecial = 'event-publie' | 'cross-module' | 'http-final';

/**
 * Description d'une étape unique du cycle d'une opération.
 *
 * <p>Une étape porte les informations nécessaires à la fois pour
 * l'animation slow-mo (couche d'appartenance, composant à mettre en
 * surbrillance, effet spécial) et pour la documentation statique (titre,
 * description, lien GitHub).
 */
export interface EtapeCycle {
  /** Position dans le cycle, 1-indexé pour l'affichage utilisateur. */
  readonly numero: number;
  /** Titre court de l'étape, lisible en grand format. */
  readonly titre: string;
  /** Étiquette technique (nom du port, du DTO, de la méthode invoquée). */
  readonly etiquette: string;
  /** Description pédagogique courte (1-2 phrases). */
  readonly description: string;
  /** Couche hexagonale d'appartenance — pilote la position du pointeur. */
  readonly couche: CoucheHexa;
  /**
   * Couche d'arrivée si l'étape représente une transition entre bandes.
   * Le pointeur anime alors de {@link #couche} vers cette valeur.
   */
  readonly coucheArrivee?: CoucheHexa;
  /** Nom du composant à mettre en surbrillance dans la bande active. */
  readonly composantMarque: string;
  /** Clé du fichier source dans {@link SOURCES}, ou {@code undefined}. */
  readonly sourceKey?: keyof typeof SOURCES;
  /** Bounded context dans lequel se déroule l'étape (mode pédagogique). */
  readonly boundedContext?: 'identite' | 'portefeuille';
  /** Effet visuel particulier joué sur cette étape. */
  readonly effetSpecial?: EffetSpecial;
}

/**
 * Un cycle complet d'une opération métier.
 */
export interface Cycle {
  /** Nom lisible affiché en titre de l'overlay slow-mo. */
  readonly nomOperation: string;
  /** Liste ordonnée des étapes traversées. */
  readonly etapes: readonly EtapeCycle[];
}

/**
 * Cycle de création d'un abonné — 13 étapes, deux bounded contexts,
 * un événement de domaine cross-module.
 */
export const creationAbonne: Cycle = {
  nomOperation: 'Création de votre compte',
  etapes: [
    {
      numero: 1,
      titre: 'Requête HTTP entrante',
      etiquette: 'POST /api/abonnes',
      description:
        "L'adaptateur primaire REST reçoit la requête JSON et la désérialise vers le DTO d'entrée.",
      couche: 'primary',
      composantMarque: 'AbonneController',
      sourceKey: 'abonneController',
      boundedContext: 'identite',
    },
    {
      numero: 2,
      titre: 'Construction des Value Objects',
      etiquette: 'NomGabonais, NumeroTelephoneGabonais',
      description:
        "Les chaînes brutes deviennent des objets typés. Un numéro mal formé est rejeté AVANT d'atteindre le domaine.",
      couche: 'domain',
      composantMarque: 'NumeroTelephoneGabonais',
      sourceKey: 'numeroTelephoneGabonais',
      boundedContext: 'identite',
    },
    {
      numero: 3,
      titre: 'Création de la commande',
      etiquette: 'CommandeCreerAbonne',
      description:
        "Record immuable qui agrège les Value Objects validés. Le contrôleur la transmet à la couche application.",
      couche: 'primary',
      composantMarque: 'CommandeCreerAbonne',
      sourceKey: 'commandeCreerAbonne',
      boundedContext: 'identite',
    },
    {
      numero: 4,
      titre: "Appel du port in (cas d'usage)",
      etiquette: 'CreerAbonneUseCase',
      description:
        "Le contrôleur dépend uniquement de l'interface du cas d'usage. Inversion de dépendance.",
      couche: 'primary',
      coucheArrivee: 'application',
      composantMarque: 'CreerAbonneUseCase',
      sourceKey: 'creerAbonneUseCase',
      boundedContext: 'identite',
    },
    {
      numero: 5,
      titre: 'Décorateur transactionnel',
      etiquette: '@Transactional',
      description:
        "Le bean Spring qui implémente le port est un décorateur : il ouvre la transaction puis délègue au POJO applicatif.",
      couche: 'secondary',
      composantMarque: 'CreerAbonneServiceTransactionnel',
      sourceKey: 'creerAbonneServiceTransactionnel',
      boundedContext: 'identite',
    },
    {
      numero: 6,
      titre: 'Service applicatif (POJO)',
      etiquette: 'CreerAbonneService',
      description:
        "Orchestration pure : récupération, appel domaine, persistance, publication. Aucune règle métier.",
      couche: 'application',
      composantMarque: 'CreerAbonneService',
      sourceKey: 'creerAbonneService',
      boundedContext: 'identite',
    },
    {
      numero: 7,
      titre: "Factory de l'agrégat",
      etiquette: 'Abonne.creer(...)',
      description:
        "L'agrégat est seul juge de la validité d'un nouvel abonné. Les invariants sont vérifiés ici.",
      couche: 'domain',
      composantMarque: 'Abonne',
      sourceKey: 'abonne',
      boundedContext: 'identite',
    },
    {
      numero: 8,
      titre: 'Sauvegarde via port out',
      etiquette: 'DepotAbonne.sauvegarder',
      description:
        "Le domaine déclare son besoin via une interface ; il ignore comment la persistance est implémentée.",
      couche: 'application',
      coucheArrivee: 'secondary',
      composantMarque: 'DepotAbonne',
      sourceKey: 'depotAbonne',
      boundedContext: 'identite',
    },
    {
      numero: 9,
      titre: 'Adaptateur secondaire JPA',
      etiquette: 'DepotAbonnePostgres',
      description:
        "Implémentation Spring Data JPA du port. Mappe domaine ↔ entité, insère dans PostgreSQL.",
      couche: 'secondary',
      composantMarque: 'DepotAbonnePostgres',
      sourceKey: 'depotAbonnePostgres',
      boundedContext: 'identite',
    },
    {
      numero: 10,
      titre: "Publication de l'événement",
      etiquette: 'EvenementAbonneCree',
      description:
        "Un événement de domaine est publié sur le bus Spring Modulith. Seul moyen de notifier sans couplage.",
      couche: 'domain',
      coucheArrivee: 'secondary',
      composantMarque: 'EvenementAbonneCree',
      sourceKey: 'evenementAbonneCree',
      boundedContext: 'identite',
      effetSpecial: 'event-publie',
    },
    {
      numero: 11,
      titre: 'Listener cross-module',
      etiquette: '@ApplicationModuleListener',
      description:
        "Le module portefeuille écoute les événements de identite via la NamedInterface events. Aucune dépendance directe.",
      couche: 'primary',
      composantMarque: 'EcouteurEvenementAbonne',
      sourceKey: 'ecouteurEvenementAbonne',
      boundedContext: 'portefeuille',
      effetSpecial: 'cross-module',
    },
    {
      numero: 12,
      titre: 'Création du portefeuille',
      etiquette: 'Portefeuille.creerVide(abonneId)',
      description:
        "Le listener appelle CreerPortefeuilleUseCase. Un portefeuille à zéro FCFA est créé puis persisté.",
      couche: 'domain',
      composantMarque: 'Portefeuille',
      sourceKey: 'portefeuille',
      boundedContext: 'portefeuille',
    },
    {
      numero: 13,
      titre: 'Réponse HTTP 201',
      etiquette: 'AbonneResponse (DTO)',
      description:
        "Le contrôleur mappe l'agrégat en DTO immutable et renvoie HTTP 201 Created au client.",
      couche: 'primary',
      composantMarque: 'AbonneResponse',
      sourceKey: 'abonneResponse',
      boundedContext: 'identite',
      effetSpecial: 'http-final',
    },
  ],
};

/**
 * Cycle de dépôt d'argent — 9 étapes, un seul bounded context, pas d'événement
 * cross-module (la mutation reste interne à portefeuille).
 */
export const depotArgent: Cycle = {
  nomOperation: "Dépôt d'argent",
  etapes: [
    {
      numero: 1,
      titre: 'Requête HTTP entrante',
      etiquette: 'POST /api/portefeuilles/{id}/depot',
      description:
        "L'adaptateur primaire REST reçoit la requête JSON contenant le montant à déposer.",
      couche: 'primary',
      composantMarque: 'PortefeuilleController',
      sourceKey: 'portefeuilleController',
      boundedContext: 'portefeuille',
    },
    {
      numero: 2,
      titre: 'Construction du Value Object',
      etiquette: 'Argent',
      description:
        "Le montant entier est promu en Argent (record immuable). Un montant négatif est rejeté ici par les invariants du VO.",
      couche: 'domain',
      composantMarque: 'Argent',
      sourceKey: 'argent',
      boundedContext: 'portefeuille',
    },
    {
      numero: 3,
      titre: 'Création de la commande',
      etiquette: 'CommandeDeposerArgent',
      description:
        "Record agrégeant l'identifiant du portefeuille et le montant validé.",
      couche: 'primary',
      composantMarque: 'CommandeDeposerArgent',
      boundedContext: 'portefeuille',
    },
    {
      numero: 4,
      titre: "Appel du port in (cas d'usage)",
      etiquette: 'DeposerArgentUseCase',
      description:
        "Le contrôleur invoque l'interface du cas d'usage. Aucune dépendance directe à l'implémentation.",
      couche: 'primary',
      coucheArrivee: 'application',
      composantMarque: 'DeposerArgentUseCase',
      sourceKey: 'deposerArgentUseCase',
      boundedContext: 'portefeuille',
    },
    {
      numero: 5,
      titre: 'Décorateur transactionnel',
      etiquette: '@Transactional',
      description:
        "Le décorateur secondaire ouvre une transaction PostgreSQL avant de déléguer au POJO applicatif.",
      couche: 'secondary',
      composantMarque: 'DeposerArgentServiceTransactionnel',
      boundedContext: 'portefeuille',
    },
    {
      numero: 6,
      titre: 'Service applicatif (POJO)',
      etiquette: 'DeposerArgentService',
      description:
        "Récupère l'agrégat, appelle la méthode métier, sauvegarde, enregistre l'opération.",
      couche: 'application',
      composantMarque: 'DeposerArgentService',
      sourceKey: 'deposerArgentService',
      boundedContext: 'portefeuille',
    },
    {
      numero: 7,
      titre: "Méthode métier de l'agrégat",
      etiquette: 'Portefeuille.deposer(montant)',
      description:
        "L'agrégat protège son invariant : seul lui peut muter son solde. On ne touche jamais le champ solde directement.",
      couche: 'domain',
      composantMarque: 'Portefeuille',
      sourceKey: 'portefeuille',
      boundedContext: 'portefeuille',
    },
    {
      numero: 8,
      titre: 'Persistence via ports out',
      etiquette: 'DepotPortefeuille + DepotOperations',
      description:
        "Le service applicatif sauvegarde l'état mis à jour ET enregistre l'opération dans l'historique via deux ports out distincts.",
      couche: 'application',
      coucheArrivee: 'secondary',
      composantMarque: 'DepotPortefeuillePostgres',
      sourceKey: 'depotPortefeuillePostgres',
      boundedContext: 'portefeuille',
    },
    {
      numero: 9,
      titre: 'Réponse HTTP 200',
      etiquette: 'PortefeuilleResponse',
      description:
        "Le contrôleur renvoie le nouvel état du portefeuille (solde mis à jour) sous forme de DTO immutable.",
      couche: 'primary',
      composantMarque: 'PortefeuilleController',
      sourceKey: 'portefeuilleController',
      boundedContext: 'portefeuille',
      effetSpecial: 'http-final',
    },
  ],
};

/**
 * Cycle de retrait d'argent — 9 étapes. Structurellement identique au dépôt,
 * mais la méthode {@code Portefeuille.retirer(...)} peut lever
 * {@code SoldeInsuffisantException} si le solde est insuffisant.
 */
export const retraitArgent: Cycle = {
  nomOperation: "Retrait d'argent",
  etapes: [
    {
      numero: 1,
      titre: 'Requête HTTP entrante',
      etiquette: 'POST /api/portefeuilles/{id}/retrait',
      description:
        "L'adaptateur primaire REST reçoit la requête JSON contenant le montant à retirer.",
      couche: 'primary',
      composantMarque: 'PortefeuilleController',
      sourceKey: 'portefeuilleController',
      boundedContext: 'portefeuille',
    },
    {
      numero: 2,
      titre: 'Construction du Value Object',
      etiquette: 'Argent',
      description:
        "Le montant entier est promu en Argent. Un montant négatif est rejeté avant le domaine.",
      couche: 'domain',
      composantMarque: 'Argent',
      sourceKey: 'argent',
      boundedContext: 'portefeuille',
    },
    {
      numero: 3,
      titre: 'Création de la commande',
      etiquette: 'CommandeRetirerArgent',
      description:
        "Record agrégeant l'identifiant du portefeuille et le montant validé.",
      couche: 'primary',
      composantMarque: 'CommandeRetirerArgent',
      boundedContext: 'portefeuille',
    },
    {
      numero: 4,
      titre: "Appel du port in (cas d'usage)",
      etiquette: 'RetirerArgentUseCase',
      description:
        "Le contrôleur invoque l'interface du cas d'usage. Aucune dépendance directe à l'implémentation.",
      couche: 'primary',
      coucheArrivee: 'application',
      composantMarque: 'RetirerArgentUseCase',
      sourceKey: 'retirerArgentUseCase',
      boundedContext: 'portefeuille',
    },
    {
      numero: 5,
      titre: 'Décorateur transactionnel',
      etiquette: '@Transactional',
      description:
        "Le décorateur secondaire ouvre une transaction PostgreSQL avant de déléguer au POJO applicatif.",
      couche: 'secondary',
      composantMarque: 'RetirerArgentServiceTransactionnel',
      boundedContext: 'portefeuille',
    },
    {
      numero: 6,
      titre: 'Service applicatif (POJO)',
      etiquette: 'RetirerArgentService',
      description:
        "Récupère l'agrégat, appelle la méthode métier, sauvegarde, enregistre l'opération.",
      couche: 'application',
      composantMarque: 'RetirerArgentService',
      sourceKey: 'retirerArgentService',
      boundedContext: 'portefeuille',
    },
    {
      numero: 7,
      titre: "Méthode métier de l'agrégat",
      etiquette: 'Portefeuille.retirer(montant)',
      description:
        "L'agrégat vérifie la pré-condition métier solde >= montant. Si elle est violée, SoldeInsuffisantException est levée ici.",
      couche: 'domain',
      composantMarque: 'Portefeuille',
      sourceKey: 'portefeuille',
      boundedContext: 'portefeuille',
    },
    {
      numero: 8,
      titre: 'Persistence via ports out',
      etiquette: 'DepotPortefeuille + DepotOperations',
      description:
        "Le service applicatif sauvegarde l'état mis à jour ET enregistre l'opération dans l'historique (TypeOperation.RETRAIT).",
      couche: 'application',
      coucheArrivee: 'secondary',
      composantMarque: 'DepotPortefeuillePostgres',
      sourceKey: 'depotPortefeuillePostgres',
      boundedContext: 'portefeuille',
    },
    {
      numero: 9,
      titre: 'Réponse HTTP 200',
      etiquette: 'PortefeuilleResponse',
      description:
        "Le contrôleur renvoie le nouvel état du portefeuille (solde mis à jour) sous forme de DTO immutable.",
      couche: 'primary',
      composantMarque: 'PortefeuilleController',
      sourceKey: 'portefeuilleController',
      boundedContext: 'portefeuille',
      effetSpecial: 'http-final',
    },
  ],
};
