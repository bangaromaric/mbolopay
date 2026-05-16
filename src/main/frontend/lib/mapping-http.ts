/**
 * Mapping des endpoints REST MboloPay vers leurs ports (cas d'usage) Java,
 * leur nature CQRS (Query/Command) et leur bounded context.
 *
 * <p>Consommé par l'Inspector pédagogique pour enrichir chaque appel HTTP
 * journalisé d'un lien vers le code source Java et d'une étiquette
 * Query/Command.
 *
 * <p>Lorsque le backend expose un nouvel endpoint, ajouter une entrée à
 * {@link PATTERNS} ici.
 *
 * @author BANGA Romaric
 */
import { SOURCES } from './sources.js';

export interface MetaPort {
  readonly nom: string;
  readonly type: 'query' | 'command';
  readonly boundedContext: 'identite' | 'portefeuille';
  readonly sourceKey: keyof typeof SOURCES;
}

interface PatternHttp {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly regex: RegExp;
  readonly meta: MetaPort;
}

const PATTERNS: readonly PatternHttp[] = [
  {
    method: 'POST',
    regex: /^\/api\/abonnes\/?$/,
    meta: {
      nom: 'CreerAbonneUseCase',
      type: 'command',
      boundedContext: 'identite',
      sourceKey: 'creerAbonneUseCase',
    },
  },
  {
    method: 'GET',
    regex: /^\/api\/abonnes\/[^/]+\/?$/,
    meta: {
      nom: 'RechercherAbonneUseCase',
      type: 'query',
      boundedContext: 'identite',
      sourceKey: 'rechercherAbonneUseCase',
    },
  },
  {
    method: 'POST',
    regex: /^\/api\/portefeuilles\/[^/]+\/depot\/?$/,
    meta: {
      nom: 'DeposerArgentUseCase',
      type: 'command',
      boundedContext: 'portefeuille',
      sourceKey: 'deposerArgentUseCase',
    },
  },
  {
    method: 'POST',
    regex: /^\/api\/portefeuilles\/[^/]+\/retrait\/?$/,
    meta: {
      nom: 'RetirerArgentUseCase',
      type: 'command',
      boundedContext: 'portefeuille',
      sourceKey: 'retirerArgentUseCase',
    },
  },
  {
    method: 'GET',
    regex: /^\/api\/portefeuilles\/abonne\/[^/]+\/?$/,
    meta: {
      nom: 'RecupererPortefeuilleParAbonneUseCase',
      type: 'query',
      boundedContext: 'portefeuille',
      sourceKey: 'recupererPortefeuilleParAbonneUseCase',
    },
  },
  {
    method: 'GET',
    regex: /^\/api\/portefeuilles\/[^/]+\/operations(?:\?.*)?$/,
    meta: {
      nom: 'HistoriqueOperationsUseCase',
      type: 'query',
      boundedContext: 'portefeuille',
      sourceKey: 'historiqueOperationsUseCase',
    },
  },
];

/**
 * Décode une requête HTTP en métadonnées de port métier.
 *
 * @param method verbe HTTP (insensible à la casse)
 * @param url    chemin (avec ou sans query string)
 * @return les métadonnées du port appelé, ou {@code null} si l'URL ne
 *         correspond à aucun endpoint métier connu (health checks, etc.).
 */
export function decoder(method: string, url: string): MetaPort | null {
  const m = method.toUpperCase() as PatternHttp['method'];
  const chemin = url.split('?')[0];
  for (const p of PATTERNS) {
    if (p.method === m && p.regex.test(chemin)) {
      return p.meta;
    }
  }
  return null;
}
