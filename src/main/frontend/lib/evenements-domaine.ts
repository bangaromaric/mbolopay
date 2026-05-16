/**
 * Store frontend des événements de domaine observés en session (charte §9.3).
 *
 * <b>Représentation pédagogique côté client</b> — miroir best-effort des
 * événements publiés par Spring Modulith côté backend. Tant qu'aucun canal
 * SSE n'est ouvert, le store est alimenté manuellement par les pages
 * d'application (ex. {@code page-creer-abonne} appelle
 * {@link publier} après un POST /api/abonnes réussi).
 *
 * Persistance dans {@code sessionStorage} (volontairement éphémère —
 * disparaît à la fermeture de l'onglet, cohérent avec la nature démo).
 * Sérialiseur custom pour préserver les instances {@link Date}.
 *
 * @author BANGA Romaric
 */

const CLE_STOCKAGE = 'mbolo.evenements-domaine';

/**
 * Événement de domaine observé.
 */
export interface EvenementDomaine {
  readonly nom: string;
  readonly boundedContext: string;
  readonly publiePar: string;
  readonly consommePar: readonly string[];
  readonly payload: unknown;
  readonly timestamp: Date;
}

interface EvenementSerialise extends Omit<EvenementDomaine, 'timestamp'> {
  readonly timestamp: string;
}

function hydrater(serialise: EvenementSerialise): EvenementDomaine {
  return { ...serialise, timestamp: new Date(serialise.timestamp) };
}

function lireBrut(): EvenementSerialise[] {
  try {
    const brut = sessionStorage.getItem(CLE_STOCKAGE);
    if (!brut) return [];
    const parse: unknown = JSON.parse(brut);
    return Array.isArray(parse) ? (parse as EvenementSerialise[]) : [];
  } catch {
    return [];
  }
}

function ecrire(evenements: readonly EvenementDomaine[]): void {
  try {
    const serialise: EvenementSerialise[] = evenements.map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    }));
    sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(serialise));
  } catch {
    /* sessionStorage indisponible : conserve uniquement en mémoire. */
  }
}

/**
 * @return liste chronologique inversée (le plus récent en premier) des
 *         événements observés depuis le début de la session.
 */
export function liste(): readonly EvenementDomaine[] {
  return lireBrut().map(hydrater);
}

/**
 * Enregistre un nouvel événement de domaine observé. Émet
 * {@code mbolo-evenement-publie} sur {@code window}.
 *
 * @param evenement événement à enregistrer.
 */
export function publier(evenement: EvenementDomaine): void {
  const courants = liste();
  const nouveaux = [evenement, ...courants];
  ecrire(nouveaux);
  window.dispatchEvent(new CustomEvent('mbolo-evenement-publie', { detail: evenement }));
}

/**
 * Vide le store. Utilisé depuis le profil (mode pédagogique).
 */
export function vider(): void {
  try {
    sessionStorage.removeItem(CLE_STOCKAGE);
  } catch {
    /* no-op */
  }
  window.dispatchEvent(new CustomEvent('mbolo-evenement-publie', { detail: null }));
}
