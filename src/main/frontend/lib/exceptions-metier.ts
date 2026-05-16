/**
 * Catalogue des exceptions métier MboloPay côté backend, exposées à l'UI
 * pédagogique pour annoter les erreurs API observées.
 *
 * <p>Chaque entrée pointe vers la classe d'exception Java et vers le
 * {@code @RestControllerAdvice} qui la mappe vers un statut HTTP.
 *
 * <p>La fonction {@link deduire} infère l'exception probable à partir de
 * la signature d'un appel échoué (method + url + statut + message). Le
 * fallback est {@code null} (pas d'annotation, plutôt qu'une annotation
 * incorrecte).
 *
 * @author BANGA Romaric
 */
import type { SOURCES } from './sources.js';

export interface MetaException {
  readonly classe: string;
  readonly module: 'identite' | 'portefeuille';
  readonly statutHttp: number;
  readonly raisonHttp: string;
  readonly description: string;
  readonly sourceClasseKey: keyof typeof SOURCES;
  readonly sourceHandlerKey: keyof typeof SOURCES;
}

export const EXCEPTIONS = {
  NumeroDejaUtiliseException: {
    classe: 'NumeroDejaUtiliseException',
    module: 'identite',
    statutHttp: 409,
    raisonHttp: 'CONFLICT',
    description:
      'Levée quand le numéro de téléphone est déjà associé à un autre abonné. Garantit l\'unicité dans le bounded context identité.',
    sourceClasseKey: 'numeroDejaUtilise',
    sourceHandlerKey: 'gestionnaireExceptionsIdentite',
  },
  NumeroNonAutoriseException: {
    classe: 'NumeroNonAutoriseException',
    module: 'identite',
    statutHttp: 400,
    raisonHttp: 'BAD_REQUEST',
    description:
      'Levée quand le numéro fourni ne respecte pas le format gabonais attendu (Airtel ou Moov uniquement).',
    sourceClasseKey: 'numeroNonAutorise',
    sourceHandlerKey: 'gestionnaireExceptionsIdentite',
  },
  AbonneIntrouvableException: {
    classe: 'AbonneIntrouvableException',
    module: 'identite',
    statutHttp: 404,
    raisonHttp: 'NOT_FOUND',
    description:
      "Levée par le controller quand aucun abonné ne correspond à l'identifiant fourni.",
    sourceClasseKey: 'abonneIntrouvable',
    sourceHandlerKey: 'gestionnaireExceptionsIdentite',
  },
  PortefeuilleIntrouvableException: {
    classe: 'PortefeuilleIntrouvableException',
    module: 'portefeuille',
    statutHttp: 404,
    raisonHttp: 'NOT_FOUND',
    description:
      "Levée par le service quand aucun portefeuille n'existe pour l'identifiant ou l'abonné demandé.",
    sourceClasseKey: 'portefeuilleIntrouvable',
    sourceHandlerKey: 'gestionnaireExceptionsGlobal',
  },
  SoldeInsuffisantException: {
    classe: 'SoldeInsuffisantException',
    module: 'portefeuille',
    statutHttp: 400,
    raisonHttp: 'BAD_REQUEST',
    description:
      "Levée par l'agrégat Portefeuille quand le retrait demandé excède le solde disponible. Invariant métier respecté.",
    sourceClasseKey: 'soldeInsuffisant',
    sourceHandlerKey: 'gestionnaireExceptionsGlobal',
  },
  MontantInvalideException: {
    classe: 'MontantInvalideException',
    module: 'portefeuille',
    statutHttp: 400,
    raisonHttp: 'BAD_REQUEST',
    description:
      'Levée quand le montant fourni est négatif (Argent.estNegatif()). Invariant métier de l\'agrégat Portefeuille.',
    sourceClasseKey: 'montantInvalide',
    sourceHandlerKey: 'gestionnaireExceptionsGlobal',
  },
} as const satisfies Record<string, MetaException>;

function contient(s: string | undefined, motif: string): boolean {
  return !!s && s.toLowerCase().includes(motif.toLowerCase());
}

/**
 * Infère l'exception métier probable depuis la signature d'un appel
 * échoué. Match prioritairement sur (method + url + statut). Le message
 * du backend affine si plusieurs candidats partagent la même signature.
 *
 * @param method   verbe HTTP de la requête
 * @param url      chemin appelé (sans hôte)
 * @param statut   code HTTP de la réponse
 * @param message  champ {@code message} ou {@code details} du body d'erreur
 * @return l'exception inférée ou {@code null} si aucun match fiable.
 */
export function deduire(
  method: string,
  url: string,
  statut: number,
  message?: string,
): MetaException | null {
  const m = method.toUpperCase();
  const chemin = url.split('?')[0];

  // identité
  if (m === 'POST' && /^\/api\/abonnes\/?$/.test(chemin)) {
    if (statut === 409) return EXCEPTIONS.NumeroDejaUtiliseException;
    if (statut === 400) return EXCEPTIONS.NumeroNonAutoriseException;
  }
  if (m === 'GET' && /^\/api\/abonnes\/[^/]+\/?$/.test(chemin)) {
    if (statut === 404) return EXCEPTIONS.AbonneIntrouvableException;
  }

  // portefeuille
  if (/^\/api\/portefeuilles\/[^/]+\/retrait\/?$/.test(chemin) && statut === 400) {
    if (contient(message, 'solde') || contient(message, 'insuffisant')) {
      return EXCEPTIONS.SoldeInsuffisantException;
    }
    if (contient(message, 'négatif') || contient(message, 'positif') || contient(message, 'montant')) {
      return EXCEPTIONS.MontantInvalideException;
    }
    return EXCEPTIONS.MontantInvalideException; // fallback raisonnable
  }
  if (/^\/api\/portefeuilles\/[^/]+\/depot\/?$/.test(chemin) && statut === 400) {
    return EXCEPTIONS.MontantInvalideException;
  }
  if (/^\/api\/portefeuilles\//.test(chemin) && statut === 404) {
    return EXCEPTIONS.PortefeuilleIntrouvableException;
  }

  return null;
}
