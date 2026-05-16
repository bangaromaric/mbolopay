/**
 * Gestion de la préférence « mode slow-mo ».
 *
 * <p>Le slow-mo est une <b>sous-fonctionnalité</b> du mode pédagogique :
 * quand il est actif, chaque opération mutante (création abonné, dépôt,
 * retrait) déclenche une animation pas-à-pas montrant la traversée des
 * couches hexagonales avant l'exécution effective. Le slow-mo est ignoré
 * si le mode pédagogique est désactivé — l'overlay reste discret.
 *
 * <p>Trois vitesses sont proposées :
 * <ul>
 *   <li>{@code apprentissage} (1800 ms / étape) — démos en classe ;</li>
 *   <li>{@code normale} (900 ms / étape) — découverte fluide, <b>défaut</b> ;</li>
 *   <li>{@code rapide} (400 ms / étape) — re-visualisation après familiarisation.</li>
 * </ul>
 *
 * <p>Persistance dans {@code localStorage} sous {@code mbolo.slow-mo}
 * et {@code mbolo.slow-mo-vitesse}. Toute mutation émet
 * {@code window.dispatchEvent('mbolo-mode-slow-mo-change')}.
 *
 * @author BANGA Romaric
 */

const CLE_STOCKAGE_ACTIF = 'mbolo.slow-mo';
const CLE_STOCKAGE_VITESSE = 'mbolo.slow-mo-vitesse';

/**
 * Vitesses de lecture proposées par le slow-mo.
 */
export type Vitesse = 'apprentissage' | 'normale' | 'rapide';

const VITESSE_DEFAUT: Vitesse = 'normale';

const DELAIS_MS: Readonly<Record<Vitesse, number>> = {
  apprentissage: 1800,
  normale: 900,
  rapide: 400,
};

/**
 * @return {@code true} si le mode slow-mo est actif pour la session
 *         courante. Indépendant du mode pédagogique : la double-condition
 *         est appliquée par {@code slow-mo-runner}.
 */
export function estActif(): boolean {
  try {
    return localStorage.getItem(CLE_STOCKAGE_ACTIF) === 'true';
  } catch {
    return false;
  }
}

/**
 * Active ou désactive le mode slow-mo. Émet
 * {@code mbolo-mode-slow-mo-change} sur {@code window}.
 *
 * @param actif nouvel état souhaité.
 */
export function definir(actif: boolean): void {
  try {
    localStorage.setItem(CLE_STOCKAGE_ACTIF, String(actif));
  } catch {
    /* localStorage indisponible : no-op silencieux. */
  }
  window.dispatchEvent(
    new CustomEvent('mbolo-mode-slow-mo-change', { detail: { actif, vitesse: vitesse() } }),
  );
}

/**
 * Inverse l'état courant du mode slow-mo.
 *
 * @return le nouvel état après bascule.
 */
export function basculer(): boolean {
  const nouveau = !estActif();
  definir(nouveau);
  return nouveau;
}

/**
 * @return la vitesse persistée, ou la vitesse par défaut si aucune valeur
 *         n'a été enregistrée.
 */
export function vitesse(): Vitesse {
  try {
    const v = localStorage.getItem(CLE_STOCKAGE_VITESSE);
    if (v === 'apprentissage' || v === 'normale' || v === 'rapide') return v;
  } catch {
    /* idem */
  }
  return VITESSE_DEFAUT;
}

/**
 * Persiste la vitesse choisie et émet {@code mbolo-mode-slow-mo-change}.
 *
 * @param v nouvelle vitesse souhaitée.
 */
export function definirVitesse(v: Vitesse): void {
  try {
    localStorage.setItem(CLE_STOCKAGE_VITESSE, v);
  } catch {
    /* idem */
  }
  window.dispatchEvent(
    new CustomEvent('mbolo-mode-slow-mo-change', { detail: { actif: estActif(), vitesse: v } }),
  );
}

/**
 * @return le délai en millisecondes par étape correspondant à la vitesse
 *         courante.
 */
export function delaiMs(): number {
  return DELAIS_MS[vitesse()];
}
