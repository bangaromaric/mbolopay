/**
 * Session abonné côté client (pédagogique — pas d'authentification réelle).
 *
 * Le backend MboloPay n'expose pas (encore) de mécanisme de session ou
 * d'authentification. Pour rendre l'UI fonctionnelle après création d'un
 * abonné, on conserve son identifiant en {@code localStorage} comme
 * « session » légère. Ce mécanisme est explicitement <b>simplifié</b> et
 * n'a pas de valeur de sécurité : il existe uniquement pour permettre à
 * l'UI de récupérer le portefeuille de l'abonné couramment manipulé.
 *
 * Persistance dans {@code localStorage} sous {@code mbolo.session}. Toute
 * mutation émet {@code mbolo-session-change} sur {@code window}.
 *
 * @author BANGA Romaric
 */
import { abonneApi } from '../api/abonne-api.js';
import type { ApiError } from '../api/client.js';
import type { AbonneResponse } from '../api/types.js';

const CLE_STOCKAGE = 'mbolo.session';

/**
 * Information d'abonné connecté minimale.
 */
export interface AbonneEnSession {
  readonly id: string;
  readonly prenom: string;
  readonly nom: string;
  readonly numeroTelephone: string;
  readonly numeroFormatInternational: string;
}

function lire(): AbonneEnSession | null {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return null;
    const parse = JSON.parse(brut) as AbonneEnSession;
    if (!parse || typeof parse.id !== 'string') return null;
    return parse;
  } catch {
    return null;
  }
}

function ecrire(abonne: AbonneEnSession | null): void {
  try {
    if (abonne === null) {
      localStorage.removeItem(CLE_STOCKAGE);
    } else {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(abonne));
    }
  } catch {
    /* localStorage indisponible : no-op silencieux. */
  }
  window.dispatchEvent(new CustomEvent('mbolo-session-change', { detail: { abonne } }));
}

/**
 * @return l'abonné connecté ou {@code null} si aucune session active.
 */
export function abonneCourant(): AbonneEnSession | null {
  return lire();
}

/**
 * Indique si une session est active.
 */
export function estConnecte(): boolean {
  return abonneCourant() !== null;
}

/**
 * Connecte un abonné fraîchement créé. Stocke ses informations en local et
 * émet {@code mbolo-session-change}.
 *
 * @param abonne réponse {@link AbonneResponse} du backend.
 */
export function connecter(abonne: AbonneResponse): void {
  ecrire({
    id: abonne.id,
    prenom: abonne.prenom,
    nom: abonne.nom,
    numeroTelephone: abonne.numeroTelephone,
    numeroFormatInternational: abonne.numeroFormatInternational,
  });
}

/**
 * Termine la session courante. No-op si aucune session active.
 */
export function deconnecter(): void {
  ecrire(null);
}

/**
 * Rafraîchit la session courante depuis le backend.
 *
 * <ul>
 *   <li>Si aucune session locale → no-op.</li>
 *   <li>Si {@code GET /api/abonnes/{id}} réussit → met à jour la session avec les
 *       données fraîches.</li>
 *   <li>Si 404 (abonné inconnu : base réinitialisée, abonné supprimé) → déconnecte
 *       silencieusement pour éviter une session zombie.</li>
 *   <li>Si erreur réseau / 5xx → conserve la session locale telle quelle (l'erreur
 *       remontera à la prochaine action utilisateur).</li>
 * </ul>
 *
 * Conçu pour être appelé au démarrage de l'app afin de garantir un état cohérent
 * avant le premier rendu. Timeout dur de 3 secondes pour ne pas bloquer le boot
 * si le backend est lent ou indisponible.
 */
export async function rafraichirDepuisBackend(): Promise<void> {
  const courant = abonneCourant();
  if (!courant) return;

  const controleur = new AbortController();
  const timeoutId = window.setTimeout(() => controleur.abort(), 3000);

  try {
    const reponse = await Promise.race([
      abonneApi.parId(courant.id),
      new Promise<never>((_, reject) => {
        controleur.signal.addEventListener('abort', () =>
          reject({ kind: 'NetworkError', cause: new Error('timeout') } satisfies ApiError),
        );
      }),
    ]);
    connecter(reponse);
  } catch (e) {
    const err = e as ApiError;
    if (err.kind === 'ClientError' && err.status === 404) {
      deconnecter();
    }
    /* autres erreurs : on garde la session locale telle quelle. */
  } finally {
    window.clearTimeout(timeoutId);
  }
}
